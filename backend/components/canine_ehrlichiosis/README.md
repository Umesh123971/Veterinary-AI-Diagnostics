# Canine Ehrlichiosis component

**Current YOLO status:** repaired color-input preprocessing and replacement weights are active. A real color-upload example now produces a box at 79.6% confidence. Detection still missed 6 of 7 original positive validation images, so it remains experimental. See [YOLO repair results](results/detector_fix_report.md).

**Initial baseline (before YOLO repair):** both models trained for 10 CPU epochs. ResNet50 achieved 93.75% accuracy on 16 original test images. The hybrid missed all 8 positives because the detector returned no boxes at confidence 0.25. At least one positive image contains pre-existing arrows, which may cause shortcut learning. This is an experimental implementation, not a reliable detector. See [the full baseline report](results/baseline_report.md).

All component code, generated datasets, weights and outputs live here. Original datasets remain in `backend/dataset/canine_ehrlichiosis_detection`.

## Setup and commands (PowerShell, from this folder)

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe prepare_data.py
.venv/Scripts/python.exe train.py --epochs 30 --batch 4 --device cpu
.venv/Scripts/python.exe evaluate.py --split test
.venv/Scripts/python.exe pipeline.py path/to/image.jpg --output results/example
```

Use `--device cuda:0` with a CUDA-enabled PyTorch installation. Detector training also accepts Ultralytics device syntax; `cuda:0` works for both stages. `--stage detection` or `--stage classification` runs one model. A frozen ImageNet ResNet50 backbone and trained binary head provide the initial classification baseline. YOLOv8s is fine-tuned from pretrained detection weights. Downloads need internet access.

## Data and leakage controls

Folder labels confirmed by the user: `e-canis` positive, `healthy` negative. There are 51 positive and 50 healthy originals. The archive has 70 annotated positive variants from only 14 source filenames, all under `train`; its YAML references missing validation/test folders. Preparation creates new train/validation/test splits (approximately 70/15/15) shared across both tasks. Variants with the same source filename and exact decoded-pixel duplicates stay in one split. Healthy images get empty detector labels. Unannotated positive originals are never treated as detector background. The classifier trains only on original images, with augmentation applied during training.

Patient/slide IDs are unavailable. Renamed near-duplicates and images of the same patient can still cross splits. The manifest records origins, hashes and group assignments; inspect it and add provenance before interpreting performance as independent validation. Source grouping by filenames cannot guarantee biological independence. The Roboflow archive declares a private license; retain the original dataset licensing information.

## Hybrid rule

The same full smear image goes to both models. YOLOv8s localizes `ecanis` and draws rectangular boxes. ResNet50 classifies the full image (negative=0, positive=1). Output is Positive only when the classifier positive probability is at least 0.5 AND at least one detector box has confidence at least 0.25. Otherwise output is Negative; disagreement is separately flagged. These are initial experimental thresholds. Tune only on validation data, lock the rule, then evaluate once on held-out test data. An AND rule can miss positive images if either model misses evidence. The classifier probability is not a calibrated hybrid confidence or clinical disease probability.

`pipeline.py` saves `annotated.png` and `prediction.json`, including pixel-coordinate boxes and both thresholds. Missing weights raise an error; no fabricated results or generic pretrained models are substituted. A negative image prediction does not rule out disease in a dog. Outputs are for research.

`evaluate.py` reports confusion counts, sensitivity, specificity, precision, F1 and accuracy for each model and the hybrid; detector validation additionally saves mAP and plots. `results/classification_history.json` records classifier training and validation curves. Training chooses weights using validation data only.

This component is standalone. Existing Babesia endpoints and frontend behavior are unchanged; app integration should use these trained weights after validation.

References: https://docs.ultralytics.com/models/yolov8/ and https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.resnet50.html

## Local baseline run

The local `.venv` was created with `--system-site-packages` to reuse the installed CPU PyTorch stack without duplicating large packages. For an independent environment, use the setup commands above. The first local baseline uses 10 epochs per stage; this verifies operation and is not an optimized research model. `data_partial/` preserves an incomplete first preparation attempt caused by long source filenames on Windows; current generated names are short and origins remain in the manifest.

Run component checks with `.venv/Scripts/python.exe -m unittest test_component.py` from this folder.

## Upload demo interface

From this component folder, run:

```powershell
.venv/Scripts/python.exe -m streamlit run app.py --server.address 127.0.0.1 --server.port 8501
```

Open http://localhost:8501, upload a JPG/PNG/WebP smear, and click **Analyze image**. The page shows the hybrid result, classifier score, detected cell count, original and annotated images, and model disagreement. Download the annotated PNG or result JSON. The current weak-detector limitation remains visible on the page. Source arrows are not model predictions.

Uploads are processed locally. Temporary result files are removed after analysis; the displayed result remains in that browser session until the input changes. Refresh the demo after replacing trained weights; its model cache reloads when weights change. Stop the server with Ctrl+C when launched in your own terminal.

## Detector-only retry and missing-box diagnosis

The first detector checkpoint produced only approximately 0.015-0.030 maximum confidence on inspected training/validation images, with hundreds of weak proposals at confidence 0.001. No boxes survived confidence 0.25. This is a weak detector checkpoint, not a disconnected display. Lowering the threshold alone would expose many unreliable proposals.

```powershell
.venv/Scripts/python.exe improve_detector.py --epochs 25 --device cpu
```

This retrains only YOLOv8s from its original pretrained weights. The retry uses an explicit AdamW learning rate of 0.0005, a frozen backbone (first 10 layers), nominal batch equal to actual batch (4), mild stain/scale augmentation, and 512-pixel training images. Each minibatch can update the trainable weights rather than accumulating toward the original nominal batch of 64. Validation and inference use 640 pixels and confidence 0.25.

The existing detector is backed up under the retry results folder. Automatic replacement requires improvement in both validation localization mAP50-95 and validation box F1 at confidence 0.25 / IoU 0.5. The test split is not used in this selection. Full comparisons are saved in `results/latest_detector_retry.json`; runs are under `results/detector_retry_*/`. `train.py` now uses the same small-data recipe for initial training and preserves any prior active checkpoint before replacement. Use `improve_detector.py` when comparing against an existing detector.

The upload demo detects changed weight timestamps, clears stale results, and reloads the model on the next interaction. Refresh the page and analyze again after a successful retry. ResNet50 is not retrained by this command.

Training settings reference: https://docs.ultralytics.com/modes/train/

### Color upload consistency

The original YOLO archive contains grayscale positives, while the original healthy images are color. On an original validation image the retrained detector found zero boxes in color but one target at 84% confidence in grayscale. Future preparation now converts **both** detector classes to grayscale, while retaining the original RGB classification inputs and displayed images.

`normalize_detector.py --epochs 8` performs a short follow-up on consistently grayscale positives and negatives, checks localization and original-image validation decisions, and promotes only an improving detector. The deployed checkpoint stores `vetai_preprocessing=grayscale_rgb`. The pipeline reads this metadata to normalize only YOLO's branch; ResNet50 and the annotation canvas retain color. Thresholds stay at 0.25 for YOLO and 0.5 for ResNet50. Evaluation applies the same normalization to detector inputs.

Original source images, annotations, splits, and ResNet50 weights are preserved. The normalization experiment reports are in `results/latest_grayscale_retry.json` and `results/detector_grayscale_*/`.

For the legacy prepared dataset in this checkout, use `.venv/Scripts/python.exe normalize_detector.py --epochs 8` for another detector-only experiment. `train.py` and `improve_detector.py` require a freshly prepared grayscale detector dataset and refuse legacy mixed-color inputs. Current results are validation results; the initial baseline test report is historical.
