import io
import json
import tempfile
import unittest
import zipfile
from pathlib import Path
from PIL import Image
from prepare_data import prepare
from pipeline import fuse, EhrlichiosisPipeline, preprocessing, prepare_detector_image
from evaluate import metrics
from improve_detector import iou

class ComponentTests(unittest.TestCase):
    def test_grayscale_detector_preserves_original_color(self):
        image=Image.new("RGB",(12,12),(255,0,0))
        detector=prepare_detector_image(image,"grayscale_rgb")
        a,b,c=detector.getpixel((0,0))
        self.assertEqual(a,b)
        self.assertEqual(b,c)
        self.assertEqual(image.getpixel((0,0)),(255,0,0))
        self.assertEqual(prepare_detector_image(image).getpixel((0,0)),(255,0,0))
        with self.assertRaises(ValueError):
            prepare_detector_image(image,"unknown")

    def test_localization_overlap_for_model_selection(self):
        self.assertEqual(iou([0,0,10,10],[0,0,10,10]),1.)
        self.assertEqual(iou([0,0,10,10],[0,0,5,10]),.5)
        self.assertEqual(iou([0,0,10,10],[11,0,20,10]),0.)
        self.assertEqual(iou([0,0,0,0],[0,0,0,0]),0.)

    def test_fusion_all_combinations(self):
        self.assertEqual(fuse(.9,[{}]),"Positive")
        self.assertEqual(fuse(.9,[]),"Negative")
        self.assertEqual(fuse(.1,[{}]),"Negative")
        self.assertEqual(fuse(.1,[]),"Negative")
        self.assertEqual(fuse(.5,[{}]),"Positive")

    def test_annotation_output_with_controlled_model_predictions(self):
        # Controlled predictions exercise the renderer without claiming model accuracy.
        import torch
        from types import SimpleNamespace
        class Classifier:
            def __call__(self, image):
                return torch.tensor([[0.,4.]])
        class Detector:
            def predict(self,*args,**kwargs):
                return [SimpleNamespace(boxes=[SimpleNamespace(xyxy=torch.tensor([[4.,8.,20.,24.]]),conf=torch.tensor([.9]))])]
        pipeline=EhrlichiosisPipeline.__new__(EhrlichiosisPipeline)
        pipeline.device=torch.device("cpu")
        pipeline.classifier=Classifier()
        pipeline.detector=Detector()
        pipeline.transform=preprocessing()
        pipeline.detection_threshold=.25
        pipeline.classification_threshold=.5
        with tempfile.TemporaryDirectory() as temp:
            result=pipeline.predict(Image.new("RGB",(32,32),"white"),temp)
            self.assertEqual(result["prediction"],"Positive")
            self.assertEqual(result["boxes"][0]["xyxy"],[4.,8.,20.,24.])
            self.assertEqual(Image.open(Path(temp)/"annotated.png").getpixel((4,16)),(255,0,0))
            self.assertEqual(json.loads((Path(temp)/"prediction.json").read_text())["prediction"],"Positive")

    def test_metrics_with_no_positive_predictions(self):
        result=metrics([0,1],[0,0])
        self.assertEqual(result["fn"],1)
        self.assertEqual(result["specificity"],1)
        self.assertEqual(result["sensitivity"],0)
        self.assertIsNone(result["precision"])

    def test_shared_split_and_negative_detection_labels(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            for folder in ["e-canis","healthy"]:
                (root/folder).mkdir()
            with zipfile.ZipFile(root/"annotations.zip","w") as archive:
                for index in range(8):
                    for folder,color in [("e-canis",(index*20,10,0)),("healthy",(0,index*20,30))]:
                        path=root/folder/f"{index}.png"
                        Image.new("RGB",(16,16),color).save(path)
                        if folder=="e-canis":
                            # Two export variants of the same original source.
                            for variant in ["a","b"]:
                                stem=f"{index}_png.rf.{variant}"
                                archive.writestr(f"train/images/{stem}.png",path.read_bytes())
                                archive.writestr(f"train/labels/{stem}.txt","0 0.5 0.5 0.3 0.3")
            report=prepare(root,root/"output")
            groups={}
            for row in report["records"]:
                groups.setdefault(row["group"],set()).add(row["split"])
                if row["label"]=="negative":
                    label=(root/"output"/row["detection"]).parent.parent/"labels"/(Path(row["detection"]).stem+".txt")
                    self.assertEqual(label.read_text(),"")
                    with Image.open(root/"output"/row["detection"]) as prepared:
                        red,green,blue=prepared.convert("RGB").getpixel((0,0))
                        self.assertEqual(red,green)
                        self.assertEqual(green,blue)
            self.assertTrue(all(len(splits)==1 for splits in groups.values()))
            self.assertEqual({r["split"] for r in report["records"]},{"train","val","test"})
            with self.assertRaises(FileExistsError):
                prepare(root,root/"output")
            # A healthy duplicate of a positive image must fail before output creation.
            (root/"healthy"/"conflict.png").write_bytes((root/"e-canis"/"0.png").read_bytes())
            with self.assertRaisesRegex(ValueError,"conflicting labels"):
                prepare(root,root/"conflict_output")

if __name__=="__main__":
    unittest.main()
