"""File-based bridge for Django; models stay in this component environment."""
import argparse
import json
from pathlib import Path
import torch
from PIL import Image
from pipeline import EhrlichiosisPipeline

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--image",required=True,type=Path)
    parser.add_argument("--output",required=True,type=Path)
    args=parser.parse_args()
    torch.set_num_threads(4)
    with Image.open(args.image) as source:
        image=source.convert("RGB")
    result=EhrlichiosisPipeline().predict(image,args.output)
    result["width"],result["height"]=image.size
    (args.output/"prediction.json").write_text(json.dumps(result),encoding="utf-8")
