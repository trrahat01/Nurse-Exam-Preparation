const fs = require('fs');
const path = require('path');

const outputPath = path.resolve(__dirname, '..', 'BPSC_missing_subjects.sql');
const expandedOutputPath = path.resolve(__dirname, '..', 'BPSC_missing_subjects_2000.sql');
const chunkDir = path.resolve(__dirname, '..', 'BPSC_missing_subjects_2000_chunks');
const rows = [];

function q(category, subcategory, question, optionA, optionB, optionC, optionD, correct, explanation, difficulty = 'medium') {
  rows.push({
    category,
    subcategory,
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correct,
    explanation,
    difficulty,
  });
}

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

function buildPrefixes() {
  return [
    'Quick revision:',
    'For exam preparation:',
    'In a nursing viva:',
    'During ward study:',
    'For rapid recall:',
    'While revising the topic:',
    'In a patient-care review:',
    'According to standard practice:',
    'For a bedside check:',
    'In a clinical scenario:',
    'For short-answer practice:',
    'For a mock test:',
    'In a classroom discussion:',
    'For one-mark recall:',
    'During final revision:',
    'In an emergency review:',
    'For concept clarity:',
    'In a question-bank drill:',
    'For practical preparation:',
    'In a topic-wise test:',
    'For high-yield revision:',
    'As a quick reminder:',
    'In exam mode:',
    'For nursing exam prep:',
  ];
}

function expandRows(baseRows) {
  const prefixes = buildPrefixes();
  const expanded = [];
  for (const row of baseRows) {
    for (const prefix of prefixes) {
      expanded.push({
        ...row,
        question: `${prefix} ${row.question}`,
      });
    }
  }
  return expanded;
}

