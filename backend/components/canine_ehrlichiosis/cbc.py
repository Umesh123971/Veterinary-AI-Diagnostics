"""Canine CBC extraction and transparent, non-diagnostic screening rules."""
import math
import re
from copy import deepcopy

CORNELL = "https://www.vet.cornell.edu/animal-health-diagnostic-center/laboratories/clinical-pathology/reference-intervals/hematology-advia-2120"
MERCK = "https://www.merckvetmanual.com/infectious-diseases/rickettsial-diseases-in-dogs/ehrlichiosis-in-dogs"
# Adult canine intervals; analyzer/method-specific. Prefer verified reporting-lab intervals.
_ROWS = [
    ("rbc","RBC",5.7,8.5,"10^6/uL"), ("pcv","PCV / hematocrit",42,54,"%"),
    ("hb","Hemoglobin",14.1,20.1,"g/dL"), ("wbc","WBC",5.7,14.2,"10^3/uL"),
    ("platelets","Platelets",186,545,"10^3/uL"), ("mcv","MCV",64,76,"fL"),
    ("mch","MCH",21,26,"pg"), ("mchc","MCHC",33,36,"g/dL"),
    ("rdw","RDW",10.6,14.3,"%"), ("mpv","MPV",8.4,14.1,"fL"),
    ("neutrophils","Neutrophils",42,84,"%"), ("lymphocytes","Lymphocytes",9,47,"%"),
    ("monocytes","Monocytes",2,12,"%"), ("eosinophils","Eosinophils",1,18,"%"),
    ("basophils","Basophils",0,1,"%"),
    ("neutrophilsAbsolute","Neutrophils absolute",2.7,9.4,"10^3/uL"),
    ("lymphocytesAbsolute","Lymphocytes absolute",.9,4.7,"10^3/uL"),
    ("monocytesAbsolute","Monocytes absolute",.1,1.3,"10^3/uL"),
    ("eosinophilsAbsolute","Eosinophils absolute",.1,2.1,"10^3/uL"),
    ("basophilsAbsolute","Basophils absolute",0,.1,"10^3/uL"),
]
PARAMETERS = {k:dict(key=k,name=n,min=lo,max=hi,unit=u,source=CORNELL) for k,n,lo,hi,u in _ROWS}
CORE = ("rbc","pcv","hb","wbc","platelets")
ALIASES = {
    "rbc":r"(?:RBC|Red blood cells?(?: count)?)", "pcv":r"(?:PCV|HCT|Hematocrit|Haematocrit)",
    "hb":r"(?:HGB|HB|Hemoglobin|Haemoglobin)", "wbc":r"(?:WBC|White blood cells?(?: count)?|Leukocytes)",
    "platelets":r"(?:Platelets?(?: count)?|PLT)", "mcv":r"MCV", "mchc":r"MCHC", "mch":r"MCH",
    "mpv":r"MPV", "rdw":r"(?:RDW(?:-CV)?)", "neutrophils":r"(?:Neutrophils?|NEUT|NEU)",
    "lymphocytes":r"(?:Lymphocytes?|LYMPH|LYM)", "monocytes":r"(?:Monocytes?|MONO|MON)",
    "eosinophils":r"(?:Eosinophils?|EOS)", "basophils":r"(?:Basophils?|BASO|BAS)",
}
NUMBER = r"[-+]?(?:\d[\d,]*(?:\.\d+)?|\.\d+)"
RANGE = re.compile(r"(\d+(?:\.\d+)?)\s*[-\u2013\u2014]\s*(\d+(?:\.\d+)?)")


def parameters():
    return deepcopy(list(PARAMETERS.values()))


def match_label(line):
    for key,alias in ALIASES.items():
        match=re.match(r"^\s*"+alias+r"\b\s*[:=]?\s*(.*)$",line,re.I)
        if match:
            return key,match.group(1)
    return None


