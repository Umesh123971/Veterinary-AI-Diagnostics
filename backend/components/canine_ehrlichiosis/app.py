"""Local upload-and-predict demo for the isolated Ehrlichiosis component."""
import hashlib
import io
import json
import tempfile
import threading
from pathlib import Path

import streamlit as st
import torch
from PIL import Image, ImageOps, UnidentifiedImageError
from pipeline import ROOT, EhrlichiosisPipeline

st.set_page_config(page_title="Ehrlichiosis image demo",page_icon="\U0001f52c",layout="wide")
st.title("Canine Ehrlichiosis")
st.caption("Upload a blood-smear image to try YOLOv8s + ResNet50.")
st.warning("Experimental model: detections can be missed or incorrect. Review the image; a negative result cannot rule out disease.")

@st.cache_resource(show_spinner=False,max_entries=1)
def load_pipeline(weights_version):
    torch.set_num_threads(4)
    return EhrlichiosisPipeline(), threading.Lock()

uploaded=st.file_uploader("Choose a blood-smear image",type=["jpg","jpeg","png","webp"],key="smear")
if uploaded is None:
    st.session_state.pop("analysis",None)
    st.info("Upload an image, then click Analyze image.")
    st.stop()

raw=uploaded.getvalue()
weights_version=tuple((ROOT/"models"/name).stat().st_mtime_ns if (ROOT/"models"/name).exists() else 0 for name in ["yolov8s.pt","resnet50.pt"])
fingerprint=hashlib.sha256(raw).hexdigest()+":"+str(weights_version)
if st.session_state.get("analysis",{}).get("fingerprint") != fingerprint:
    st.session_state.pop("analysis",None)
try:
    if len(raw)>20*1024*1024:
        raise ValueError("Please choose an image smaller than 20 MB.")
    with Image.open(io.BytesIO(raw)) as source:
        if source.width*source.height>16_000_000:
            raise ValueError("Please resize this image to at most 16 megapixels.")
        image=ImageOps.exif_transpose(source).convert("RGB")
except (UnidentifiedImageError,OSError,ValueError,Image.DecompressionBombError) as exc:
    st.error(f"Cannot read this image: {exc}")
    st.stop()

left,right=st.columns(2)
with left:
    st.subheader("Your image")
    st.image(image,width="stretch")
    st.caption(f"{uploaded.name} - {image.width} x {image.height} pixels")

if st.button("Analyze image",type="primary",key="analyze"):
    try:
        with st.spinner("Loading models and analyzing your image..."):
            model,lock=load_pipeline(weights_version)
            (ROOT/"results").mkdir(exist_ok=True)
            with tempfile.TemporaryDirectory(prefix="demo_",dir=ROOT/"results") as directory:
                with lock:
                    result=model.predict(image,output=directory)
                annotated=(Path(directory)/"annotated.png").read_bytes()
            st.session_state["analysis"]={"fingerprint":fingerprint,"result":result,"annotated":annotated}
    except Exception as exc:
        st.session_state.pop("analysis",None)
        st.error(f"Analysis could not complete: {exc}")

analysis=st.session_state.get("analysis")
with right:
    st.subheader("Detection image")
    if analysis:
        st.image(analysis["annotated"],width="stretch")
        st.caption("Red rectangles are model detections. Existing arrows or text in your source image remain unchanged.")
    else:
        st.info("The annotated image will appear here after analysis.")

if analysis:
    result=analysis["result"]
    st.subheader(f"Hybrid result: {result['prediction']}")
    a,b,c=st.columns(3)
    a.metric("ResNet50 positive score",f"{result['classifier_positive_probability']:.1%}",help="Classifier score only; this is not a calibrated probability that the dog has disease.")
    b.metric("YOLO detected cells",str(len(result["boxes"])))
    c.metric("Classifier result","Positive" if result["classifier_positive_probability"]>=result["classification_threshold"] else "Negative")
    if result["disagreement"]:
        st.warning("Models disagree. Review this sample: the hybrid requires both a positive classifier and at least one detected cell.")
    if not result["boxes"]:
        st.info("No cells detected at the configured confidence threshold (0.25).")
    else:
        st.dataframe(result["boxes"],hide_index=True)
    download_image,download_json=st.columns(2)
    download_image.download_button("Download annotated image",analysis["annotated"],"ehrlichiosis_annotated.png","image/png",key="download_image")
    download_json.download_button("Download result JSON",json.dumps(result,indent=2),"ehrlichiosis_result.json","application/json",key="download_json")
    with st.expander("Result details"):
        st.json(result)
