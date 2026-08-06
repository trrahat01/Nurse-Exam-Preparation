export type Difficulty = 'easy' | 'medium' | 'hard';
export type AnswerOption = 'a' | 'b' | 'c' | 'd';
export type ExamType = 'mock' | 'daily_20' | 'daily_50' | 'daily_100' | 'challenge' | 'practice';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  questionCount?: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  question_count: number;
  order_index: number;
}

export interface Question {
  id: string;
  category: string;
  subcategory: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: AnswerOption;
  explanation: string;
  difficulty: Difficulty;
  reference?: string;
  active: boolean;
  created_at?: string;
}

export interface MockResult {
  id: string;
  user_id: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
  time_taken: number;
  exam_type: ExamType;
  created_at: string;
}

export interface UserAnswer {
  question_id: string;
  selected_answer: AnswerOption | null;
  correct_answer: AnswerOption;
  is_correct: boolean;
}

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
  question?: Question;
}

export interface ExamSession {
  examType: ExamType;
  questions: Question[];
  answers: Record<string, AnswerOption | null>;
  markedForReview: string[];
  timeLimit: number;
}

export interface ExamResult {
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
  timeTaken: number;
  passed: boolean;
  examType: ExamType;
  answers: Record<string, AnswerOption | null>;
  questions: Question[];
}

export interface CategoryConfig {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  chapters: string[];
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Nursing: {
    name: 'Nursing',
    icon: 'medical-bag',
    color: '#0891B2',
    bgColor: '#E0F2FE',
    description: 'Nursing Science & Clinical Practice',
    chapters: [
      'Medical Surgical Nursing', 'Anatomy', 'Physiology', 'Pharmacology',
      'Pediatric Nursing', 'Community Nursing', 'Obstetrics', 'Gynecology',
      'Microbiology', 'Pathology', 'Nutrition', 'Infection Control',
      'ICU', 'Emergency Nursing', 'Psychiatric Nursing',
      'Fundamentals of Nursing', 'Ethics', 'Nursing Procedures',
    ],
  },
  Bangla: {
    name: 'Bangla',
    icon: 'alphabetical',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    description: 'Bangla Language & Literature',
    chapters: ['Grammar', 'Literature', 'Composition', 'Comprehension'],
  },
  English: {
    name: 'English',
    icon: 'book-open-variant',
    color: '#059669',
    bgColor: '#D1FAE5',
    description: 'English Language & Grammar',
    chapters: ['Grammar', 'Vocabulary', 'Comprehension', 'Composition', 'Synonyms & Antonyms'],
  },
  'General Knowledge': {
    name: 'General Knowledge',
    icon: 'earth',
    color: '#D97706',
    bgColor: '#FEF3C7',
    description: 'GK, Current Affairs & Bangladesh Affairs',
    chapters: ['Bangladesh Affairs', 'International Affairs', 'Current Affairs', 'Science & Technology', 'History', 'Geography'],
  },
};

export const MOCK_DISTRIBUTION = {
  Nursing: 60,
  'General Knowledge': 15,
  English: 15,
  Bangla: 10,
};
