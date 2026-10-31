"""Storage and inference adapters. Never fetch arbitrary remote image URLs."""
import base64
import io
import json
import logging
import os
import subprocess
import tempfile
import uuid
from pathlib import Path
from urllib.parse import urlsplit,unquote
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image,ImageOps

log=logging.getLogger(__name__)


def local_media_path(value):
    if not value:
        raise ValueError("No uploaded file is available")
    parsed=urlsplit(str(value))
    path=unquote(parsed.path)
    if not path.startswith(settings.MEDIA_URL):
        raise ValueError("This record has no locally uploaded file; upload a file for this patient")
    root=Path(settings.MEDIA_ROOT).resolve()
    resolved=(root/path[len(settings.MEDIA_URL):]).resolve()
    if not resolved.is_relative_to(root) or not resolved.is_file():
        raise ValueError("The uploaded file is missing")
    return resolved


def save_pdf(upload):
    data=upload.read(20*1024*1024+1)
    if len(data)>20*1024*1024 or not data.lstrip().startswith(b"%PDF-"):
        raise ValueError("Upload a PDF report smaller than 20 MB")
    name=default_storage.save(f"cbc_reports/{uuid.uuid4().hex}.pdf",ContentFile(data))
    return default_storage.url(name)


def save_image(upload):
    if isinstance(upload,str):
        if not upload.startswith("data:image/") or ";base64," not in upload:
            raise ValueError("Upload an image file; remote URLs are not accepted")
        try:
            data=base64.b64decode(upload.split(";base64,",1)[1],validate=True)
        except Exception as exc:
            raise ValueError("Invalid image encoding") from exc
    else:
        data=upload.read(15*1024*1024+1)
    if len(data)>15*1024*1024:
        raise ValueError("Image must be smaller than 15 MB")
    try:
        with Image.open(io.BytesIO(data)) as source:
            if source.width*source.height>16_000_000:
                raise ValueError("Image must contain at most 16 megapixels")
            image=ImageOps.exif_transpose(source).convert("RGB")
            output=io.BytesIO(); image.save(output,format="PNG")
    except Exception as exc:
        raise ValueError("Upload a valid JPG, PNG or WebP image") from exc
    name=default_storage.save(f"blood_smears/{uuid.uuid4().hex}.png",ContentFile(output.getvalue()))
    return default_storage.url(name)


def run_image_analysis(image_url):
    component=Path(settings.BASE_DIR)/"components/canine_ehrlichiosis"
    configured=os.getenv("EHRLICHIOSIS_PYTHON")
    executable=Path(configured) if configured else component/".venv"/("Scripts/python.exe" if os.name=="nt" else "bin/python")
    try:
        image_path=local_media_path(image_url)
        if not executable.is_file():
            raise ValueError("The Ehrlichiosis model environment is unavailable")
        with tempfile.TemporaryDirectory(prefix="vetai_ehrlichiosis_") as directory:
            env={**os.environ,"PYTHONUTF8":"1","PYTHONIOENCODING":"utf-8","YOLO_AUTOINSTALL":"false"}
            process=subprocess.run([str(executable),str(component/"infer_service.py"),"--image",str(image_path),"--output",directory],
                                   cwd=str(component),capture_output=True,text=True,encoding="utf-8",errors="replace",timeout=120,env=env)
            result_path=Path(directory)/"prediction.json"
            if process.returncode or not result_path.is_file():
                log.warning("Ehrlichiosis inference failed with exit code %s",process.returncode)
                raise ValueError("The Ehrlichiosis image models could not complete inference; retry or check the model files")
            result=json.loads(result_path.read_text(encoding="utf-8"))
            probability=float(result["classifier_positive_probability"])
            if not 0<=probability<=1:
                raise ValueError("Image model returned an invalid score")
            width,height=result["width"],result["height"]
            boxes=[]
            for index,box in enumerate(result["boxes"]):
                x1,y1,x2,y2=box["xyxy"]
                boxes.append(dict(id=index+1,label="Ehrlichiosis inclusion candidate",x=100*x1/width,y=100*y1/height,
                                  width=100*(x2-x1)/width,height=100*(y2-y1)/height,
                                  confidence=round(box["confidence"]*100,2),xyxy=box["xyxy"]))
            name=default_storage.save(f"diagnosis_images/{uuid.uuid4().hex}.png",ContentFile((Path(directory)/"annotated.png").read_bytes()))
            return dict(available=True,positiveScore=probability,classifierPrediction="Positive" if probability>=.5 else "Negative",
                        localizationDecision=result["prediction"],boxes=boxes,annotatedImage=default_storage.url(name),
                        width=width,height=height,detectorThreshold=.25,detectorImageSize=640,
                        models=["ResNet50","YOLOv8s"],warning="Experimental image models with limited validation. Absent boxes do not exclude disease.")
    except subprocess.TimeoutExpired:
        return dict(available=False,reason="Image inference timed out; CBC-only analysis is shown")
    except (ValueError,OSError,KeyError,TypeError,json.JSONDecodeError) as exc:
        return dict(available=False,reason=str(exc))
