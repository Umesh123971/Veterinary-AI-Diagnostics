"""
Self-Contained Babesia Cytological Diagnostic Engine
---------------------------------------------------
Copy this file ('babesia_detector.py') and 'model.pkl' into your website folder.
It works immediately with NO background server needed.

Usage in your website backend:
    from babesia_detector import diagnose_blood_smear

    result = diagnose_blood_smear(image_file)
    print(result['diagnosis'])    # 'Babesia Positive (Infected)' or 'Babesia Negative'
    print(result['probability'])  # 0.9631 (96.31%)
    print(result['status'])       # '[!] Active Piroplasm Infection Detected'
"""

import os
import io
import json
import pickle
import sys
import base64

# Auto-redirect to local .venv if run directly
try:
    import numpy as np
    from PIL import Image
except ImportError:
    venv_py = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "Scripts", "python.exe")
    if os.path.exists(venv_py) and os.path.normpath(sys.executable) != os.path.normpath(venv_py):
        import subprocess
        sys.exit(subprocess.call([venv_py] + sys.argv))
    else:
        raise

def _resolve_image(image_input):
    """Safely converts file path, base64 data-URL, file-like object, or PIL Image into a PIL Image."""
    if isinstance(image_input, Image.Image):
        return image_input.copy()
    if isinstance(image_input, str):
        if image_input.startswith("data:image") or ";base64," in image_input:
            raw_b64 = image_input.split(";base64,")[-1]
            return Image.open(io.BytesIO(base64.b64decode(raw_b64)))
        return Image.open(image_input)
    if isinstance(image_input, bytes):
        return Image.open(io.BytesIO(image_input))
    if hasattr(image_input, 'read'):
        pos = image_input.tell() if hasattr(image_input, 'tell') else 0
        img = Image.open(image_input)
        img.load()
        if hasattr(image_input, 'seek'):
            image_input.seek(pos)
        return img
    raise ValueError(f"Unsupported image input type: {type(image_input)}")

def extract_features(image_input):
    """Extracts the 21 Giemsa cytology features from an image path, file object, base64 string, or PIL Image."""
    img = _resolve_image(image_input).convert("RGB").resize((64, 64))
    pixels = np.array(img, dtype=np.float32)

    r = pixels[:, :, 0]
    g = pixels[:, :, 1]
    b = pixels[:, :, 2]
    gray = 0.299 * r + 0.587 * g + 0.114 * b

    # 1. Color moments
    r_mean, r_std = float(np.mean(r)), float(np.std(r))
    g_mean, g_std = float(np.mean(g)), float(np.std(g))
    b_mean, b_std = float(np.mean(b)), float(np.std(b))
    gray_mean, gray_std = float(np.mean(gray)), float(np.std(gray))

    # 2. Stain chemistry ratios
    bg_ratio = b / (g + 1.0)
    br_ratio = b / (r + 1.0)
    bg_mean = float(np.mean(bg_ratio))
    bg_p95 = float(np.percentile(bg_ratio, 95))
    bg_max = float(np.max(bg_ratio))
    br_mean = float(np.mean(br_ratio))
    br_p95 = float(np.percentile(br_ratio, 95))

    # 3. Low-intensity percentiles
    p1 = float(np.percentile(gray, 1))
    p5 = float(np.percentile(gray, 5))
    p10 = float(np.percentile(gray, 10))
    p25 = float(np.percentile(gray, 25))
    p50 = float(np.percentile(gray, 50))
    p95 = float(np.percentile(gray, 95))

    contrast_spot = p50 - p5
    contrast_dynamic = p95 - p5

    # 4. Spatial gradient energy
    diff_h = np.abs(gray[:, 1:] - gray[:, :-1])
    diff_v = np.abs(gray[1:, :] - gray[:-1, :])
    grad_energy = float(np.mean(diff_h) + np.mean(diff_v)) / 2.0

    return np.array([
        r_mean, r_std, g_mean, g_std, b_mean, b_std, gray_mean, gray_std,
        bg_mean, bg_p95, bg_max, br_mean, br_p95,
        p1, p5, p10, p25, p50, contrast_spot, contrast_dynamic, grad_energy
    ], dtype=np.float32).reshape(1, -1)