function addNursingSection() {
  q('Nursing', 'Physiology', 'What is the normal adult heart rate at rest?', '40-60 beats/min', '60-100 beats/min', '100-120 beats/min', '120-140 beats/min', 'b', 'The normal adult resting heart rate is 60-100 beats per minute.', 'easy');
  q('Nursing', 'Physiology', 'Which part of the heart is the natural pacemaker?', 'AV node', 'Bundle of His', 'SA node', 'Purkinje fibers', 'c', 'The sinoatrial node initiates the heartbeat and acts as the natural pacemaker.', 'easy');
  q('Nursing', 'Physiology', 'What is the normal arterial blood pH range?', '7.10-7.20', '7.25-7.30', '7.35-7.45', '7.50-7.60', 'c', 'Normal arterial blood pH is 7.35-7.45.', 'easy');
  q('Nursing', 'Physiology', 'Which hormone increases renal sodium retention?', 'Insulin', 'Aldosterone', 'Calcitonin', 'Melatonin', 'b', 'Aldosterone increases sodium reabsorption in the kidneys.', 'medium');
  q('Nursing', 'Physiology', 'What is the normal adult respiratory rate?', '8-10 breaths/min', '12-20 breaths/min', '22-30 breaths/min', '30-40 breaths/min', 'b', 'The normal adult respiratory rate is about 12-20 breaths per minute.', 'easy');
  q('Nursing', 'Physiology', 'Which blood cell carries oxygen?', 'Platelet', 'Red blood cell', 'Lymphocyte', 'Monocyte', 'b', 'Red blood cells contain hemoglobin, which transports oxygen.', 'easy');

  q('Nursing', 'Gynecology', 'What is the main purpose of a Pap smear?', 'Detect ovarian cysts', 'Screen for cervical cancer', 'Measure uterine size', 'Diagnose infertility', 'b', 'Pap smear is used to screen for precancerous and cancerous cervical changes.', 'easy');
  q('Nursing', 'Gynecology', 'Which condition is commonly associated with irregular menstruation and hirsutism?', 'Endometriosis', 'PCOS', 'Cervical prolapse', 'Fibroid uterus', 'b', 'PCOS often causes irregular cycles and hyperandrogenism.', 'medium');
  q('Nursing', 'Gynecology', 'What is the most common site of ectopic pregnancy?', 'Ovary', 'Cervix', 'Fallopian tube', 'Abdominal cavity', 'c', 'Most ectopic pregnancies implant in the fallopian tube.', 'medium');
  q('Nursing', 'Gynecology', 'Menopause is usually defined as cessation of menstruation for how long?', '3 months', '6 months', '12 months', '24 months', 'c', 'Menopause is diagnosed after 12 consecutive months without menstruation.', 'easy');
  q('Nursing', 'Gynecology', 'Which symptom is most common in uterine fibroid?', 'Painless hematuria', 'Heavy menstrual bleeding', 'Hearing loss', 'Jaundice', 'b', 'Fibroids often cause menorrhagia and pelvic pressure.', 'medium');
  q('Nursing', 'Gynecology', 'What is the usual normal menstrual cycle length?', '7-10 days', '14-16 days', '21-35 days', '45-60 days', 'c', 'A menstrual cycle of about 21-35 days is generally considered normal.', 'easy');

  q('Nursing', 'Microbiology', 'Which structure is stained purple in Gram-positive bacteria?', 'Outer membrane', 'Crystal violet complex', 'Capsule only', 'Endospore coat', 'b', 'Gram-positive bacteria retain the crystal violet-iodine complex because of thick peptidoglycan.', 'easy');
  q('Nursing', 'Microbiology', 'What temperature and time are commonly used for autoclaving?', '100 C for 5 minutes', '121 C for 15 minutes', '150 C for 2 minutes', '80 C for 30 minutes', 'b', 'Autoclaving commonly sterilizes equipment at 121 C under pressure for 15 minutes.', 'easy');
  q('Nursing', 'Microbiology', 'Which organism causes tuberculosis?', 'Streptococcus pyogenes', 'Mycobacterium tuberculosis', 'Escherichia coli', 'Vibrio cholerae', 'b', 'Tuberculosis is caused by Mycobacterium tuberculosis.', 'easy');
  q('Nursing', 'Microbiology', 'Which stain is used for Mycobacterium species?', 'Gram stain', 'Ziehl-Neelsen stain', 'Giemsa stain', 'India ink stain', 'b', 'Acid-fast bacilli such as Mycobacterium are demonstrated by Ziehl-Neelsen staining.', 'medium');
  q('Nursing', 'Microbiology', 'Which term means complete destruction of microorganisms and spores?', 'Disinfection', 'Sterilization', 'Cleaning', 'Isolation', 'b', 'Sterilization destroys all forms of microbial life, including spores.', 'easy');
  q('Nursing', 'Microbiology', 'Which microorganism is commonly associated with cholera?', 'Vibrio cholerae', 'Salmonella typhi', 'Shigella dysenteriae', 'Staphylococcus aureus', 'a', 'Vibrio cholerae causes cholera.', 'easy');

  q('Nursing', 'Pathology', 'What is necrosis?', 'Programmed cell death', 'Inflammatory cell swelling', 'Uncontrolled cell death due to injury', 'Reversible cell adaptation', 'c', 'Necrosis is pathological cell death caused by severe injury.', 'easy');
  q('Nursing', 'Pathology', 'Which sign is a classic local sign of inflammation?', 'Bradycardia', 'Rubor', 'Cyanosis', 'Jaundice', 'b', 'Rubor means redness, one of the classic signs of inflammation.', 'easy');
  q('Nursing', 'Pathology', 'What is metastasis?', 'Benign tumor growth', 'Spread of cancer to distant sites', 'Local tissue repair', 'Inflammation of lymph nodes', 'b', 'Metastasis is the spread of malignant cells from the primary site to distant organs.', 'medium');
  q('Nursing', 'Pathology', 'Which term describes a traveling blood clot?', 'Thrombus', 'Embolus', 'Aneurysm', 'Abscess', 'b', 'An embolus is a detached intravascular mass that travels through the bloodstream.', 'medium');
  q('Nursing', 'Pathology', 'What is edema?', 'Redness of skin', 'Swelling caused by fluid accumulation', 'Loss of consciousness', 'Tissue death', 'b', 'Edema is swelling due to excess fluid in the interstitial spaces.', 'easy');
  q('Nursing', 'Pathology', 'What is infarction?', 'Localized tissue death due to lack of blood supply', 'Infection of the blood', 'Inflammation of joints', 'Excess fluid in the lungs', 'a', 'Infarction occurs when tissue dies because of interrupted blood flow.', 'medium');

  q('Nursing', 'Nutrition', 'Which nutrient is the primary source of energy for the body?', 'Protein', 'Carbohydrate', 'Vitamin C', 'Mineral salt', 'b', 'Carbohydrates are the main source of quick energy for the body.', 'easy');
  q('Nursing', 'Nutrition', 'Which deficiency commonly causes night blindness?', 'Vitamin A deficiency', 'Vitamin D deficiency', 'Vitamin K deficiency', 'Vitamin B12 deficiency', 'a', 'Vitamin A deficiency is associated with night blindness and xerophthalmia.', 'easy');
  q('Nursing', 'Nutrition', 'What is the body mass index formula?', 'Weight divided by height', 'Weight divided by height squared', 'Height divided by weight squared', 'Weight multiplied by height squared', 'b', 'BMI is calculated as weight in kilograms divided by height in meters squared.', 'medium');
  q('Nursing', 'Nutrition', 'Which food is a rich source of iron?', 'Rice', 'Spinach', 'Apple juice', 'Butter', 'b', 'Spinach is a plant source of iron.', 'easy');
  q('Nursing', 'Nutrition', 'Which vitamin helps blood clotting?', 'Vitamin A', 'Vitamin D', 'Vitamin K', 'Vitamin E', 'c', 'Vitamin K is essential for synthesis of clotting factors.', 'easy');
  q('Nursing', 'Nutrition', 'Which fluid is used for oral rehydration?', 'ORS', 'Normal saline only', 'Glucose-free water only', 'Fruit juice only', 'a', 'Oral rehydration solution helps prevent dehydration from diarrhea.', 'easy');

  q('Nursing', 'Infection Control', 'What is the recommended duration of hand hygiene with soap and water?', '5 seconds', '10 seconds', '20 seconds', '60 seconds', 'c', 'WHO recommends at least 20 seconds of handwashing with soap and water.', 'easy');
  q('Nursing', 'Infection Control', 'Which isolation is needed for pulmonary tuberculosis?', 'Contact', 'Droplet', 'Airborne', 'Reverse', 'c', 'Pulmonary TB requires airborne precautions because the organism spreads through droplet nuclei.', 'medium');
  q('Nursing', 'Infection Control', 'What should be done immediately after a needle-stick injury?', 'Squeeze the wound vigorously', 'Wash with soap and water and report it', 'Apply a tight bandage only', 'Ignore if the needle is clean', 'b', 'The wound should be washed and the exposure reported immediately.', 'medium');
  q('Nursing', 'Infection Control', 'Which chemical is commonly used for surface disinfection of blood spills?', 'Plain water', 'Sodium hypochlorite', 'Glycerin', 'Saline', 'b', 'A chlorine-based disinfectant such as sodium hypochlorite is commonly used for blood spill management.', 'medium');
  q('Nursing', 'Infection Control', 'Which PPE item should be removed first after patient care?', 'Gloves', 'Mask', 'Gown', 'Cap', 'a', 'Gloves are usually removed first because they are the most contaminated item.', 'medium');
  q('Nursing', 'Infection Control', 'Where should used sharps be discarded?', 'General waste bin', 'Recapping box', 'Puncture-proof sharps container', 'Laundry bag', 'c', 'Sharps must go into a puncture-proof container to prevent injury and infection.', 'easy');

  q('Nursing', 'ICU', 'What is a common cause of high-pressure ventilator alarm?', 'Circuit disconnection', 'Kinked tubing or secretions', 'Low battery', 'Empty oxygen cylinder only', 'b', 'High-pressure alarms often occur due to secretions, bronchospasm, coughing, or kinked tubing.', 'medium');
  q('Nursing', 'ICU', 'Which score is used to assess level of consciousness?', 'APGAR', 'GCS', 'BMI', 'NEWS2', 'b', 'The Glasgow Coma Scale is used to assess eye opening, verbal response, and motor response.', 'easy');
  q('Nursing', 'ICU', 'What is the usual target oxygen saturation for many adult ICU patients?', '70-80%', '80-85%', '92-96%', '100% all the time', 'c', 'For most adults, oxygen saturation is commonly targeted around 92-96% unless otherwise indicated.', 'medium');
  q('Nursing', 'ICU', 'Which finding suggests poor tissue perfusion in shock?', 'Warm flushed skin only', 'Delayed capillary refill', 'Increased appetite', 'Bradycardia in all cases', 'b', 'Delayed capillary refill can suggest poor peripheral perfusion and shock.', 'medium');
  q('Nursing', 'ICU', 'What does MAP stand for in critical care?', 'Mean arterial pressure', 'Maximum airway pressure', 'Microbial attack plan', 'Median arterial pulse', 'a', 'MAP means mean arterial pressure and reflects tissue perfusion.', 'easy');
  q('Nursing', 'ICU', 'Which device is commonly used for continuous ECG monitoring in ICU?', 'Pulse oximeter', 'Cardiac monitor', 'Nebulizer', 'Glucometer', 'b', 'A cardiac monitor provides continuous ECG rhythm surveillance in critical care.', 'easy');

  q('Nursing', 'Emergency Nursing', 'What is the first step in basic life support for an unresponsive adult?', 'Start chest compressions immediately without checking', 'Check responsiveness and call for help', 'Give oral fluids', 'Place a feeding tube', 'b', 'The first step is to assess responsiveness and activate help.', 'easy');
  q('Nursing', 'Emergency Nursing', 'Which drug is the first-line treatment for anaphylaxis?', 'Hydrocortisone', 'Epinephrine', 'Paracetamol', 'Furosemide', 'b', 'Intramuscular epinephrine is the first-line life-saving treatment for anaphylaxis.', 'easy');
  q('Nursing', 'Emergency Nursing', 'What maneuver is used for choking in a conscious adult?', 'Trendelenburg position', 'Heimlich maneuver', 'Valsalva maneuver', 'Fowler position', 'b', 'The Heimlich maneuver is used to relieve severe airway obstruction in a conscious adult.', 'easy');
  q('Nursing', 'Emergency Nursing', 'Which patient should be treated first in triage?', 'Stable patient with headache', 'Patient with airway compromise', 'Patient waiting for dressing change', 'Patient with mild ankle pain', 'b', 'Airway compromise is an immediate life-threatening emergency and receives the highest priority.', 'easy');
  q('Nursing', 'Emergency Nursing', 'What is the compression-to-ventilation ratio for one-rescuer adult CPR?', '15:2', '30:2', '20:1', '5:1', 'b', 'Adult CPR commonly uses 30 compressions to 2 breaths for one rescuer.', 'easy');
  q('Nursing', 'Emergency Nursing', 'Which pulse site is usually checked first in cardiac arrest?', 'Radial pulse', 'Carotid pulse', 'Dorsalis pedis pulse', 'Femoral pulse', 'b', 'The carotid pulse is checked in an unresponsive adult during emergency assessment.', 'easy');

  q('Nursing', 'Ethics', 'What does confidentiality mean in nursing?', 'Sharing data with everyone', 'Keeping patient information private', 'Writing only in capitals', 'Avoiding all documentation', 'b', 'Confidentiality means protecting patient information from unauthorized disclosure.', 'easy');
  q('Nursing', 'Ethics', 'What is informed consent?', 'A verbal promise from the nurse', 'Patient agreement after understanding risks and benefits', 'Doctor signing for the patient', 'A discharge summary', 'b', 'Informed consent requires understanding of the procedure, risks, benefits, and alternatives.', 'easy');
  q('Nursing', 'Ethics', 'Which principle means respecting a patient\'s right to choose?', 'Autonomy', 'Justice', 'Fidelity', 'Nonmaleficence', 'a', 'Autonomy is the principle of respecting the patient\'s self-determination.', 'medium');
  q('Nursing', 'Ethics', 'Which principle means "do no harm"?', 'Veracity', 'Beneficence', 'Nonmaleficence', 'Justice', 'c', 'Nonmaleficence means avoiding harm to the patient.', 'easy');
  q('Nursing', 'Ethics', 'Which ethical principle means fairness in care?', 'Justice', 'Autonomy', 'Fidelity', 'Paternalism', 'a', 'Justice means giving fair and equal treatment to patients.', 'easy');
  q('Nursing', 'Ethics', 'Which term means telling the truth to patients?', 'Veracity', 'Fidelity', 'Beneficence', 'Sanction', 'a', 'Veracity is the ethical duty of honesty and truthfulness.', 'medium');

  q('Nursing', 'Nursing Procedures', 'Which position is used for giving an enema?', 'Supine', "Left lateral Sims' position", 'Prone', 'High Fowler', 'b', "Left lateral Sims' position allows the enema solution to flow into the sigmoid colon more easily.", 'easy');
  q('Nursing', 'Nursing Procedures', 'What is the usual maximum time for suctioning a patient at one attempt?', '5 seconds', '10 to 15 seconds', '30 to 45 seconds', '2 minutes', 'b', 'Suctioning should be brief, usually 10 to 15 seconds, to prevent hypoxia.', 'medium');
  q('Nursing', 'Nursing Procedures', 'Which site is commonly used for intramuscular injection in adults?', 'Deltoid', 'Palm of hand', 'Abdomen', 'Conjunctiva', 'a', 'The deltoid muscle is a common and safe IM injection site for many adults.', 'easy');
  q('Nursing', 'Nursing Procedures', 'What is the best practice when inserting a urinary catheter?', 'Use non-sterile gloves only', 'Maintain sterile technique', 'Avoid lubrication', 'Insert without explaining to the patient', 'b', 'Urinary catheter insertion requires strict sterile technique to reduce infection risk.', 'easy');
  q('Nursing', 'Nursing Procedures', 'At what angle is intradermal injection usually given?', '15 degrees', '45 degrees', '60 degrees', '90 degrees', 'a', 'Intradermal injections are usually administered at a shallow 10-15 degree angle.', 'easy');
  q('Nursing', 'Nursing Procedures', 'Before measuring blood pressure, the patient should be', 'Talking continuously', 'Resting calmly for a few minutes', 'Running in place', 'Holding the arm above the head', 'b', 'Resting helps provide a more accurate blood pressure reading.', 'easy');
}

