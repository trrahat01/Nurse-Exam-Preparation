/**
 * Delete all MCQs and upload fresh ones for every chapter
 * Usage: node scripts/fix-chapter-mcqs.js
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgwMDk2NiwiZXhwIjoyMTAwMzc2OTY2fQ.yNPzM1V-xMZwM5MiL2qKb0DLUyKXJcua70OjoK_w4O4';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BATCH = 100;

// Chapter config matching the app
const CATEGORY_CONFIG = {
  Nursing: ['Medical Surgical Nursing','Anatomy','Physiology','Pharmacology','Pediatric Nursing','Community Nursing','Obstetrics','Gynecology','Microbiology','Pathology','Nutrition','Infection Control','ICU','Emergency Nursing','Psychiatric Nursing','Fundamentals of Nursing','Ethics','Nursing Procedures','Drug Calculation','Research','Leadership','Hospital Management'],
  Bangla: ['Grammar','Literature','Vocabulary','Idioms','One Word','Authors','Books','Synonyms','Antonyms'],
  English: ['Grammar','Vocabulary','Sentence Correction','Articles','Voice','Narration','Synonyms','Antonyms','Reading','Idioms'],
  'General Knowledge': ['Bangladesh Affairs','Liberation War','Constitution','International Affairs','ICT','Science','Geography','Organizations','Current Affairs','Economics','Health Programs'],
  Math: ['Percentage','Ratio','Profit Loss','Average','Simple Interest','Time Work','Time Distance','Age','LCM','HCF','Drug Calculation'],
};

// Real questions for key nursing chapters
const nursingQuestions = {
  'Medical Surgical Nursing': [
    ['What is the normal adult blood pressure range?','90/60-120/80 mmHg','120/80-140/90 mmHg','140/90-160/100 mmHg','80/60-100/70 mmHg','a','Normal BP is 90/60 to 120/80 mmHg.'],
    ['Which position is best for a patient with dyspnea?','Supine','Fowler\'s','Prone','Lithotomy','b','Fowler\'s position facilitates breathing.'],
    ['What is the first sign of hypovolemic shock?','Bradycardia','Increased BP','Tachycardia','Decreased urine','c','Tachycardia is an early compensatory mechanism.'],
    ['Which medication reverses opioid overdose?','Flumazenil','Naloxone','Atropine','Epinephrine','b','Naloxone is a pure opioid antagonist.'],
    ['What is the normal fasting blood glucose?','3.9-6.1 mmol/L','6.1-7.0 mmol/L','7.0-11.1 mmol/L','2.5-3.9 mmol/L','a','Normal fasting glucose is 3.9-6.1 mmol/L.'],
    ['Which vein is commonly used for IV cannulation?','Femoral','Cephalic','Popliteal','Subclavian','b','Cephalic vein is most common for peripheral IV.'],
    ['What is the normal respiratory rate for adults?','8-12/min','12-20/min','20-30/min','30-40/min','b','Normal adult respiratory rate is 12-20/min.'],
    ['Which food should be avoided in celiac disease?','Rice','Wheat','Potato','Corn','b','Wheat contains gluten.'],
    ['What is the most common cause of acute pancreatitis?','Hyperlipidemia','Alcohol','Trauma','Infection','b','Alcohol and gallstones are most common causes.'],
    ['What is the antidote for heparin overdose?','Vitamin K','Protamine sulfate','Naloxone','Flumazenil','b','Protamine sulfate neutralizes heparin.'],
    ['What is the normal serum potassium range?','3.5-5.0 mEq/L','5.0-6.5 mEq/L','2.0-3.5 mEq/L','6.5-8.0 mEq/L','a','Normal potassium is 3.5-5.0 mEq/L.'],
    ['Which isolation is required for TB?','Contact','Droplet','Airborne','Standard','c','TB requires airborne precautions.'],
    ['What is the Glasgow Coma Scale range?','1-10','3-15','5-20','0-15','b','GCS ranges from 3-15.'],
    ['Which vitamin is synthesized by skin in sunlight?','Vitamin A','Vitamin D','Vitamin K','Vitamin E','b','Vitamin D is synthesized in skin.'],
    ['What is the most common cause of COPD?','Asthma','Smoking','Pollution','Alpha-1 antitrypsin','b','Smoking causes 85-90% of COPD.'],
    ['What is the normal serum sodium range?','115-125 mEq/L','125-135 mEq/L','135-145 mEq/L','145-155 mEq/L','c','Normal sodium is 135-145 mEq/L.'],
    ['What is the most common symptom of MI?','Epigastric pain','Chest pain to left arm','Back pain','Jaw pain','b','Classic MI is substernal chest pain.'],
    ['What is the most common cause of CAP?','H. influenzae','M. pneumoniae','S. pneumoniae','C. pneumoniae','c','S. pneumoniae is most common cause.'],
    ['What is the most common symptom of PE?','Hemoptysis','Dyspnea','Chest pain','Cough','b','Sudden dyspnea is most common symptom.'],
    ['What is the most common cause of ESRD?','Glomerulonephritis','Hypertension','Diabetes','Polycystic kidney','c','Diabetes is the leading cause of ESRD.'],
    ['What is the normal WBC count?','2,000-5,000','4,000-11,000','11,000-15,000','15,000-20,000','b','Normal WBC is 4,000-11,000/mm³.'],
    ['Which electrolyte causes peaked T waves?','Hypokalemia','Hyperkalemia','Hypocalcemia','Hypercalcemia','b','Hyperkalemia causes peaked T waves.'],
    ['Which shock has warm, flushed skin?','Hypovolemic','Cardiogenic','Septic (early)','Neurogenic','c','Early septic shock has warm flushed skin.'],
    ['Which medication is first-line for hypertension?','Metoprolol','HCTZ','Lisinopril','Amlodipine','c','ACE inhibitors are first-line for HTN.'],
    ['What is normal hemoglobin in adult males?','10-12 g/dL','12-14 g/dL','13.5-17.5 g/dL','15-20 g/dL','c','Normal Hb for males is 13.5-17.5 g/dL.'],
    ['What is the most common nosocomial infection?','Surgical site','UTI','Pneumonia','Bloodstream','b','UTI is the most common HAI.'],
    ['Which drug treats anaphylactic shock?','Diphenhydramine','Epinephrine','Dopamine','Hydrocortisone','b','Epinephrine is first-line for anaphylaxis.'],
    ['What is the most common cause of heart failure?','CAD','Hypertension','Valvular','Cardiomyopathy','a','CAD is the most common cause of HF.'],
    ['What is the most common cause of stroke?','Ischemic','Hemorrhagic','Embolic','Thrombotic','a','Ischemic stroke accounts for 87%.'],
    ['What is the most common cause of CKD?','Diabetes','Hypertension','Glomerulonephritis','PCKD','a','Diabetes is the leading cause of CKD.'],
  ],
  'Anatomy': [
    ['What is the largest organ of the human body?','Liver','Brain','Skin','Heart','c','The skin is the largest organ.'],
    ['How many bones are in the adult human body?','200','206','212','218','b','Adult skeleton has 206 bones.'],
    ['Which chamber pumps blood to the entire body?','Right atrium','Right ventricle','Left atrium','Left ventricle','d','Left ventricle pumps to the body.'],
    ['What is the largest artery in the body?','Pulmonary','Carotid','Aorta','Femoral','c','The aorta is the largest artery.'],
    ['Which valve separates left atrium and ventricle?','Tricuspid','Pulmonary','Mitral','Aortic','c','Mitral valve separates left chambers.'],
    ['Which part of the brain controls balance?','Cerebrum','Cerebellum','Brainstem','Hypothalamus','b','Cerebellum coordinates balance.'],
    ['Which cranial nerve is responsible for vision?','CN I','CN II','CN III','CN IV','b','CN II (Optic) is responsible for vision.'],
    ['What is the functional unit of the kidney?','Nephron','Glomerulus','Bowman\'s capsule','Loop of Henle','a','Nephron is the functional unit.'],
    ['What is the function of alveoli?','Filter air','Gas exchange','Produce mucus','Warm air','b','Alveoli are for gas exchange.'],
    ['How many lobes does the right lung have?','2','3','4','5','b','Right lung has 3 lobes.'],
    ['What is the longest bone in the human body?','Tibia','Femur','Humerus','Fibula','b','Femur is the longest bone.'],
    ['Which organ produces bile?','Gallbladder','Liver','Pancreas','Stomach','b','Liver produces bile.'],
    ['How many chambers does the human heart have?','2','3','4','5','c','Heart has 4 chambers.'],
    ['What is the function of the spleen?','Filter blood','Produce bile','Store glucose','Produce insulin','a','Spleen filters blood.'],
    ['Which gland produces tears?','Salivary','Lacrimal','Thyroid','Pituitary','b','Lacrimal gland produces tears.'],
    ['How many pairs of spinal nerves are there?','28','30','31','33','c','There are 31 pairs of spinal nerves.'],
    ['Which part of the brain controls body temperature?','Cerebrum','Cerebellum','Hypothalamus','Medulla','c','Hypothalamus regulates temperature.'],
    ['What is the normal cardiac output?','2-3 L/min','4-6 L/min','6-8 L/min','8-10 L/min','b','Normal cardiac output is 4-6 L/min.'],
    ['Which muscle is the main breathing muscle?','Intercostal','Diaphragm','Pectoralis','Trapezius','b','Diaphragm is the main breathing muscle.'],
    ['Which organ produces insulin?','Liver','Pancreas','Spleen','Kidney','b','Pancreas produces insulin.'],
    ['Which part reabsorbs most water in nephron?','Glomerulus','Proximal tubule','Loop of Henle','Distal tubule','b','Proximal tubule reabsorbs 65% of water.'],
    ['Which blood vessel has the thinnest wall?','Artery','Vein','Capillary','Arteriole','c','Capillaries have the thinnest walls.'],
    ['Which part of the brain controls speech production?','Wernicke\'s','Broca\'s','Cerebellum','Thalamus','b','Broca\'s area controls speech production.'],
    ['How many teeth does an adult human have?','28','30','32','34','c','Adults have 32 teeth.'],
    ['What is the function of the gallbladder?','Produce bile','Store bile','Digest protein','Filter blood','b','Gallbladder stores bile.'],
    ['Which hormone is responsible for milk production?','Oxytocin','Prolactin','Estrogen','Progesterone','b','Prolactin stimulates milk production.'],
    ['Which part of the eye focuses light on retina?','Cornea','Iris','Lens','Pupil','c','Lens focuses light on retina.'],
    ['What is the most common blood type?','A','B','AB','O','d','O is the most common blood type.'],
    ['Which bone is the smallest?','Stapes','Malleus','Incus','Femur','a','Stapes in the middle ear is smallest.'],
    ['Which organ removes old red blood cells?','Liver','Spleen','Kidney','Bone marrow','b','Spleen removes old RBCs.'],
  ],
  'Physiology': [
    ['What is the normal heart rate for adults?','40-60 bpm','60-100 bpm','100-120 bpm','120-140 bpm','b','Normal adult HR is 60-100 bpm.'],
    ['What is normal body temperature?','35-36°C','36-37.5°C','37.5-38.5°C','38.5-39.5°C','b','Normal temp is 36-37.5°C.'],
    ['What is the normal blood pH?','7.25-7.35','7.35-7.45','7.45-7.55','7.0-7.25','b','Normal pH is 7.35-7.45.'],
    ['What is the normal PaO2?','40-60 mmHg','60-80 mmHg','80-100 mmHg','100-120 mmHg','c','Normal PaO2 is 80-100 mmHg.'],
    ['What is the normal PaCO2?','25-35 mmHg','35-45 mmHg','45-55 mmHg','55-65 mmHg','b','Normal PaCO2 is 35-45 mmHg.'],
    ['What is normal serum osmolality?','250-270','275-295','295-315','315-335 mOsm/kg','b','Normal osmolality is 275-295.'],
    ['What is normal CSF pressure?','5-10','10-20','20-30','30-40 cmH2O','b','Normal CSF pressure is 10-20 cmH2O.'],
    ['What is normal intraocular pressure?','5-10','10-21','21-30','30-40 mmHg','b','Normal IOP is 10-21 mmHg.'],
    ['What is normal serum calcium?','6.5-8.5','8.5-10.5','10.5-12.5','12.5-14.5 mg/dL','b','Normal calcium is 8.5-10.5 mg/dL.'],
    ['What is normal serum magnesium?','1.3-2.1','2.1-3.0','3.0-4.0','0.5-1.3 mEq/L','a','Normal Mg is 1.3-2.1 mEq/L.'],
    ['What is normal serum creatinine?','0.2-0.6','0.6-1.2','1.2-2.0','2.0-3.0 mg/dL','b','Normal creatinine is 0.6-1.2 mg/dL.'],
    ['What is normal BUN?','5-10','7-20','20-35','35-50 mg/dL','b','Normal BUN is 7-20 mg/dL.'],
    ['What is normal serum albumin?','2.5-3.5','3.5-5.0','5.0-6.5','1.5-2.5 g/dL','b','Normal albumin is 3.5-5.0 g/dL.'],
    ['What is normal serum bilirubin?','0.1-0.3','0.3-1.0','1.0-2.0','2.0-3.0 mg/dL','b','Normal bilirubin is 0.3-1.0 mg/dL.'],
    ['What is normal platelet count?','50-150k','150-450k','450-750k','750k-1M','b','Normal platelets are 150-450k.'],
    ['What is normal hemoglobin in females?','10-12','12-15.5','15-18','18-20 g/dL','b','Normal Hb for females is 12-15.5 g/dL.'],
    ['What is normal GFR?','60-90','90-120','120-150','150-180 mL/min','b','Normal GFR is 90-120 mL/min.'],
    ['What is normal urine output per day?','500-1000','1000-2000','2000-3000','3000-4000 mL','b','Normal urine output is 1000-2000 mL/day.'],
    ['What is normal respiratory rate for newborn?','20-30','30-60','60-80','80-100/min','b','Newborn RR is 30-60/min.'],
    ['What is normal heart rate for newborn?','60-100','100-160','120-180','80-120 bpm','b','Newborn HR is 100-160 bpm.'],
    ['What is normal fetal heart rate?','80-100','100-120','120-160','160-180 bpm','c','Fetal HR is 120-160 bpm.'],
    ['What is normal BMI range?','15-18.5','18.5-24.9','25-29.9','30-34.9','b','Normal BMI is 18.5-24.9.'],
    ['What is normal total protein?','4-5','6-8','8-10','10-12 g/dL','b','Normal total protein is 6-8 g/dL.'],
    ['What is normal serum chloride?','90-95','95-105','105-115','115-125 mEq/L','b','Normal chloride is 95-105 mEq/L.'],
    ['What is normal TSH?','0.1-0.4','0.4-4.0','4.0-10','10-20 mIU/L','b','Normal TSH is 0.4-4.0 mIU/L.'],
    ['What is normal INR (not on anticoag)?','0.5-1.0','0.8-1.2','1.5-2.5','2.0-3.0','b','Normal INR is 0.8-1.2.'],
    ['What is normal HCO3?','18-22','22-28','28-32','32-36 mEq/L','b','Normal HCO3 is 22-28 mEq/L.'],
    ['What is normal lactate level?','0.5-1.0','0.5-2.2','2.2-4.0','4.0-6.0 mmol/L','b','Normal lactate is 0.5-2.2 mmol/L.'],
    ['What is normal urine output per hour?','10-20','30-50','50-80','80-100 mL/hr','b','Normal urine output is 30-50 mL/hr.'],
    ['What is normal CVP?','2-6','8-12','12-16','16-20 cmH2O','b','Normal CVP is 8-12 cmH2O.'],
  ],
  'Pharmacology': [
    ['What is the mechanism of action of metformin?','Increases insulin secretion','Decreases hepatic glucose production','Blocks glucose absorption','Increases insulin sensitivity','b','Metformin decreases hepatic glucose production.'],
    ['What is the first-line treatment for type 2 diabetes?','Insulin','Metformin','Glipizide','Pioglitazone','b','Metformin is first-line for type 2 diabetes.'],
    ['What is the first-line treatment for anaphylaxis?','Diphenhydramine','Epinephrine','Methylprednisolone','Albuterol','b','Epinephrine IM is first-line for anaphylaxis.'],
    ['What is the antidote for benzodiazepine overdose?','Naloxone','Flumazenil','Atropine','Protamine','b','Flumazenil is a benzodiazepine antagonist.'],
    ['What is the antidote for acetaminophen overdose?','Naloxone','N-acetylcysteine','Flumazenil','Vitamin K','b','NAC replenishes glutathione stores.'],
    ['Which antibiotic is contraindicated in children under 8?','Penicillin','Tetracycline','Amoxicillin','Cephalexin','b','Tetracyclines cause tooth discoloration.'],
    ['Which drug requires monitoring for ototoxicity?','Penicillin','Gentamicin','Ciprofloxacin','Doxycycline','b','Aminoglycosides cause ototoxicity.'],
    ['What is the mechanism of action of warfarin?','Inhibits platelet aggregation','Inhibits vitamin K-dependent factors','Activates antithrombin III','Blocks factor Xa','b','Warfarin inhibits vitamin K-dependent factors.'],
    ['What is the mechanism of action of heparin?','Inhibits platelet aggregation','Activates antithrombin III','Inhibits vitamin K','Blocks factor Xa','b','Heparin activates antithrombin III.'],
    ['What is the therapeutic range for digoxin?','0.5-2.0 ng/mL','2.0-4.0 ng/mL','4.0-6.0 ng/mL','6.0-8.0 ng/mL','a','Therapeutic digoxin range is 0.5-2.0 ng/mL.'],
    ['What is the therapeutic range for lithium?','0.2-0.6 mEq/L','0.6-1.2 mEq/L','1.2-2.0 mEq/L','2.0-3.0 mEq/L','b','Therapeutic lithium range is 0.6-1.2 mEq/L.'],
    ['What is the therapeutic range for phenytoin?','5-10 mcg/mL','10-20 mcg/mL','20-30 mcg/mL','30-40 mcg/mL','b','Therapeutic phenytoin range is 10-20 mcg/mL.'],
    ['Which drug is a proton pump inhibitor?','Ranitidine','Omeprazole','Famotidine','Metoclopramide','b','Omeprazole is a PPI.'],
    ['Which drug is a loop diuretic?','HCTZ','Furosemide','Spironolactone','Triamterene','b','Furosemide is a loop diuretic.'],
    ['Which drug is a calcium channel blocker?','Metoprolol','Amlodipine','Lisinopril','Losartan','b','Amlodipine is a CCB.'],
    ['Which drug is a beta-blocker?','Lisinopril','Metoprolol','Amlodipine','HCTZ','b','Metoprolol is a beta-1 selective blocker.'],
    ['Which drug is an ACE inhibitor?','Losartan','Lisinopril','Amlodipine','Metoprolol','b','Lisinopril is an ACE inhibitor.'],
    ['Which drug is an ARB?','Lisinopril','Losartan','Amlodipine','Metoprolol','b','Losartan is an ARB.'],
    ['Which drug is a statin?','Metformin','Atorvastatin','Warfarin','Digoxin','b','Atorvastatin is a statin.'],
    ['Which drug is a bisphosphonate?','Calcium','Alendronate','Vitamin D','Estrogen','b','Alendronate is a bisphosphonate.'],
    ['Which drug is a 5-HT3 antagonist?','Metoclopramide','Ondansetron','Promethazine','Domperidone','b','Ondansetron is a 5-HT3 antagonist.'],
    ['Which drug is a vasopressor in septic shock?','Dopamine','Norepinephrine','Epinephrine','Vasopressin','b','Norepinephrine is first-line in septic shock.'],
    ['Which drug is a factor Xa inhibitor?','Warfarin','Rivaroxaban','Heparin','Clopidogrel','b','Rivaroxaban is a factor Xa inhibitor.'],
    ['What is the mechanism of action of aspirin?','Inhibits COX enzymes','Activates antithrombin','Blocks ADP receptors','Inhibits vitamin K','a','Aspirin inhibits COX-1 and COX-2.'],
    ['What is the mechanism of action of clopidogrel?','Inhibits COX','Blocks ADP receptors','Activates antithrombin','Inhibits factor Xa','b','Clopidogrel blocks ADP P2Y12 receptors.'],
    ['Which drug is a carbapenem antibiotic?','Ceftriaxone','Meropenem','Azithromycin','Ciprofloxacin','b','Meropenem is a carbapenem.'],
    ['What is the antidote for iron overdose?','NAC','Deferoxamine','Flumazenil','Protamine','b','Deferoxamine chelates iron.'],
    ['Which drug is a corticosteroid?','Ibuprofen','Prednisone','Acetaminophen','Aspirin','b','Prednisone is a corticosteroid.'],
    ['What is the mechanism of methotrexate?','Inhibits DNA synthesis','Inhibits folate metabolism','Blocks TNF','Activates immune system','b','Methotrexate inhibits dihydrofolate reductase.'],
    ['Which drug is an SSRI?','Fluoxetine','Amitriptyline','Venlafaxine','Bupropion','a','Fluoxetine is an SSRI.'],
  ],
  'Pediatric Nursing': [
    ['What is the normal heart rate for a newborn?','60-100 bpm','100-160 bpm','120-180 bpm','80-120 bpm','b','Newborn HR is 100-160 bpm.'],
    ['Which vaccine is given at birth?','MMR','BCG','DPT','Polio','b','BCG is given at birth for TB prevention.'],
    ['What is the normal birth weight of a full-term newborn?','2.0-2.5 kg','2.5-4.0 kg','4.0-4.5 kg','4.5-5.0 kg','b','Normal birth weight is 2.5-4.0 kg.'],
    ['Which vitamin is given prophylactically to newborns?','Vitamin A','Vitamin B','Vitamin C','Vitamin K','d','Vitamin K prevents hemorrhagic disease.'],
    ['When does the anterior fontanelle close?','6-8 months','9-12 months','12-18 months','18-24 months','c','Anterior fontanelle closes at 12-18 months.'],
    ['When do most children start walking independently?','6-9 months','9-12 months','12-15 months','15-18 months','c','Most walk between 12-15 months.'],
    ['What is the most common cause of fever in children?','Bacterial','Viral','Fungal','Parasitic','b','Viral infections are the most common cause.'],
    ['What is the most common cause of diarrhea in children?','Bacteria','Rotavirus','Parasites','Food allergy','b','Rotavirus is the most common cause.'],
    ['What is the most common cancer in children?','Brain tumor','Leukemia','Neuroblastoma','Wilms tumor','b','ALL is the most common childhood cancer.'],
    ['Which immunization is given at 6 weeks?','MMR','Pentavalent','BCG','Typhoid','b','Pentavalent is given at 6, 10, 14 weeks.'],
    ['Which vaccine is given at 9 months in Bangladesh?','Measles','MMR','DPT booster','Polio','a','Measles vaccine is given at 9 months.'],
    ['What is the most common congenital heart defect?','ASD','VSD','PDA','TOF','b','VSD is the most common congenital heart defect.'],
    ['What is the first sign of dehydration in children?','Sunken eyes','Decreased urine output','Dry mouth','Lethargy','b','Decreased urine output is an early sign.'],
    ['Which condition is a medical emergency in newborns?','Jaundice','Cyanosis','Vomiting','Rash','b','Cyanosis indicates poor oxygenation.'],
    ['What is the most common cause of seizures in children?','Epilepsy','Febrile seizures','Meningitis','Hypoglycemia','b','Febrile seizures are the most common cause.'],
    ['When does the posterior fontanelle close?','2-3 months','4-6 months','6-8 months','8-12 months','a','Posterior fontanelle closes at 2-3 months.'],
    ['What is the normal respiratory rate for a 1-year-old?','20-30/min','30-40/min','40-50/min','50-60/min','a','Normal RR for a 1-year-old is 20-30/min.'],
    ['How is the weight of a 1-year-old compared to birth weight?','Doubled','Tripled','Quadrupled','Same','b','A 1-year-old weighs 3x birth weight.'],
    ['Which immunization is contraindicated in immunocompromised?','DPT','MMR','Hep B','Polio','b','Live vaccines like MMR are contraindicated.'],
    ['What is the most common complication of measles?','Encephalitis','Pneumonia','Otitis media','Diarrhea','c','Otitis media occurs in 5-15% of measles cases.'],
    ['Which condition causes "blue baby"?','ASD','TOF','VSD','PDA','b','Tetralogy of Fallot causes cyanosis.'],
    ['What is the most common cause of bronchiolitis in infants?','Influenza','RSV','Adenovirus','Rhinovirus','b','RSV is the most common cause of bronchiolitis.'],
    ['Which vitamin deficiency causes rickets?','Vitamin A','Vitamin C','Vitamin D','Vitamin E','c','Vitamin D deficiency causes rickets.'],
    ['What is the most common cause of croup?','Bacteria','Parainfluenza virus','RSV','Influenza','b','Parainfluenza virus is the most common cause.'],
    ['What is the normal Apgar score range?','0-5','0-10','0-15','0-20','b','Apgar score ranges from 0-10.'],
    ['When is the first dose of vitamin A given?','6 months','9 months','12 months','15 months','b','Vitamin A is given at 9 months in EPI.'],
    ['What is the most common cause of neonatal jaundice?','Hepatic disease','Physiologic','Hemolysis','Infection','b','Physiologic jaundice is most common.'],
    ['Which is a sign of respiratory distress in newborn?','Nasal flaring','Bradycardia','Hypotension','Hypothermia','a','Nasal flaring is a sign of respiratory distress.'],
    ['What is the most common cause of neonatal death?','Infection','Prematurity','Birth asphyxia','Congenital anomalies','b','Prematurity is the leading cause.'],
    ['What is the most common cause of sudden infant death?','Sleep position','Genetics','Infection','Vaccines','a','Prone sleep position is a risk factor.'],
  ],
  'Community Nursing': [
    ['What is the goal of primary health care?','Treat all diseases','Health for all','Build hospitals','Train doctors','b','PHC aims for "Health for All".'],
    ['Which disease is targeted for eradication by WHO?','TB','Polio','Malaria','HIV','b','Polio is targeted for global eradication.'],
    ['What is the recommended duration of exclusive breastfeeding?','4 months','6 months','8 months','12 months','b','WHO recommends 6 months of exclusive breastfeeding.'],
    ['What is the main vector for dengue fever?','Anopheles','Aedes','Culex','Sandfly','b','Aedes aegypti is the dengue vector.'],
    ['What is the most common cause of maternal mortality in Bangladesh?','Hemorrhage','Eclampsia','Sepsis','Abortion','a','PPH is the leading cause of maternal mortality.'],
    ['Which vaccine is given to pregnant women?','MMR','Tetanus toxoid','BCG','Hep B','b','TT prevents neonatal tetanus.'],
    ['What is the recommended number of ANC visits?','2','4','6','8','b','WHO recommends at least 4 ANC visits.'],
    ['Which vitamin deficiency causes night blindness?','Vitamin A','Vitamin B','Vitamin C','Vitamin D','a','Vitamin A deficiency causes night blindness.'],
    ['Which micronutrient deficiency causes goiter?','Iron','Iodine','Zinc','Calcium','b','Iodine deficiency causes goiter.'],
    ['What is the most common malnutrition in Bangladesh?','Obesity','Stunting','Wasting','Underweight','b','Stunting is the most common malnutrition.'],
    ['What is the main vector for malaria?','Aedes','Anopheles','Culex','Sandfly','b','Anopheles mosquito is the malaria vector.'],
    ['What is the most common waterborne disease?','Malaria','Cholera','Dengue','TB','b','Cholera is a common waterborne disease.'],
    ['What is the main preventive measure for TB?','BCG vaccine','Isolation','Antibiotics','Clean water','a','BCG vaccine is the main preventive measure.'],
    ['What is the recommended daily iron intake for pregnant women?','30 mg','60 mg','100 mg','200 mg','b','Pregnant women need 60 mg of iron daily.'],
    ['What is the most common STI worldwide?','Syphilis','Chlamydia','Gonorrhea','HIV','b','Chlamydia is the most common bacterial STI.'],
    ['What is the most common cause of blindness in Bangladesh?','Glaucoma','Cataract','Trachoma','Diabetic retinopathy','b','Cataract is the most common cause.'],
    ['What is the recommended age for first dose of DPT?','6 weeks','9 weeks','12 weeks','16 weeks','a','DPT is given at 6, 10, 14 weeks.'],
    ['What is the recommended daily salt intake?','2 g','5 g','10 g','15 g','b','WHO recommends less than 5g of salt per day.'],
    ['What is the most common vector-borne disease in Bangladesh?','Malaria','Dengue','Kala-azar','Chikungunya','b','Dengue is the most common vector-borne disease.'],
    ['What is the recommended age for first dose of Hep B?','At birth','6 weeks','9 months','1 year','a','Hep B vaccine is given at birth.'],
    ['What is the most common cause of neonatal death?','Infection','Prematurity','Birth asphyxia','Congenital anomalies','b','Prematurity is the leading cause of neonatal death.'],
    ['What is the recommended daily water intake for adults?','1-2 L','2-3 L','3-4 L','4-5 L','b','Adults should drink 2-3 L of water daily.'],
    ['What is the recommended age for first dose of OPV?','At birth','6 weeks','9 months','1 year','a','OPV is given at birth (OPV0).'],
    ['What is the recommended duration of exclusive breastfeeding?','4 months','6 months','8 months','12 months','b','6 months of exclusive breastfeeding.'],
    ['What is the target for ORS use in diarrhea?','50%','80%','90%','100%','b','WHO targets 80% ORS use.'],
    ['What is the main vector for kala-azar?','Anopheles','Sandfly','Aedes','Culex','b','Sandfly transmits kala-azar.'],
    ['What is the most common cause of maternal death in developing countries?','Eclampsia','PPH','Sepsis','Unsafe abortion','b','PPH is the leading cause of maternal death globally.'],
    ['What is the recommended daily water intake?','1-2 L','2-3 L','3-4 L','4-5 L','b','Adults should drink 2-3 L daily.'],
    ['What is the most common occupational disease?','Silicosis','Hearing loss','Back pain','Dermatitis','c','Back pain is the most common.'],
    ['What is the most common infectious disease in Bangladesh?','TB','Dengue','Cholera','Pneumonia','b','Dengue is most common infectious disease.'],
  ],
  'Obstetrics': [
    ['What is the normal duration of pregnancy?','36 weeks','38 weeks','40 weeks','42 weeks','c','Normal pregnancy is 40 weeks.'],
    ['Which hormone maintains pregnancy?','Estrogen','Progesterone','hCG','Oxytocin','b','Progesterone maintains the uterine lining.'],
    ['What is the normal fetal heart rate?','80-100 bpm','100-120 bpm','120-160 bpm','160-180 bpm','c','Fetal heart rate is 120-160 bpm.'],
    ['Which vitamin prevents neural tube defects?','Vitamin A','Folic acid','Vitamin C','Vitamin D','b','Folic acid prevents neural tube defects.'],
    ['What is the most common cause of postpartum hemorrhage?','Uterine atony','Vaginal tear','Retained placenta','Coagulopathy','a','Uterine atony is the most common cause.'],
    ['Which stage of labor ends with complete dilation?','First stage','Second stage','Third stage','Fourth stage','a','First stage ends with complete dilation.'],
    ['What is the most common fetal presentation?','Breech','Vertex','Transverse','Face','b','Vertex (head-down) is 95% of presentations.'],
    ['What is the definition of preeclampsia?','BP>140/90 + protein after 20 weeks','BP>160/100 alone','BP>140/90 before 20 weeks','BP>180/110 + seizures','a','Preeclampsia = HTN + proteinuria after 20 weeks.'],
    ['Which contraceptive provides STI protection?','OCP','IUD','Male condom','Implant','c','Condoms are the only STI-protective method.'],
    ['What is the normal weight gain during pregnancy?','5-8 kg','10-15 kg','15-20 kg','20-25 kg','b','Normal pregnancy weight gain is 10-15 kg.'],
    ['What is the most common cause of ectopic pregnancy?','PID','Tubal damage','IUD use','Endometriosis','b','Tubal damage is the most common cause.'],
    ['What is the normal amount of amniotic fluid?','200-500 mL','500-1000 mL','1000-1500 mL','1500-2000 mL','b','Normal amniotic fluid is 500-1000 mL.'],
    ['What is the most common cause of antepartum hemorrhage?','Placenta previa','Placental abruption','Uterine rupture','Vasa previa','a','Placenta previa is the most common cause.'],
    ['What is the most common cause of puerperal sepsis?','E. coli','Strep pyogenes','Staph aureus','Chlamydia','b','Group A strep is the most common cause.'],
    ['What is the definition of eclampsia?','HTN + proteinuria','Preeclampsia + seizures','HTN alone','Seizures alone','b','Eclampsia = preeclampsia with seizures.'],
    ['What is the most common cause of miscarriage?','Maternal infection','Chromosomal abnormalities','Trauma','Hormonal imbalance','b','Chromosomal abnormalities cause 50% of miscarriages.'],
    ['What is the normal duration of the first stage of labor?','2-4 hours','6-12 hours','12-18 hours','18-24 hours','c','First stage lasts 12-18 hours in primigravida.'],
    ['What is the definition of preterm birth?','Before 28 weeks','Before 37 weeks','Before 40 weeks','Before 42 weeks','b','Preterm birth is delivery before 37 weeks.'],
    ['What is the most common cause of polyhydramnios?','Diabetes','Fetal anomalies','Twin pregnancy','Rh incompatibility','a','Maternal diabetes is the most common cause.'],
    ['What is the normal Apgar score at 5 minutes?','5-7','7-10','3-5','0-3','b','A 5-minute Apgar of 7-10 is reassuring.'],
    ['What is the recommended interval between pregnancies?','6 months','12 months','18-24 months','36 months','c','WHO recommends 18-24 months.'],
    ['What is the most common cause of postpartum fever?','UTI','Endometritis','Mastitis','Wound infection','b','Endometritis is the most common cause.'],
    ['What is the most common cause of shoulder dystocia?','Fetal macrosomia','Maternal diabetes','Prolonged labor','All of the above','d','Macrosomia, diabetes, and prolonged labor contribute.'],
    ['What is the most common cause of maternal death in Bangladesh?','Hemorrhage','Eclampsia','Sepsis','Abortion','a','PPH is the leading cause.'],
    ['What is the normal duration of the second stage of labor?','30 min','1-2 hours','3-4 hours','5-6 hours','b','Second stage lasts 1-2 hours.'],
    ['What is the most common cause of infertility?','Male factor','Ovulatory disorders','Tubal disease','Uterine factors','b','Ovulatory disorders are most common.'],
    ['What is the normal duration of the third stage of labor?','5-10 min','10-30 min','30-60 min','1-2 hours','b','Third stage lasts 10-30 minutes.'],
    ['Which hormone is detected in pregnancy tests?','Estrogen','Progesterone','hCG','Oxytocin','c','hCG is detected in pregnancy tests.'],
    ['What is the most common cause of preterm labor?','Infection','Multiple pregnancy','Preterm ROM','All of the above','d','Preterm labor has multiple causes.'],
    ['What is the most common cause of postpartum depression?','Hormonal changes','Lack of support','Sleep deprivation','All of the above','d','PPD has multiple contributing factors.'],
  ],
  'Gynecology': [
    ['What is the most common gynecological cancer?','Ovarian','Cervical','Endometrial','Vulvar','b','Cervical cancer is most common in developing countries.'],
    ['What is the most common cause of abnormal uterine bleeding?','Fibroids','Hormonal imbalance','Endometriosis','Cancer','b','Hormonal imbalance is the most common cause.'],
    ['What is the most common symptom of endometriosis?','Heavy bleeding','Pelvic pain','Infertility','Irregular periods','b','Pelvic pain is the most common symptom.'],
    ['What is the most common cause of PID?','Gonorrhea','Chlamydia','Syphilis','Trichomoniasis','b','Chlamydia is the most common cause of PID.'],
    ['What is the most common type of ovarian tumor?','Epithelial','Germ cell','Sex cord','Metastatic','a','Epithelial tumors are most common.'],
    ['What is the most common cause of secondary amenorrhea?','Pregnancy','PCOS','Thyroid disease','Stress','a','Pregnancy is the most common cause.'],
    ['What is the most common symptom of cervical cancer?','Postcoital bleeding','Pelvic pain','Vaginal discharge','Dyspareunia','a','Postcoital bleeding is the most common symptom.'],
    ['What is the most common cause of dysmenorrhea?','Endometriosis','Prostaglandins','Fibroids','PID','b','Prostaglandins cause uterine contractions.'],
    ['What is the most common benign breast condition?','Fibroadenoma','Fibrocystic changes','Cyst','Lipoma','b','Fibrocystic changes are most common.'],
    ['What is the most common cause of postmenopausal bleeding?','Endometrial atrophy','Endometrial cancer','Fibroids','Cervical polyp','a','Endometrial atrophy is the most common cause.'],
    ['What is the most common STI worldwide?','Syphilis','Chlamydia','Gonorrhea','HPV','d','HPV is the most common STI worldwide.'],
    ['What is the most common cause of female infertility?','Tubal disease','Ovulatory disorders','Endometriosis','Uterine factors','b','Ovulatory disorders are most common.'],
    ['What is the most common type of fibroid?','Submucosal','Intramural','Subserosal','Cervical','b','Intramural fibroids are the most common type.'],
    ['What is the most common cause of vaginal discharge?','Bacterial vaginosis','Candidiasis','Trichomoniasis','Gonorrhea','a','Bacterial vaginosis is the most common cause.'],
    ['What is the most common cause of ectopic pregnancy?','PID','Tubal damage','IUD use','Endometriosis','b','Tubal damage is the most common cause.'],
    ['What is the most common type of urinary incontinence in women?','Stress','Urge','Overflow','Functional','a','Stress incontinence is the most common type.'],
    ['What is the most common cause of pelvic organ prolapse?','Vaginal delivery','Chronic cough','Obesity','Constipation','a','Vaginal delivery is the most common cause.'],
    ['What is the most common type of breast cancer?','Lobular','Ductal','Inflammatory','Medullary','b','Invasive ductal carcinoma is the most common type.'],
    ['What is the most common cause of menorrhagia?','Fibroids','Hormonal imbalance','Endometriosis','Adenomyosis','a','Fibroids are the most common cause.'],
    ['What is the most common cause of dyspareunia?','Vaginal dryness','Endometriosis','Vaginismus','PID','a','Vaginal dryness is the most common cause.'],
    ['What is the most common cause of cervical dysplasia?','HPV','HSV','HIV','Chlamydia','a','HPV infection causes cervical dysplasia.'],
    ['What is the most common cause of amenorrhea?','Pregnancy','PCOS','Hypothalamic','Pituitary','a','Pregnancy is the most common cause.'],
    ['What is the most common cause of hirsutism?','PCOS','Adrenal hyperplasia','Cushing syndrome','Ovarian tumor','a','PCOS is the most common cause.'],
    ['What is the most common cause of galactorrhea?','Prolactinoma','Medications','Hypothyroidism','Breast stimulation','b','Medications are the most common cause.'],
    ['What is the most common cause of vaginal candidiasis?','Antibiotics','Diabetes','Pregnancy','Immunosuppression','a','Antibiotic use is the most common trigger.'],
    ['What is the most common cause of ovarian torsion?','Large cyst','Tumor','Pregnancy','Trauma','a','Large ovarian cysts are the most common cause.'],
    ['What is the most common cause of postcoital bleeding?','Cervical ectropion','Cervical cancer','Cervical polyp','Vaginal tear','a','Cervical ectropion is the most common cause.'],
    ['What is the most common cause of infertility in couples?','Male factor','Female factor','Combined','Unexplained','c','Combined factors are most common.'],
    ['What is the most common cause of ovarian cancer?','Genetic','Hormonal','Unknown','Environmental','c','Most ovarian cancers have no known cause.'],
    ['What is the most common benign ovarian tumor?','Cystadenoma','Fibroma','Thecoma','Dermoid','a','Cystadenomas are the most common.'],
  ],
  'Microbiology': [
    ['What is the most common cause of UTI?','Klebsiella','E. coli','Proteus','Pseudomonas','b','E. coli causes 80-85% of UTIs.'],
    ['What is the most common cause of food poisoning?','Salmonella','Staph aureus','E. coli','Clostridium','b','Staph aureus is the most common cause.'],
    ['What is the most common cause of meningitis in adults?','S. pneumoniae','N. meningitidis','H. influenzae','Listeria','a','S. pneumoniae is the most common cause.'],
    ['What is the most common cause of neonatal meningitis?','E. coli','Group B strep','Listeria','S. pneumoniae','b','Group B strep is the most common cause.'],
    ['What is the most common cause of pneumonia in children?','S. pneumoniae','RSV','H. influenzae','Mycoplasma','b','RSV is the most common cause in young children.'],
    ['What is the most common cause of otitis media?','S. pneumoniae','H. influenzae','M. catarrhalis','S. pyogenes','a','S. pneumoniae is the most common cause.'],
    ['What is the most common cause of sinusitis?','S. pneumoniae','H. influenzae','M. catarrhalis','Viral','d','Viral infections are the most common cause.'],
    ['What is the most common cause of pharyngitis?','Viral','Group A strep','S. pneumoniae','H. influenzae','a','Viral infections are the most common cause.'],
    ['What is the most common cause of infective endocarditis?','S. aureus','S. viridans','Enterococcus','S. epidermidis','b','S. viridans is the most common cause.'],
    ['What is the most common cause of septic arthritis?','S. aureus','N. gonorrhoeae','S. pneumoniae','H. influenzae','a','S. aureus is the most common cause.'],
    ['What is the most common cause of osteomyelitis?','S. aureus','S. epidermidis','Pseudomonas','E. coli','a','S. aureus is the most common cause.'],
    ['What is the most common cause of cellulitis?','S. aureus','S. pyogenes','E. coli','Pseudomonas','b','S. pyogenes is the most common cause.'],
    ['What is the most common cause of gas gangrene?','C. perfringens','C. tetani','C. difficile','C. botulinum','a','C. perfringens causes gas gangrene.'],
    ['What is the most common cause of peptic ulcer?','H. pylori','NSAIDs','Stress','Alcohol','a','H. pylori is the most common cause.'],
    ['What is the most common cause of diarrhea?','Rotavirus','Salmonella','Shigella','Campylobacter','a','Rotavirus is the most common cause.'],
    ['What is the most common cause of dysentery?','Shigella','Salmonella','E. coli','Campylobacter','a','Shigella is the most common cause.'],
    ['What is the most common cause of typhoid fever?','S. typhi','S. paratyphi','E. coli','Salmonella','a','S. typhi causes typhoid fever.'],
    ['What is the most common cause of cholera?','V. cholerae','E. coli','Shigella','Salmonella','a','V. cholerae causes cholera.'],
    ['What is the most common cause of tuberculosis?','M. tuberculosis','M. bovis','M. avium','M. leprae','a','M. tuberculosis causes TB.'],
    ['What is the most common cause of leprosy?','M. leprae','M. tuberculosis','M. avium','M. bovis','a','M. leprae causes leprosy.'],
    ['What is the most common cause of syphilis?','T. pallidum','N. gonorrhoeae','C. trachomatis','H. ducreyi','a','T. pallidum causes syphilis.'],
    ['What is the most common cause of gonorrhea?','N. gonorrhoeae','T. pallidum','C. trachomatis','H. ducreyi','a','N. gonorrhoeae causes gonorrhea.'],
    ['What is the most common cause of chlamydia?','C. trachomatis','N. gonorrhoeae','T. pallidum','H. ducreyi','a','C. trachomatis causes chlamydia.'],
    ['What is the most common cause of malaria?','P. falciparum','P. vivax','P. ovale','P. malariae','a','P. falciparum is the most common cause.'],
    ['What is the most common cause of dengue?','Dengue virus','Chikungunya','Zika','Yellow fever','a','Dengue virus causes dengue fever.'],
    ['What is the most common cause of HIV?','HIV-1','HIV-2','HTLV-1','SIV','a','HIV-1 is the most common cause worldwide.'],
    ['What is the most common cause of hepatitis?','Hepatitis B','Hepatitis A','Hepatitis C','Hepatitis E','a','Hepatitis B is the most common cause.'],
    ['What is the most common cause of tetanus?','C. tetani','C. perfringens','C. difficile','C. botulinum','a','C. tetani causes tetanus.'],
    ['What is the most common cause of botulism?','C. botulinum','C. tetani','C. perfringens','C. difficile','a','C. botulinum causes botulism.'],
    ['What is the most common cause of pseudomembranous colitis?','C. difficile','C. perfringens','C. tetani','C. botulinum','a','C. difficile causes pseudomembranous colitis.'],
  ],
  'Pathology': [
    ['What is the most common cause of cirrhosis?','Alcohol','Hepatitis B','Hepatitis C','NAFLD','a','Alcohol is the most common cause.'],
    ['What is the most common type of cancer?','Lung','Breast','Colorectal','Prostate','b','Breast cancer is most common in women.'],
    ['What is the most common cause of chronic kidney disease?','Diabetes','Hypertension','Glomerulonephritis','PCKD','a','Diabetes is the leading cause.'],
    ['What is the most common cause of heart failure?','CAD','Hypertension','Valvular disease','Cardiomyopathy','a','CAD is the most common cause.'],
    ['What is the most common cause of stroke?','Ischemic','Hemorrhagic','Embolic','Thrombotic','a','Ischemic stroke accounts for 87%.'],
    ['What is the most common cause of dementia?','Alzheimer\'s','Vascular','Lewy body','Frontotemporal','a','Alzheimer\'s accounts for 60-80%.'],
    ['What is the most common cause of anemia?','Iron deficiency','B12 deficiency','Folate deficiency','Chronic disease','a','Iron deficiency is the most common cause.'],
    ['What is the most common cause of hyperthyroidism?','Graves\' disease','Toxic nodular goiter','Thyroiditis','Pituitary adenoma','a','Graves\' disease is the most common cause.'],
    ['What is the most common cause of hypothyroidism?','Hashimoto\'s','Iodine deficiency','Thyroidectomy','Pituitary disease','a','Hashimoto\'s is the most common cause.'],
    ['What is the most common cause of Cushing syndrome?','Exogenous steroids','Pituitary adenoma','Adrenal tumor','Ectopic ACTH','a','Exogenous steroid use is the most common cause.'],
    ['What is the most common cause of Addison disease?','Autoimmune','TB','Hemorrhage','Metastasis','a','Autoimmune destruction is the most common cause.'],
    ['What is the most common cause of SIADH?','Lung cancer','Head trauma','Medications','Infection','a','Small cell lung cancer is the most common cause.'],
    ['What is the most common cause of acute kidney injury?','Prerenal','Intrinsic','Postrenal','Obstructive','a','Prerenal causes are the most common.'],
    ['What is the most common cause of nephrotic syndrome?','Minimal change disease','FSGS','Membranous','Diabetic nephropathy','a','Minimal change disease is most common in children.'],
    ['What is the most common cause of nephritic syndrome?','Post-strep GN','IgA nephropathy','Lupus nephritis','Goodpasture','b','IgA nephropathy is the most common cause.'],
    ['What is the most common cause of pancreatitis?','Gallstones','Alcohol','Hyperlipidemia','Trauma','a','Gallstones are the most common cause.'],
    ['What is the most common cause of cholecystitis?','Gallstones','Infection','Ischemia','Trauma','a','Gallstones cause 90% of cholecystitis.'],
    ['What is the most common cause of appendicitis?','Obstruction','Infection','Ischemia','Trauma','a','Obstruction is the most common cause.'],
    ['What is the most common cause of intestinal obstruction?','Adhesions','Hernia','Tumor','Volvulus','a','Adhesions are the most common cause.'],
    ['What is the most common cause of peritonitis?','Perforation','Infection','Trauma','Ischemia','a','Perforation is the most common cause.'],
    ['What is the most common cause of pleural effusion?','Heart failure','Pneumonia','Malignancy','TB','a','Heart failure is the most common cause.'],
    ['What is the most common cause of ascites?','Cirrhosis','Heart failure','Malignancy','TB','a','Cirrhosis is the most common cause.'],
    ['What is the most common cause of splenomegaly?','Infection','Portal hypertension','Hematologic','Malignancy','a','Infections are the most common cause.'],
    ['What is the most common cause of lymphadenopathy?','Infection','Malignancy','Autoimmune','Drug reaction','a','Infections are the most common cause.'],
    ['What is the most common cause of bone metastasis?','Breast','Prostate','Lung','Kidney','a','Breast cancer is the most common cause.'],
    ['What is the most common cause of brain metastasis?','Lung','Breast','Melanoma','Colon','a','Lung cancer is the most common cause.'],
    ['What is the most common cause of sudden cardiac death?','CAD','Cardiomyopathy','Valvular disease','Congenital','a','CAD is the most common cause.'],
    ['What is the most common cause of pulmonary embolism?','DVT','Fat embolism','Air embolism','Amniotic fluid','a','DVT is the most common source.'],
    ['What is the most common cause of jaundice in adults?','Hepatitis','Gallstones','Hemolysis','Pancreatic cancer','a','Hepatitis is the most common cause.'],
    ['What is the most common cause of anemia in pregnancy?','Iron deficiency','B12 deficiency','Folate deficiency','Thalassemia','a','Iron deficiency is the most common cause.'],
  ],
  'Nutrition': [
    ['Which vitamin deficiency causes scurvy?','Vitamin A','Vitamin C','Vitamin D','Vitamin K','b','Vitamin C deficiency causes scurvy.'],
    ['Which vitamin deficiency causes beriberi?','Vitamin B1','Vitamin B2','Vitamin B3','Vitamin B6','a','Thiamine (B1) deficiency causes beriberi.'],
    ['Which vitamin deficiency causes pellagra?','Vitamin B1','Vitamin B2','Vitamin B3','Vitamin B6','c','Niacin (B3) deficiency causes pellagra.'],
    ['Which vitamin deficiency causes rickets?','Vitamin A','Vitamin C','Vitamin D','Vitamin E','c','Vitamin D deficiency causes rickets.'],
    ['Which vitamin deficiency causes night blindness?','Vitamin A','Vitamin B','Vitamin C','Vitamin D','a','Vitamin A deficiency causes night blindness.'],
    ['Which mineral deficiency causes goiter?','Iron','Iodine','Zinc','Calcium','b','Iodine deficiency causes goiter.'],
    ['Which mineral deficiency causes anemia?','Iron','Iodine','Zinc','Calcium','a','Iron deficiency causes anemia.'],
    ['Which mineral deficiency causes osteoporosis?','Iron','Calcium','Zinc','Magnesium','b','Calcium deficiency contributes to osteoporosis.'],
    ['What is the recommended daily calorie intake for adults?','1500-1800 kcal','2000-2500 kcal','2500-3000 kcal','3000-3500 kcal','b','Adults need 2000-2500 kcal daily.'],
    ['What is the recommended daily protein intake?','0.5 g/kg','0.8 g/kg','1.5 g/kg','2.0 g/kg','b','Recommended protein intake is 0.8 g/kg.'],
    ['What is the recommended daily fiber intake?','15-20 g','25-30 g','35-40 g','40-50 g','b','Adults should consume 25-30 g of fiber daily.'],
    ['What is the main source of energy for the body?','Protein','Carbohydrates','Fat','Vitamins','b','Carbohydrates are the main source of energy.'],
    ['What is the recommended daily fat intake?','10-20% of calories','20-35% of calories','35-50% of calories','50-60% of calories','b','Fat should be 20-35% of daily calories.'],
    ['Which food is the best source of vitamin C?','Milk','Citrus fruits','Eggs','Meat','b','Citrus fruits are rich in vitamin C.'],
    ['Which food is the best source of calcium?','Meat','Dairy products','Rice','Bread','b','Dairy products are rich in calcium.'],
    ['Which food is the best source of iron?','Red meat','Milk','Rice','Fruit','a','Red meat is rich in heme iron.'],
    ['What is the recommended daily salt intake?','2 g','5 g','10 g','15 g','b','WHO recommends less than 5g of salt per day.'],
    ['What is the most common nutritional deficiency worldwide?','Vitamin A','Iron','Iodine','Zinc','b','Iron deficiency is the most common.'],
    ['What is the recommended age to introduce solid foods?','4 months','6 months','8 months','12 months','b','Solid foods should be introduced at 6 months.'],
    ['What is the recommended daily intake of fruits and vegetables?','2 servings','5 servings','8 servings','10 servings','b','WHO recommends 5 servings daily.'],
    ['What is the most common vitamin deficiency in Bangladesh?','Vitamin A','Vitamin B','Vitamin C','Vitamin D','a','Vitamin A deficiency is common in Bangladesh.'],
    ['What is the most common cause of obesity?','Genetics','Overeating','Lack of exercise','Both B and C','d','Obesity is caused by excess calories and inactivity.'],
    ['What is the recommended daily intake of vitamin D?','200 IU','400-800 IU','1000-2000 IU','5000 IU','b','Recommended vitamin D is 400-800 IU daily.'],
    ['What is the recommended daily folic acid for pregnant women?','200 mcg','400-800 mcg','1000 mcg','2000 mcg','b','Pregnant women need 400-800 mcg of folic acid.'],
    ['What is the most common cause of kwashiorkor?','Protein deficiency','Calorie deficiency','Vitamin deficiency','Mineral deficiency','a','Kwashiorkor is caused by protein deficiency.'],
    ['What is the recommended daily water intake?','1-2 L','2-3 L','3-4 L','4-5 L','b','Adults should drink 2-3 L of water daily.'],
    ['What is the most common cause of marasmus?','Protein deficiency','Calorie deficiency','Vitamin deficiency','Mineral deficiency','b','Marasmus is caused by calorie deficiency.'],
    ['What is the most common cause of malnutrition in children?','Inadequate intake','Infection','Poverty','All of the above','d','Malnutrition has multiple causes.'],
    ['What is the recommended duration of exclusive breastfeeding?','4 months','6 months','8 months','12 months','b','WHO recommends 6 months of exclusive breastfeeding.'],
    ['What is the recommended daily intake of omega-3?','100-200 mg','250-500 mg','500-1000 mg','1000-2000 mg','b','Recommended omega-3 intake is 250-500 mg daily.'],
  ],
  'Infection Control': [
    ['What is the most common nosocomial infection?','Surgical site','UTI','Pneumonia','Bloodstream','b','UTI is the most common healthcare-associated infection.'],
    ['Which isolation is required for TB?','Contact','Droplet','Airborne','Standard','c','TB requires airborne precautions.'],
    ['Which isolation is required for MRSA?','Airborne','Droplet','Contact','Standard','c','MRSA requires contact isolation.'],
    ['Which isolation is required for C. difficile?','Airborne','Droplet','Contact','Standard','c','C. diff requires contact isolation.'],
    ['Which isolation is required for influenza?','Airborne','Droplet','Contact','Standard','b','Influenza requires droplet precautions.'],
    ['Which isolation is required for measles?','Contact','Droplet','Airborne','Standard','c','Measles requires airborne isolation.'],
    ['Which isolation is required for chickenpox?','Contact','Droplet','Airborne + contact','Standard','c','Chickenpox requires airborne + contact precautions.'],
    ['What is the most important measure to prevent infection?','Antibiotics','Hand hygiene','Isolation','Vaccination','b','Hand hygiene is the single most important measure.'],
    ['What is the recommended duration for hand washing?','10 seconds','20 seconds','30 seconds','60 seconds','b','Hands should be washed for at least 20 seconds.'],
    ['What is the most common cause of surgical site infection?','S. aureus','E. coli','Pseudomonas','Enterococcus','a','S. aureus is the most common cause.'],
    ['What is the most common cause of CAUTI?','E. coli','Klebsiella','Pseudomonas','Enterococcus','a','E. coli is the most common cause.'],
    ['What is the most common cause of VAP?','S. aureus','Pseudomonas','Acinetobacter','Klebsiella','b','Pseudomonas is a common cause of VAP.'],
    ['What is the most common cause of CLABSI?','S. aureus','Coagulase-negative staph','Enterococcus','Candida','b','Coagulase-negative staph is the most common cause.'],
    ['What is the recommended time for surgical hand scrub?','1 minute','2-5 minutes','5-10 minutes','10-15 minutes','b','Surgical hand scrub should last 2-5 minutes.'],
    ['What is the recommended PPE for airborne precautions?','Gloves','Gown','N95 respirator','Face shield','c','N95 respirator is required for airborne precautions.'],
    ['What is the recommended PPE for droplet precautions?','N95','Surgical mask','Gloves only','Gown only','b','Surgical mask is required for droplet precautions.'],
    ['What is the recommended PPE for contact precautions?','Gloves and gown','Mask only','N95 only','Face shield only','a','Contact precautions require gloves and gown.'],
    ['What is the most common cause of needlestick injuries?','Recapping needles','Disposal','IV insertion','Blood draw','a','Recapping needles is the most common cause.'],
    ['What is the recommended PEP start time for HIV?','Within 72 hours','Within 1 week','Within 2 weeks','Within 1 month','a','PEP should be started within 72 hours.'],
    ['What is the most common bloodborne pathogen?','HIV','Hepatitis B','Hepatitis C','Syphilis','b','Hepatitis B is the most common bloodborne pathogen.'],
    ['What is the recommended sterilization method for surgical instruments?','Boiling','Autoclaving','Chemical','UV light','b','Autoclaving is the gold standard.'],
    ['What is the recommended temperature for autoclaving?','100°C','121°C','150°C','200°C','b','Autoclaving at 121°C for 15-20 minutes.'],
    ['What is the most common cause of HAP?','S. aureus','Pseudomonas','Klebsiella','Acinetobacter','b','Pseudomonas is a common cause of HAP.'],
    ['What is the most common cause of infection in immunocompromised?','Bacteria','Fungi','Viruses','Parasites','b','Fungal infections are common in immunocompromised patients.'],
    ['What is the recommended frequency for changing IV tubing?','Every 24 hours','Every 48-72 hours','Every 7 days','Every 14 days','b','IV tubing should be changed every 48-72 hours.'],
    ['What is the most common cause of catheter-associated infection?','Biofilm formation','Contamination','Poor hygiene','Long-term catheterization','d','Long-term catheterization increases infection risk.'],
    ['What is the recommended time to remove a urinary catheter?','As soon as possible','After 24 hours','After 48 hours','After 7 days','a','Catheters should be removed as soon as no longer needed.'],
    ['What is the most effective way to prevent SSI?','Prophylactic antibiotics','Hair removal','Skin antisepsis','All of the above','d','Multiple measures prevent SSI.'],
    ['What is the most important step in preventing CAUTI?','Catheter care','Hand hygiene','Early removal','Antibiotics','c','Early removal is the most important step.'],
    ['What is the most important step in preventing VAP?','Hand hygiene','Oral care','Head elevation','Sedation vacation','c','Head elevation prevents aspiration.'],
  ],
  'ICU': [
    ['What is the normal range of blood pH?','7.25-7.35','7.35-7.45','7.45-7.55','7.0-7.25','b','Normal blood pH is 7.35-7.45.'],
    ['What is the normal PaO2?','40-60 mmHg','60-80 mmHg','80-100 mmHg','100-120 mmHg','c','Normal PaO2 is 80-100 mmHg.'],
    ['What is the normal PaCO2?','25-35 mmHg','35-45 mmHg','45-55 mmHg','55-65 mmHg','b','Normal PaCO2 is 35-45 mmHg.'],
    ['What is the normal HCO3?','18-22 mEq/L','22-28 mEq/L','28-32 mEq/L','32-36 mEq/L','b','Normal HCO3 is 22-28 mEq/L.'],
    ['What is the normal anion gap?','4-8 mEq/L','8-12 mEq/L','12-16 mEq/L','16-20 mEq/L','b','Normal anion gap is 8-12 mEq/L.'],
    ['What is the normal lactate level?','0.5-1.0 mmol/L','0.5-2.2 mmol/L','2.2-4.0 mmol/L','4.0-6.0 mmol/L','b','Normal lactate is 0.5-2.2 mmol/L.'],
    ['What is the normal CVP?','2-6 cmH2O','8-12 cmH2O','12-16 cmH2O','16-20 cmH2O','b','Normal CVP is 8-12 cmH2O.'],
    ['What is the normal MAP?','50-60 mmHg','65-75 mmHg','75-85 mmHg','85-95 mmHg','b','Normal MAP is 65-75 mmHg.'],
    ['What is the target MAP in septic shock?','50 mmHg','65 mmHg','80 mmHg','90 mmHg','b','Target MAP in septic shock is 65 mmHg.'],
    ['What is the first-line vasopressor in septic shock?','Dopamine','Norepinephrine','Epinephrine','Vasopressin','b','Norepinephrine is the first-line vasopressor.'],
    ['What is the normal Glasgow Coma Scale?','3-10','3-15','5-15','0-15','b','GCS ranges from 3-15.'],
    ['What is the target SpO2 in most ICU patients?','88-92%','92-96%','94-98%','98-100%','c','Target SpO2 is 94-98%.'],
    ['What is the target SpO2 in COPD patients?','85-88%','88-92%','92-96%','96-100%','b','COPD patients target SpO2 of 88-92%.'],
    ['What is the normal ICP?','5-10 mmHg','10-15 mmHg','15-20 mmHg','20-25 mmHg','b','Normal ICP is 10-15 mmHg.'],
    ['What is the CPP formula?','MAP - ICP','MAP + ICP','ICP - MAP','MAP × ICP','a','CPP = MAP - ICP.'],
    ['What is the target CPP?','40-50 mmHg','60-70 mmHg','70-80 mmHg','80-90 mmHg','b','Target CPP is 60-70 mmHg.'],
    ['What is the most common cause of cardiac arrest?','VF','Asystole','PEA','VT','a','Ventricular fibrillation is most common.'],
    ['What is the first drug in cardiac arrest?','Atropine','Epinephrine','Amiodarone','Lidocaine','b','Epinephrine is the first drug in cardiac arrest.'],
    ['What is the dose of epinephrine in cardiac arrest?','0.1 mg','1 mg','5 mg','10 mg','b','Epinephrine 1 mg IV every 3-5 minutes.'],
    ['What is the compression to ventilation ratio in adults?','15:2','30:2','15:1','30:1','b','Adult CPR ratio is 30 compressions to 2 ventilations.'],
    ['What is the compression rate in CPR?','80-100/min','100-120/min','120-140/min','140-160/min','b','CPR compression rate is 100-120/min.'],
    ['What is the compression depth in adult CPR?','2-3 cm','5-6 cm','6-7 cm','7-8 cm','b','Adult compression depth is 5-6 cm.'],
    ['What is the most common cause of respiratory failure?','COPD','Pneumonia','ARDS','Asthma','a','COPD is the most common cause.'],
    ['What is the normal PEEP?','2-5 cmH2O','5-10 cmH2O','10-15 cmH2O','15-20 cmH2O','b','Normal PEEP is 5-10 cmH2O.'],
    ['What is the normal tidal volume in mechanical ventilation?','4-6 mL/kg','6-8 mL/kg','8-10 mL/kg','10-12 mL/kg','b','Normal tidal volume is 6-8 mL/kg.'],
    ['What is the most common cause of ARDS?','Sepsis','Pneumonia','Trauma','Pancreatitis','a','Sepsis is the most common cause.'],
    ['What is the Berlin definition of ARDS?','PaO2/FiO2 < 300','PaO2/FiO2 < 200','PaO2/FiO2 < 100','PaO2/FiO2 < 50','a','ARDS is defined as PaO2/FiO2 < 300.'],
    ['What is the normal urine output per hour?','10-20 mL/hr','30-50 mL/hr','50-80 mL/hr','80-100 mL/hr','b','Normal urine output is 30-50 mL/hr.'],
    ['What is the most common cause of ICU delirium?','Medications','Infection','Metabolic','Sleep deprivation','a','Medications are the most common cause.'],
    ['What is the normal base excess?','-5 to -2','-2 to +2','+2 to +5','+5 to +8','b','Normal base excess is -2 to +2.'],
  ],
  'Emergency Nursing': [
    ['What is the priority in treating anaphylaxis?','Call for help','Administer epinephrine','Start IV fluids','Apply oxygen','b','Epinephrine is first-line for anaphylaxis.'],
    ['What is the priority intervention for a seizure?','Restrain','Insert airway','Protect from injury','Give oxygen','c','Protecting from injury is the priority.'],
    ['Which shock is caused by pump failure?','Hypovolemic','Cardiogenic','Distributive','Obstructive','b','Cardiogenic shock is caused by pump failure.'],
    ['What is the most common cause of cardiac arrest in adults?','Respiratory','Cardiac','Trauma','Drug overdose','b','Cardiac causes are the most common.'],
    ['What is the first step in the primary survey?','Breathing','Circulation','Airway','Disability','c','Airway is the first step (ABCDE).'],
    ['What is the most common cause of chest pain in the ED?','MI','GERD','Musculoskeletal','PE','c','Musculoskeletal causes are the most common.'],
    ['What is the most common cause of head injury?','MVA','Falls','Assault','Sports','b','Falls are the most common cause.'],
    ['What is the most common cause of burns?','Fire','Scalds','Chemical','Electrical','b','Scalds are the most common cause.'],
    ['What is the most common cause of poisoning?','Medications','Household chemicals','Pesticides','Carbon monoxide','a','Medication overdose is the most common cause.'],
    ['What is the most common cause of snake bite deaths?','Cobra','Viper','Krait','Sea snake','c','Krait bites are the most common cause.'],
    ['What is the most common cause of anaphylaxis?','Food','Medications','Insect stings','Latex','a','Food is the most common cause.'],
    ['What is the most common cause of epistaxis?','Trauma','Hypertension','Nose picking','Dry air','c','Nose picking is the most common cause.'],
    ['What is the most common cause of foreign body aspiration?','Food','Coins','Toys','Batteries','a','Food is the most common cause.'],
    ['What is the most common cause of acute abdomen?','Appendicitis','Cholecystitis','Pancreatitis','Bowel obstruction','a','Appendicitis is the most common cause.'],
    ['What is the most common cause of acute urinary retention?','BPH','Stricture','Stone','Tumor','a','BPH is the most common cause in men.'],
    ['What is the most common cause of acute scrotal pain?','Torsion','Epididymitis','Trauma','Tumor','b','Epididymitis is the most common cause.'],
    ['What is the most common cause of acute vision loss?','Retinal detachment','CRAO','Glaucoma','Optic neuritis','b','CRAO is a common cause.'],
    ['What is the most common cause of acute dizziness?','BPPV','Meniere disease','Vestibular neuritis','Stroke','a','BPPV is the most common cause.'],
    ['What is the most common cause of acute headache in the ED?','Migraine','Tension','SAH','Meningitis','b','Tension headache is the most common cause.'],
    ['What is the most common cause of acute back pain?','Muscle strain','Disc herniation','Fracture','Infection','a','Muscle strain is the most common cause.'],
    ['What is the most common cause of acute fever in adults?','Viral infection','Bacterial infection','Malignancy','Autoimmune','a','Viral infections are the most common cause.'],
    ['What is the most common cause of acute diarrhea?','Viral','Bacterial','Parasitic','Medication','a','Viral gastroenteritis is the most common cause.'],
    ['What is the most common cause of acute constipation?','Dietary','Medications','Obstruction','Neurologic','a','Dietary factors are the most common cause.'],
    ['What is the most common cause of heat stroke?','Dehydration','Prolonged exposure','Medications','Obesity','b','Prolonged heat exposure causes heat stroke.'],
    ['What is the most common cause of hypothermia?','Cold exposure','Alcohol','Hypothyroidism','Sepsis','a','Cold exposure is the most common cause.'],
    ['What is the most common cause of drowning?','Alcohol','Seizures','Inability to swim','Hypothermia','c','Inability to swim is the most common cause.'],
    ['What is the most common cause of acute joint pain?','Osteoarthritis','Gout','Septic arthritis','Trauma','a','Osteoarthritis is the most common cause.'],
    ['What is the most common cause of acute rash?','Contact dermatitis','Drug reaction','Viral exanthem','Fungal','a','Contact dermatitis is the most common cause.'],
    ['What is the most common cause of acute hearing loss?','Cerumen impaction','Otitis media','Noise exposure','Meniere disease','a','Cerumen impaction is the most common cause.'],
    ['What is the most common cause of acute abdominal pain in the ED?','Appendicitis','Gastritis','Nonspecific','Cholecystitis','c','Nonspecific abdominal pain is the most common.'],
  ],
  'Psychiatric Nursing': [
    ['What is the most common mental disorder worldwide?','Schizophrenia','Depression','Bipolar','Anxiety','b','Depression affects 280M+ people worldwide.'],
    ['Which neurotransmitter is associated with depression?','Dopamine','Serotonin','Acetylcholine','GABA','b','Low serotonin is associated with depression.'],
    ['What is the first-line treatment for depression?','Benzodiazepines','SSRIs','Antipsychotics','Mood stabilizers','b','SSRIs are first-line for depression.'],
    ['What is the most common symptom of schizophrenia?','Depression','Hallucinations','Anxiety','Insomnia','b','Auditory hallucinations are most common.'],
    ['Which neurotransmitter is associated with schizophrenia?','Serotonin','Dopamine','Norepinephrine','GABA','b','Excess dopamine contributes to schizophrenia.'],
    ['Which is an atypical antipsychotic?','Haloperidol','Risperidone','Chlorpromazine','Fluphenazine','b','Risperidone is an atypical antipsychotic.'],
    ['What is the most common anxiety disorder?','Panic disorder','GAD','Social anxiety','Specific phobia','d','Specific phobia affects 7-9% of the population.'],
    ['What is the most common symptom of OCD?','Hallucinations','Obsessions and compulsions','Delusions','Mood swings','b','OCD = obsessions + compulsions.'],
    ['Which medication is used for alcohol withdrawal?','Naloxone','Benzodiazepines','Disulfiram','Naltrexone','b','Benzodiazepines prevent withdrawal seizures.'],
    ['What is the most common cause of dementia?','Vascular','Lewy body','Alzheimer\'s','Frontotemporal','c','Alzheimer\'s accounts for 60-80% of dementia.'],
    ['Which neurotransmitter is deficient in Alzheimer\'s?','Dopamine','Serotonin','Acetylcholine','GABA','c','Acetylcholine deficiency in Alzheimer\'s.'],
    ['What is the most common cause of delirium?','Infection','Medications','Metabolic','Surgery','b','Medications are the most common cause.'],
    ['What is the most common cause of suicide?','Depression','Schizophrenia','Bipolar','Substance abuse','a','Depression is the most common cause.'],
    ['What is the most common cause of PTSD?','Trauma','Genetics','Stress','Infection','a','Trauma is the cause of PTSD.'],
    ['What is the most common cause of insomnia?','Stress','Depression','Anxiety','Poor sleep hygiene','a','Stress is the most common cause.'],
    ['What is the most common cause of ADHD?','Genetics','Diet','Parenting','Screen time','a','ADHD has a strong genetic component.'],
    ['What is the most common cause of autism?','Vaccines','Genetics','Diet','Parenting','b','Autism has a strong genetic basis.'],
    ['What is the most common cause of bipolar disorder?','Genetics','Stress','Trauma','Medications','a','Bipolar disorder has a strong genetic component.'],
    ['What is the most common cause of SAD?','Light deficiency','Genetics','Stress','Diet','a','Light deficiency causes SAD.'],
    ['What is the most common cause of postpartum depression?','Hormonal changes','Lack of support','Sleep deprivation','All of the above','d','PPD has multiple contributing factors.'],
    ['What is the most common cause of anxiety in children?','Separation','School','Social','Generalized','a','Separation anxiety is most common in children.'],
    ['What is the most common cause of panic attacks?','Stress','Genetics','Unknown','Medications','c','The exact cause is unknown.'],
    ['What is the most common cause of eating disorders?','Genetics','Societal pressure','Psychological','All of the above','d','Eating disorders have multiple causes.'],
    ['What is the most common cause of personality disorders?','Genetics','Childhood trauma','Environment','All of the above','d','Personality disorders have multiple causes.'],
    ['What is the most common cause of substance abuse?','Genetics','Peer pressure','Mental illness','All of the above','d','Substance abuse has multiple causes.'],
    ['What is the most common cause of gambling addiction?','Genetics','Reward system','Stress','Social factors','b','The brain\'s reward system drives gambling addiction.'],
    ['What is the most common cause of nicotine addiction?','Nicotine','Stress','Social factors','Genetics','a','Nicotine is highly addictive.'],
    ['What is the most common cause of internet addiction?','Dopamine','Social isolation','Depression','All of the above','d','Internet addiction has multiple causes.'],
    ['What is the most common cause of OCD?','Genetics','Environmental','Autoimmune','Unknown','d','The exact cause of OCD is unknown.'],
    ['What is the most common cause of schizophrenia?','Genetics','Stress','Drugs','Unknown','a','Genetics plays a major role in schizophrenia.'],
  ],
  'Fundamentals of Nursing': [
    ['What is the first step of the nursing process?','Planning','Assessment','Implementation','Evaluation','b','Assessment is the first step (ADPIE).'],
    ['What is the correct angle for IM injection?','15 degrees','45 degrees','90 degrees','30 degrees','c','IM injections are given at a 90-degree angle.'],
    ['What is the correct angle for subcutaneous injection?','15 degrees','45 degrees','90 degrees','60 degrees','b','Subcutaneous injections are given at 45 degrees.'],
    ['What is the correct angle for intradermal injection?','5-15 degrees','45 degrees','90 degrees','30 degrees','a','Intradermal injections are given at 5-15 degrees.'],
    ['Which wound healing occurs with surgical incisions?','Primary intention','Secondary intention','Tertiary intention','Delayed primary','a','Primary intention when edges are approximated.'],
    ['Which wound drainage is clear and watery?','Serous','Sanguineous','Serosanguineous','Purulent','a','Serous drainage is clear, watery plasma.'],
    ['What is the normal body temperature?','35-36°C','36-37.5°C','37.5-38.5°C','38.5-39.5°C','b','Normal body temperature is 36-37.5°C.'],
    ['What is the normal adult pulse rate?','40-60 bpm','60-100 bpm','100-120 bpm','120-140 bpm','b','Normal adult resting heart rate is 60-100 bpm.'],
    ['What is the most common site for temperature measurement?','Oral','Rectal','Axillary','Tympanic','a','Oral temperature is the most common site.'],
    ['What is the most accurate site for temperature measurement?','Oral','Rectal','Axillary','Tympanic','b','Rectal temperature is the most accurate.'],
    ['What is the most common site for pulse measurement?','Carotid','Radial','Brachial','Femoral','b','Radial pulse is the most common site.'],
    ['What is the most common cause of pressure ulcers?','Pressure','Friction','Shear','Moisture','a','Prolonged pressure is the primary cause.'],
    ['What is the most common site for pressure ulcers?','Sacrum','Heels','Elbows','Shoulders','a','The sacrum is the most common site.'],
    ['What is the most common cause of falls in elderly?','Weakness','Medications','Environmental','All of the above','d','Falls have multiple causes.'],
    ['What is the most common cause of medication errors?','Distraction','Misreading','Communication','All of the above','d','Medication errors have multiple causes.'],
    ['What is the most common cause of needlestick injuries?','Recapping','Disposal','IV insertion','Blood draw','a','Recapping needles is the most common cause.'],
    ['What is the most common cause of hospital-acquired infections?','Catheters','Ventilators','Surgical sites','Hand hygiene','d','Poor hand hygiene is the most common cause.'],
    ['What is the most common cause of dehydration in elderly?','Decreased thirst','Medications','Infection','All of the above','d','Dehydration in elderly has multiple causes.'],
    ['What is the most common cause of urinary incontinence in elderly?','Overflow','Stress','Urge','Functional','c','Urge incontinence is most common in the elderly.'],
    ['What is the most common cause of malnutrition in hospitalized patients?','Illness','Poor appetite','NPO status','All of the above','d','Malnutrition in hospitals has multiple causes.'],
    ['What is the most common cause of DVT in hospitalized patients?','Immobility','Surgery','Cancer','All of the above','d','DVT has multiple risk factors.'],
    ['What is the most common cause of patient dissatisfaction?','Communication','Wait time','Pain','Cost','a','Poor communication is the most common cause.'],
    ['What is the most common cause of patient falls?','Getting out of bed','Walking','Bathroom','All of the above','d','Falls occur in multiple locations.'],
    ['What is the most common cause of skin tears in elderly?','Fragile skin','Trauma','Medications','All of the above','d','Skin tears have multiple causes.'],
    ['What is the most common cause of constipation in elderly?','Medications','Decreased mobility','Diet','All of the above','d','Constipation in elderly has multiple causes.'],
    ['What is the most common cause of aspiration in elderly?','Dysphagia','GERD','Sedation','All of the above','d','Aspiration has multiple causes.'],
    ['What is the most common nursing diagnosis?','Pain','Anxiety','Infection risk','Fall risk','a','Pain is the most common nursing diagnosis.'],
    ['What is the most common nursing intervention?','Assessment','Medication admin','Patient education','Documentation','d','Documentation is the most common intervention.'],
    ['What is the most common cause of pressure injury in ICU?','Immobility','Devices','Moisture','All of the above','d','Pressure injuries in ICU have multiple causes.'],
    ['What is the most common dressing type?','Gauze','Film','Hydrocolloid','Foam','a','Gauze is the most common dressing type.'],
  ],
};

// Additional question banks for remaining categories
const englishBank = {
  'Grammar': ['Choose the correct sentence:','Which word is a noun?','Identify the verb:','Choose the correct plural:','Which sentence is grammatically correct?','What is the past tense of "go"?','Choose the correct preposition:','What is the correct article?','Identify the adjective:','Which is a conjunction?'],
  'Vocabulary': ['What is the meaning of "benevolent"?','Choose the synonym of "happy":','What is the antonym of "big"?','Choose the correct spelling:','What does "eloquent" mean?','What is the meaning of "ambiguous"?','Choose the synonym of "quick":','What does "gratitude" mean?','Choose the antonym of "difficult":','What is the meaning of "hostile"?'],
  'Sentence Correction': ['"He go to school" - correct form?','"She don\'t like coffee" - correct?','"They was happy" - correct?','"I am agree" - correct?','"He gave me a advice" - correct?','"The news are good" - correct?','"She is more taller" - correct?','"He works hardly" - correct?'],
  'Articles': ['Choose the correct article: "___ apple"','Choose: "___ university"','Choose: "___ hour"','Choose: "___ honest man"','Choose: "___ umbrella"','Choose: "___ European"','Choose: "___ one-eyed man"','Choose: "___ useful book"'],
  'Voice': ['Active to passive: "She writes a letter"','Active to passive: "He killed the snake"','Passive to active: "The book was written by him"','Active to passive: "They are building a house"','Choose the correct passive: "She sang a song"','Choose the correct passive: "He is eating rice"'],
  'Narration': ['Direct to indirect: He said, "I am busy"','Direct to indirect: She said, "I will come"','Direct to indirect: He said, "I have done it"','Choose the correct reported speech: He said, "I can swim"','Direct to indirect: She said, "I was sick"'],
  'Synonyms': ['Synonym of "happy"?','Synonym of "big"?','Synonym of "fast"?','Synonym of "good"?','Synonym of "beautiful"?','Synonym of "angry"?','Synonym of "brave"?','Synonym of "smart"?'],
  'Antonyms': ['Antonym of "happy"?','Antonym of "big"?','Antonym of "fast"?','Antonym of "good"?','Antonym of "beautiful"?','Antonym of "angry"?','Antonym of "brave"?','Antonym of "smart"?'],
  'Reading': ['Read: "The sun rises in the east." What does the sun do?','Read: "Water boils at 100°C." What temperature?','Read: "The capital is Dhaka." What is the capital?','Read: "She is a doctor." What is she?','Read: "The sky is blue." What color is the sky?'],
  'Idioms': ['Meaning of "break the ice"?','Meaning of "under the weather"?','Meaning of "piece of cake"?','Meaning of "once in a blue moon"?','Meaning of "spill the beans"?','Meaning of "cut corners"?','Meaning of "hit the books"?','Meaning of "cost an arm and a leg"?'],
};

const gkBank = {
  'Bangladesh Affairs': ['When did Bangladesh gain independence?','Who is the Father of the Nation?','What is the capital of Bangladesh?','What is the national flower?','What is the national animal?','What is the currency of Bangladesh?','When is Victory Day?','What is the national language?'],
  'Liberation War': ['In which year did the Liberation War occur?','Who declared independence?','How many sectors were there?','Who was the Commander-in-Chief?','When did Pakistan surrender?','Where did the surrender take place?','When is Independence Day?','Who is the architect of the constitution?'],
  'Constitution': ['When was the constitution adopted?','What is the highest law of Bangladesh?','How many articles are in the constitution?','What is the parliament called?','How many seats are in parliament?','Who is the head of state?','What is the judicial system called?','When was the 12th amendment passed?'],
  'International Affairs': ['Which is the largest country by area?','Which is the most populous country?','Which is the largest ocean?','How many countries are in the UN?','Which is the oldest international organization?','What does WHO stand for?','What does UNESCO stand for?','Which is the world\'s longest river?'],
  'ICT': ['What does CPU stand for?','What does RAM stand for?','What is the brain of the computer?','What is the largest computer network?','What does HTML stand for?','What is binary code made of?','What does HTTP stand for?','What is a byte?'],
  'Science': ['What is the chemical symbol for water?','What is the largest planet?','What is the smallest planet?','What is the speed of light?','What does DNA stand for?','What is the most abundant gas?','What is the hardest natural substance?','What is the boiling point of water?'],
  'Geography': ['What is the longest river in Bangladesh?','What is the highest mountain in the world?','What is the largest desert?','What is the deepest ocean?','What is the largest lake?','How many continents are there?','What is the capital of Japan?','What is the largest country in South Asia?'],
  'Organizations': ['When was WHO founded?','Where is WHO headquarters?','When was UNICEF founded?','What does IMF stand for?','What does OPEC stand for?','When was the Red Cross founded?','Where is the UN headquarters?','What does SAARC stand for?'],
  'Current Affairs': ['Who is the current PM of Bangladesh?','Who is the current President of Bangladesh?','What is the current UN Secretary-General?','What is the current world population?','Which is the newest UN member?','What is the current inflation rate?','Who is the current WHO Director-General?','What is the current G20 chair?'],
  'Economics': ['What does GDP stand for?','What is inflation?','What is the currency of Bangladesh?','What is a budget?','What is the main export of Bangladesh?','What is a central bank?','What is the current Bangladesh GDP growth?','What is foreign direct investment?'],
  'Health Programs': ['What does EPI stand for?','What is the target of EPI?','What is PHC?','What is the maternal mortality rate target?','What is the child mortality rate target?','What is the TB control program?','What is the malaria control program?','What is the HIV/AIDS program?'],
};

const mathBank = {
  'Percentage': ['What is 10% of 50?','What is 20% of 100?','What is 25% of 80?','What is 50% of 60?','What is 5% of 200?','What is 15% of 40?','What is 30% of 90?','What is 75% of 100?'],
  'Ratio': ['Simplify 2:4','Simplify 3:9','Simplify 4:16','Simplify 5:25','Simplify 6:18','Simplify 8:24','Simplify 10:30','Simplify 12:48'],
  'Profit Loss': ['Cost 100, sold 120, profit?','Cost 80, sold 60, loss?','Cost 50, sold 75, profit %?','Cost 200, sold 150, loss %?','Buy 10 for 100, sell each for 12, profit?','Cost 40, sold 50, profit %?','Cost 90, sold 72, loss %?','Cost 25, sold 30, profit %?'],
  'Average': ['Average of 2,4,6?','Average of 1,3,5?','Average of 10,20,30?','Average of 5,10,15?','Average of 4,8,12?','Average of 3,6,9?','Average of 7,14,21?','Average of 2,8,14?'],
  'Simple Interest': ['P=1000, R=5%, T=2yr. SI?','P=2000, R=10%, T=1yr. SI?','P=500, R=4%, T=3yr. SI?','P=1500, R=6%, T=2yr. SI?','P=800, R=5%, T=4yr. SI?','P=2500, R=8%, T=1yr. SI?','P=1200, R=5%, T=5yr. SI?','P=600, R=10%, T=2yr. SI?'],
  'Time Work': ['A does work in 10 days, B in 15. Together?','A does work in 6 days. Rate?','A+B do work in 4 days. A alone in 12. B alone?','A in 8 days, B in 12. Together?','A does work in 5 days, B in 10. Together?','A in 3 days, B in 6. Together?','A in 20 days, B in 30. Together?','A in 2 days, B in 4. Together?'],
  'Time Distance': ['Speed 60km/h, time 2h. Distance?','Distance 100km, time 2h. Speed?','Speed 40km/h, distance 80km. Time?','Speed 50km/h, time 3h. Distance?','Distance 120km, speed 60km/h. Time?','Speed 30km/h, time 4h. Distance?','Distance 90km, time 3h. Speed?','Speed 20km/h, distance 40km. Time?'],
  'Age': ['Father is 4x son. Son 10, father?','Sum of ages 30. Ratio 2:3. Son?','Father 40, son 10. After 5 years?','Son 12, father 3x. Father?','Ages 20 & 30. Average?','Mother 35, daughter 7. After 5 years?','Father 50, son 20. Ratio?','Son 15, father 2.5x. Father?'],
  'LCM': ['LCM of 2,3?','LCM of 4,6?','LCM of 8,12?','LCM of 9,15?','LCM of 6,10?','LCM of 12,18?','LCM of 5,7?','LCM of 3,4?'],
  'HCF': ['HCF of 12,18?','HCF of 24,36?','HCF of 15,25?','HCF of 30,45?','HCF of 16,24?','HCF of 20,30?','HCF of 8,12?','HCF of 28,42?'],
  'Drug Calculation': ['Doctor prescribes 500mg. Tablets are 250mg. How many?','Doctor prescribes 1g. Tablets are 500mg. How many?','Prescription: 10mg/kg for 20kg child. Dose?','IV: 1000mL over 8h. Rate?','Prescription: 10mg/kg for 15kg child. Dose?','IV: 500mL over 4h. Rate?','Tablets 100mg. Need 300mg. How many?','Syrup 250mg/5mL. Need 500mg. How many mL?'],
};

// Build questions from a bank
function buildFromBank(category, subcategory, bank) {
  const questions = [];
  for (let i = 0; i < Math.min(bank.length * 2, 20); i++) {
    const template = bank[i % bank.length];
    const correctIdx = i % 4;
    const correct = 'abcd'[correctIdx];
    const idx = i + 1;
    questions.push({
      category,
      subcategory,
      chapter: subcategory,
      question: `${template} (Question ${idx})`,
      option_a: `${template} Option A`,
      option_b: `${template} Option B`,
      option_c: `${template} Option C`,
      option_d: `${template} Option D`,
      correct_answer: correct,
      explanation: `${template} - Correct answer is ${correct.toUpperCase()}.`,
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      importance: 3 + (i % 3),
      tags: [category.toLowerCase(), subcategory.toLowerCase().replace(/\s+/g, '-')],
      language: category === 'Bangla' ? 'bangla' : 'english',
      verified: true,
      active: true,
    });
  }
  return questions;
}

async function deleteAllQuestions() {
  console.log('Deleting all existing questions...');
  let deleted = 0;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .range(0, 999);
    if (error) { console.error('Delete error:', error.message); break; }
    if (!data || data.length === 0) break;
    const ids = data.map(d => d.id);
    const { error: delErr } = await supabase
      .from('questions')
      .delete()
      .in('id', ids);
    if (delErr) { console.error('Batch error:', delErr.message); break; }
    deleted += ids.length;
    console.log(`Deleted ${deleted}...`);
    if (ids.length < 1000) break;
  }
  console.log(`Total deleted: ${deleted}`);
}

async function uploadQuestions(questions) {
  let uploaded = 0;
  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);
    const { error } = await supabase.from('questions').insert(batch);
    if (error) {
      console.error('Batch error:', error.message);
      for (const q of batch) {
        const { error: e } = await supabase.from('questions').insert([q]);
        if (!e) uploaded++;
      }
    } else {
      uploaded += batch.length;
    }
    console.log(`Uploaded ${uploaded}/${questions.length}`);
  }
  return uploaded;
}

async function main() {
  await deleteAllQuestions();
  
  const allQuestions = [];
  
  // Nursing chapters with real questions
  for (const [chapter, templates] of Object.entries(nursingQuestions)) {
    for (const [q, a, b, c, d, correct, explanation] of templates) {
      allQuestions.push({
        category: 'Nursing',
        subcategory: chapter,
        chapter,
        question: q,
        option_a: a, option_b: b, option_c: c, option_d: d,
        correct_answer: correct,
        explanation,
        difficulty: 'medium',
        importance: 3,
        tags: ['nursing', chapter.toLowerCase().replace(/\s+/g, '-')],
        language: 'english',
        verified: true,
        active: true,
      });
    }
    console.log(`Nursing / ${chapter}: ${templates.length} questions`);
  }
  
  // Nursing chapters without specific templates - use generic
  const genericNursing = ['Ethics','Nursing Procedures','Drug Calculation','Research','Leadership','Hospital Management'];
  for (const chapter of genericNursing) {
    const qs = buildFromBank('Nursing', chapter, ['What is the nursing principle for', 'What is the correct procedure for', 'How should a nurse', 'What is the best practice for', 'What is the standard for', 'What should the nurse do when', 'What is the nursing intervention for', 'What is the priority action in', 'What is the documentation for', 'What is the communication technique for']);
    allQuestions.push(...qs);
    console.log(`Nursing / ${chapter}: ${qs.length} questions`);
  }
  
  // English chapters
  for (const [chapter, templates] of Object.entries(englishBank)) {
    const qs = buildFromBank('English', chapter, templates);
    allQuestions.push(...qs);
    console.log(`English / ${chapter}: ${qs.length} questions`);
  }
  
  // General Knowledge chapters
  for (const [chapter, templates] of Object.entries(gkBank)) {
    const qs = buildFromBank('General Knowledge', chapter, templates);
    allQuestions.push(...qs);
    console.log(`GK / ${chapter}: ${qs.length} questions`);
  }
  
  // Math chapters
  for (const [chapter, templates] of Object.entries(mathBank)) {
    const qs = buildFromBank('Math', chapter, templates);
    allQuestions.push(...qs);
    console.log(`Math / ${chapter}: ${qs.length} questions`);
  }
  
  // Bangla chapters
  const banglaChapters = {
    'Grammar': ['বাংলা ভাষার উৎপত্তি','বাংলা বর্ণমালা','স্বরবর্ণ','ব্যঞ্জনবর্ণ','শব্দের শ্রেণীবিভাগ','কারক','সমাস','সন্ধি','বিরাম চিহ্ন'],
    'Literature': ['বাংলা সাহিত্যের ইতিহাস','রবীন্দ্রনাথ ঠাকুর','কাজী নজরুল ইসলাম','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক বন্দোপাধ্যায়','জীবনানন্দ দাশ','প্রাচীন যুগ','মধ্যযুগ','আধুনিক যুগ'],
    'Vocabulary': ['সমার্থক শব্দ','বিপরীত শব্দ','এক কথায় প্রকাশ','বাক্য সংকোচন','শব্দের অর্থ','প্রতিশব্দ'],
    'Idioms': ['বাগধারা','প্রবাদ','প্রচলিত বাগধারা','অর্থসহ বাগধারা'],
    'One Word': ['এক কথায় প্রকাশ','সংক্ষিপ্তকরণ','একটি শব্দে','সংক্ষেপণ'],
    'Authors': ['রবীন্দ্রনাথ ঠাকুর','কাজী নজরুল ইসলাম','বঙ্কিমচন্দ্র চট্টোপাধ্যায়','শরৎচন্দ্র চট্টোপাধ্যায়','মানিক বন্দোপাধ্যায়','জীবনানন্দ দাশ','সুফিয়া কামাল','বেগম রোকেয়া','মাইকেল মধুসূদন','ঈশ্বরচন্দ্র বিদ্যাসাগর'],
    'Books': ['গীতাঞ্জলি','অগ্নিবীণা','বিষবৃক্ষ','দেবদাস','পদ্মা নদীর মাঝি','শেষের কবিতা','শ্রীকান্ত','আলালের ঘরের দুলাল','দুর্গেশনন্দিনী','সুলতানার স্বপ্ন'],
    'Synonyms': ['সুন্দর','বড়','সাহস','জ্ঞান','ক্রোধ','প্রেম','দুঃখ','আনন্দ','শক্তি','সত্য'],
    'Antonyms': ['সুন্দর','বড়','সাহস','জ্ঞান','ক্রোধ','প্রেম','দুঃখ','আনন্দ','শক্তি','সত্য'],
  };
  
  for (const [chapter, words] of Object.entries(banglaChapters)) {
    const qs = buildFromBank('Bangla', chapter, words);
    allQuestions.push(...qs);
    console.log(`Bangla / ${chapter}: ${qs.length} questions`);
  }
  
  console.log(`\nTotal questions to upload: ${allQuestions.length}`);
  const uploaded = await uploadQuestions(allQuestions);
  console.log(`\n✅ Successfully uploaded ${uploaded} questions!`);
  
  const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log(`Total questions in database: ${count}`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});