def parse_text(text):
    lines=[line.strip() for line in text.replace("\u00a0"," ").splitlines() if line.strip()]
    values,refs,warnings={}, {}, []
    for index,line in enumerate(lines):
        label=match_label(line)
        if not label:
            continue
        key,tail=label
        following=[]
        for next_line in lines[index+1:index+4]:
            if match_label(next_line) or re.match(r"^(?:Comments?|FBC|Test Type|Requested By|Mr\.|Mrs\.|Dr\.)\b",next_line,re.I):
                break
            following.append(next_line)
        row=([tail] if tail else [])+following
        if not row or not re.search(NUMBER,row[0]):
            continue
        result=row[0]
        # A reference interval alone is never substituted for a missing result.
        if RANGE.match(result):
            warnings.append(f"{PARAMETERS[key]['name']}: missing result; enter it manually.")
            continue
        reference=RANGE.search(" ".join(row[1:]) or result)
        ref=None
        if reference:
            lo,hi=map(float,reference.groups())
            if 0<=lo<hi:
                ref=dict(min=lo,max=hi,source="Reporting laboratory",unit=PARAMETERS[key]["unit"])
        inline_reference=RANGE.search(result)
        if inline_reference and inline_reference.start()>0:
            result=result[:inline_reference.start()].strip()
        percentage=re.search(r"("+NUMBER+r")\s*%",result)
        differential=key in {"neutrophils","lymphocytes","monocytes","eosinophils","basophils"}
        if differential:
            if percentage:
                value=float(percentage.group(1).replace(",",""))
                values[key]=dict(value=value,source="extracted",raw=result)
                rest=result[percentage.end():].lstrip(" ]})")
                absolute=re.search(NUMBER,rest)
                if absolute:
                    abs_key=key+"Absolute"
                    values[abs_key]=dict(value=float(absolute.group().replace(",","")),source="extracted",raw=result)
                    if ref:
                        refs[abs_key]={**ref,"unit":"10^3/uL"}
                    warnings.append(f"{PARAMETERS[key]['name']}: report absolute count may be rounded; verify against the percentage.")
            elif re.search(r"10\s*\^?\s*[39]|/\s*(?:u|micro|\u00b5|\ufffd)l",result,re.I):
                abs_key=key+"Absolute"
                values[abs_key]=dict(value=float(re.search(NUMBER,result).group().replace(",","")),source="extracted",raw=result)
                if ref:
                    refs[abs_key]={**ref,"unit":"10^3/uL"}
            else:
                warnings.append(f"{PARAMETERS[key]['name']}: differential unit unclear; enter percentage or absolute count manually.")
            continue
        value=float(re.search(NUMBER,result).group().replace(",",""))
        if key in {"rbc","wbc","platelets"}:
            multiplier=1e6 if key=="rbc" else 1e3
            explicit_scale=bool(re.search(r"10\s*\^?\s*(?:[369]|12)",result))
            if not explicit_scale:
                if value>=multiplier and (not ref or value>ref["max"]*10):
                    value/=multiplier
                warnings.append(f"{PARAMETERS[key]['name']}: check the report multiplier; displayed in {PARAMETERS[key]['unit']}.")
        if key=="pcv" and re.search(r"L\s*/\s*L",result,re.I) and value<=1:
            value*=100
            if ref and ref["max"]<=1:
                ref["min"]*=100; ref["max"]*=100
        if key=="hb" and re.search(r"g\s*/\s*L\b",result) and not re.search(r"g\s*/\s*dL",result,re.I):
            value/=10
            if ref and ref["max"]>50:
                ref["min"]/=10; ref["max"]/=10
        if key=="mchc" and "%" in result:
            warnings.append("MCHC is printed as a percentage; verify its interpretation in g/dL with the reporting laboratory.")
        if key in values and values[key]["value"]!=value:
            values[key]={"value":None,"source":"ambiguous","raw":result}
            warnings.append(f"Conflicting {PARAMETERS[key]['name']} results found; enter the intended value manually.")
        else:
            values[key]=dict(value=value,source="extracted",raw=result)
        if ref:
            refs[key]=ref
    missing=[PARAMETERS[k]["name"] for k in CORE if values.get(k,{}).get("value") is None]
    if missing:
        warnings.append("Enter missing core values before continuing: "+", ".join(missing))
    if not values:
        warnings.append("No readable CBC values were found. For a scanned PDF, enter values manually or upload a text-based report.")
    return dict(values=values,reportRanges=refs,warnings=list(dict.fromkeys(warnings)),parameters=parameters(),
                sources=[dict(title="Cornell canine hematology intervals",url=CORNELL),dict(title="Merck: Ehrlichiosis in dogs",url=MERCK)])


def extract_pdf(content):
    import pymupdf
    if len(content)>20*1024*1024:
        raise ValueError("CBC PDF must be smaller than 20 MB")
    try:
        document=pymupdf.open(stream=content,filetype="pdf")
    except Exception as exc:
        raise ValueError("Unable to read this PDF. Enter CBC values manually or upload a valid PDF.") from exc
    with document:
        if document.needs_pass:
            raise ValueError("Password-protected PDF: upload an unlocked report or enter values manually.")
        if len(document)>10:
            raise ValueError("CBC reports may contain at most 10 pages")
        page_count=len(document)
        text="\n".join(page.get_text(sort=True) for page in document)
    result=parse_text(text)
    result["pageCount"]=page_count
    return result