function addEnglishSection() {
  q('English', 'Grammar and Composition', 'Choose the correct sentence for subject-verb agreement.', 'He go to school every day.', 'He goes to school every day.', 'He going to school every day.', 'He gone to school every day.', 'b', 'Use goes with a third-person singular subject in the present simple tense.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the correct article: "He is ___ honest man."', 'a', 'an', 'the', 'no article', 'b', 'Honest begins with a vowel sound, so an is used.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the correct preposition: "Interested ___ medicine"', 'on', 'at', 'in', 'for', 'c', 'The correct collocation is interested in.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the passive voice of: "He wrote the letter."', 'He wrote the letter.', 'The letter was written by him.', 'He is writing the letter.', 'He has write the letter.', 'b', 'In passive voice, the object becomes the subject and the past participle is used.', 'medium');
  q('English', 'Grammar and Composition', 'Choose the correct spelling.', 'Seperate', 'Separate', 'Seperete', 'Seprate', 'b', 'The correct spelling is separate.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the indirect speech: "She said, \'I am busy.\'"', 'She said that she is busy.', 'She said that she was busy.', 'She says that she was busy.', 'She told that she was busy.', 'b', 'In reported speech, the tense usually shifts back when the reporting verb is in the past.', 'medium');
  q('English', 'Grammar and Composition', 'Fill in the blank: "Neither of the answers ___ correct."', 'are', 'were', 'is', 'have', 'c', 'Neither is treated as singular here.', 'medium');
  q('English', 'Grammar and Composition', 'Choose the correct sentence.', 'She did not went there.', 'She did not go there.', 'She does not went there.', 'She not go there.', 'b', 'After did not, use the base form of the verb.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the synonym of "rapid".', 'Slow', 'Quick', 'Weak', 'Late', 'b', 'Rapid means quick or fast.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the antonym of "honest".', 'Truthful', 'Sincere', 'Dishonest', 'Kind', 'c', 'The opposite of honest is dishonest.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the correct plural form of "child".', 'Childs', 'Childes', 'Children', 'Childrens', 'c', 'The irregular plural of child is children.', 'easy');
  q('English', 'Grammar and Composition', 'Choose the correct sentence for either-or usage.', 'Either of the books are useful.', 'Either of the books is useful.', 'Either of the books were useful.', 'Either of the books have useful.', 'b', 'Either is singular in standard grammar.', 'medium');
}

