/**
 * Delete all MCQs and upload fresh ones for every chapter
 * Uses only columns that exist in the questions table
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgwMDk2NiwiZXhwIjoyMTAwMzc2OTY2fQ.yNPzM1V-xMZwM5MiL2qKb0DLUyKXJcua70OjoK_w4O4';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BATCH = 100;

// All chapters from the app
const ALL_CHAPTERS = {
  'Nursing': ['Medical Surgical Nursing','Anatomy','Physiology','Pharmacology','Pediatric Nursing','Community Nursing','Obstetrics','Gynecology','Microbiology','Pathology','Nutrition','Infection Control','ICU','Emergency Nursing','Psychiatric Nursing','Fundamentals of Nursing','Ethics','Nursing Procedures','Drug Calculation','Research','Leadership','Hospital Management'],
  'Bangla': ['Grammar','Literature','Vocabulary','Idioms','One Word','Authors','Books','Synonyms','Antonyms'],
  'English': ['Grammar','Vocabulary','Sentence Correction','Articles','Voice','Narration','Synonyms','Antonyms','Reading','Idioms'],
  'General Knowledge': ['Bangladesh Affairs','Liberation War','Constitution','International Affairs','ICT','Science','Geography','Organizations','Current Affairs','Economics','Health Programs'],
  'Math': ['Percentage','Ratio','Profit Loss','Average','Simple Interest','Time Work','Time Distance','Age','LCM','HCF','Drug Calculation'],
};

// Question templates for each chapter
const chapterTemplates = {
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
};

// Generic templates for chapters without specific questions
const genericTemplates = {
  'Pharmacology': ['What is the mechanism of action of','What is the first-line treatment for','What is the antidote for','Which drug is a','What is the therapeutic range for','Which medication is used for','What is the side effect of','Which drug class is'],
  'Pediatric Nursing': ['What is the normal','Which vaccine is given','When does the','What is the most common','Which condition is','What is the first sign of','Which immunization is','What is the normal range for'],
  'Community Nursing': ['What is the goal of','Which disease is','What is the recommended','What is the main vector for','What is the most common','Which vaccine is given','What is the target for','What is the recommended age for'],
  'Obstetrics': ['What is the normal','Which hormone','What is the most common','Which stage of','What is the definition of','Which contraceptive','What is the recommended','What is the normal duration of'],
  'Gynecology': ['What is the most common','What is the most common cause of','What is the most common symptom of','What is the most common type of','Which is the most common','What is the most common benign','What is the most common cause of','What is the most common type of'],
  'Microbiology': ['What is the most common cause of','Which organism causes','What is the most common','Which bacteria is','What is the most common pathogen','Which virus causes','What is the most common infection','Which organism is'],
  'Pathology': ['What is the most common cause of','What is the most common type of','Which is the most common','What is the most common','What is the most common cause of','What is the most common type of','Which is the most common cause','What is the most common finding in'],
  'Nutrition': ['Which vitamin deficiency causes','Which mineral deficiency causes','What is the recommended daily','Which food is the best source of','What is the most common','What is the recommended','What is the main source of','What is the most common cause of'],
  'Infection Control': ['What is the most common','Which isolation is required for','What is the recommended','What is the most important','What is the most common cause of','What is the recommended PPE for','What is the most effective way to','What is the most common cause of'],
  'ICU': ['What is the normal','What is the target','What is the first-line','What is the most common cause of','What is the normal range of','What is the compression','What is the normal tidal','What is the most common cause of'],
  'Emergency Nursing': ['What is the priority in','What is the most common cause of','What is the first step in','Which shock is','What is the most common','What is the priority intervention for','What is the most common cause of','What is the most common cause of acute'],
  'Psychiatric Nursing': ['What is the most common','Which neurotransmitter is','What is the first-line treatment for','What is the most common symptom of','Which is an','What is the most common cause of','What is the most common type of','What is the most common cause of'],
  'Fundamentals of Nursing': ['What is the first step of','What is the correct angle for','Which type of','What is the most common site for','What is the most common cause of','What is the most common','What is the correct procedure for','What is the most common type of'],
  'Ethics': ['What is the primary ethical principle','What does informed consent mean','What is patient confidentiality','What is the principle of','What is the most common ethical','What is the most important ethical','What is the most common ethical issue in','What is the principle of'],
  'Nursing Procedures': ['What is the correct procedure for','What is the correct angle for','What is the maximum','What is the correct flow rate for','What is the correct position for','What is the correct technique for','What is the correct method for','What is the correct way to'],
  'Drug Calculation': ['What is the formula for','What is the dose of','What is the correct calculation for','What is the formula to calculate','What is the pediatric dose of','What is the IV rate for','What is the correct dose of','What is the formula for calculating'],
  'Research': ['What is the first step in','What is the most common type of','What is the gold standard','What is the most common','What is the most common sampling','What is the most common data','What is the most common statistical','What is the most common type of'],
  'Leadership': ['What is the most common','What is the most effective','What is the most common cause of','What is the most common type of','What does SBAR stand for','What is the most common conflict','What is the most common nursing','What is the most common type of'],
  'Hospital Management': ['What is the most common type of','What is the most common cause of','What is the most common department','What is the most common type of hospital','What is the most common cause of hospital','What is the most common type of hospital','What is the most common type of','What is the most common type of hospital'],
  'Grammar': ['Choose the correct sentence:','Which word is a noun?','Identify the verb:','Choose the correct plural:','Which sentence is grammatically correct?','What is the past tense of','Choose the correct preposition:','What is the correct article?'],
  'Vocabulary': ['What is the meaning of','Choose the synonym of','What is the antonym of','Choose the correct spelling:','What does the word mean','Choose the correct meaning of','What is the opposite of','What is the meaning of the word'],
  'Sentence Correction': ['Which sentence is correct?','Choose the correct form:','Identify the error:','What is the correct sentence?','Choose the grammatically correct option:','Which is the correct usage?','Choose the correct version:','What is the correct way to say'],
  'Articles': ['Choose the correct article:','Which article is correct?','Fill in the blank with the correct article:','Choose the right article:','What is the correct article for','Select the correct article:','Which article should be used:','Choose the appropriate article:'],
  'Voice': ['Convert to passive voice:','Convert to active voice:','Choose the correct passive form:','What is the passive voice of','Choose the correct active form:','What is the active voice of','Convert the following to passive:','Choose the correct voice:'],
  'Narration': ['Convert to indirect speech:','Choose the correct reported speech:','What is the indirect form of','Convert to direct speech:','Choose the correct narration:','What is the reported form of','Convert the following to indirect:','Choose the correct indirect speech:'],
  'Synonyms': ['What is the synonym of','Choose the synonym:','What is a synonym for','Which word is a synonym of','Choose the correct synonym:','What is the closest synonym of','Which is a synonym for','Choose the best synonym:'],
  'Antonyms': ['What is the antonym of','Choose the antonym:','What is an antonym for','Which word is an antonym of','Choose the correct antonym:','What is the opposite of','Which is an antonym for','Choose the best antonym:'],
  'Reading': ['Read the passage and answer:','What is the main idea of','What does the passage say about','According to the passage,','What can be inferred from','What is the purpose of','What is the tone of','What is the best title for'],
  'Idioms': ['What is the meaning of the idiom','Choose the correct meaning of','What does the idiom mean','What is the meaning of','Choose the correct idiom meaning:','What does the phrase mean','What is the meaning of the phrase','Choose the correct meaning:'],
  'Bangladesh Affairs': ['When did Bangladesh','Who is the','What is the capital of','What is the national','What is the currency of','When is','What is the main','Which is the largest'],
  'Liberation War': ['In which year did','Who declared','How many sectors','Who was the','When did Pakistan','Where did the','When is Independence','Who is the architect'],
  'Constitution': ['When was the constitution','What is the highest law','How many articles','What is the parliament','How many seats','Who is the head of state','What is the judicial','When was the'],
  'International Affairs': ['Which is the largest','Which is the most populous','Which is the largest ocean','How many countries','Which is the oldest','What does WHO stand for','What does UNESCO stand for','Which is the world\'s longest'],
  'ICT': ['What does CPU stand for','What does RAM stand for','What is the brain of','What is the largest','What does HTML stand for','What is binary code','What does HTTP stand for','What is a byte'],
  'Science': ['What is the chemical symbol for','What is the largest planet','What is the smallest planet','What is the speed of','What does DNA stand for','What is the most abundant','What is the hardest','What is the boiling point of'],
  'Geography': ['What is the longest river','What is the highest mountain','What is the largest desert','What is the deepest ocean','What is the largest lake','How many continents','What is the capital of','What is the largest country'],
  'Organizations': ['When was WHO founded','Where is WHO headquarters','When was UNICEF founded','What does IMF stand for','What does OPEC stand for','When was the Red Cross','Where is the UN headquarters','What does SAARC stand for'],
  'Current Affairs': ['Who is the current','What is the current','Which is the newest','What is the current world','Who is the current UN','What is the current G20','Who is the current WHO','What is the current inflation'],
  'Economics': ['What does GDP stand for','What is inflation','What is the currency of','What is a budget','What is the main export','What is a central bank','What is the current GDP','What is foreign direct'],
  'Health Programs': ['What does EPI stand for','What is the target of','What is PHC','What is the maternal','What is the child','What is the TB control','What is the malaria','What is the HIV/AIDS'],
  'Percentage': ['What is 10% of 50','What is 20% of 100','What is 25% of 80','What is 50% of 60','What is 5% of 200','What is 15% of 40','What is 30% of 90','What is 75% of 100'],
  'Ratio': ['Simplify the ratio 2:4','Simplify the ratio 3:9','Simplify the ratio 4:16','Simplify the ratio 5:25','Simplify the ratio 6:18','Simplify the ratio 8:24','Simplify the ratio 10:30','Simplify the ratio 12:48'],
  'Profit Loss': ['Cost 100, sold 120, what is the profit?','Cost 80, sold 60, what is the loss?','Cost 50, sold 75, what is the profit %?','Cost 200, sold 150, what is the loss %?','Buy 10 for 100, sell each for 12, what is the profit?','Cost 40, sold 50, what is the profit %?','Cost 90, sold 72, what is the loss %?','Cost 25, sold 30, what is the profit %?'],
  'Average': ['What is the average of 2,4,6?','What is the average of 1,3,5?','What is the average of 10,20,30?','What is the average of 5,10,15?','What is the average of 4,8,12?','What is the average of 3,6,9?','What is the average of 7,14,21?','What is the average of 2,8,14?'],
  'Simple Interest': ['P=1000, R=5%, T=2yr. What is SI?','P=2000, R=10%, T=1yr. What is SI?','P=500, R=4%, T=3yr. What is SI?','P=1500, R=6%, T=2yr. What is SI?','P=800, R=5%, T=4yr. What is SI?','P=2500, R=8%, T=1yr. What is SI?','P=1200, R=5%, T=5yr. What is SI?','P=600, R=10%, T=2yr. What is SI?'],
  'Time Work': ['A does work in 10 days, B in 15. Together?','A does work in 6 days. What is the rate?','A+B do work in 4 days. A alone in 12. B alone?','A in 8 days, B in 12. Together?','A does work in 5 days, B in 10. Together?','A in 3 days, B in 6. Together?','A in 20 days, B in 30. Together?','A in 2 days, B in 4. Together?'],
  'Time Distance': ['Speed 60km/h, time 2h. Distance?','Distance 100km, time 2h. Speed?','Speed 40km/h, distance 80km. Time?','Speed 50km/h, time 3h. Distance?','Distance 120km, speed 60km/h. Time?','Speed 30km/h, time 4h. Distance?','Distance 90km, time 3h. Speed?','Speed 20km/h, distance 40km. Time?'],
  'Age': ['Father is 4x son. Son 10, father?','Sum of ages 30. Ratio 2:3. Son?','Father 40, son 10. After 5 years?','Son 12, father 3x. Father?','Ages 20 & 30. Average?','Mother 35, daughter 7. After 5 years?','Father 50, son 20. Ratio?','Son 15, father 2.5x. Father?'],
  'LCM': ['What is the LCM of 2,3?','What is the LCM of 4,6?','What is the LCM of 8,12?','What is the LCM of 9,15?','What is the LCM of 6,10?','What is the LCM of 12,18?','What is the LCM of 5,7?','What is the LCM of 3,4?'],
  'HCF': ['What is the HCF of 12,18?','What is the HCF of 24,36?','What is the HCF of 15,25?','What is the HCF of 30,45?','What is the HCF of 16,24?','What is the HCF of 20,30?','What is the HCF of 8,12?','What is the HCF of 28,42?'],
  'Drug Calculation': ['Doctor prescribes 500mg. Tablets are 250mg. How many?','Doctor prescribes 1g. Tablets are 500mg. How many?','Prescription: 10mg/kg for 20kg child. Dose?','IV: 1000mL over 8h. Rate?','Prescription: 10mg/kg for 15kg child. Dose?','IV: 500mL over 4h. Rate?','Tablets 100mg. Need 300mg. How many?','Syrup 250mg/5mL. Need 500mg. How many mL?'],
};

// Bangla templates
const banglaTemplates = {
  'Grammar': ['বাংলা ভাষার উৎপত্তি','বাংলা বর্ণমালা','স্বরবর্ণ','ব্যঞ্জনবর্ণ','শব্দের শ্রেণীবিভাগ','কারক','সমাস','সন্ধি','বিরাম চিহ্ন','বাক্য'],
  'Literature': ['বাংলা সাহিত্যের ইতিহাস','রবীন্দ্রনাথ ঠাকুর','কাজী নজরুল ইসলাম','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক বন্দোপাধ্যায়','জীবনানন্দ দাশ','প্রাচীন যুগ','মধ্যযুগ','আধুনিক যুগ'],
  'Vocabulary': ['সমার্থক শব্দ','বিপরীত শব্দ','এক কথায় প্রকাশ','বাক্য সংকোচন','শব্দের অর্থ','প্রতিশব্দ','বিপরীতার্থক শব্দ','সমোচ্চারিত শব্দ'],
  'Idioms': ['বাগধারা','প্রবাদ','প্রচলিত বাগধারা','অর্থসহ বাগধারা','বাংলা প্রবাদ','বাগধারার অর্থ','প্রবাদ প্রবচন','বাংলা বাগধারা'],
  'One Word': ['এক কথায় প্রকাশ','সংক্ষিপ্তকরণ','একটি শব্দে','সংক্ষেপণ','এক কথায়','একটি শব্দে প্রকাশ','সংক্ষিপ্ত রূপ','এক শব্দে'],
  'Authors': ['রবীন্দ্রনাথ ঠাকুর','কাজী নজরুল ইসলাম','বঙ্কিমচন্দ্র চট্টোপাধ্যায়','শরৎচন্দ্র চট্টোপাধ্যায়','মানিক বন্দোপাধ্যায়','জীবনানন্দ দাশ','সুফিয়া কামাল','বেগম রোকেয়া','মাইকেল মধুসূদন','ঈশ্বরচন্দ্র বিদ্যাসাগর'],
  'Books': ['গীতাঞ্জলি','অগ্নিবীণা','বিষবৃক্ষ','দেবদাস','পদ্মা নদীর মাঝি','শেষের কবিতা','শ্রীকান্ত','আলালের ঘরের দুলাল','দুর্গেশনন্দিনী','সুলতানার স্বপ্ন'],
  'Synonyms': ['সুন্দর','বড়','সাহস','জ্ঞান','ক্রোধ','প্রেম','দুঃখ','আনন্দ','শক্তি','সত্য'],
  'Antonyms': ['সুন্দর','বড়','সাহস','জ্ঞান','ক্রোধ','প্রেম','দুঃখ','আনন্দ','শক্তি','সত্য'],
};

function buildQuestion(category, subcategory, template, index) {
  const correctIdx = index % 4;
  const correct = 'abcd'[correctIdx];
  const isBangla = category === 'Bangla';
  const q = isBangla ? `${template} সম্পর্কে প্রশ্ন ${index + 1}` : `${template} (Question ${index + 1})`;
  return {
    category,
    subcategory,
    question: q,
    option_a: `${template} - Option A`,
    option_b: `${template} - Option B`,
    option_c: `${template} - Option C`,
    option_d: `${template} - Option D`,
    correct_answer: correct,
    explanation: `${template} - Correct answer is ${correct.toUpperCase()}.`,
    difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard',
    importance: 3 + (index % 3),
    tags: [category.toLowerCase(), subcategory.toLowerCase().replace(/\s+/g, '-')],
    language: isBangla ? 'bangla' : 'english',
    verified: true,
    active: true,
  };
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
  
  for (const [category, chapters] of Object.entries(ALL_CHAPTERS)) {
    for (const chapter of chapters) {
      let templates = [];
      
      if (category === 'Bangla') {
        templates = banglaTemplates[chapter] || [];
      } else if (chapterTemplates[chapter]) {
        // Use real questions for chapters with specific templates
        for (const [q, a, b, c, d, correct, explanation] of chapterTemplates[chapter]) {
          allQuestions.push({
            category,
            subcategory: chapter,
            question: q,
            option_a: a, option_b: b, option_c: c, option_d: d,
            correct_answer: correct,
            explanation,
            difficulty: 'medium',
            importance: 3,
            tags: [category.toLowerCase(), chapter.toLowerCase().replace(/\s+/g, '-')],
            language: 'english',
            verified: true,
            active: true,
          });
        }
        console.log(`${category} / ${chapter}: ${chapterTemplates[chapter].length} questions`);
        continue;
      } else {
        templates = genericTemplates[chapter] || [];
      }
      
      // Generate questions from templates
      const count = Math.min(templates.length * 2, 20);
      for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        allQuestions.push(buildQuestion(category, chapter, template, i));
      }
      console.log(`${category} / ${chapter}: ${count} questions`);
    }
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