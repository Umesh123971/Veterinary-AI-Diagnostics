"""Normalize both detector classes to grayscale; leave classifier data unchanged."""
import argparse
import json
import shutil
import time
from pathlib import Path
import torch
from PIL import Image
from ultralytics import YOLO
from pipeline import ROOT, prepare_detector_image
from improve_detector import validate


def image_level(weights, preprocessing):
    model=YOLO(str(weights))
    tp=tn=fp=fn=0
    for label in ["negative","positive"]:
        for path in sorted((ROOT/"data/classification/val"/label).iterdir()):
            image=prepare_detector_image(Image.open(path).convert("RGB"),preprocessing)
            boxes=model.predict(image,conf=.25,imgsz=640,device="cpu",verbose=False)[0].boxes
            positive=bool(len(boxes))
            tp+=int(label=="positive" and positive)
            fn+=int(label=="positive" and not positive)
            fp+=int(label=="negative" and positive)
            tn+=int(label=="negative" and not positive)
    return dict(tp=tp,tn=tn,fp=fp,fn=fn,f1=2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else 0.)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--epochs",type=int,default=8)
    args=parser.parse_args()
    torch.set_num_threads(4)
    run=ROOT/"results"/("detector_grayscale_"+time.strftime("%Y%m%d_%H%M%S",time.gmtime()))
    run.mkdir(parents=True)
    active=ROOT/"models/yolov8s.pt"
    shutil.copy2(active,run/"previous_detector.pt")
    current_mode=YOLO(str(active)).ckpt.get("vetai_preprocessing","rgb")
    before_original=image_level(active,current_mode)
    print("Original validation image decisions before grayscale:",before_original,flush=True)
    data=ROOT/"data"/("detection_grayscale_"+run.name.removeprefix("detector_grayscale_"))
    if data.exists():
        raise FileExistsError(f"{data} exists; preserve and inspect it before running another experiment")
    for split in ["train","val"]:
        for src in sorted((ROOT/"data/detection"/split/"images").iterdir()):
            destination=data/split/"images"/(src.stem+".png")
            destination.parent.mkdir(parents=True,exist_ok=True)
            prepare_detector_image(Image.open(src).convert("RGB"),"grayscale_rgb").save(destination)
            label=data/split/"labels"/(src.stem+".txt")
            label.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(src.parent.parent/"labels"/(src.stem+".txt"),label)
    config=run/"data.yaml"
    config.write_text(f"path: {json.dumps(data.resolve().as_posix())}\ntrain: train/images\nval: val/images\nnames: [ecanis]\n")
    before=validate(active,run/"before",data_config=config if current_mode=="grayscale_rgb" else None)
    model=YOLO(str(active))
    model.train(data=str(config),epochs=args.epochs,imgsz=512,batch=4,nbs=4,workers=0,device="cpu",
                freeze=10,optimizer="AdamW",lr0=.0002,lrf=.2,warmup_epochs=0.,warmup_bias_lr=0.,
                seed=42,cos_lr=True,mosaic=0.,close_mosaic=0,scale=.1,translate=.05,hsv_s=0.,hsv_v=.15,
                project=str(run),name="training",exist_ok=False,patience=8)
    candidate=Path(model.trainer.best)
    after=validate(candidate,run/"after",data_config=config)
    after_original=image_level(candidate,"grayscale_rgb")
    # Compare original-image validation decisions too, rather than only grayscale exports.
    promoted=(after["f1"]>0 and after["f1"]>=before["f1"]
              and after_original["f1"]>before_original["f1"]
              and after_original["tp"]>0 and after_original["fp"]<=before_original["fp"])
    if promoted:
        deployed=YOLO(str(candidate))
        deployed.ckpt["vetai_preprocessing"]="grayscale_rgb"
        staged=active.with_name("yolov8s-next.pt")
        deployed.save(str(staged))
        staged.replace(active)
    report=dict(promoted=promoted,detector_preprocessing="grayscale_rgb",before=before,after=after,
                before_original_images=before_original,after_original_images=after_original,
                previous_weights=str(run/"previous_detector.pt"),candidate_weights=str(candidate),
                test_set_used=False,confidence=.25)
    (run/"comparison.json").write_text(json.dumps(report,indent=2))
    (ROOT/"results/latest_grayscale_retry.json").write_text(json.dumps(report,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k not in ["before","after"]},indent=2),flush=True)
