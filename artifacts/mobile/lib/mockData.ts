// Mock data for development when Supabase is not configured
// This provides sample questions so the app can run without a backend

import type { Question, Category, Subcategory, MockResult } from './types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'nursing',
    name: 'Nursing',
    icon: 'medical-bag',
    color: '#0891B2',
    bgColor: '#E0F2FE',
    description: 'Nursing Science & Clinical Practice',
    questionCount: 400,
  },
  {
    id: 'bangla',
    name: 'Bangla',
    icon: 'alphabetical',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    description: 'Bangla Language & Literature',
    questionCount: 200,
  },
  {
    id: 'english',
    name: 'English',
    icon: 'book-open-variant',
    color: '#059669',
    bgColor: '#D1FAE5',
    description: 'English Language & Grammar',
    questionCount: 200,
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    icon: 'earth',
    color: '#D97706',
    bgColor: '#FEF3C7',
    description: 'GK, Current Affairs & Bangladesh Affairs',
    questionCount: 200,
  },
];

export const MOCK_SUBCATEGORIES: Record<string, Subcategory[]> = {
  Nursing: [
    { id: 'msn', category_id: 'nursing', name: 'Medical Surgical Nursing', question_count: 100, order_index: 1 },
    { id: 'anatomy', category_id: 'nursing', name: 'Anatomy', question_count: 50, order_index: 2 },
    { id: 'pharma', category_id: 'nursing', name: 'Pharmacology', question_count: 50, order_index: 3 },
    { id: 'pediatric', category_id: 'nursing', name: 'Pediatric Nursing', question_count: 50, order_index: 4 },
    { id: 'community', category_id: 'nursing', name: 'Community Nursing', question_count: 50, order_index: 5 },
    { id: 'obgyn', category_id: 'nursing', name: 'Obstetrics', question_count: 50, order_index: 6 },
    { id: 'fundamentals', category_id: 'nursing', name: 'Fundamentals of Nursing', question_count: 50, order_index: 7 },
    { id: 'psych', category_id: 'nursing', name: 'Psychiatric Nursing', question_count: 50, order_index: 8 },
  ],
  Bangla: [
    { id: 'bangla-grammar', category_id: 'bangla', name: 'Grammar', question_count: 80, order_index: 1 },
    { id: 'bangla-lit', category_id: 'bangla', name: 'Literature', question_count: 70, order_index: 2 },
    { id: 'bangla-comp', category_id: 'bangla', name: 'Composition', question_count: 50, order_index: 3 },
  ],
  English: [
    { id: 'eng-grammar', category_id: 'english', name: 'Grammar', question_count: 80, order_index: 1 },
    { id: 'eng-vocab', category_id: 'english', name: 'Vocabulary', question_count: 60, order_index: 2 },
    { id: 'eng-comp', category_id: 'english', name: 'Comprehension', question_count: 60, order_index: 3 },
  ],
  'General Knowledge': [
    { id: 'bd-affairs', category_id: 'general-knowledge', name: 'Bangladesh Affairs', question_count: 60, order_index: 1 },
    { id: 'int-affairs', category_id: 'general-knowledge', name: 'International Affairs', question_count: 50, order_index: 2 },
    { id: 'current-affairs', category_id: 'general-knowledge', name: 'Current Affairs', question_count: 50, order_index: 3 },
    { id: 'science', category_id: 'general-knowledge', name: 'Science & Technology', question_count: 40, order_index: 4 },
  ],
};

