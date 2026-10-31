"""Evaluate the locked pipeline on original held-out images only."""
import argparse
import json
import shutil
import tempfile
from PIL import Image
from pathlib import Path
from pipeline import ROOT, EhrlichiosisPipeline, prepare_detector_image

def metrics(truth,prediction):
    tp=sum(t==1 and p==1 for t,p in zip(truth,prediction))
    tn=sum(t==0 and p==0 for t,p in zip(truth,prediction))
    fp=sum(t==0 and p==1 for t,p in zip(truth,prediction))
    fn=sum(t==1 and p==0 for t,p in zip(truth,prediction))
    return dict(tp=tp,tn=tn,fp=fp,fn=fn,accuracy=(tp+tn)/len(truth),
                sensitivity=tp/(tp+fn) if tp+fn else None,
                specificity=tn/(tn+fp) if tn+fp else None,
                precision=tp/(tp+fp) if tp+fp else None,
                f1=2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else None)

def validate_localization(pipeline, split, device):
    kwargs=dict(split=split,imgsz=640,batch=4,device=device,workers=0,project=str(ROOT/"results"),name=f"detector_{split}")
    if pipeline.detector_preprocessing == "rgb":
        return pipeline.detector.val(data=str(ROOT/"data/detection.yaml"),**kwargs)
    # Normalize only the requested evaluation split, when evaluation is explicitly run.
    # No classifier images or source detector data are modified.
    with tempfile.TemporaryDirectory(prefix="evaluation_",dir=ROOT/"results") as temp:
        directory=Path(temp)
        for src in sorted((ROOT/"data/detection"/split/"images").iterdir()):
            image=directory/"images"/(src.stem+".png")
            image.parent.mkdir(exist_ok=True)
            prepare_detector_image(Image.open(src).convert("RGB"),pipeline.detector_preprocessing).save(image)
            label=directory/"labels"/(src.stem+".txt")
            label.parent.mkdir(exist_ok=True)
            shutil.copy2(src.parent.parent/"labels"/(src.stem+".txt"),label)
        config=directory/"data.yaml"
        config.write_text(f"path: {json.dumps(directory.as_posix())}\ntrain: images\nval: images\ntest: images\nnames: [ecanis]\n")
        return pipeline.detector.val(data=str(config),**kwargs)

if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--split",choices=["val","test"],default="test")
    parser.add_argument("--device",default="cpu")
    args=parser.parse_args()
    model=EhrlichiosisPipeline(device=args.device)
    truth,hybrid,classifier,detector,rows=[],[],[],[],[]
    for label in ["negative","positive"]:
        for path in sorted((ROOT/"data"/"classification"/args.split/label).iterdir()):
            result=model.predict(path)
            truth.append(int(label=="positive"))
            hybrid.append(int(result["prediction"]=="Positive"))
            classifier.append(int(result["classifier_positive_probability"]>=.5))
            detector.append(int(bool(result["boxes"])))
            rows.append(dict(image=path.name,truth=label,**result))
    report=dict(split=args.split,patient_grouping_available=False,detector_preprocessing=model.detector_preprocessing,
                hybrid=metrics(truth,hybrid),classifier=metrics(truth,classifier),
                detector_image_level=metrics(truth,detector),predictions=rows)
    dest=ROOT/"results"/f"{args.split}_metrics.json"
    dest.write_text(json.dumps(report,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k!="predictions"},indent=2))
    detection=validate_localization(model,args.split,args.device)
    (ROOT/"results"/f"detection_{args.split}_metrics.json").write_text(json.dumps(detection.results_dict,indent=2))
