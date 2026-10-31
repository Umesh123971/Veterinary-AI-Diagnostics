"""Patient-owned, downloadable screening report using the existing PyMuPDF dependency."""
import fitz
from django.utils import timezone
from .integration import local_media_path

TEAL=(0.04,0.42,0.39)
INK=(0.12,0.18,0.25)
MUTED=(0.36,0.42,0.48)

def build_report(patient):
    doc=fitz.open()
    page=None
    y=0
    def new_page(title):
        nonlocal page,y
        page=doc.new_page(width=595,height=842)
        page.draw_rect(fitz.Rect(0,0,595,14),color=None,fill=TEAL)
        page.insert_text((40,48),'VetAI | Veterinary screening report',fontsize=18,color=TEAL)
        page.insert_text((40,70),str(patient.custom_id),fontsize=9,color=MUTED)
        y=99
        heading(title)
    def heading(text):
        nonlocal y
        page.insert_text((40,y),text,fontsize=13,fontname='hebo',color=TEAL)
        y+=25
    def paragraph(text,size=10,color=INK):
        nonlocal y
        # Wrap with measured Helvetica widths; never silently truncate long comments.
        words=str(text or 'Not recorded').split()
        lines=[]; line=''
        for word in words:
            # Split unusually long tokens as well as normal word wrapping.
            chunks=[]
            while fitz.get_text_length(word,fontsize=size)>510:
                cut=max(1,int(len(word)*500/fitz.get_text_length(word,fontsize=size)))
                chunks.append(word[:cut]);word=word[cut:]
            chunks.append(word)
            for chunk in chunks:
                candidate=(line+' '+chunk).strip()
                if fitz.get_text_length(candidate,fontsize=size)>510 and line:
                    lines.append(line);line=chunk
                else: line=candidate
        if line: lines.append(line)
        for line in lines:
            if y>775: new_page('Report continued')
            page.insert_text((40,y),line,fontsize=size,color=color)
            y+=size+5
        y+=7
    def pct(value):
        return 'Unavailable' if value is None else f'{value*100:.1f}%'
    cbc=patient.cbc_analysis or {}; image=patient.image_analysis or {}; fusion=patient.fusion_details or {}
    new_page('Patient and result summary')
    for label,value in [('Animal',patient.dog_name),('Owner',patient.owner_name),('Breed / age / sex',f'{patient.breed} / {patient.age} / {patient.sex}'),('Sample date',patient.sample_date),('Generated',timezone.localtime().strftime('%Y-%m-%d %H:%M %Z'))]:
        paragraph(f'{label}: {value or "Not recorded"}')
    y+=8
    heading('Ehrlichiosis screening')
    if fusion.get('mode'):
        paragraph(fusion.get('prediction'),13)
        paragraph('Analysis: '+('CBC only - image unavailable' if fusion['mode']=='cbc_only' else 'CBC + blood-smear image'))
        paragraph(f'Final screening score: {pct(fusion.get("score"))}',15,TEAL)
        paragraph(f'CBC pattern score: {pct(cbc.get("score"))} | Image positive score: {pct(image.get("positiveScore")) if image.get("available") else "Unavailable"}')
        paragraph(fusion.get('formula'))
        if fusion['mode']=='cbc_only': paragraph('Image unavailable: '+str(fusion.get('imageFailureReason') or image.get('reason') or 'No image result'))
        paragraph('CBC findings: '+('; '.join(cbc.get('abnormalities',[])) or 'Measured values within selected intervals.'))
    else:
        paragraph('Analysis not completed. No current screening result is available.')
    paragraph('Research screening only. Scores are not calibrated disease probabilities or confirmed diagnoses. CBC findings are nonspecific. A low score or absent boxes cannot exclude infection. A veterinary professional must interpret this report.',9,MUTED)
    heading('Review')
    review=patient.doctor_review or {}
    paragraph('Technician review: '+str(review.get('status') or 'Pending'))
    if review.get('comments'): paragraph('Comments: '+str(review['comments']))
    paragraph('Other disease models: Babesiosis, Dirofilariasis and Hepatozoonosis are not available. No results are assigned.',9,MUTED)
    if cbc.get('parameters'):
        new_page('Complete blood count (CBC)')
        paragraph('Values reviewed by the technician. References are report-laboratory intervals where selected and available, otherwise Cornell canine intervals. Missing values remain unreported.',9,MUTED)
        def table_header():
            nonlocal y
            page.draw_rect(fitz.Rect(40,y-13,555,y+8),fill=(0.91,0.96,0.95),color=None)
            for x,t in [(44,'Parameter'),(205,'Value'),(267,'Unit'),(343,'Reference'),(439,'Flag')]:
                page.insert_text((x,y),t,fontsize=9,fontname='hebo',color=INK)
            y+=28
        table_header()
        for row in cbc['parameters'].values():
            if y>735: new_page('CBC continued');table_header()
            ref=row.get('reference') or {}
            values=[(44,row.get('name','')),(205,str(row.get('value')) if row.get('value') is not None else 'Not reported'),(267,row.get('unit','')),(343,f'{ref.get("min","-")} - {ref.get("max","-")}'),(439,row.get('status',''))]
            for x,text in values: page.insert_text((x,y),str(text),fontsize=8,color=INK)
            y+=13
            source='Report laboratory' if ref.get('source')=='Reporting laboratory' else 'Cornell canine'
            page.insert_text((44,y),source,fontsize=7,color=MUTED)
            y+=13
            page.draw_line((40,y-9),(555,y-9),color=(0.89,0.91,0.93),width=.4)
        y+=10
        paragraph('CBC pattern rules: platelet signal 65%, red-cell deficits 25%, leukopenia 10%. These internal research weights are separate from 30% CBC / 70% image fusion.',9,MUTED)
        for source in cbc.get('sources',[]): paragraph(source.get('title','')+': '+source.get('url',''),8,MUTED)
    if image.get('available'):
        new_page('Blood-smear image evidence')
        paragraph(f'ResNet50 positive score: {pct(image.get("positiveScore"))}. YOLO detected regions: {len(image.get("boxes") or [])}.')
        paragraph('YOLO boxes show model localization evidence. Existing source arrows or marks are not generated by this system.',9,MUTED)
        try:
            path=local_media_path(image.get('annotatedImage',''))
            page.insert_image(fitz.Rect(40,y,555,y+440),filename=str(path),keep_proportion=True)
            y+=460
        except (ValueError,OSError,RuntimeError):
            paragraph('Annotated image could not be embedded. The saved image score remains shown above.')
        if not image.get('boxes'): paragraph('No YOLO boxes passed the threshold. ResNet50 still contributes to the combined score.')
        paragraph('Experimental models with limited validation. Absent detections do not rule out disease.',9,MUTED)
    for i,p in enumerate(doc):
        p.draw_line((40,798),(555,798),color=(0.8,0.85,0.87))
        p.insert_text((40,816),'VetAI | Research screening | '+str(patient.custom_id),fontsize=8,color=MUTED)
        p.insert_text((495,816),f'{i+1} / {len(doc)}',fontsize=8,color=MUTED)
    content=doc.tobytes(garbage=4,deflate=True)
    doc.close()
    return content
