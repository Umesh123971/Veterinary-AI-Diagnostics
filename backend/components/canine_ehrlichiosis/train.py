"""Train YOLOv8s and transfer-learn ResNet50; keep the test set untouched."""
import argparse
import json
import random
import shutil
from pathlib import Path
import numpy as np
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import resnet50, ResNet50_Weights
from ultralytics import YOLO
from pipeline import ROOT, preprocessing

def train_classifier(data, epochs, batch, device, results, models):
    augment = transforms.Compose([transforms.Resize((224,224)),transforms.RandomHorizontalFlip(),
                                  transforms.RandomVerticalFlip(),transforms.ToTensor(),
                                  transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
    sets = {s: datasets.ImageFolder(data / "classification" / s, transform=augment if s=="train" else preprocessing()) for s in ["train","val"]}
    assert sets["train"].class_to_idx == {"negative":0,"positive":1}
    loaders = {s:DataLoader(d,batch_size=batch,shuffle=s=="train",num_workers=0) for s,d in sets.items()}
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    for parameter in model.parameters():
        parameter.requires_grad = False
    model.fc = torch.nn.Linear(model.fc.in_features,2)
    model.to(device)
    optimizer = torch.optim.AdamW(model.fc.parameters(),lr=1e-3)
    loss_fn = torch.nn.CrossEntropyLoss()
    history, best = [], float("inf")
    for epoch in range(epochs):
        row = {"epoch":epoch+1}
        for split in ["train","val"]:
            # Freeze backbone batch-normalization statistics with the frozen backbone.
            model.eval()
            model.fc.train(split=="train")
            loss_sum, correct = 0., 0
            for images, labels in loaders[split]:
                images,labels=images.to(device),labels.to(device)
                optimizer.zero_grad(set_to_none=True)
                with torch.set_grad_enabled(split=="train"):
                    logits=model(images)
                    loss=loss_fn(logits,labels)
                    if split=="train":
                        loss.backward()
                        optimizer.step()
                loss_sum += float(loss.detach())*len(labels)
                correct += int((logits.argmax(1)==labels).sum())
            row[split+"_loss"]=loss_sum/len(sets[split])
            row[split+"_accuracy"]=correct/len(sets[split])
        if row["val_loss"] < best:
            best=row["val_loss"]
            torch.save({"state_dict":model.cpu().state_dict(),"class_to_idx":sets["train"].class_to_idx,
                        "epoch":epoch+1,"training":"frozen ImageNet backbone; trained binary head"},models/"resnet50.pt")
            model.to(device)
        history.append(row)
        (results/"classification_history.json").write_text(json.dumps(history,indent=2))
        print(row,flush=True)

if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--stage",choices=["all","detection","classification"],default="all")
    parser.add_argument("--epochs",type=int,default=30)
    parser.add_argument("--batch",type=int,default=4)
    parser.add_argument("--imgsz",type=int,default=640)
    parser.add_argument("--device",default="cpu")
    parser.add_argument("--threads",type=int,default=4)
    parser.add_argument("--data",type=Path,default=ROOT/"data")
    args=parser.parse_args()
    if args.epochs < 1 or args.batch < 1:
        parser.error("epochs and batch must be positive")
    random.seed(42); np.random.seed(42); torch.manual_seed(42)
    torch.set_num_threads(args.threads)
    models,results=ROOT/"models",ROOT/"results"
    models.mkdir(exist_ok=True); results.mkdir(exist_ok=True)
    if args.stage in ["all","detection"]:
        manifest=json.loads((args.data/"manifest.json").read_text())
        if manifest.get("detector_preprocessing") != "grayscale_rgb":
            raise ValueError("Legacy mixed-color detector data. Use normalize_detector.py, or prepare a fresh dataset with prepare_data.py --output and pass it via --data.")
        # Store pretrained downloads inside the component too.
        detector=YOLO(str(models/"yolov8s-pretrained.pt")) if (models/"yolov8s-pretrained.pt").exists() else None
        if detector is None:
            from ultralytics.utils.downloads import attempt_download_asset
            downloaded=attempt_download_asset(str(models/"yolov8s.pt"))
            shutil.move(downloaded,models/"yolov8s-pretrained.pt")
            detector=YOLO(str(models/"yolov8s-pretrained.pt"))
        detector.train(data=str(args.data/"detection.yaml"),epochs=args.epochs,imgsz=args.imgsz,
                       batch=args.batch,device=args.device,workers=0,seed=42,
                       optimizer="AdamW",lr0=.0005,lrf=.1,nbs=args.batch,
                       warmup_epochs=1.,warmup_bias_lr=.0005,freeze=10,cos_lr=True,
                       mosaic=0.,close_mosaic=0,scale=.15,translate=.05,hsv_s=.2,hsv_v=.2,
                       project=str(results),name="detection",exist_ok=False,patience=10)
        active=models/"yolov8s.pt"
        if active.exists():
            shutil.copy2(active,Path(detector.trainer.save_dir)/"previous_active_detector.pt")
        staged=models/"yolov8s-next.pt"
        deployed=YOLO(str(detector.trainer.best))
        manifest=json.loads((args.data/"manifest.json").read_text())
        deployed.ckpt["vetai_preprocessing"]=manifest.get("detector_preprocessing","rgb")
        deployed.save(str(staged))
        staged.replace(active)
    if args.stage in ["all","classification"]:
        torch.hub.set_dir(str(models/"pretrained"))
        train_classifier(args.data,args.epochs,args.batch,torch.device(args.device),results,models)
