"""Full-image ResNet50 classification plus YOLOv8s cell localization."""
import argparse
import json
from pathlib import Path
import torch
from PIL import Image, ImageDraw
from torchvision import transforms
from torchvision.models import resnet50
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent

def preprocessing():
    return transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor(),
                               transforms.Normalize([.485,.456,.406],[.229,.224,.225])])

def prepare_detector_image(image, preprocessing="rgb"):
    if preprocessing == "grayscale_rgb":
        return image.convert("L").convert("RGB")
    if preprocessing == "rgb":
        return image.convert("RGB")
    raise ValueError(f"Unknown detector preprocessing: {preprocessing}")

def fuse(probability, boxes, classification_threshold=.5):
    # This explicit AND rule is an experimental operating point, not calibrated certainty.
    return "Positive" if probability >= classification_threshold and boxes else "Negative"

class EhrlichiosisPipeline:
    def __init__(self, models=ROOT / "models", device="cpu", detection_threshold=.25, classification_threshold=.5):
        models = Path(models)
        for name in ["yolov8s.pt", "resnet50.pt"]:
            if not (models / name).is_file():
                raise FileNotFoundError(f"Missing trained component weights: {models / name}. Run train.py first.")
        self.device = torch.device(device)
        self.detector = YOLO(str(models / "yolov8s.pt"))
        if self.detector.names != {0: "ecanis"}:
            raise ValueError("Detector must be trained on the single ecanis class")
        self.detector_preprocessing = self.detector.ckpt.get("vetai_preprocessing", "rgb")
        if self.detector_preprocessing not in {"rgb", "grayscale_rgb"}:
            raise ValueError("Unsupported detector preprocessing metadata")
        state = torch.load(models / "resnet50.pt", map_location="cpu", weights_only=True)
        if state["class_to_idx"] != {"negative":0,"positive":1}:
            raise ValueError("Unexpected classifier class mapping")
        self.classifier = resnet50(weights=None)
        self.classifier.fc = torch.nn.Linear(self.classifier.fc.in_features, 2)
        self.classifier.load_state_dict(state["state_dict"])
        self.classifier.to(self.device).eval()
        self.transform = preprocessing()
        self.detection_threshold = detection_threshold
        self.classification_threshold = classification_threshold
        if not 0 <= detection_threshold <= 1 or not 0 <= classification_threshold <= 1:
            raise ValueError("Thresholds must lie between 0 and 1")

    def predict(self, image, output=None):
        image = image.convert("RGB") if isinstance(image, Image.Image) else Image.open(image).convert("RGB")
        with torch.inference_mode():
            probability = float(self.classifier(self.transform(image).unsqueeze(0).to(self.device)).softmax(1)[0,1])
        mode = getattr(self, "detector_preprocessing", "rgb")
        detector_image = prepare_detector_image(image, mode)
        detected = self.detector.predict(detector_image, conf=self.detection_threshold, imgsz=640, device=str(self.device), verbose=False)[0]
        boxes = []
        overlay = image.copy()
        draw = ImageDraw.Draw(overlay)
        for box in detected.boxes:
            xyxy = [float(v) for v in box.xyxy[0].cpu().tolist()]
            confidence = float(box.conf[0].cpu())
            boxes.append(dict(xyxy=xyxy, confidence=confidence, label="ecanis"))
            draw.rectangle(xyxy, outline="red", width=3)
            draw.text((xyxy[0],max(0,xyxy[1]-12)),f"ecanis {confidence:.2f}",fill="red")
        prediction = fuse(probability, boxes, self.classification_threshold)
        result = dict(disease="Canine Ehrlichiosis", prediction=prediction,
                      classifier_positive_probability=probability, boxes=boxes,
                      detector_preprocessing=mode,detector_image_size=640,
                      detection_threshold=self.detection_threshold,
                      classification_threshold=self.classification_threshold,
                      fusion_rule="positive iff ResNet50 positive AND at least one YOLOv8s detection",
                      disagreement=(probability >= self.classification_threshold) != bool(boxes),
                      research_only=True)
        if output is not None:
            output = Path(output)
            output.mkdir(parents=True, exist_ok=True)
            overlay.save(output / "annotated.png")
            (output / "prediction.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
        return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "results" / "prediction")
    parser.add_argument("--models", type=Path, default=ROOT / "models")
    parser.add_argument("--device", default="cpu")
    args = parser.parse_args()
    print(json.dumps(EhrlichiosisPipeline(args.models,args.device).predict(args.image,args.output),indent=2))