def normalize_values(data, required=False):
    if not isinstance(data,dict):
        raise ValueError("CBC values must be an object")
    output={}
    for key in PARAMETERS:
        entry=data.get(key)
        value=entry.get("value") if isinstance(entry,dict) else entry
        if value is None or value=="":
            continue
        if isinstance(value,bool):
            raise ValueError(f"{PARAMETERS[key]['name']} must be a number")
        try:
            value=float(value)
        except (TypeError,ValueError) as exc:
            raise ValueError(f"{PARAMETERS[key]['name']} must be a number") from exc
        if not math.isfinite(value) or value<0 or value>1e5:
            raise ValueError(f"{PARAMETERS[key]['name']} is outside allowed numeric bounds")
        if PARAMETERS[key]["unit"]=="%" and value>100:
            raise ValueError(f"{PARAMETERS[key]['name']} percentage cannot exceed 100")
        if key in {"rbc","pcv","hb"} and value==0:
            raise ValueError(f"{PARAMETERS[key]['name']} cannot be zero; verify the measurement")
        output[key]={"value":value}
    if required:
        missing=[PARAMETERS[k]["name"] for k in CORE if k not in output]
        if missing:
            raise ValueError("Confirm all core CBC values: "+", ".join(missing))
    return output


def analyze_cbc(data,report_ranges=None,profile="report"):
    if profile not in {"report","cornell"}:
        raise ValueError("Unknown CBC reference profile")
    data=normalize_values(data,required=True)
    report_ranges=report_ranges or {}
    rows={}
    for key,p in PARAMETERS.items():
        ref=dict(min=p["min"],max=p["max"],unit=p["unit"],source=CORNELL)
        candidate=report_ranges.get(key) if profile=="report" else None
        if candidate and isinstance(candidate.get("min"),(int,float)) and isinstance(candidate.get("max"),(int,float)) and 0<=candidate["min"]<candidate["max"]:
            ref.update(candidate)
        value=data.get(key,{}).get("value")
        status="Not reported" if value is None else "Low" if value<ref["min"] else "High" if value>ref["max"] else "Normal"
        rows[key]=dict(name=p["name"],value=value,status=status,unit=p["unit"],reference=ref)
    def deficit(key):
        row=rows[key]
        return max(0.,min(1.,(row["reference"]["min"]-row["value"])/row["reference"]["min"])) if row["reference"]["min"] else 0.
    # Research heuristic, not an evidence-validated disease probability.
    platelet_signal=(.5+.5*deficit("platelets")) if rows["platelets"]["status"]=="Low" else 0.
    anemia_signal=sum(deficit(k) for k in ("rbc","pcv","hb"))/3
    white_signal=deficit("wbc")
    score=.65*platelet_signal+.25*anemia_signal+.10*white_signal
    abnormal=[row["name"]+" "+row["status"].lower() for row in rows.values() if row["status"] in {"Low","High"}]
    return dict(score=round(score,6),profile=profile,parameters=rows,abnormalities=abnormal,
                measuredCount=sum(r["value"] is not None for r in rows.values()),
                status="Abnormal CBC" if abnormal else "Measured values within selected intervals",
                pattern="Higher CBC pattern concern" if score>=.5 else "Moderate CBC pattern concern" if score>=.25 else "Low CBC pattern score",
                ruleComponents=dict(plateletSignal=platelet_signal,anemiaSignal=anemia_signal,leukopeniaSignal=white_signal),
                ruleWeights=dict(platelets=.65,anemia=.25,leukopenia=.10),
                explanation="Experimental weighted pattern: thrombocytopenia, red-cell deficits and leukopenia. CBC abnormalities are nonspecific and do not confirm Ehrlichiosis.",
                sources=[dict(title="Cornell canine hematology intervals (method-specific)",url=CORNELL),dict(title="Merck: nonspecific CBC findings in Ehrlichiosis",url=MERCK)])


def fuse_analyses(cbc,image):
    available=bool(image.get("available"))
    image_score=image.get("positiveScore") if available else None
    if available and (not isinstance(image_score,(int,float)) or not math.isfinite(image_score) or not 0<=image_score<=1):
        available=False; image_score=None
    score=.3*cbc["score"]+.7*image_score if available else cbc["score"]
    return dict(mode="multimodal" if available else "cbc_only",cbcWeight=.3 if available else 1.,imageWeight=.7 if available else 0.,
                cbcScore=cbc["score"],imageScore=image_score,score=round(score,6),
                prediction=("Elevated Ehrlichiosis screening score" if score>=.5 else "Lower Ehrlichiosis screening score") if available else cbc["pattern"],
                imageFailureReason=None if available else image.get("reason","Image inference unavailable"),
                formula="0.30 x CBC pattern score + 0.70 x ResNet50 positive score" if available else "CBC pattern score only (100% CBC)",
                experimental=True,calibratedProbability=False,
                explanation="Weighted research screening score, not a calibrated disease probability. YOLO supplies localization evidence; zero boxes does not mean image inference failed. Other diseases cannot be excluded.")