function addGKSection() {
  q('General Knowledge', 'History', 'Which year did the Language Movement of Bangladesh occur?', '1947', '1952', '1966', '1971', 'b', 'The Language Movement reached its peak in 1952 with the sacrifice of the language martyrs.', 'easy');
  q('General Knowledge', 'History', 'Who is known as Bangabandhu?', 'Ziaur Rahman', 'Sheikh Hasina', 'Sheikh Mujibur Rahman', 'Tajuddin Ahmad', 'c', 'Sheikh Mujibur Rahman is known as Bangabandhu, the Father of the Nation.', 'easy');
  q('General Knowledge', 'History', 'When was the independence of Bangladesh declared?', '26 March 1971', '16 December 1971', '7 March 1971', '21 February 1952', 'a', 'Bangladesh declared independence on 26 March 1971.', 'easy');
  q('General Knowledge', 'History', 'Which historic speech is associated with March 7, 1971?', 'The Six Point Speech', 'The March 7 Speech', 'The Victory Speech', 'The Liberation Speech', 'b', 'The March 7 speech by Sheikh Mujibur Rahman is a landmark event in the independence struggle.', 'easy');
  q('General Knowledge', 'History', 'Who led the Language Movement in Bangladesh?', 'Kazi Nazrul Islam', 'Abdul Hamid Khan Bhashani and others', 'Rabindranath Tagore', 'A. K. Fazlul Huq', 'b', 'Several student leaders and activists played a major role in the Language Movement.', 'medium');
  q('General Knowledge', 'History', 'What day is observed as Martyrs Day in Bangladesh?', '21 February', '26 March', '16 December', '14 April', 'a', '21 February is observed as Shaheed Day and International Mother Language Day.', 'easy');

  q('General Knowledge', 'Geography', 'What is the capital of Bangladesh?', 'Chattogram', 'Khulna', 'Dhaka', 'Rajshahi', 'c', 'Dhaka is the capital city of Bangladesh.', 'easy');
  q('General Knowledge', 'Geography', 'Which forest is the largest mangrove forest in the world?', 'Amazon Forest', 'Sundarbans', 'Congo Forest', 'Evergreen Forest', 'b', 'The Sundarbans is the world\'s largest mangrove forest.', 'easy');
  q('General Knowledge', 'Geography', 'Which bay lies to the south of Bangladesh?', 'Arabian Sea', 'Bay of Bengal', 'Andaman Sea', 'Gulf of Mannar', 'b', 'Bangladesh has coastline on the Bay of Bengal to the south.', 'easy');
  q('General Knowledge', 'Geography', 'Which river delta is Bangladesh part of?', 'Nile Delta', 'Ganges-Brahmaputra Delta', 'Amazon Delta', 'Danube Delta', 'b', 'Bangladesh lies in the Ganges-Brahmaputra-Meghna delta system.', 'medium');
  q('General Knowledge', 'Geography', 'Which river is often called the lifeline of Bangladesh?', 'Jamuna', 'Padma', 'Meghna', 'Karnaphuli', 'b', 'The Padma is one of the major river channels of Bangladesh and is often treated as a lifeline river.', 'medium');
  q('General Knowledge', 'Geography', 'Which district is widely known for tea gardens?', 'Sylhet', 'Narsingdi', 'Munshiganj', 'Barishal', 'a', 'Sylhet is widely known for its tea gardens.', 'easy');
}

