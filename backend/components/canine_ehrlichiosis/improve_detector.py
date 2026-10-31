"""Small-data YOLO retry; promote only after a validation-only comparison."""
import argparse
import json
import shutil
import time
from pathlib import Path
import torch
from ultralytics import YOLO
from pipeline import ROOT


def iou(a,b):
    area=max(0,min(a[2],b[2])-max(a[0],b[0]))*max(0,min(a[3],b[3])-max(a[1],b[1]))
    union=(a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-area
    return area/union if union>0 else 0.


def validate(weights, output, device="cpu", data_config=None):
    model=YOLO(str(weights))
    config=Path(data_config) if data_config else ROOT/"data/detection.yaml"
    import yaml
    data_root=Path(yaml.safe_load(config.read_text())["path"])
    measured=model.val(data=str(config),split="val",imgsz=640,batch=4,device=device,workers=0,
                       project=str(output),name="localization",plots=True,verbose=False)
    tp=fp=fn=positive_images_detected=negative_images_with_boxes=0
    cases=[]
    for image in sorted((data_root/"val/images").iterdir()):
        prediction=model.predict(str(image),conf=.25,imgsz=640,device=device,verbose=False)[0]
        height,width=prediction.orig_shape
        truth=[]
        for line in (image.parent.parent/"labels"/(image.stem+".txt")).read_text().splitlines():
            _,xc,yc,w,h=map(float,line.split())
            truth.append([(xc-w/2)*width,(yc-h/2)*height,(xc+w/2)*width,(yc+h/2)*height])
        matched=set()
        case_tp=case_fp=0
        for box in prediction.boxes:
            xyxy=box.xyxy[0].cpu().tolist()
            eligible=[(iou(xyxy,t),i) for i,t in enumerate(truth) if i not in matched]
            score,index=max(eligible,default=(0,-1))
            if score>=.5:
                matched.add(index); case_tp+=1
            else:
                case_fp+=1
        case_fn=len(truth)-len(matched)
        tp+=case_tp; fp+=case_fp; fn+=case_fn
        positive_images_detected+=int(bool(truth) and case_tp>0)
        negative_images_with_boxes+=int(not truth and len(prediction.boxes)>0)
        cases.append(dict(image=image.name,tp=case_tp,fp=case_fp,fn=case_fn,
                          max_confidence=float(prediction.boxes.conf.max()) if len(prediction.boxes) else 0.))
    report=dict(weights=str(weights),confidence=.25,iou=.5,tp=tp,fp=fp,fn=fn,
                precision=tp/(tp+fp) if tp+fp else 0.,recall=tp/(tp+fn) if tp+fn else 0.,
                f1=2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else 0.,
                positive_images_detected=positive_images_detected,
                negative_images_with_boxes=negative_images_with_boxes,
                map50=float(measured.box.map50),map50_95=float(measured.box.map),cases=cases)
    output.mkdir(parents=True,exist_ok=True)
    (output/"validation.json").write_text(json.dumps(report,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k!="cases"},indent=2),flush=True)
    return report


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--epochs",type=int,default=25)
    parser.add_argument("--device",default="cpu")
    parser.add_argument("--imgsz",type=int,default=512)
    args=parser.parse_args()
    torch.set_num_threads(4)
    prepared_manifest=json.loads((ROOT/"data/manifest.json").read_text())
    if prepared_manifest.get("detector_preprocessing") != "grayscale_rgb":
        raise ValueError("Legacy mixed-color detector data: use normalize_detector.py for this prepared dataset.")
    run=ROOT/"results"/("detector_retry_"+time.strftime("%Y%m%d_%H%M%S",time.gmtime()))
    run.mkdir(parents=True)
    active=ROOT/"models/yolov8s.pt"
    backup=run/"previous_detector.pt"
    shutil.copy2(active,backup)
    before=validate(backup,run/"before",args.device)
    model=YOLO(str(ROOT/"models/yolov8s-pretrained.pt"))
    model.train(data=str(ROOT/"data/detection.yaml"),epochs=args.epochs,imgsz=args.imgsz,batch=4,
                nbs=4,device=args.device,workers=0,seed=42,optimizer="AdamW",lr0=.0005,lrf=.1,
                warmup_epochs=1.,warmup_bias_lr=.0005,freeze=10,cos_lr=True,patience=10,
                mosaic=0.,close_mosaic=0,scale=.15,translate=.05,hsv_s=.2,hsv_v=.2,
                project=str(run),name="training",exist_ok=False)
    candidate=Path(model.trainer.best)
    after=validate(candidate,run/"after",args.device)
    # No test-set feedback, threshold reduction, or classifier modifications.
    promoted=after["f1"]>before["f1"] and after["map50_95"]>before["map50_95"]
    if promoted:
        staged=active.with_name("yolov8s-next.pt")
        deployed=YOLO(str(candidate))
        manifest=json.loads((ROOT/"data/manifest.json").read_text())
        deployed.ckpt["vetai_preprocessing"]=manifest.get("detector_preprocessing","rgb")
        deployed.save(str(staged))
        staged.replace(active)
    comparison=dict(promoted=promoted,selection="validation F1 at confidence .25 and IoU .5, plus validation mAP50-95 must both improve",before=before,after=after,
                    previous_weights=str(backup),candidate_weights=str(candidate),test_set_used=False)
    (run/"comparison.json").write_text(json.dumps(comparison,indent=2))
    (ROOT/"results/latest_detector_retry.json").write_text(json.dumps(comparison,indent=2))
    print("Detector promoted:",promoted,"Results:",run,flush=True)
