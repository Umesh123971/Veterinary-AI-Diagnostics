import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const report=process.env.CBC_TEST_PDF;
const backend=path.resolve('..','backend');
const image=path.join(backend,'dataset','canine_ehrlichiosis_detection','e-canis','9.jpg');
const ids=[];
test.skip(!report,'Set CBC_TEST_PDF to a local canine CBC report before running this integration test.');
test.afterAll(()=>{
 if(!ids.length)return;
 const code=`import os,json; from diagnostics.models import Patient; from diagnostics.integration import local_media_path; from django.conf import settings; from django.core.files.storage import default_storage; from pathlib import Path
for patient in Patient.objects.filter(custom_id__in=json.loads(os.environ['CBC_E2E_IDS'])):
    assert patient.dog_name.startswith('E2E verification ')
    for value in [patient.cbc_report_pdf,patient.blood_smear_image,patient.image_analysis.get('annotatedImage')]:
        if not value: continue
        try: file=local_media_path(value)
        except ValueError: continue
        assert file.is_relative_to(Path(settings.MEDIA_ROOT).resolve())
        default_storage.delete(str(file.relative_to(Path(settings.MEDIA_ROOT).resolve())))
    patient.delete()
print('Removed only E2E-owned records and generated media')`;
 execFileSync(path.join(backend,'.venv','Scripts','python.exe'),['manage.py','shell','-c',code],{cwd:backend,env:{...process.env,CBC_E2E_IDS:JSON.stringify(ids)},stdio:'pipe'});
});
async function createPatient(page,name,withImage){
 await page.goto('/patients/new');
 await page.getByLabel('Animal name').fill(`E2E verification ${name}`);
 await page.getByLabel('Owner name').fill('Integration test owner');
 await page.getByLabel('Age',{exact:true}).fill('5 years');
 await page.getByLabel('Breed',{exact:true}).fill('Mixed breed');
 await page.getByLabel('CBC report PDF',{exact:true}).setInputFiles(report);
 if(withImage)await page.getByLabel('Blood-smear image',{exact:true}).setInputFiles(image);
 const responsePromise=page.waitForResponse(response=>response.url().endsWith('/api/patients/')&&response.request().method()==='POST');
 await page.getByRole('button',{name:'Save Patient',exact:true}).click();
 const response=await responsePromise;
 expect(response.status()).toBe(201);
 const patient=await response.json();ids.push(patient.id);
 await page.waitForURL(`**/patients/${patient.id}`);
 await page.getByRole('button',{name:'Diagnose',exact:true}).click();
 await expect(page.getByLabel('RBC value',{exact:true})).toHaveValue('6.17');
 await expect(page.getByLabel('Platelets value',{exact:true})).toHaveValue('53');
 await expect(page.locator('iframe[title="Uploaded CBC report"]')).toHaveAttribute('src',/^blob:/);
 return patient.id;
}
async function run(page,id){
 await page.getByRole('checkbox').check();
 const responsePromise=page.waitForResponse(response=>response.url().endsWith(`/${id}/run-ai/`)&&response.request().method()==='POST');
 await page.getByRole('button',{name:'Confirm CBC & Continue to Image Analysis',exact:true}).click();
 const response=await responsePromise;expect(response.status()).toBe(200);
 const patient=(await response.json()).patient;
 await page.waitForURL(`**/results/${id}`);
 await expect(page.getByText('Model not available',{exact:true})).toHaveCount(3);
 return patient;
}
test('CBC review, real model fusion, report export and CBC-only fallback',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const id=await createPatient(page,'multimodal',true);
 await page.getByLabel('Platelets value',{exact:true}).fill('100');
 fs.mkdirSync('test-results',{recursive:true});
 await page.screenshot({path:'test-results/cbc-review.png',fullPage:true});
 const result=await run(page,id);
 expect(result.cbcData.platelets.value).toBe(100);
 expect(result.imageAnalysis.available).toBe(true);
 expect(result.imageAnalysis.boxes.length).toBeGreaterThan(0);
 expect(result.fusionDetails.mode).toBe('multimodal');
 expect(result.fusionDetails.score).toBeCloseTo(.3*result.cbcAnalysis.score+.7*result.imageAnalysis.positiveScore,5);
 await expect.poll(()=>page.getByAltText('Ehrlichiosis model bounding boxes').evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);
 await page.screenshot({path:'test-results/multimodal-result.png',fullPage:true});
 await page.reload();
 await expect(page.getByText('Ehrlichiosis screening - CBC + image',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Printable report',exact:true}).click();
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download JSON report'}).click();
 const download=await downloadPromise;const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
 expect(exported.cbcData.platelets.value).toBe(100);
 const fallbackId=await createPatient(page,'CBC only',false);
 const fallback=await run(page,fallbackId);
 expect(fallback.fusionDetails.mode).toBe('cbc_only');
 expect(fallback.fusionDetails.cbcWeight).toBe(1);
 expect(fallback.fusionDetails.imageWeight).toBe(0);
 expect(fallback.fusionDetails.score).toBe(fallback.cbcAnalysis.score);
 await expect(page.getByText('CBC-only result - image unavailable',{exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/cbc-only-result.png',fullPage:true});
 expect(errors).toEqual([]);
 console.log('Verified actual PDF extraction, corrected values, real model boxes, persisted 30/70 fusion, export and CBC-only fallback.');
});