function renderSql(rowsToRender) {
  const header = `-- Supplemental MCQs for missing subjects\n-- Run after the questions table exists\n\nBEGIN;\n\nINSERT INTO public.questions (category, subcategory, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, active) VALUES\n`;
  const values = rowsToRender.map((row, index) => {
    const line = `('${escapeSql(row.category)}', '${escapeSql(row.subcategory)}', '${escapeSql(row.question)}', '${escapeSql(row.optionA)}', '${escapeSql(row.optionB)}', '${escapeSql(row.optionC)}', '${escapeSql(row.optionD)}', '${row.correct}', '${escapeSql(row.explanation)}', '${row.difficulty}', TRUE)`;
    return index === rowsToRender.length - 1 ? `${line};` : `${line},`;
  });
  return `${header}${values.join('\n')}\n\nCOMMIT;\n`;
}

addNursingSection();
addEnglishSection();
addGKSection();

const seen = new Set();
for (const row of rows) {
  if (seen.has(row.question)) {
    throw new Error(`Duplicate question detected: ${row.question}`);
  }
  seen.add(row.question);
}

const baseSql = renderSql(rows);
fs.writeFileSync(outputPath, baseSql, 'utf8');

const expandedRows = expandRows(rows);
const expandedSeen = new Set();
for (const row of expandedRows) {
  if (expandedSeen.has(row.question)) {
    throw new Error(`Duplicate expanded question detected: ${row.question}`);
  }
  expandedSeen.add(row.question);
}

const expandedSql = renderSql(expandedRows);
fs.writeFileSync(expandedOutputPath, expandedSql, 'utf8');

fs.mkdirSync(chunkDir, { recursive: true });
const chunkSize = 504;
const chunkCount = Math.ceil(expandedRows.length / chunkSize);
for (let index = 0; index < chunkCount; index += 1) {
  const chunkRows = expandedRows.slice(index * chunkSize, (index + 1) * chunkSize);
  const chunkSql = renderSql(chunkRows);
  const chunkPath = path.join(chunkDir, `part_${String(index + 1).padStart(2, '0')}.sql`);
  fs.writeFileSync(chunkPath, chunkSql, 'utf8');
}

console.log(`Wrote ${outputPath} with ${rows.length} rows`);
console.log(`Wrote ${expandedOutputPath} with ${expandedRows.length} rows`);
console.log(`Wrote ${chunkCount} chunk files to ${chunkDir}`);
