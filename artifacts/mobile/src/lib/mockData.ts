import type { Question } from '@/src/types';

// Sample offline questions for when Supabase is not configured
const MOCK_QUESTIONS: Question[] = generateMockQuestions();

function generateMockQuestions(): Question[] {
  const questions: Question[] = [];
  let id = 1;

  const nursingQuestions = [
    { q: 'What is the normal adult respiratory rate?', a: '12-20 breaths/min', b: '20-30 breaths/min', c: '8-12 breaths/min', d: '30-40 breaths/min', correct: 'a', exp: 'Normal adult respiratory rate is 12-20 breaths per minute.' },
    { q: 'Which position is best for a patient with dyspnea?', a: 'Supine', b: 'Fowler\'s', c: 'Prone', d: 'Trendelenburg', correct: 'b', exp: 'Fowler\'s position facilitates breathing by maximizing chest expansion.' },
    { q: 'What is the normal range for adult blood pressure?', a: '90/60 - 120/80', b: '140/90 - 160/100', c: '120/80 - 140/90', d: '80/60 - 100/70', correct: 'a', exp: 'Normal adult BP is 90/60 to 120/80 mmHg.' },
    { q: 'What does PQRST stand for in pain assessment?', a: 'Provoke, Quality, Region, Severity, Time', b: 'Pain, Quality, Relief, Severity, Treatment', c: 'Position, Quantity, Radiation, Sensation, Type', d: 'Pattern, Question, Response, Scale, Test', correct: 'a', exp: 'PQRST: Provoke, Quality, Region, Severity, Time for pain assessment.' },
    { q: 'Which heart sound is associated with ventricular contraction?', a: 'S1', b: 'S2', c: 'S3', d: 'S4', correct: 'a', exp: 'S1 (lub) is the sound of mitral and tricuspid valve closure during ventricular systole.' },
    { q: 'What is the normal fasting blood glucose level?', a: '70-100 mg/dL', b: '100-126 mg/dL', c: '126-150 mg/dL', d: '50-70 mg/dL', correct: 'a', exp: 'Normal fasting glucose is 70-100 mg/dL.' },
    { q: 'Which electrolyte imbalance is most common in patients with diarrhea?', a: 'Hypernatremia', b: 'Hypokalemia', c: 'Hypercalcemia', d: 'Hypermagnesemia', correct: 'b', exp: 'Diarrhea causes loss of potassium, leading to hypokalemia.' },
    { q: 'What is the priority nursing intervention for a patient with chest pain?', a: 'Administer oxygen', b: 'Call the doctor', c: 'Administer nitroglycerin', d: 'Perform ECG', correct: 'a', exp: 'Oxygen is the priority to prevent myocardial ischemia.' },
    { q: 'Which vaccine is contraindicated in pregnancy?', a: 'Tetanus toxoid', b: 'Hepatitis B', c: 'MMR', d: 'Influenza', correct: 'c', exp: 'MMR (Measles, Mumps, Rubella) is a live vaccine contraindicated in pregnancy.' },
    { q: 'What is the normal range for serum potassium?', a: '3.5-5.0 mEq/L', b: '5.0-6.0 mEq/L', c: '2.5-3.5 mEq/L', d: '6.0-7.0 mEq/L', correct: 'a', exp: 'Normal serum potassium is 3.5-5.0 mEq/L.' },
    { q: 'Which type of shock is characterized by vasodilation and increased capillary permeability?', a: 'Cardiogenic', b: 'Hypovolemic', c: 'Septic', d: 'Neurogenic', correct: 'c', exp: 'Septic shock causes vasodilation and increased capillary permeability due to inflammatory mediators.' },
    { q: 'What is the most common cause of postpartum hemorrhage?', a: 'Uterine atony', b: 'Laceration', c: 'Retained placenta', d: 'Coagulopathy', correct: 'a', exp: 'Uterine atony is the most common cause of postpartum hemorrhage.' },
    { q: 'Which drug is used to reverse opioid overdose?', a: 'Flumazenil', b: 'Naloxone', c: 'Naltrexone', d: 'Atropine', correct: 'b', exp: 'Naloxone is an opioid antagonist used to reverse opioid overdose.' },
    { q: 'What is the normal range for hemoglobin in adult males?', a: '13.5-17.5 g/dL', b: '12-15 g/dL', c: '15-18 g/dL', d: '10-13 g/dL', correct: 'a', exp: 'Normal hemoglobin for adult males is 13.5-17.5 g/dL.' },
    { q: 'Which type of isolation is required for a patient with tuberculosis?', a: 'Contact', b: 'Droplet', c: 'Airborne', d: 'Standard', correct: 'c', exp: 'TB requires airborne precautions in a negative pressure room.' },
    { q: 'What is the Glasgow Coma Scale used to assess?', a: 'Pain level', b: 'Level of consciousness', c: 'Muscle strength', d: 'Coordination', correct: 'b', exp: 'GCS assesses eye, verbal, and motor responses for level of consciousness.' },
    { q: 'Which vitamin is synthesized by the skin in sunlight?', a: 'Vitamin A', b: 'Vitamin D', c: 'Vitamin K', d: 'Vitamin E', correct: 'b', exp: 'Vitamin D is synthesized in the skin upon exposure to UVB sunlight.' },
    { q: 'What is the most common nosocomial infection?', a: 'Urinary tract infection', b: 'Surgical site infection', c: 'Pneumonia', d: 'Bloodstream infection', correct: 'a', exp: 'UTI is the most common hospital-acquired infection, often from catheter use.' },
    { q: 'Which artery is used to measure blood pressure?', a: 'Radial', b: 'Femoral', c: 'Brachial', d: 'Carotid', correct: 'c', exp: 'Brachial artery is the standard site for BP measurement.' },
    { q: 'What is the normal range for body temperature in Celsius?', a: '36.0-37.5°C', b: '37.5-38.5°C', c: '35.0-36.0°C', d: '38.0-39.0°C', correct: 'a', exp: 'Normal body temperature is 36.0-37.5°C (96.8-99.5°F).' },
  ];

  const banglaQuestions = [
    { q: '"সূর্য" শব্দের সমার্থক শব্দ কোনটি?', a: 'রবি', b: 'চন্দ্র', c: 'তারা', d: 'গ্রহ', correct: 'a', exp: 'সূর্যের সমার্থক শব্দ: রবি, দিবাকর, ভানু, আদিত্য।' },
    { q: '"বাংলা ভাষা" কোন ভাষাগোষ্ঠীর অন্তর্ভুক্ত?', a: 'ইন্দো-ইউরোপীয়', b: 'দ্রাবিড়', c: 'আফ্রো-এশিয়াটিক', d: 'চীনা-তিব্বতি', correct: 'a', exp: 'বাংলা ইন্দো-ইউরোপীয় ভাষাগোষ্ঠীর ইন্দো-আর্য শাখার অন্তর্ভুক্ত।' },
    { q: 'কাজী নজরুল ইসলামের জন্মস্থান কোন জেলায়?', a: 'বর্ধমান', b: 'নদীয়া', c: 'চুরুলিয়া', d: 'যশোর', correct: 'c', exp: 'কাজী নজরুল ইসলামের জন্ম পশ্চিমবঙ্গের বর্ধমান জেলার চুরুলিয়া গ্রামে।' },
    { q: '"গীতাঞ্জলি" কাব্যগ্রন্থের রচয়িতা কে?', a: 'রবীন্দ্রনাথ ঠাকুর', b: 'কাজী নজরুল ইসলাম', c: 'জীবনানন্দ দাশ', d: 'বুদ্ধদেব বসু', correct: 'a', exp: 'গীতাঞ্জলি রবীন্দ্রনাথ ঠাকুরের একটি বিখ্যাত কাব্যগ্রন্থ।' },
    { q: 'বাংলা ভাষায় মৌলিক স্বরধ্বনির সংখ্যা কত?', a: '৭টি', b: '১১টি', c: '৮টি', d: '১০টি', correct: 'a', exp: 'বাংলা ভাষায় মৌলিক স্বরধ্বনির সংখ্যা ৭টি: অ, আ, ই, উ, এ, ও, অ্যা।' },
    { q: '"শেষের কবিতা" উপন্যাসের লেখক কে?', a: 'রবীন্দ্রনাথ ঠাকুর', b: 'শরৎচন্দ্র চট্টোপাধ্যায়', c: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়', d: 'তারাশঙ্কর বন্দোপাধ্যায়', correct: 'a', exp: 'শেষের কবিতা রবীন্দ্রনাথ ঠাকুরের একটি বিখ্যাত উপন্যাস।' },
    { q: 'বাংলা বর্ণমালায় মোট বর্ণের সংখ্যা কত?', a: '৫০টি', b: '৫২টি', c: '৫১টি', d: '৪৯টি', correct: 'c', exp: 'বাংলা বর্ণমালায় মোট ৫১টি বর্ণ রয়েছে (১১টি স্বর + ৪০টি ব্যঞ্জন)।' },
    { q: '"পদ্মা নদীর মাঝি" উপন্যাসের লেখক কে?', a: 'মানিক বন্দোপাধ্যায়', b: 'তারাশঙ্কর বন্দোপাধ্যায়', c: 'বিভূতিভূষণ বন্দোপাধ্যায়', d: 'শরৎচন্দ্র চট্টোপাধ্যায়', correct: 'a', exp: 'পদ্মা নদীর মাঝি মানিক বন্দোপাধ্যায়ের বিখ্যাত উপন্যাস।' },
    { q: 'বাংলা ভাষার উৎপত্তি কোন ভাষা থেকে?', a: 'সংস্কৃত', b: 'প্রাকৃত', c: 'পালি', d: 'হিন্দি', correct: 'b', exp: 'বাংলা ভাষার উৎপত্তি মাগধী প্রাকৃত থেকে।' },
    { q: '"শ্রীকান্ত" উপন্যাসের লেখক কে?', a: 'শরৎচন্দ্র চট্টোপাধ্যায়', b: 'রবীন্দ্রনাথ ঠাকুর', c: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়', d: 'মানিক বন্দোপাধ্যায়', correct: 'a', exp: 'শ্রীকান্ত শরৎচন্দ্র চট্টোপাধ্যায়ের একটি বিখ্যাত উপন্যাস।' },
  ];

  const englishQuestions = [
    { q: 'Choose the correct synonym of "Abundant":', a: 'Scarce', b: 'Plentiful', c: 'Limited', d: 'Rare', correct: 'b', exp: 'Abundant means existing in large quantities, synonym is plentiful.' },
    { q: 'What is the past tense of "Go"?', a: 'Goed', b: 'Went', c: 'Gone', d: 'Going', correct: 'b', exp: 'The past tense of "go" is "went" (irregular verb).' },
    { q: 'Choose the correct antonym of "Expand":', a: 'Increase', b: 'Enlarge', c: 'Contract', d: 'Extend', correct: 'c', exp: 'Expand means to increase in size; contract means to decrease in size.' },
    { q: 'Which sentence is grammatically correct?', a: 'He go to school', b: 'He goes to school', c: 'He going to school', d: 'He gone to school', correct: 'b', exp: 'For third person singular, use "goes" with the present tense.' },
    { q: 'What is the meaning of the idiom "Break the ice"?', a: 'Break something cold', b: 'Start a conversation', c: 'Destroy ice', d: 'Feel cold', correct: 'b', exp: 'Break the ice means to initiate conversation in a social setting.' },
    { q: 'Choose the correct spelling:', a: 'Accommodate', b: 'Acommodate', c: 'Accomodate', d: 'Acomodate', correct: 'a', exp: 'Correct spelling: accommodate (double c, double m).' },
    { q: 'What is the comparative form of "good"?', a: 'Gooder', b: 'Better', c: 'Best', d: 'More good', correct: 'b', exp: 'Comparative of good is better; superlative is best.' },
    { q: 'Which part of speech is "beautifully"?', a: 'Adjective', b: 'Adverb', c: 'Noun', d: 'Verb', correct: 'b', exp: 'Beautifully is an adverb - it modifies a verb, adjective, or other adverb.' },
    { q: 'Choose the correct passive voice: "She writes a letter."', a: 'A letter is written by her', b: 'A letter was written by her', c: 'A letter has been written by her', d: 'A letter had been written by her', correct: 'a', exp: 'Present simple passive: is/am/are + past participle.' },
    { q: 'What is the antonym of "Generous"?', a: 'Kind', b: 'Stingy', c: 'Charitable', d: 'Benevolent', correct: 'b', exp: 'Generous means willing to give; stingy means unwilling to give.' },
  ];

  const gkQuestions = [
    { q: 'What is the capital of Bangladesh?', a: 'Chittagong', b: 'Dhaka', c: 'Rajshahi', d: 'Khulna', correct: 'b', exp: 'Dhaka is the capital city of Bangladesh.' },
    { q: 'Who is known as the Father of the Nation in Bangladesh?', a: 'Sheikh Mujibur Rahman', b: 'Ziaur Rahman', c: 'Hussain Muhammad Ershad', d: 'Khaleda Zia', correct: 'a', exp: 'Bangabandhu Sheikh Mujibur Rahman is the Father of the Nation.' },
    { q: 'What is the currency of Bangladesh?', a: 'Rupee', b: 'Taka', c: 'Dollar', d: 'Rial', correct: 'b', exp: 'The currency of Bangladesh is Taka (BDT).' },
    { q: 'When did Bangladesh gain independence?', a: '1970', b: '1971', c: '1972', d: '1973', correct: 'b', exp: 'Bangladesh gained independence on December 16, 1971.' },
    { q: 'What is the longest river in Bangladesh?', a: 'Padma', b: 'Meghna', c: 'Jamuna', d: 'Brahmaputra', correct: 'd', exp: 'Brahmaputra is the longest river flowing through Bangladesh.' },
    { q: 'Which is the largest sea port in Bangladesh?', a: 'Mongla', b: 'Chittagong', c: 'Paira', d: 'Dhaka', correct: 'b', exp: 'Chittagong seaport is the largest and busiest port in Bangladesh.' },
    { q: 'What is the national flower of Bangladesh?', a: 'Rose', b: 'Lily', c: 'Shapla (Water Lily)', d: 'Sunflower', correct: 'c', exp: 'Shapla (White Water Lily) is the national flower of Bangladesh.' },
    { q: 'Who is the current Prime Minister of Bangladesh?', a: 'Khaleda Zia', b: 'Sheikh Hasina', c: 'Hussain Muhammad Ershad', d: 'Ziaur Rahman', correct: 'b', exp: 'Sheikh Hasina is the current Prime Minister of Bangladesh.' },
    { q: 'What is the national animal of Bangladesh?', a: 'Tiger', b: 'Lion', c: 'Elephant', d: 'Royal Bengal Tiger', correct: 'd', exp: 'Royal Bengal Tiger (Panthera tigris) is the national animal of Bangladesh.' },
    { q: 'Which gas is most abundant in the Earth\'s atmosphere?', a: 'Oxygen', b: 'Carbon Dioxide', c: 'Nitrogen', d: 'Argon', correct: 'c', exp: 'Nitrogen (N2) makes up about 78% of the Earth\'s atmosphere.' },
  ];

  const categories = [
    { name: 'Nursing', questions: nursingQuestions, count: 20 },
    { name: 'Bangla', questions: banglaQuestions, count: 10 },
    { name: 'English', questions: englishQuestions, count: 10 },
    { name: 'General Knowledge', questions: gkQuestions, count: 10 },
  ];

  for (const cat of categories) {
    for (const q of cat.questions) {
      questions.push({
        id: `mock-${id++}`,
        category: cat.name,
        exam_type: 'nursing',
        question: q.q,
        option_a: q.a,
        option_b: q.b,
        option_c: q.c,
        option_d: q.d,
        correct_answer: q.correct as 'a' | 'b' | 'c' | 'd',
        explanation: q.exp,
        difficulty: 'medium',
        importance: 1,
        tags: [],
        language: 'english',
        verified: true,
        active: true,
      });
    }
  }

  return questions;
}

export function getMockQuestions(): Question[] {
  return MOCK_QUESTIONS;
}

export function getMockQuestionsByCategory(category: string): Question[] {
  return MOCK_QUESTIONS.filter(q => q.category === category);
}

export function getMockMockQuestions(): Question[] {
  const dist: Record<string, number> = { Nursing: 10, 'General Knowledge': 5, English: 5, Bangla: 5 };
  const selected: Question[] = [];
  for (const [cat, count] of Object.entries(dist)) {
    const catQuestions = MOCK_QUESTIONS.filter(q => q.category === cat);
    selected.push(...catQuestions.slice(0, count));
  }
  return selected.sort(() => Math.random() - 0.5);
}

export function getMockDailyQuestions(count: number): Question[] {
  const shuffled = [...MOCK_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}