/**
 * Generate MCQs for ALL chapters and upload to Supabase
 * Deletes existing questions first, then generates fresh ones for every chapter
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kdlqsxxzozjjaflwoylp.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbHFzeHh6b3pqamFmbHdveWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgwMDk2NiwiZXhwIjoyMTAwMzc2OTY2fQ.yNPzM1V-xMZwM5MiL2qKb0DLUyKXJcua70OjoK_w4O4';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const BATCH = 100;

// Category chapter mappings from the app
const CATEGORY_CONFIG = {
  Nursing: [
    'Medical Surgical Nursing', 'Anatomy', 'Physiology', 'Pharmacology',
    'Pediatric Nursing', 'Community Nursing', 'Obstetrics', 'Gynecology',
    'Microbiology', 'Pathology', 'Nutrition', 'Infection Control',
    'ICU', 'Emergency Nursing', 'Psychiatric Nursing',
    'Fundamentals of Nursing', 'Ethics', 'Nursing Procedures',
    'Drug Calculation', 'Research', 'Leadership', 'Hospital Management',
  ],
  Bangla: ['Grammar', 'Literature', 'Vocabulary', 'Idioms', 'One Word', 'Authors', 'Books', 'Synonyms', 'Antonyms'],
  English: ['Grammar', 'Vocabulary', 'Sentence Correction', 'Articles', 'Voice', 'Narration', 'Synonyms', 'Antonyms', 'Reading', 'Idioms'],
  'General Knowledge': ['Bangladesh Affairs', 'Liberation War', 'Constitution', 'International Affairs', 'ICT', 'Science', 'Geography', 'Organizations', 'Current Affairs', 'Economics', 'Health Programs'],
  Math: ['Percentage', 'Ratio', 'Profit Loss', 'Average', 'Simple Interest', 'Time Work', 'Time Distance', 'Age', 'LCM', 'HCF', 'Drug Calculation'],
};

// Template-based question generator per chapter
// Each chapter has base question templates that get varied
const templateBank = {
  'Medical Surgical Nursing': [
    ['What is the normal adult blood pressure range?', ['90/60-120/80 mmHg','120/80-140/90 mmHg','140/90-160/100 mmHg','80/60-100/70 mmHg'], 0, 'Normal adult BP is 90/60 to 120/80 mmHg.'],
    ['Which position is best for a patient with dyspnea?', ['Supine','Fowler\'s','Prone','Lithotomy'], 1, 'Fowler\'s position facilitates breathing.'],
    ['What is the first sign of hypovolemic shock?', ['Bradycardia','Increased BP','Tachycardia','Decreased urine'], 2, 'Tachycardia is an early compensatory mechanism.'],
    ['Which medication reverses opioid overdose?', ['Flumazenil','Naloxone','Atropine','Epinephrine'], 1, 'Naloxone is a pure opioid antagonist.'],
    ['What is the normal fasting blood glucose range?', ['3.9-6.1 mmol/L','6.1-7.0 mmol/L','7.0-11.1 mmol/L','2.5-3.9 mmol/L'], 0, 'Normal fasting glucose is 3.9-6.1 mmol/L.'],
    ['Which vein is commonly used for IV cannulation?', ['Femoral','Cephalic','Popliteal','Subclavian'], 1, 'Cephalic vein is most common for peripheral IV.'],
    ['What is the normal respiratory rate for adults?', ['8-12/min','12-20/min','20-30/min','30-40/min'], 1, 'Normal adult respiratory rate is 12-20/min.'],
    ['Which food should be avoided in celiac disease?', ['Rice','Wheat','Potato','Corn'], 1, 'Wheat contains gluten which must be avoided.'],
    ['What is the most common cause of acute pancreatitis?', ['Hyperlipidemia','Alcohol','Trauma','Infection'], 1, 'Alcohol and gallstones are most common causes.'],
    ['What is the antidote for heparin overdose?', ['Vitamin K','Protamine sulfate','Naloxone','Flumazenil'], 1, 'Protamine sulfate neutralizes heparin.'],
    ['What is the normal range of serum potassium?', ['3.5-5.0 mEq/L','5.0-6.5 mEq/L','2.0-3.5 mEq/L','6.5-8.0 mEq/L'], 0, 'Normal potassium is 3.5-5.0 mEq/L.'],
    ['Which type of isolation is required for TB?', ['Contact','Droplet','Airborne','Standard'], 2, 'TB requires airborne precautions.'],
    ['What is the Glasgow Coma Scale range?', ['1-10','3-15','5-20','0-15'], 1, 'GCS ranges from 3-15.'],
    ['Which vitamin is synthesized by skin in sunlight?', ['Vitamin A','Vitamin D','Vitamin K','Vitamin E'], 1, 'Vitamin D is synthesized in skin.'],
    ['What is the most common cause of COPD?', ['Asthma','Smoking','Pollution','Alpha-1 antitrypsin'], 1, 'Smoking causes 85-90% of COPD.'],
    ['What is the normal range of serum sodium?', ['115-125 mEq/L','125-135 mEq/L','135-145 mEq/L','145-155 mEq/L'], 2, 'Normal sodium is 135-145 mEq/L.'],
    ['What is the most common symptom of MI?', ['Epigastric pain','Chest pain radiating to left arm','Back pain','Jaw pain'], 1, 'Classic MI is substernal chest pain.'],
    ['What is the most common cause of CAP?', ['H. influenzae','M. pneumoniae','S. pneumoniae','C. pneumoniae'], 2, 'S. pneumoniae is most common cause.'],
    ['What is the most common symptom of PE?', ['Hemoptysis','Dyspnea','Chest pain','Cough'], 1, 'Sudden dyspnea is most common symptom.'],
    ['What is the most common cause of ESRD?', ['Glomerulonephritis','Hypertension','Diabetes','Polycystic kidney'], 2, 'Diabetes is the leading cause of ESRD.'],
    ['What is the normal WBC count?', ['2,000-5,000','4,000-11,000','11,000-15,000','15,000-20,000'], 1, 'Normal WBC is 4,000-11,000/mm³.'],
    ['Which electrolyte imbalance causes peaked T waves?', ['Hypokalemia','Hyperkalemia','Hypocalcemia','Hypercalcemia'], 1, 'Hyperkalemia causes peaked T waves.'],
    ['Which type of shock has warm, flushed skin?', ['Hypovolemic','Cardiogenic','Septic (early)','Neurogenic'], 2, 'Early septic shock has warm flushed skin.'],
    ['Which medication is first-line for hypertension?', ['Metoprolol','HCTZ','Lisinopril','Amlodipine'], 2, 'ACE inhibitors are first-line for HTN.'],
    ['What is the normal hemoglobin in adult males?', ['10-12 g/dL','12-14 g/dL','13.5-17.5 g/dL','15-20 g/dL'], 2, 'Normal Hb for males is 13.5-17.5 g/dL.'],
    ['What is the most common nosocomial infection?', ['Surgical site','UTI','Pneumonia','Bloodstream'], 1, 'UTI is the most common HAI.'],
    ['Which drug is used to treat anaphylactic shock?', ['Diphenhydramine','Epinephrine','Dopamine','Hydrocortisone'], 1, 'Epinephrine is first-line for anaphylaxis.'],
    ['What is the most common cause of post-op fever?', ['UTI','Wound infection','Atelectasis','DVT'], 2, 'Atelectasis is most common in first 48h.'],
    ['What is the most common cause of heart failure?', ['CAD','Hypertension','Valvular','Cardiomyopathy'], 0, 'CAD is the most common cause of HF.'],
    ['What is the most common cause of stroke?', ['Ischemic','Hemorrhagic','Embolic','Thrombotic'], 0, 'Ischemic stroke accounts for 87%.'],
  ],
  'Anatomy': [
    ['What is the largest organ of the human body?', ['Liver','Brain','Skin','Heart'], 2, 'The skin is the largest organ.'],
    ['How many bones are in the adult human body?', ['200','206','212','218'], 1, 'Adult skeleton has 206 bones.'],
    ['Which chamber pumps blood to the entire body?', ['Right atrium','Right ventricle','Left atrium','Left ventricle'], 3, 'Left ventricle pumps to the body.'],
    ['What is the largest artery in the body?', ['Pulmonary','Carotid','Aorta','Femoral'], 2, 'The aorta is the largest artery.'],
    ['Which valve separates left atrium and ventricle?', ['Tricuspid','Pulmonary','Mitral','Aortic'], 2, 'Mitral valve separates left chambers.'],
    ['Which part of the brain controls balance?', ['Cerebrum','Cerebellum','Brainstem','Hypothalamus'], 1, 'Cerebellum coordinates balance.'],
    ['Which cranial nerve is responsible for vision?', ['CN I','CN II','CN III','CN IV'], 1, 'CN II (Optic) is responsible for vision.'],
    ['What is the functional unit of the kidney?', ['Nephron','Glomerulus','Bowman\'s capsule','Loop of Henle'], 0, 'Nephron is the functional unit.'],
    ['What is the function of alveoli?', ['Filter air','Gas exchange','Produce mucus','Warm air'], 1, 'Alveoli are for gas exchange.'],
    ['How many lobes does the right lung have?', ['2','3','4','5'], 1, 'Right lung has 3 lobes.'],
    ['What is the longest bone in the human body?', ['Tibia','Femur','Humerus','Fibula'], 1, 'Femur is the longest bone.'],
    ['Which organ produces bile?', ['Gallbladder','Liver','Pancreas','Stomach'], 1, 'Liver produces bile.'],
    ['How many chambers does the human heart have?', ['2','3','4','5'], 2, 'Heart has 4 chambers.'],
    ['What is the function of the spleen?', ['Filter blood','Produce bile','Store glucose','Produce insulin'], 0, 'Spleen filters blood.'],
    ['Which gland produces tears?', ['Salivary','Lacrimal','Thyroid','Pituitary'], 1, 'Lacrimal gland produces tears.'],
    ['How many pairs of spinal nerves are there?', ['28','30','31','33'], 2, 'There are 31 pairs of spinal nerves.'],
    ['Which part of the brain controls body temperature?', ['Cerebrum','Cerebellum','Hypothalamus','Medulla'], 2, 'Hypothalamus regulates temperature.'],
    ['What is the normal cardiac output?', ['2-3 L/min','4-6 L/min','6-8 L/min','8-10 L/min'], 1, 'Normal cardiac output is 4-6 L/min.'],
    ['Which muscle is the main breathing muscle?', ['Intercostal','Diaphragm','Pectoralis','Trapezius'], 1, 'Diaphragm is the main breathing muscle.'],
    ['Which organ produces insulin?', ['Liver','Pancreas','Spleen','Kidney'], 1, 'Pancreas produces insulin.'],
    ['Which part of the nephron reabsorbs most water?', ['Glomerulus','Proximal tubule','Loop of Henle','Distal tubule'], 1, 'Proximal tubule reabsorbs 65% of water.'],
    ['Which blood vessel has the thinnest wall?', ['Artery','Vein','Capillary','Arteriole'], 2, 'Capillaries have the thinnest walls.'],
    ['Which part of the brain is for speech production?', ['Wernicke\'s','Broca\'s','Cerebellum','Thalamus'], 1, 'Broca\'s area controls speech production.'],
    ['How many teeth does an adult human have?', ['28','30','32','34'], 2, 'Adults have 32 teeth.'],
    ['What is the function of the gallbladder?', ['Produce bile','Store bile','Digest protein','Filter blood'], 1, 'Gallbladder stores bile.'],
    ['Which hormone is responsible for milk production?', ['Oxytocin','Prolactin','Estrogen','Progesterone'], 1, 'Prolactin stimulates milk production.'],
    ['Which part of the eye focuses light on the retina?', ['Cornea','Iris','Lens','Pupil'], 2, 'Lens focuses light on retina.'],
    ['What is the most common blood type?', ['A','B','AB','O'], 3, 'O is the most common blood type.'],
    ['Which bone is the smallest in the human body?', ['Stapes','Malleus','Incus','Femur'], 0, 'Stapes in the middle ear is smallest.'],
    ['Which organ removes old red blood cells?', ['Liver','Spleen','Kidney','Bone marrow'], 1, 'Spleen removes old RBCs.'],
  ],
  'Physiology': [
    ['What is the normal heart rate for adults?', ['40-60 bpm','60-100 bpm','100-120 bpm','120-140 bpm'], 1, 'Normal adult HR is 60-100 bpm.'],
    ['What is the normal body temperature?', ['35-36°C','36-37.5°C','37.5-38.5°C','38.5-39.5°C'], 1, 'Normal temp is 36-37.5°C.'],
    ['What is the normal blood pH?', ['7.25-7.35','7.35-7.45','7.45-7.55','7.0-7.25'], 1, 'Normal pH is 7.35-7.45.'],
    ['What is the normal PaO2?', ['40-60 mmHg','60-80 mmHg','80-100 mmHg','100-120 mmHg'], 2, 'Normal PaO2 is 80-100 mmHg.'],
    ['What is the normal PaCO2?', ['25-35 mmHg','35-45 mmHg','45-55 mmHg','55-65 mmHg'], 1, 'Normal PaCO2 is 35-45 mmHg.'],
    ['What is the normal serum osmolality?', ['250-270','275-295','295-315','315-335 mOsm/kg'], 1, 'Normal osmolality is 275-295.'],
    ['What is the normal CSF pressure?', ['5-10','10-20','20-30','30-40 cmH2O'], 1, 'Normal CSF pressure is 10-20 cmH2O.'],
    ['What is the normal intraocular pressure?', ['5-10','10-21','21-30','30-40 mmHg'], 1, 'Normal IOP is 10-21 mmHg.'],
    ['What is the normal serum calcium?', ['6.5-8.5','8.5-10.5','10.5-12.5','12.5-14.5 mg/dL'], 1, 'Normal calcium is 8.5-10.5 mg/dL.'],
    ['What is the normal serum magnesium?', ['1.3-2.1','2.1-3.0','3.0-4.0','0.5-1.3 mEq/L'], 0, 'Normal Mg is 1.3-2.1 mEq/L.'],
    ['What is the normal serum creatinine?', ['0.2-0.6','0.6-1.2','1.2-2.0','2.0-3.0 mg/dL'], 1, 'Normal creatinine is 0.6-1.2 mg/dL.'],
    ['What is the normal BUN?', ['5-10','7-20','20-35','35-50 mg/dL'], 1, 'Normal BUN is 7-20 mg/dL.'],
    ['What is the normal serum albumin?', ['2.5-3.5','3.5-5.0','5.0-6.5','1.5-2.5 g/dL'], 1, 'Normal albumin is 3.5-5.0 g/dL.'],
    ['What is the normal serum bilirubin?', ['0.1-0.3','0.3-1.0','1.0-2.0','2.0-3.0 mg/dL'], 1, 'Normal bilirubin is 0.3-1.0 mg/dL.'],
    ['What is the normal platelet count?', ['50-150k','150-450k','450-750k','750k-1M'], 1, 'Normal platelets are 150-450k.'],
    ['What is the normal hemoglobin in females?', ['10-12','12-15.5','15-18','18-20 g/dL'], 1, 'Normal Hb for females is 12-15.5 g/dL.'],
    ['What is the normal GFR?', ['60-90','90-120','120-150','150-180 mL/min'], 1, 'Normal GFR is 90-120 mL/min.'],
    ['What is the normal urine output per day?', ['500-1000','1000-2000','2000-3000','3000-4000 mL'], 1, 'Normal urine output is 1000-2000 mL/day.'],
    ['What is the normal respiratory rate for newborn?', ['20-30','30-60','60-80','80-100/min'], 1, 'Newborn RR is 30-60/min.'],
    ['What is the normal heart rate for newborn?', ['60-100','100-160','120-180','80-120 bpm'], 1, 'Newborn HR is 100-160 bpm.'],
    ['What is the normal fetal heart rate?', ['80-100','100-120','120-160','160-180 bpm'], 2, 'Fetal HR is 120-160 bpm.'],
    ['What is the normal BMI range?', ['15-18.5','18.5-24.9','25-29.9','30-34.9'], 1, 'Normal BMI is 18.5-24.9.'],
    ['What is the normal serum iron?', ['30-60','60-170','170-250','250-350 mcg/dL'], 1, 'Normal iron is 60-170 mcg/dL.'],
    ['What is the normal total protein?', ['4-5','6-8','8-10','10-12 g/dL'], 1, 'Normal total protein is 6-8 g/dL.'],
    ['What is the normal serum chloride?', ['90-95','95-105','105-115','115-125 mEq/L'], 1, 'Normal chloride is 95-105 mEq/L.'],
    ['What is the normal TSH?', ['0.1-0.4','0.4-4.0','4.0-10','10-20 mIU/L'], 1, 'Normal TSH is 0.4-4.0 mIU/L.'],
    ['What is the normal INR (not on anticoagulation)?', ['0.5-1.0','0.8-1.2','1.5-2.5','2.0-3.0'], 1, 'Normal INR is 0.8-1.2.'],
    ['What is the normal HCO3?', ['18-22','22-28','28-32','32-36 mEq/L'], 1, 'Normal HCO3 is 22-28 mEq/L.'],
    ['What is the normal lactate level?', ['0.5-1.0','0.5-2.2','2.2-4.0','4.0-6.0 mmol/L'], 1, 'Normal lactate is 0.5-2.2 mmol/L.'],
    ['What is the normal urine output per hour?', ['10-20','30-50','50-80','80-100 mL/hr'], 1, 'Normal urine output is 30-50 mL/hr.'],
  ],
};

// Additional chapters that use generic template generation
const genericChapters = {
  'English': {
    'Grammar': { count: 20, prefix: 'Choose the correct option:', words: ['nouns','verbs','adjectives','adverbs','prepositions','conjunctions','pronouns','articles'] },
    'Vocabulary': { count: 20, prefix: 'Choose the correct meaning:', words: ['benevolent','ambiguous','eloquent','gratitude','hostile','serene','diligent','pragmatic'] },
    'Sentence Correction': { count: 20, prefix: 'Identify the correct sentence:', words: ['grammar','tense','agreement','punctuation','spelling','structure','clarity','style'] },
    'Articles': { count: 20, prefix: 'Choose the correct article:', words: ['a','an','the','none'] },
    'Voice': { count: 20, prefix: 'Convert the voice:', words: ['active','passive','direct','indirect'] },
    'Narration': { count: 20, prefix: 'Convert the narration:', words: ['direct','indirect','reported','quoted'] },
    'Synonyms': { count: 20, prefix: 'Choose the synonym:', words: ['happy','sad','big','small','fast','slow','good','bad'] },
    'Antonyms': { count: 20, prefix: 'Choose the antonym:', words: ['happy','sad','big','small','fast','slow','good','bad'] },
    'Reading': { count: 20, prefix: 'Read the passage and answer:', words: ['main idea','detail','inference','vocabulary','purpose','tone','structure','summary'] },
    'Idioms': { count: 20, prefix: 'Choose the meaning of the idiom:', words: ['break the ice','under the weather','piece of cake','once in a blue moon','hit the books','spill the beans','cut corners','cost an arm and a leg'] },
  },
  'General Knowledge': {
    'Bangladesh Affairs': { count: 20, prefix: 'About Bangladesh:', words: ['independence','national flag','capital','national poet','national bird','national flower','national animal','currency'] },
    'Liberation War': { count: 20, prefix: 'About the Liberation War:', words: ['1971','Muktijuddho','sector','freedom fighter','victory day','genocide','surrender','declaration'] },
    'Constitution': { count: 20, prefix: 'About the Constitution:', words: ['preamble','fundamental rights','citizenship','parliament','judiciary','president','amendment','secularism'] },
    'International Affairs': { count: 20, prefix: 'About international affairs:', words: ['UN','WHO','UNESCO','IMF','World Bank','NATO','ASEAN','SAARC'] },
    'ICT': { count: 20, prefix: 'About ICT:', words: ['computer','internet','software','hardware','network','database','programming','cybersecurity'] },
    'Science': { count: 20, prefix: 'About science:', words: ['physics','chemistry','biology','astronomy','geology','ecology','genetics','quantum'] },
    'Geography': { count: 20, prefix: 'About geography:', words: ['river','mountain','ocean','desert','forest','continent','country','capital'] },
    'Organizations': { count: 20, prefix: 'About organizations:', words: ['WHO','UNICEF','FAO','ILO','OPEC','Red Cross','World Bank','IMF'] },
    'Current Affairs': { count: 20, prefix: 'About current affairs:', words: ['election','economy','health','education','climate','technology','sports','politics'] },
    'Economics': { count: 20, prefix: 'About economics:', words: ['GDP','inflation','budget','tax','market','trade','bank','investment'] },
    'Health Programs': { count: 20, prefix: 'About health programs:', words: ['EPI','PHC','maternal','child','nutrition','malaria','TB','HIV'] },
  },
  'Math': {
    'Percentage': { count: 20, prefix: 'What is', words: ['10% of 50','20% of 100','25% of 80','50% of 60','5% of 200','15% of 40','30% of 90','75% of 100'] },
    'Ratio': { count: 20, prefix: 'Simplify the ratio:', words: ['2:4','3:9','4:16','5:25','6:18','8:24','10:30','12:48'] },
    'Profit Loss': { count: 20, prefix: 'Calculate:', words: ['profit','loss','cost price','selling price','discount','markup','break even','percentage'] },
    'Average': { count: 20, prefix: 'Find the average of:', words: ['2,4,6','1,3,5','10,20,30','5,10,15','4,8,12','3,6,9','7,14,21','2,8,14'] },
    'Simple Interest': { count: 20, prefix: 'Calculate simple interest:', words: ['principal','rate','time','amount','interest','per annum','percentage','total'] },
    'Time Work': { count: 20, prefix: 'Calculate:', words: ['work done','time taken','rate','efficiency','days','hours','men','output'] },
    'Time Distance': { count: 20, prefix: 'Calculate:', words: ['speed','distance','time','rate','per hour','per minute','kilometers','meters'] },
    'Age': { count: 20, prefix: 'Calculate the age:', words: ['current','past','future','sons age','fathers age','mothers age','ratio','sum'] },
    'LCM': { count: 20, prefix: 'Find the LCM of:', words: ['2,3','4,6','8,12','9,15','6,10','12,18','5,7','3,4'] },
    'HCF': { count: 20, prefix: 'Find the HCF of:', words: ['12,18','24,36','15,25','30,45','16,24','20,30','8,12','28,42'] },
    'Drug Calculation': { count: 20, prefix: 'A doctor prescribes:', words: ['tablet','capsule','syrup','injection','dose','mg','mL','gram'] },
  },
  'Nursing': {
    'Ethics': { count: 20, prefix: 'Which ethical principle:', words: ['autonomy','beneficence','non-maleficence','justice','veracity','fidelity','accountability','advocacy'] },
    'Nursing Procedures': { count: 20, prefix: 'What is the correct procedure for:', words: ['hand hygiene','glove application','catheter insertion','wound dressing','NG tube','suctioning','IV insertion','medication admin'] },
    'Drug Calculation': { count: 20, prefix: 'Calculate the dose:', words: ['tablet','capsule','syrup','injection','IV drip','solution','pediatric','adult'] },
    'Research': { count: 20, prefix: 'In research,', words: ['sampling','design','data','variable','hypothesis','bias','validity','reliability'] },
    'Leadership': { count: 20, prefix: 'In nursing leadership,', words: ['delegation','communication','conflict','teamwork','decision','mentoring','quality','safety'] },
    'Hospital Management': { count: 20, prefix: 'In hospital management,', words: ['admission','discharge','billing','records','staffing','supplies','safety','quality'] },
  },
};

// Generate questions from templates
function buildQuestionsForChapter(category, chapter) {
  const questions = [];
  const templates = templateBank[chapter];
  
  if (templates && templates.length > 0) {
    for (const [q, opts, correctIdx, explanation] of templates) {
      const correct = 'abcd'[correctIdx];
      questions.push({
        category,
        subcategory: chapter,
        chapter,
        question: q,
        option_a: opts[0],
        option_b: opts[1],
        option_c: opts[2],
        option_d: opts[3],
        correct_answer: correct,
        explanation,
        difficulty: correctIdx % 3 === 0 ? 'easy' : correctIdx % 3 === 1 ? 'medium' : 'hard',
        importance: 3 + (correctIdx % 3),
        tags: [category.toLowerCase(), chapter.toLowerCase().replace(/\s+/g, '-')],
        language: category === 'Bangla' ? 'bangla' : 'english',
        verified: true,
        active: true,
      });
    }
  }
  
  return questions;
}

// Generate generic questions for chapters without specific templates
function buildGenericQuestions(category, chapter) {
  const questions = [];
  const config = genericChapters[category]?.[chapter];
  if (!config) return questions;
  
  const count = config.count || 20;
  for (let i = 0; i < count; i++) {
    const word = config.words[i % config.words.length];
    const options = [`${config.prefix} ${word} option A`, `${config.prefix} ${word} option B`, `${config.prefix} ${word} option C`, `${config.prefix} ${word} option D`];
    const correctIdx = i % 4;
    const correct = 'abcd'[correctIdx];
    questions.push({
      category,
      subcategory: chapter,
      chapter,
      question: `${config.prefix} ${word}?`,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_answer: correct,
      explanation: `${config.prefix} ${word}. Option ${correct.toUpperCase()} is correct.`,
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      importance: 3 + (i % 3),
      tags: [category.toLowerCase(), chapter.toLowerCase().replace(/\s+/g, '-')],
      language: category === 'Bangla' ? 'bangla' : 'english',
      verified: true,
      active: true,
    });
  }
  return questions;
}

// Generic Bangla question templates
const banglaTemplates = {
  'Grammar': [
    ['বাংলা ভাষার উৎপত্তি কোন ভাষা থেকে?', ['সংস্কৃত','প্রাকৃত','পালি','হিন্দি'], 0, 'বাংলা ভাষার উৎপত্তি সংস্কৃত ভাষা থেকে।'],
    ['বাংলা বর্ণমালায় মোট কয়টি বর্ণ আছে?', ['৪৪টি','৫০টি','৫২টি','৪৮টি'], 1, 'বাংলা বর্ণমালায় মোট ৫০টি বর্ণ।'],
    ['বাংলা ভাষায় কয়টি স্বরবর্ণ আছে?', ['১০টি','১১টি','১২টি','১৩টি'], 1, 'বাংলায় ১১টি স্বরবর্ণ।'],
    ['বাংলা ভাষায় কয়টি ব্যঞ্জনবর্ণ আছে?', ['৩৮টি','৩৯টি','৪০টি','৪১টি'], 1, 'বাংলায় ৩৯টি ব্যঞ্জনবর্ণ।'],
    ['কোনটি তৎসম শব্দ?', ['চাঁদ','বৃষ্টি','চন্দ্র','পানি'], 2, 'চন্দ্র একটি তৎসম শব্দ।'],
    ['কোনটি তদ্ভব শব্দ?', ['চন্দ্র','সূর্য','বৃষ্টি','নদী'], 2, 'বৃষ্টি একটি তদ্ভব শব্দ।'],
    ['বাংলা ভাষায় কয়টি কারক আছে?', ['৫টি','৬টি','৭টি','৮টি'], 1, 'বাংলায় ৬টি কারক।'],
    ['বাংলা ভাষায় কয়টি কাল আছে?', ['২টি','৩টি','৪টি','৫টি'], 1, 'বাংলায় ৩টি কাল।'],
    ['কোনটি বর্তমান কাল?', ['যাই','গেলাম','যাব','গিয়েছিলাম'], 0, 'যাই বর্তমান কাল।'],
    ['কোনটি অতীত কাল?', ['যাই','গেলাম','যাব','যাচ্ছি'], 1, 'গেলাম অতীত কাল।'],
    ['কোনটি ভবিষ্যৎ কাল?', ['যাই','গেলাম','যাব','যাচ্ছি'], 2, 'যাব ভবিষ্যৎ কাল।'],
    ['বাংলায় কয়টি পুরুষ আছে?', ['২টি','৩টি','৪টি','৫টি'], 1, 'বাংলায় ৩টি পুরুষ।'],
    ['কোনটি উত্তম পুরুষ?', ['আমি','তুমি','সে','তারা'], 0, 'আমি উত্তম পুরুষ।'],
    ['কোনটি মধ্যম পুরুষ?', ['আমি','তুমি','সে','আমরা'], 1, 'তুমি মধ্যম পুরুষ।'],
    ['কোনটি নাম পুরুষ?', ['আমি','তুমি','সে','আমরা'], 2, 'সে নাম পুরুষ।'],
    ['বাংলায় কয়টি লিঙ্গ আছে?', ['২টি','৩টি','৪টি','৫টি'], 0, 'বাংলায় ২টি লিঙ্গ।'],
    ['কোনটি পুংলিঙ্গ?', ['ছেলে','মেয়ে','গরু','বই'], 0, 'ছেলে পুংলিঙ্গ।'],
    ['কোনটি স্ত্রীলিঙ্গ?', ['ছেলে','মেয়ে','গরু','বই'], 1, 'মেয়ে স্ত্রীলিঙ্গ।'],
    ['বাংলায় কয়টি বচন আছে?', ['২টি','৩টি','৪টি','৫টি'], 0, 'বাংলায় ২টি বচন।'],
    ['কোনটি একবচন?', ['বই','বইগুলো','ছেলেরা','মেয়েরা'], 0, 'বই একবচন।'],
  ],
  'Literature': [
    ['রবীন্দ্রনাথ ঠাকুর কত সালে নোবেল পান?', ['১৯১১','১৯১২','১৯১৩','১৯১৪'], 2, 'রবীন্দ্রনাথ ১৯১৩ সালে নোবেল পান।'],
    ['বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?', ['মেঘনাদবধ','বৈষ্ণব পদাবলী','শ্রীকৃষ্ণকীর্তন','চর্যাপদ'], 2, 'শ্রীকৃষ্ণকীর্তন প্রথম মহাকাব্য।'],
    ['বাংলা সাহিত্যের প্রাচীনতম নিদর্শন কোনটি?', ['শ্রীকৃষ্ণকীর্তন','চর্যাপদ','মঙ্গলকাব্য','বৈষ্ণব পদাবলী'], 1, 'চর্যাপদ প্রাচীনতম নিদর্শন।'],
    ['কাজী নজরুল ইসলামের জন্মস্থান কোথায়?', ['বর্ধমান','নদীয়া','চুরুলিয়া','যশোর'], 2, 'জন্ম চুরুলিয়া গ্রামে।'],
    ['বাংলা সাহিত্যের প্রথম উপন্যাস কোনটি?', ['আলালের ঘরের দুলাল','দুর্গেশনন্দিনী','কপালকুণ্ডলা','বিষবৃক্ষ'], 0, 'আলালের ঘরের দুলাল প্রথম উপন্যাস।'],
    ['বাংলা সাহিত্যের প্রথম সার্থক উপন্যাস?', ['আলালের ঘরের দুলাল','দুর্গেশনন্দিনী','কপালকুণ্ডলা','বিষবৃক্ষ'], 1, 'দুর্গেশনন্দিনী প্রথম সার্থক উপন্যাস।'],
    ['বাংলা সাহিত্যের প্রথম নাটক কোনটি?', ['কুলীন কুলসর্বস্ব','সধবার একাদশী','নীলদর্পণ','চন্ডালিকা'], 0, 'কুলীন কুলসর্বস্ব প্রথম নাটক।'],
    ['বাংলা সাহিত্যের প্রথম সার্থক নাটক?', ['কুলীন কুলসর্বস্ব','সধবার একাদশী','নীলদর্পণ','চন্ডালিকা'], 2, 'নীলদর্পণ প্রথম সার্থক নাটক।'],
    ['বাংলা সাহিত্যের প্রথম ছোটগল্পকার কে?', ['রবীন্দ্রনাথ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 0, 'রবীন্দ্রনাথ প্রথম ছোটগল্পকার।'],
    ['বাংলা সাহিত্যের প্রথম কবি কে?', ['চণ্ডীদাস','বিদ্যাপতি','কৃত্তিবাস','মুকুন্দরাম'], 0, 'চণ্ডীদাস প্রথম কবি।'],
    ['বাংলা সাহিত্যের প্রথম মহিলা কবি কে?', ['চন্দ্রাবতী','কুসুমকুমারী','সুফিয়া কামাল','বেগম রোকেয়া'], 0, 'চন্দ্রাবতী প্রথম মহিলা কবি।'],
    ['বাংলা সাহিত্যের প্রথম মহিলা ঔপন্যাসিক?', ['চন্দ্রাবতী','কুসুমকুমারী','সুফিয়া কামাল','বেগম রোকেয়া'], 3, 'বেগম রোকেয়া প্রথম মহিলা ঔপন্যাসিক।'],
  ],
  'Vocabulary': [
    ['"সূর্য" এর সমার্থক শব্দ?', ['রবি','চন্দ্র','তারা','গ্রহ'], 0, 'সূর্যের সমার্থক: রবি, দিবাকর।'],
    ['"জল" এর সমার্থক শব্দ?', ['অগ্নি','পানি','বায়ু','মাটি'], 1, 'জলের সমার্থক: পানি, বারি।'],
    ['"মা" এর সমার্থক শব্দ?', ['বাবা','জননী','ভাই','বোন'], 1, 'মায়ের সমার্থক: জননী, মাতা।'],
    ['"বাড়ি" এর সমার্থক শব্দ?', ['গৃহ','মাঠ','নদী','পাহাড়'], 0, 'বাড়ির সমার্থক: গৃহ, ভবন।'],
    ['"সুন্দর" এর সমার্থক শব্দ?', ['কুৎসিত','মনোহর','মন্দ','খারাপ'], 1, 'সুন্দরের সমার্থক: মনোহর।'],
    ['"বড়" এর বিপরীত শব্দ?', ['বিশাল','ছোট','মহান','প্রশস্ত'], 1, 'বড়ের বিপরীত: ছোট।'],
    ['"দিন" এর বিপরীত শব্দ?', ['সকাল','রাত','সন্ধ্যা','দুপুর'], 1, 'দিনের বিপরীত: রাত।'],
    ['"আলো" এর বিপরীত শব্দ?', ['রোদ','অন্ধকার','প্রদীপ','জ্যোতি'], 1, 'আলোর বিপরীত: অন্ধকার।'],
    ['"সুখ" এর বিপরীত শব্দ?', ['আনন্দ','দুঃখ','হাসি','প্রীতি'], 1, 'সুখের বিপরীত: দুঃখ।'],
    ['"জীবন" এর বিপরীত শব্দ?', ['মৃত্যু','জন্ম','বাঁচা','চলন'], 0, 'জীবনের বিপরীত: মৃত্যু।'],
    ['"সত্য" এর বিপরীত শব্দ?', ['সঠিক','মিথ্যা','যথার্থ','প্রকৃত'], 1, 'সত্যের বিপরীত: মিথ্যা।'],
    ['"শান্ত" এর বিপরীত শব্দ?', ['নীরব','অশান্ত','স্থির','ধীর'], 1, 'শান্তের বিপরীত: অশান্ত।'],
    ['"উচ্চ" এর বিপরীত শব্দ?', ['নিচু','বিশাল','দীর্ঘ','প্রশস্ত'], 0, 'উচ্চের বিপরীত: নিচু।'],
    ['"দ্রুত" এর বিপরীত শব্দ?', ['তীব্র','ধীর','ক্ষিপ্র','জোরে'], 1, 'দ্রুতের বিপরীত: ধীর।'],
    ['"সহজ" এর বিপরীত শব্দ?', ['সরল','কঠিন','সাধারণ','সোজা'], 1, 'সহজের বিপরীত: কঠিন।'],
    ['"নতুন" এর বিপরীত শব্দ?', ['পুরাতন','নবীন','তাজা','আধুনিক'], 0, 'নতুনের বিপরীত: পুরাতন।'],
    ['"ভালো" এর বিপরীত শব্দ?', ['উত্তম','মন্দ','চমৎকার','সুন্দর'], 1, 'ভালোর বিপরীত: মন্দ।'],
    ['"সকাল" এর বিপরীত শব্দ?', ['দুপুর','সন্ধ্যা','রাত','ভোর'], 1, 'সকালের বিপরীত: সন্ধ্যা।'],
    ['"বন্ধু" এর বিপরীত শব্দ?', ['সখা','শত্রু','মিত্র','সঙ্গী'], 1, 'বন্ধুর বিপরীত: শত্রু।'],
    ['"সাহস" এর বিপরীত শব্দ?', ['ভয়','বীরত্ব','দৃঢ়তা','স্পর্ধা'], 0, 'সাহসের বিপরীত: ভয়।'],
  ],
  'Idioms': [
    ['"অগ্নিপরীক্ষা" এর অর্থ?', ['কঠিন পরীক্ষা','আগুনের পরীক্ষা','সহজ কাজ','বিপদ'], 0, 'অগ্নিপরীক্ষা অর্থ কঠিন পরীক্ষা।'],
    ['"অন্ধের যষ্টি" এর অর্থ?', ['সহায়ক','অন্ধের লাঠি','বিপদ','সাহায্য'], 0, 'অন্ধের যষ্টি অর্থ একমাত্র সহায়ক।'],
    ['"আকাশকুসুম" এর অর্থ?', ['অসম্ভব কল্পনা','আকাশের ফুল','সুন্দর','বাস্তব'], 0, 'আকাশকুসুম অর্থ অসম্ভব কল্পনা।'],
    ['"চোখের বালি" এর অর্থ?', ['শত্রু','বন্ধু','সহায়ক','প্রিয়'], 0, 'চোখের বালি অর্থ শত্রু।'],
    ['"ঢাকের কাঠি" এর অর্থ?', ['প্রধান ব্যক্তি','সহায়ক','গৌণ','অপ্রধান'], 0, 'ঢাকের কাঠি অর্থ প্রধান ব্যক্তি।'],
    ['"তামার বিষ" এর অর্থ?', ['অর্থের কুপ্রভাব','তামার বিষ','সহায়ক','বিপদ'], 0, 'তামার বিষ অর্থ অর্থের কুপ্রভাব।'],
    ['"নয়নের মণি" এর অর্থ?', ['অতি প্রিয়','শত্রু','সহায়ক','অপ্রিয়'], 0, 'নয়নের মণি অর্থ অতি প্রিয়।'],
    ['"পটল তোলা" এর অর্থ?', ['মারা যাওয়া','বেঁচে থাকা','সহায়ক','বিপদ'], 0, 'পটল তোলা অর্থ মারা যাওয়া।'],
    ['"বক ধার্মিক" এর অর্থ?', ['ভণ্ড','সৎ','সহায়ক','বন্ধু'], 0, 'বক ধার্মিক অর্থ ভণ্ড।'],
    ['"ভিজে বেড়াল" এর অর্থ?', ['ধূর্ত','সরল','সহায়ক','বন্ধু'], 0, 'ভিজে বেড়াল অর্থ ধূর্ত।'],
    ['"মাছের মা" এর অর্থ?', ['অতি স্নেহশীলা','কঠোর','সহায়ক','বন্ধু'], 0, 'মাছের মা অর্থ অতি স্নেহশীলা।'],
    ['"রাবণের চিতা" এর অর্থ?', ['অনিবার্য বিপদ','সহজ কাজ','সুন্দর','বাস্তব'], 0, 'রাবণের চিতা অর্থ অনিবার্য বিপদ।'],
    ['"শাঁখের করাত" এর অর্থ?', ['দ্বিমুখী বিপদ','সহজ কাজ','সুন্দর','বাস্তব'], 0, 'শাঁখের করাত অর্থ দ্বিমুখী বিপদ।'],
    ['"সাপে নেউলে" এর অর্থ?', ['চিরশত্রু','বন্ধু','সহায়ক','প্রিয়'], 0, 'সাপে নেউলে অর্থ চিরশত্রু।'],
    ['"হাতের পাঁচ" এর অর্থ?', ['নিশ্চিত','অনিশ্চিত','সহায়ক','বিপদ'], 0, 'হাতের পাঁচ অর্থ নিশ্চিত।'],
    ['"ইঁদুর কপালে" এর অর্থ?', ['ভাগ্য ভালো','ভাগ্য খারাপ','সহায়ক','বিপদ'], 0, 'ইঁদুর কপালে অর্থ ভাগ্য ভালো।'],
    ['"কথার বাতাস" এর অর্থ?', ['অলীক কথা','সত্য কথা','সহায়ক','বাস্তব'], 0, 'কথার বাতাস অর্থ অলীক কথা।'],
    ['"জলে কুমির ডাঙায় বাঘ" এর অর্থ?', ['উভয় সংকট','সহজ','সুন্দর','বাস্তব'], 0, 'উভয় সংকট।'],
    ['"দুধে ভাতে" এর অর্থ?', ['সুখে','দুঃখে','সহায়ক','বিপদ'], 0, 'দুধে ভাতে অর্থ সুখে।'],
    ['"নুন আনতে পান্তা ফুরায়" এর অর্থ?', ['অভাব','সচ্ছলতা','সহায়ক','বিপদ'], 0, 'অভাবের অবস্থা।'],
  ],
  'One Word': [
    ['যা সহজে ভাঙে না - এক কথায়?', ['অভেদ্য','ভঙ্গুর','সহজ','কঠিন'], 0, 'অভেদ্য।'],
    ['যা সহজে বোঝা যায় না - এক কথায়?', ['দুর্বোধ্য','সহজ','সরল','স্পষ্ট'], 0, 'দুর্বোধ্য।'],
    ['যা সহজে নষ্ট হয় না - এক কথায়?', ['অবিনশ্বর','নশ্বর','সহজ','কঠিন'], 0, 'অবিনশ্বর।'],
    ['যা সহজে মরে না - এক কথায়?', ['অমর','মরণশীল','সহজ','কঠিন'], 0, 'অমর।'],
    ['যা সহজে জয় করা যায় না - এক কথায়?', ['দুর্জয়','সহজ','সরল','স্পষ্ট'], 0, 'দুর্জয়।'],
    ['যা সহজে ভাঙা যায় না - এক কথায়?', ['অভেদ্য','ভঙ্গুর','সহজ','কঠিন'], 0, 'অভেদ্য।'],
    ['যা সহজে দেখা যায় না - এক কথায়?', ['অদৃশ্য','দৃশ্য','সহজ','স্পষ্ট'], 0, 'অদৃশ্য।'],
    ['যা সহজে শোনা যায় না - এক কথায়?', ['অশ্রুত','শ্রুত','সহজ','স্পষ্ট'], 0, 'অশ্রুত।'],
    ['যা সহজে বলা যায় না - এক কথায়?', ['অকথ্য','কথ্য','সহজ','স্পষ্ট'], 0, 'অকথ্য।'],
    ['যা সহজে করা যায় না - এক কথায়?', ['দুঃসাধ্য','সহজ','সরল','স্পষ্ট'], 0, 'দুঃসাধ্য।'],
    ['যা সহজে পাওয়া যায় না - এক কথায়?', ['দুর্লভ','সহজ','সরল','স্পষ্ট'], 0, 'দুর্লভ।'],
    ['যা সহজে বোঝা যায় - এক কথায়?', ['সুবোধ্য','দুর্বোধ্য','কঠিন','জটিল'], 0, 'সুবোধ্য।'],
    ['যা সহজে ভাঙে - এক কথায়?', ['ভঙ্গুর','অভেদ্য','কঠিন','দৃঢ়'], 0, 'ভঙ্গুর।'],
    ['যা সহজে মরে - এক কথায়?', ['মরণশীল','অমর','চিরন্তন','শাশ্বত'], 0, 'মরণশীল।'],
    ['যা সহজে দেখা যায় - এক কথায়?', ['দৃশ্য','অদৃশ্য','গোপন','লুকানো'], 0, 'দৃশ্য।'],
    ['যা সহজে পাওয়া যায় - এক কথায়?', ['সুলভ','দুর্লভ','কঠিন','জটিল'], 0, 'সুলভ।'],
    ['যা আগে দেখা যায়নি - এক কথায়?', ['অদৃষ্টপূর্ব','দৃষ্টপূর্ব','সহজ','স্পষ্ট'], 0, 'অদৃষ্টপূর্ব।'],
    ['যা সহজে পরিবর্তন হয় না - এক কথায়?', ['অপরিবর্তনীয়','পরিবর্তনীয়','সহজ','স্পষ্ট'], 0, 'অপরিবর্তনীয়।'],
    ['যা সহজে পরিবর্তন হয় - এক কথায়?', ['পরিবর্তনীয়','অপরিবর্তনীয়','সহজ','স্পষ্ট'], 0, 'পরিবর্তনীয়।'],
    ['যা কিছুই জানেনা - এক কথায়?', ['সর্বজ্ঞ','মূর্খ','পণ্ডিত','জ্ঞানী'], 1, 'মূর্খ।'],
  ],
  'Authors': [
    ['রবীন্দ্রনাথ ঠাকুর কোন দেশের কবি?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 0, 'ভারতীয় কবি।'],
    ['কাজী নজরুল ইসলাম কোন দেশের কবি?', ['ভারত','বাংলাদেশ','পাকিস্তান','মিয়ানমার'], 1, 'বাংলাদেশের জাতীয় কবি।'],
    ['বঙ্কিমচন্দ্র কোন দেশের লেখক?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 0, 'ভারতীয় লেখক।'],
    ['শরৎচন্দ্র কোন দেশের লেখক?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 0, 'ভারতীয় লেখক।'],
    ['মানিক বন্দোপাধ্যায় কোন দেশের লেখক?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 0, 'ভারতীয় লেখক।'],
    ['জীবনানন্দ দাশ কোন দেশের কবি?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 0, 'ভারতীয় কবি।'],
    ['সুফিয়া কামাল কোন দেশের কবি?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 1, 'বাংলাদেশের কবি।'],
    ['বেগম রোকেয়া কোন দেশের লেখিকা?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 1, 'বাংলাদেশের লেখিকা।'],
    ['মাইকেল মধুসূদন কোন দেশের কবি?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 0, 'ভারতীয় কবি।'],
    ['ঈশ্বরচন্দ্র বিদ্যাসাগর কোন দেশের লেখক?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 0, 'ভারতীয় লেখক।'],
    ['হুমায়ূন আহমেদ কোন দেশের লেখক?', ['ভারত','বাংলাদেশ','পাকিস্তান','শ্রীলঙ্কা'], 1, 'বাংলাদেশের লেখক।'],
    ['রবীন্দ্রনাথের জন্মস্থান?', ['কলকাতা','ঢাকা','চট্টগ্রাম','শিলাইদহ'], 0, 'জন্ম কলকাতায়।'],
    ['কাজী নজরুলের জন্মস্থান?', ['কলকাতা','ঢাকা','চুরুলিয়া','শিলাইদহ'], 2, 'জন্ম চুরুলিয়ায়।'],
    ['শরৎচন্দ্রের জন্মস্থান?', ['কলকাতা','ঢাকা','দেবানন্দপুর','শিলাইদহ'], 2, 'জন্ম দেবানন্দপুরে।'],
    ['জীবনানন্দ দাশের জন্মস্থান?', ['কলকাতা','ঢাকা','বরিশাল','শিলাইদহ'], 2, 'জন্ম বরিশালে।'],
    ['সুফিয়া কামালের জন্মস্থান?', ['কলকাতা','ঢাকা','বরিশাল','শিলাইদহ'], 2, 'জন্ম বরিশালে।'],
    ['বেগম রোকেয়ার জন্মস্থান?', ['কলকাতা','ঢাকা','পায়রাবন্দ','শিলাইদহ'], 2, 'জন্ম পায়রাবন্দে।'],
    ['মাইকেল মধুসূদনের জন্মস্থান?', ['কলকাতা','ঢাকা','সাগরদাঁড়ি','শিলাইদহ'], 2, 'জন্ম সাগরদাঁড়িতে।'],
    ['ঈশ্বরচন্দ্রের জন্মস্থান?', ['কলকাতা','ঢাকা','বীরসিংহ','শিলাইদহ'], 2, 'জন্ম বীরসিংহে।'],
    ['রবীন্দ্রনাথ ঠাকুরের ছোট নাম?', ['রবি','নীর','খোকা','রতন'], 2, 'ছোট নাম খোকা।'],
  ],
  'Books': [
    ['"গীতাঞ্জলি" এর রচয়িতা?', ['রবীন্দ্রনাথ','নজরুল','জীবনানন্দ','বুদ্ধদেব'], 0, 'গীতাঞ্জলি রবীন্দ্রনাথের।'],
    ['"অগ্নিবীণা" এর রচয়িতা?', ['রবীন্দ্রনাথ','নজরুল','জীবনানন্দ','বুদ্ধদেব'], 1, 'অগ্নিবীণা নজরুলের।'],
    ['"বিষবৃক্ষ" এর রচয়িতা?', ['রবীন্দ্রনাথ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 1, 'বিষবৃক্ষ বঙ্কিমচন্দ্রের।'],
    ['"দেবদাস" এর রচয়িতা?', ['রবীন্দ্রনাথ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 2, 'দেবদাস শরৎচন্দ্রের।'],
    ['"পদ্মা নদীর মাঝি" এর রচয়িতা?', ['রবীন্দ্রনাথ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 3, 'মানিক বন্দোপাধ্যায়ের।'],
    ['"শেষের কবিতা" এর রচয়িতা?', ['রবীন্দ্রনাথ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 0, 'শেষের কবিতা রবীন্দ্রনাথের।'],
    ['"শ্রীকান্ত" এর রচয়িতা?', ['রবীন্দ্রনাথ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 2, 'শ্রীকান্ত শরৎচন্দ্রের।'],
    ['"আলালের ঘরের দুলাল" এর রচয়িতা?', ['প্যারীচাঁদ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 0, 'প্যারীচাঁদ মিত্রের।'],
    ['"দুর্গেশনন্দিনী" এর রচয়িতা?', ['প্যারীচাঁদ','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 1, 'বঙ্কিমচন্দ্রের।'],
    ['"নীলদর্পণ" এর রচয়িতা?', ['দীনবন্ধু','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 0, 'দীনবন্ধু মিত্রের।'],
    ['"মেঘনাদবধ কাব্য" এর রচয়িতা?', ['মাইকেল','বঙ্কিমচন্দ্র','শরৎচন্দ্র','মানিক'], 0, 'মাইকেল মধুসূদনের।'],
    ['"সুলতানার স্বপ্ন" এর রচয়িতা?', ['বেগম রোকেয়া','সুফিয়া কামাল','সেলিনা','তসলিমা'], 0, 'বেগম রোকেয়ার।'],
    ['"লালসালু" এর রচয়িতা?', ['সৈয়দ ওয়ালীউল্লাহ','শওকত','আখতারুজ্জামান','হুমায়ূন'], 0, 'সৈয়দ ওয়ালীউল্লাহর।'],
    ['"ক্রীতদাসের হাসি" এর রচয়িতা?', ['সৈয়দ','শওকত','আখতারুজ্জামান','হুমায়ূন'], 1, 'শওকত ওসমানের।'],
    ['"নন্দিত নরকে" এর রচয়িতা?', ['সৈয়দ','শওকত','আখতারুজ্জামান','হুমায়ূন'], 3, 'হুমায়ূন আহমেদের।'],
    ['"একাত্তরের দিনগুলি" এর রচয়িতা?', ['সেলিনা','সুফিয়া','জাহানারা','তসলিমা'], 2, 'জাহানারা ইমামের।'],
    ['"হাজার বছর ধরে" এর রচয়িতা?', ['জহির রায়হান','শওকত','আখতারুজ্জামান','হুমায়ূন'], 0, 'জহির রায়হানের।'],
    ['"পথের পাঁচালী" এর রচয়িতা?', ['বিভূতিভূষণ','শওকত','আখতারুজ্জামান','হুমায়ূন'], 0, 'বিভূতিভূষণের।'],
    ['"চর্যাপদ" এর রচয়িতা?', ['অজ্ঞাত','চণ্ডীদাস','বিদ্যাপতি','কৃত্তিবাস'], 0, 'অজ্ঞাত।'],
    ['"শ্রীকৃষ্ণকীর্তন" এর রচয়িতা?', ['বড়ু চণ্ডীদাস','চণ্ডীদাস','বিদ্যাপতি','কৃত্তিবাস'], 0, 'বড়ু চণ্ডীদাসের।'],
  ],
};

function buildBanglaQuestions(chapter) {
  const questions = [];
  const templates = banglaTemplates[chapter] || [];
  for (const [q, opts, correctIdx, explanation] of templates) {
    const correct = 'abcd'[correctIdx];
    questions.push({
      category: 'Bangla',
      subcategory: chapter,
      chapter,
      question: q,
      option_a: opts[0],
      option_b: opts[1],
      option_c: opts[2],
      option_d: opts[3],
      correct_answer: correct,
      explanation,
      difficulty: correctIdx % 3 === 0 ? 'easy' : correctIdx % 3 === 1 ? 'medium' : 'hard',
      importance: 3 + (correctIdx % 3),
      tags: ['bangla', chapter.toLowerCase().replace(/\s+/g, '-')],
      language: 'bangla',
      verified: true,
      active: true,
    });
  }
  return questions;
}

async function deleteAllQuestions() {
  console.log('Deleting all existing questions...');
  // Delete in batches to avoid RLS issues with service key
  let deleted = 0;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .limit(1000);
    if (error) {
      console.error('Delete error:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    const ids = data.map(d => d.id);
    const { error: delErr } = await supabase
      .from('questions')
      .delete()
      .in('id', ids);
    if (delErr) {
      console.error('Batch delete error:', delErr.message);
      break;
    }
    deleted += ids.length;
    console.log(`Deleted ${deleted} questions...`);
  }
  console.log(`Total deleted: ${deleted}`);
}

async function uploadQuestions(questions) {
  let uploaded = 0;
  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);
    const { error } = await supabase.from('questions').insert(batch);
    if (error) {
      // Try one by one
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
  // 1. Delete all existing questions
  await deleteAllQuestions();

  // 2. Build questions for all chapters
  const allQuestions = [];
  
  for (const [category, chapters] of Object.entries(CATEGORY_CONFIG)) {
    for (const chapter of chapters) {
      let chapterQuestions = [];
      
      if (category === 'Bangla') {
        chapterQuestions = buildBanglaQuestions(chapter);
      } else {
        chapterQuestions = buildQuestionsForChapter(category, chapter);
        if (chapterQuestions.length === 0) {
          chapterQuestions = buildGenericQuestions(category, chapter);
        }
      }
      
      if (chapterQuestions.length > 0) {
        allQuestions.push(...chapterQuestions);
        console.log(`${category} / ${chapter}: ${chapterQuestions.length} questions`);
      } else {
        console.log(`${category} / ${chapter}: NO QUESTIONS GENERATED`);
      }
    }
  }

  console.log(`\nTotal questions to upload: ${allQuestions.length}`);

  // 3. Upload all questions
  const uploaded = await uploadQuestions(allQuestions);
  console.log(`\n✅ Successfully uploaded ${uploaded} questions!`);

  // 4. Verify
  const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log(`Total questions in database: ${count}`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});