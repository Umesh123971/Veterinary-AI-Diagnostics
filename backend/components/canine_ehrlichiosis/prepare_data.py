"""Create a shared, reproducible split; never modify source images."""
import argparse
import hashlib
import io
import json
import random
import re
import shutil
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parents[1] / "dataset" / "canine_ehrlichiosis_detection"
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def source_key(name):
    name = Path(name).name.split(".rf.")[0]
    name = re.sub(r"_(jpg|jpeg|png|webp)$", "", name, flags=re.I)
    return Path(name).stem.lower()

def pixel_hash(raw):
    with Image.open(io.BytesIO(raw)) as image:
        image = image.convert("RGB")
        return hashlib.sha256(str(image.size).encode() + image.tobytes()).hexdigest()

def prepare(source=SOURCE, output=ROOT / "data", seed=42):
    source, output = Path(source), Path(output)
    if output.exists():
        raise FileExistsError(f"{output} exists. Use a new --output to preserve the recorded split.")
    records = []
    for folder, label in [("healthy", "negative"), ("e-canis", "positive")]:
        for path in sorted((source / folder).iterdir()):
            if path.suffix.lower() in EXTENSIONS:
                raw = path.read_bytes()
                records.append(dict(origin=str(path), name=path.name, label=label,
                                    group=f"{label}:{source_key(path.name)}", raw=raw, boxes=None))
    if Counter(r["label"] for r in records).keys() != {"positive", "negative"}:
        raise ValueError("Both classification classes are required")
    archives = list(source.glob("*.zip"))
    if len(archives) != 1:
        raise ValueError("Expected exactly one YOLO archive")
    with zipfile.ZipFile(archives[0]) as archive:
        for name in sorted(archive.namelist()):
            if "/images/" not in name or Path(name).suffix.lower() not in EXTENSIONS:
                continue
            label_path = str(Path(name).parent.parent / "labels" / (Path(name).stem + ".txt")).replace("\\", "/")
            boxes = archive.read(label_path).decode().strip()
            for line in boxes.splitlines():
                values = list(map(float, line.split()))
                if len(values) != 5 or values[0] != 0 or not all(0 <= v <= 1 for v in values[1:]) or min(values[3:]) <= 0:
                    raise ValueError(f"Invalid YOLO annotation: {label_path}")
            if not boxes:
                raise ValueError(f"Unlabeled positive image: {name}")
            records.append(dict(origin=f"{archives[0]}::{name}", name=Path(name).name,
                                label="positive", group=f"positive:{source_key(name)}",
                                raw=archive.read(name), boxes=boxes))
    # Merge identical decoded images, including images with different names.
    parents = {r["group"]: r["group"] for r in records}
    def find(key):
        while parents[key] != key:
            parents[key] = parents[parents[key]]
            key = parents[key]
        return key
    seen = {}
    for r in records:
        digest = pixel_hash(r["raw"])
        r["sha256"] = hashlib.sha256(r["raw"]).hexdigest()
        if digest in seen:
            other = seen[digest]
            if r["label"] != other["label"]:
                raise ValueError("Identical images have conflicting labels")
            parents[find(r["group"])] = find(other["group"])
        seen[digest] = r
    for r in records:
        r["group"] = find(r["group"])
    # Stratify by class and annotation availability so all detection splits have positives.
    groups = defaultdict(list)
    for r in records:
        groups[r["group"]].append(r)
    strata = defaultdict(list)
    for group, rows in groups.items():
        strata[(rows[0]["label"], any(r["boxes"] is not None for r in rows))].append(group)
    assignments = {}
    rng = random.Random(seed)
    for key, keys in sorted(strata.items()):
        keys.sort()
        rng.shuffle(keys)
        if len(keys) < 3:
            raise ValueError(f"Too few independent source groups: {key}")
        ntest = max(1, round(len(keys) * .15))
        nval = max(1, round(len(keys) * .15))
        for i, group in enumerate(keys):
            assignments[group] = "test" if i < ntest else "val" if i < ntest+nval else "train"
    manifest = []
    for index, r in enumerate(records):
        split = assignments[r["group"]]
        name = f"{index:04d}{Path(r['name']).suffix.lower()}"
        row = {k: v for k, v in r.items() if k not in {"raw", "boxes"}}
        row["split"] = split
        # Classifier uses original full images only, not pre-augmented YOLO exports.
        if r["boxes"] is None:
            dest = output / "classification" / split / r["label"] / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(r["raw"])
            row["classification"] = str(dest.relative_to(output))
        # Only annotated positives and confirmed healthy negatives enter detector training.
        if r["boxes"] is not None or r["label"] == "negative":
            dest = output / "detection" / split / "images" / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            # Both detector classes use the same representation; classifier originals stay RGB.
            with Image.open(io.BytesIO(r["raw"])) as detection_image:
                detection_image.convert("L").convert("RGB").save(dest)
            labels = output / "detection" / split / "labels" / (Path(name).stem + ".txt")
            labels.parent.mkdir(parents=True, exist_ok=True)
            labels.write_text(r["boxes"] or "", encoding="utf-8")
            row["detection"] = str(dest.relative_to(output))
        manifest.append(row)
    yaml = f"path: {json.dumps((output / 'detection').resolve().as_posix())}\ntrain: train/images\nval: val/images\ntest: test/images\nnames: [ecanis]\n"
    (output / "detection.yaml").write_text(yaml, encoding="utf-8")
    report = dict(seed=seed, detector_preprocessing="grayscale_rgb", grouping="source filename and exact decoded-pixel duplicates; patient IDs unavailable",
                  counts=dict(Counter(f"{r['split']}/{r['label']}" for r in manifest)), records=manifest)
    (output / "manifest.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k != "records"}, indent=2))
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=SOURCE)
    parser.add_argument("--output", type=Path, default=ROOT / "data")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    prepare(args.source, args.output, args.seed)