# Proxy class stubs so unpickling works without requiring train.py
class StandardFeatureScaler:
    pass

class NeuralClassifier:
    pass

class BabesiaDetector:
    pass

class RobustUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module in ('train', '__main__'):
            target = globals().get(name)
            if target:
                return target
        return super().find_class(module, name)

def validate_blood_smear_image(image_input):
    """
    Validates whether an image has the optical, physical, and stain characteristics
    of a Giemsa-stained microscopic canine blood smear slide.
    Rejects: non-microscopy photos (dogs, nature, rooms, documents, cars, memes, etc.).
    """
    try:
        img = _resolve_image(image_input).convert("RGB")
    except Exception as e:
        return False, f"Could not decode image file: {str(e)}"

    w, h = img.size
    if w < 24 or h < 24:
        return False, f"Image resolution ({w}x{h}) is too low for microscopic analysis."

    arr = np.array(img, dtype=np.float32)
    rm = float(np.mean(arr[:, :, 0]))
    gm = float(np.mean(arr[:, :, 1]))
    bm = float(np.mean(arr[:, :, 2]))
    brightness = 0.299 * rm + 0.587 * gm + 0.114 * bm

    # 1. Optical field illumination check
    if brightness < 45.0:
        return False, f"Image is too dark (brightness={brightness:.1f}). Microscope light field illumination is required."
    if brightness > 248.0:
        return False, f"Image is stark white or blank (brightness={brightness:.1f}). No cellular structures detected."

    # 2. Giemsa/Romanowsky stain chemistry check:
    # Canine erythrocytes absorbing acidic eosin dye are stained pink/salmon (Red > Green).
    # In nature, outdoor, green, blue, or neutral photos, Red is NOT significantly greater than Green.
    if (rm - gm) < 4.0:
        return False, f"Non-cytological color spectrum (R-G={rm-gm:.1f}). Expected Giemsa/Wright-stained erythrocyte pink/lavender coloration."

    # 3. Azure B / Methylene Blue stain check (Blue channel must be present in Romanowsky cytology)
    if bm < 45.0 or (bm / (gm + 1.0)) < 0.55:
        return False, f"Missing Romanowsky Azure B stain absorption (B={bm:.1f})."

    # 4. Check for pure grayscale/monochrome documents, invoices, or sketches
    if abs(rm - gm) < 3.5 and abs(rm - bm) < 3.5:
        return False, "Image is monochrome/grayscale without cytological differential staining."

    return True, "Valid blood smear slide"