// Sample questions for offline/dev mode (20 per category)
export const MOCK_QUESTIONS: Question[] = [
  // Nursing
  {
    id: 'n1', category: 'Nursing', subcategory: 'Medical Surgical Nursing',
    question: 'What is the normal range of adult blood pressure?',
    option_a: '90/60 - 120/80 mmHg', option_b: '120/80 - 140/90 mmHg',
    option_c: '140/90 - 160/100 mmHg', option_d: '80/60 - 100/70 mmHg',
    correct_answer: 'a', explanation: 'Normal adult BP is 90/60 to 120/80 mmHg.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n2', category: 'Nursing', subcategory: 'Medical Surgical Nursing',
    question: 'Which position is best for a patient with dyspnea?',
    option_a: 'Supine position', option_b: "Fowler's position",
    option_c: 'Prone position', option_d: 'Lithotomy position',
    correct_answer: 'b', explanation: "Fowler's position facilitates breathing by allowing maximum chest expansion.",
    difficulty: 'easy', active: true,
  },
  {
    id: 'n3', category: 'Nursing', subcategory: 'Medical Surgical Nursing',
    question: 'What is the first sign of hypovolemic shock?',
    option_a: 'Bradycardia', option_b: 'Increased blood pressure',
    option_c: 'Tachycardia', option_d: 'Decreased urine output',
    correct_answer: 'c', explanation: 'Tachycardia is an early compensatory mechanism in hypovolemic shock.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'n4', category: 'Nursing', subcategory: 'Medical Surgical Nursing',
    question: 'Which medication is used to reverse opioid overdose?',
    option_a: 'Flumazenil', option_b: 'Naloxone',
    option_c: 'Atropine', option_d: 'Epinephrine',
    correct_answer: 'b', explanation: 'Naloxone (Narcan) is a pure opioid antagonist.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n5', category: 'Nursing', subcategory: 'Anatomy',
    question: 'Which is the largest organ of the human body?',
    option_a: 'Liver', option_b: 'Brain',
    option_c: 'Skin', option_d: 'Heart',
    correct_answer: 'c', explanation: 'The skin is the largest organ, covering approximately 1.5-2 square meters.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n6', category: 'Nursing', subcategory: 'Anatomy',
    question: 'How many bones are in the adult human body?',
    option_a: '200', option_b: '206',
    option_c: '212', option_d: '218',
    correct_answer: 'b', explanation: 'The adult human skeleton consists of 206 bones.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n7', category: 'Nursing', subcategory: 'Pharmacology',
    question: 'Which drug is a first-line treatment for hypertension?',
    option_a: 'Metoprolol', option_b: 'Hydrochlorothiazide',
    option_c: 'Lisinopril', option_d: 'Amlodipine',
    correct_answer: 'c', explanation: 'ACE inhibitors like lisinopril are first-line for hypertension.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'n8', category: 'Nursing', subcategory: 'Pharmacology',
    question: 'What is the mechanism of action of metformin?',
    option_a: 'Increases insulin secretion', option_b: 'Decreases hepatic glucose production',
    option_c: 'Blocks glucose absorption', option_d: 'Increases insulin sensitivity',
    correct_answer: 'b', explanation: 'Metformin decreases hepatic glucose production.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'n9', category: 'Nursing', subcategory: 'Pediatric Nursing',
    question: 'What is the normal heart rate for a newborn?',
    option_a: '60-100 bpm', option_b: '100-160 bpm',
    option_c: '120-180 bpm', option_d: '80-120 bpm',
    correct_answer: 'b', explanation: 'Normal newborn heart rate is 100-160 bpm.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n10', category: 'Nursing', subcategory: 'Pediatric Nursing',
    question: 'Which vaccine is given at birth?',
    option_a: 'MMR', option_b: 'BCG',
    option_c: 'DPT', option_d: 'Polio (IPV)',
    correct_answer: 'b', explanation: 'BCG vaccine is given at birth to prevent tuberculosis.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n11', category: 'Nursing', subcategory: 'Community Nursing',
    question: 'What is the goal of primary health care?',
    option_a: 'Treat all diseases', option_b: 'Health for all',
    option_c: 'Build hospitals', option_d: 'Train doctors',
    correct_answer: 'b', explanation: 'Primary health care aims for "Health for All".',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n12', category: 'Nursing', subcategory: 'Community Nursing',
    question: 'Which disease is targeted for eradication by WHO?',
    option_a: 'Tuberculosis', option_b: 'Polio',
    option_c: 'Malaria', option_d: 'HIV/AIDS',
    correct_answer: 'b', explanation: 'Polio is targeted for global eradication.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n13', category: 'Nursing', subcategory: 'Obstetrics',
    question: 'What is the normal duration of pregnancy?',
    option_a: '36 weeks', option_b: '38 weeks',
    option_c: '40 weeks', option_d: '42 weeks',
    correct_answer: 'c', explanation: 'Normal pregnancy duration is 40 weeks.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n14', category: 'Nursing', subcategory: 'Obstetrics',
    question: 'Which hormone is responsible for maintaining pregnancy?',
    option_a: 'Estrogen', option_b: 'Progesterone',
    option_c: 'hCG', option_d: 'Oxytocin',
    correct_answer: 'b', explanation: 'Progesterone maintains the uterine lining during pregnancy.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'n15', category: 'Nursing', subcategory: 'Fundamentals of Nursing',
    question: 'What is the first step of the nursing process?',
    option_a: 'Planning', option_b: 'Assessment',
    option_c: 'Implementation', option_d: 'Evaluation',
    correct_answer: 'b', explanation: 'Assessment is the first step of the nursing process.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n16', category: 'Nursing', subcategory: 'Fundamentals of Nursing',
    question: 'Which temperature site is most accurate?',
    option_a: 'Oral', option_b: 'Axillary',
    option_c: 'Rectal', option_d: 'Tympanic',
    correct_answer: 'c', explanation: 'Rectal temperature is the most accurate reflection of core body temperature.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n17', category: 'Nursing', subcategory: 'Psychiatric Nursing',
    question: 'What is the most common mental disorder worldwide?',
    option_a: 'Schizophrenia', option_b: 'Depression',
    option_c: 'Bipolar disorder', option_d: 'Anxiety disorders',
    correct_answer: 'b', explanation: 'Depression is the most common mental disorder.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n18', category: 'Nursing', subcategory: 'Psychiatric Nursing',
    question: 'Which neurotransmitter is associated with depression?',
    option_a: 'Dopamine', option_b: 'Serotonin',
    option_c: 'Acetylcholine', option_d: 'GABA',
    correct_answer: 'b', explanation: 'Low serotonin levels are associated with depression.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'n19', category: 'Nursing', subcategory: 'Medical Surgical Nursing',
    question: 'What is the normal range of fasting blood glucose?',
    option_a: '3.9-6.1 mmol/L', option_b: '6.1-7.0 mmol/L',
    option_c: '7.0-11.1 mmol/L', option_d: '2.5-3.9 mmol/L',
    correct_answer: 'a', explanation: 'Normal fasting blood glucose is 3.9-6.1 mmol/L.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'n20', category: 'Nursing', subcategory: 'Medical Surgical Nursing',
    question: 'What is the most common cause of acute pancreatitis?',
    option_a: 'Hyperlipidemia', option_b: 'Alcohol consumption',
    option_c: 'Trauma', option_d: 'Infection',
    correct_answer: 'b', explanation: 'Alcohol consumption and gallstones are the most common causes.',
    difficulty: 'medium', active: true,
  },
  // Bangla
  {
    id: 'b1', category: 'Bangla', subcategory: 'Grammar',
    question: 'বাংলা ভাষার উৎপত্তি কোন ভাষা থেকে?',
    option_a: 'সংস্কৃত', option_b: 'প্রাকৃত',
    option_c: 'পালি', option_d: 'হিন্দি',
    correct_answer: 'a', explanation: 'বাংলা ভাষার উৎপত্তি সংস্কৃত ভাষা থেকে।',
    difficulty: 'easy', active: true,
  },
  {
    id: 'b2', category: 'Bangla', subcategory: 'Grammar',
    question: 'বাংলা বর্ণমালায় মোট কয়টি বর্ণ আছে?',
    option_a: '৪৪টি', option_b: '৫০টি',
    option_c: '৫২টি', option_d: '৪৮টি',
    correct_answer: 'b', explanation: 'বাংলা বর্ণমালায় মোট ৫০টি বর্ণ রয়েছে।',
    difficulty: 'easy', active: true,
  },
  {
    id: 'b3', category: 'Bangla', subcategory: 'Literature',
    question: 'বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?',
    option_a: 'মেঘনাদবধ কাব্য', option_b: 'বৈষ্ণব পদাবলী',
    option_c: 'শ্রীকৃষ্ণকীর্তন', option_d: 'চর্যাপদ',
    correct_answer: 'c', explanation: 'শ্রীকৃষ্ণকীর্তন বাংলা সাহিত্যের প্রথম মহাকাব্য।',
    difficulty: 'medium', active: true,
  },
  {
    id: 'b4', category: 'Bangla', subcategory: 'Literature',
    question: 'রবীন্দ্রনাথ ঠাকুর কত সালে নোবেল পুরস্কার পান?',
    option_a: '১৯১১', option_b: '১৯১২',
    option_c: '১৯১৩', option_d: '১৯১৪',
    correct_answer: 'c', explanation: 'রবীন্দ্রনাথ ঠাকুর ১৯১৩ সালে নোবেল পুরস্কার পান।',
    difficulty: 'easy', active: true,
  },
  {
    id: 'b5', category: 'Bangla', subcategory: 'Composition',
    question: 'রচনার মূল অংশকে কী বলে?',
    option_a: 'ভূমিকা', option_b: 'বক্তব্য',
    option_c: 'উপসংহার', option_d: 'শিরোনাম',
    correct_answer: 'b', explanation: 'রচনার মূল অংশকে বক্তব্য বা মূল আলোচনা বলে।',
    difficulty: 'easy', active: true,
  },
  // English
  {
    id: 'e1', category: 'English', subcategory: 'Grammar',
    question: 'What is the correct plural form of "child"?',
    option_a: 'Childs', option_b: 'Childes',
    option_c: 'Children', option_d: 'Children',
    correct_answer: 'c', explanation: 'The plural of "child" is "children" (irregular plural).',
    difficulty: 'easy', active: true,
  },
  {
    id: 'e2', category: 'English', subcategory: 'Grammar',
    question: 'Which sentence is grammatically correct?',
    option_a: 'He go to school', option_b: 'He goes to school',
    option_c: 'He going to school', option_d: 'He gone to school',
    correct_answer: 'b', explanation: 'With third person singular, the verb takes -s in simple present.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'e3', category: 'English', subcategory: 'Vocabulary',
    question: 'What is the meaning of "benevolent"?',
    option_a: 'Kind and generous', option_b: 'Cruel and mean',
    option_c: 'Lazy', option_d: 'Angry',
    correct_answer: 'a', explanation: '"Benevolent" means well-meaning, kind, and generous.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'e4', category: 'English', subcategory: 'Vocabulary',
    question: 'What is the meaning of "ambiguous"?',
    option_a: 'Clear', option_b: 'Having multiple meanings',
    option_c: 'Simple', option_d: 'Direct',
    correct_answer: 'b', explanation: '"Ambiguous" means open to more than one interpretation.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'e5', category: 'English', subcategory: 'Comprehension',
    question: 'Read: "The sun rises in the east and sets in the west." What does the sun do in the east?',
    option_a: 'Sets', option_b: 'Rises',
    option_c: 'Hides', option_d: 'Shines',
    correct_answer: 'b', explanation: 'The passage clearly states "The sun rises in the east."',
    difficulty: 'easy', active: true,
  },
  // General Knowledge
  {
    id: 'g1', category: 'General Knowledge', subcategory: 'Bangladesh Affairs',
    question: 'When did Bangladesh gain independence?',
    option_a: '1970', option_b: '1971',
    option_c: '1972', option_d: '1973',
    correct_answer: 'b', explanation: 'Bangladesh gained independence on December 16, 1971.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'g2', category: 'General Knowledge', subcategory: 'Bangladesh Affairs',
    question: 'Who is the Father of the Nation of Bangladesh?',
    option_a: 'Sheikh Hasina', option_b: 'Bangabandhu Sheikh Mujibur Rahman',
    option_c: 'Tajuddin Ahmad', option_d: 'Ziaur Rahman',
    correct_answer: 'b', explanation: 'Bangabandhu Sheikh Mujibur Rahman is the Father of the Nation.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'g3', category: 'General Knowledge', subcategory: 'International Affairs',
    question: 'Which is the largest country in the world by area?',
    option_a: 'China', option_b: 'USA',
    option_c: 'Russia', option_d: 'Canada',
    correct_answer: 'c', explanation: 'Russia is the largest country by area at 17.1 million sq km.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'g4', category: 'General Knowledge', subcategory: 'International Affairs',
    question: 'Which is the most populous country in the world?',
    option_a: 'China', option_b: 'India',
    option_c: 'USA', option_d: 'Indonesia',
    correct_answer: 'b', explanation: 'India is the most populous country with over 1.4 billion people.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'g5', category: 'General Knowledge', subcategory: 'Current Affairs',
    question: 'Who is the current Prime Minister of Bangladesh?',
    option_a: 'Khaleda Zia', option_b: 'Sheikh Hasina',
    option_c: 'Muhammad Yunus', option_d: 'Tajuddin Ahmad',
    correct_answer: 'b', explanation: 'Sheikh Hasina is the current Prime Minister of Bangladesh.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'g6', category: 'General Knowledge', subcategory: 'Science & Technology',
    question: 'What is the chemical symbol for water?',
    option_a: 'H2O', option_b: 'CO2',
    option_c: 'NaCl', option_d: 'O2',
    correct_answer: 'a', explanation: 'Water is H2O - two hydrogen atoms bonded to one oxygen atom.',
    difficulty: 'easy', active: true,
  },
  {
    id: 'g7', category: 'General Knowledge', subcategory: 'Science & Technology',
    question: 'What is the speed of light?',
    option_a: '300,000 km/s', option_b: '150,000 km/s',
    option_c: '500,000 km/s', option_d: '100,000 km/s',
    correct_answer: 'a', explanation: 'The speed of light in vacuum is approximately 300,000 km/s.',
    difficulty: 'medium', active: true,
  },
  {
    id: 'g8', category: 'General Knowledge', subcategory: 'Current Affairs',
    question: 'What is the current UN Secretary-General\'s name?',
    option_a: 'Ban Ki-moon', option_b: 'António Guterres',
    option_c: 'Kofi Annan', option_d: 'Boutros Boutros-Ghali',
    correct_answer: 'b', explanation: 'António Guterres is the current UN Secretary-General.',
    difficulty: 'medium', active: true,
  },
];

// Mock results for development
export const MOCK_RESULTS: MockResult[] = [
  {
    id: 'r1',
    user_id: 'mock-user',
    score: 8,
    correct: 8,
    wrong: 2,
    skipped: 0,
    percentage: 80,
    time_taken: 1200,
    exam_type: 'mock',
    created_at: new Date().toISOString(),
  },
  {
    id: 'r2',
    user_id: 'mock-user',
    score: 6,
    correct: 6,
    wrong: 3,
    skipped: 1,
    percentage: 60,
    time_taken: 1500,
    exam_type: 'daily_20',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Helper to get questions by category
export function getMockQuestionsByCategory(category: string, count: number): Question[] {
  const filtered = MOCK_QUESTIONS.filter(q => q.category === category);
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
}

// Helper to get questions by subcategory
export function getMockQuestionsBySubcategory(subcategory: string): Question[] {
  return MOCK_QUESTIONS.filter(q => q.subcategory === subcategory);
}

// Helper to get all mock questions shuffled
export function getShuffledMockQuestions(count: number): Question[] {
  return [...MOCK_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, count);
}