# Main-project Ehrlichiosis integration

## Run locally

Backend (PowerShell, from `backend`):

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe manage.py migrate
.venv\Scripts\python.exe manage.py runserver 8000
```

Frontend (a second terminal, from `frontend`):

```powershell
npm install
npm run dev
```

Open http://localhost:5173. Keep the component Python environment at
`backend/components/canine_ehrlichiosis/.venv` and the existing trained
`models/resnet50.pt` and `models/yolov8s.pt`. `EHRLICHIOSIS_PYTHON` can override
the model interpreter. Model inference runs in a separate process so the Django
and PyTorch dependencies can remain isolated.

## Demonstration workflow

1. Add a patient with animal/owner details, CBC PDF and blood-smear image.
2. Save the patient, then click **Diagnose**.
3. Verify extracted values and units beside the original PDF. Correct any mistakes.
   RBC, PCV, hemoglobin, WBC and platelets are required. Missing optional fields
   stay missing. Image-only/scanned PDFs require manual entry; OCR is not included.
4. Select the reference profile and explicitly confirm the reviewed CBC.
5. Continue to image analysis. The results show CBC flags, ResNet50 score,
   actual YOLO boxes, the weighted result, and model availability.
6. Use technician verification and the printable report/JSON export as needed.

Replacing files or editing CBC invalidates previous analysis. Revision tokens
prevent a model result from overwriting newer CBC edits. Patient-owned file API
routes serve reports/images even with DEBUG=False; the PDF preview uses a blob.

## Scores and limits

The image contribution is the ResNet50 positive score. YOLO supplies localization
evidence and does not veto a positive ResNet result. No boxes is a valid image
result. Missing images, missing model files, invalid outputs, timeouts and model
exceptions produce a clearly labelled CBC-only result.

Combined score = 0.30 * CBC pattern score + 0.70 * ResNet50 positive score.
CBC-only score = CBC pattern score, with weights 1.0 and 0.0.

CBC values are flagged against the selected reference intervals. The default
uses extracted report-laboratory intervals where present, with Cornell canine
intervals for missing ranges. The alternative uses Cornell throughout. Intervals
are method dependent, and extracted report units/ranges require technician review.

The separate CBC scoring heuristic weights thrombocytopenia 0.65, mean normalized
RBC/PCV/hemoglobin deficits 0.25, and leukopenia 0.10. For a low platelet count,
the platelet signal is 0.5 + 0.5 * relative deficit below the lower limit; other
deficits are clipped to [0,1]. This is an engineering research heuristic, not a
clinically validated probability. Other abnormalities are still displayed.

Only Ehrlichiosis is connected. Babesiosis, Dirofilariasis and Hepatozoonosis
are shown as model unavailable, with no invented scores. Existing models have
limited validation; zero boxes or a low score cannot exclude infection. Patient-
or slide-level IDs were unavailable during the earlier dataset setup.

## Code map

- `cbc.py`: extraction, normalized units, intervals, rules and score fusion.
- `pipeline.py`: ResNet50 and YOLOv8s inference/preprocessing.
- `infer_service.py`: model-environment subprocess entry point.
- `../../diagnostics/integration.py`: safe uploads, stored-file resolution and model bridge.
- `../../diagnostics/views.py`: patient workflow, CBC confirmation and inference endpoints.
- `../../diagnostics/tests.py`: backend regression coverage.
- `frontend/src/pages/diagnosis/CbcReviewDiagnosis.jsx`: editable CBC review.
- `frontend/src/components/diagnosis/IntegratedAnalysis.jsx`: integrated result display.

Patient API actions: `extract-cbc/`, `update-cbc/`, `run-ai/`, `replace-files/`,
`files/cbc/`, `files/image/`, `files/annotated/`, `technician-review/` and
`doctor-review/`, under `/api/patients/{id}/`.

## Verification

From backend: `.venv\Scripts\python.exe manage.py test diagnostics --noinput`.
From frontend: `npm run build`.

For the real-model browser test, run both servers, set `CBC_TEST_PDF` to a local
text-based CBC report matching the supplied report layout, then run
`npx playwright test --config playwright.config.js` from frontend. It uses Edge,
verifies PDF extraction/correction, real boxes, persisted fusion, export and
CBC-only fallback, then removes only its own generated test patients/media.
Screenshots are written to ignored `frontend/test-results/`.

## Reference sources

- Cornell canine hematology intervals:
  https://www.vet.cornell.edu/animal-health-diagnostic-center/laboratories/clinical-pathology/reference-intervals/hematology-advia-2120
- Merck Veterinary Manual, Ehrlichiosis in Dogs:
  https://www.merckvetmanual.com/infectious-diseases/rickettsial-diseases-in-dogs/ehrlichiosis-in-dogs

CBC abnormalities are nonspecific. Final interpretation belongs to a veterinary
professional, with additional testing where appropriate.