class StandaloneBabesiaEngine:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Look for model.pkl or checkpoints/model.pkl
        pkl_candidates = [
            os.path.join(curr_dir, "model.pkl"),
            os.path.join(curr_dir, "checkpoints", "model.pkl"),
            os.path.join(curr_dir, "best_model.json"),
            os.path.join(curr_dir, "checkpoints", "best_model.json"),
        ]

        loaded = False
        for path in pkl_candidates:
            if os.path.exists(path):
                if path.endswith(".pkl"):
                    try:
                        with open(path, "rb") as f:
                            obj = RobustUnpickler(f).load()
                            self.W1 = np.array(obj.model.W1, dtype=np.float32)
                            self.b1 = np.array(obj.model.b1, dtype=np.float32)
                            self.W2 = np.array(obj.model.W2, dtype=np.float32)
                            self.b2 = np.array(obj.model.b2, dtype=np.float32)
                            self.mean = np.array(obj.scaler.mean, dtype=np.float32)
                            self.std = np.array(obj.scaler.std, dtype=np.float32)
                            self.threshold = float(getattr(obj, "threshold", 0.35))
                            loaded = True
                            break
                    except Exception as err:
                        print(f"[Warning] Failed loading {path}: {err}")
                elif path.endswith(".json"):
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        self.W1 = np.array(data["model"]["W1"], dtype=np.float32)
                        self.b1 = np.array(data["model"]["b1"], dtype=np.float32)
                        self.W2 = np.array(data["model"]["W2"], dtype=np.float32)
                        self.b2 = np.array(data["model"]["b2"], dtype=np.float32)
                        self.mean = np.array(data["scaler"]["mean"], dtype=np.float32)
                        self.std = np.array(data["scaler"]["std"], dtype=np.float32)
                        self.threshold = 0.35
                        loaded = True
                        break

        if not loaded:
            raise FileNotFoundError("Could not find or load 'model.pkl' in the diagnostics folder.")

        self.std[self.std < 1e-8] = 1.0

    def predict_image(self, image_input):
        # 1. Gatekeeper: Validate that the image is a genuine blood smear
        is_valid, reason = validate_blood_smear_image(image_input)
        if not is_valid:
            return {
                "is_valid": False,
                "diagnosis": "Invalid / Non-Microscopy Image",
                "is_positive": False,
                "probability": 0.0,
                "confidence": 0.0,
                "threshold": self.threshold,
                "status": f"[REJECTED] {reason}",
                "error": reason
            }

        # 2. Extract domain cytological features
        raw_feats = extract_features(image_input)
        scaled_feats = (raw_feats - self.mean) / self.std

        # 3. Statistical Out-of-Distribution (OOD) distance check
        z_scores = np.abs(scaled_feats)
        mean_z = float(np.mean(z_scores))
        max_z = float(np.max(z_scores))
        if mean_z > 3.6 or max_z > 50.0:
            return {
                "is_valid": False,
                "diagnosis": "Invalid / Out-of-Distribution Image",
                "is_positive": False,
                "probability": 0.0,
                "confidence": 0.0,
                "threshold": self.threshold,
                "status": "[REJECTED] Image optical features deviate from canine blood smear cytology.",
                "error": "The texture and gradient features of this image do not match blood smear microscopy."
            }

        # 4. Neural forward pass
        z1 = np.dot(scaled_feats, self.W1) + self.b1
        a1 = np.where(z1 > 0, z1, z1 * 0.01) # LeakyReLU
        z2 = np.dot(a1, self.W2) + self.b2
        prob_arr = 1.0 / (1.0 + np.exp(-np.clip(z2, -35.0, 35.0)))
        prob = float(prob_arr.flatten()[0])

        is_pos = prob >= self.threshold

        if prob >= 0.50:
            status = "[!] Active Piroplasm Infection Detected"
            diagnosis = "Babesia Positive (Infected)"
        elif is_pos:
            status = "[?] Borderline / Low-Contrast Inclusion (Flagged for Review)"
            diagnosis = "Babesia Suspicious"
        else:
            status = "[OK] Clean Erythrocyte (Normal Cell)"
            diagnosis = "Babesia Negative (Normal / Uninfected)"

        return {
            "is_valid": True,
            "diagnosis": diagnosis,
            "is_positive": is_pos,
            "probability": round(prob, 4),
            "confidence": round(prob if is_pos else (1.0 - prob), 4),
            "threshold": self.threshold,
            "status": status
        }

def diagnose_blood_smear(image_input):
    """
    Primary API Function to call from Django, Flask, or any Python website backend.
    Accepts: file path string, PIL Image, or uploaded file object (e.g. request.FILES['image']).
    """
    engine = StandaloneBabesiaEngine.get_instance()
    return engine.predict_image(image_input)

if __name__ == "__main__":
    # Self-test
    test_pos = "Babesia_Positive/0109_143832_4.jpg"
    test_neg = "Babesia_Negetive/2_297.jpg"
    print("Testing Standalone Babesia Engine...")
    print("Positive Sample:", diagnose_blood_smear(test_pos))
    print("Negative Sample:", diagnose_blood_smear(test_neg))
