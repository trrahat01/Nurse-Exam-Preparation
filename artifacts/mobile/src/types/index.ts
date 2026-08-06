export type Difficulty = 'easy' | 'medium' | 'hard';
export type AnswerOption = 'a' | 'b' | 'c' | 'd';
export type ExamType = 'mock' | 'daily_20' | 'daily_50' | 'daily_100' | 'challenge' | 'practice';
export type Language = 'english' | 'bangla' | 'mixed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  bg_color: string;
  description: string;
  order_index: number;
  question_count?: number;
}

export interface Subject {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  order_index: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  question_count: number;
  order_index: number;
  created_at?: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  order_index: number;
  question_count: number;
}

export interface Question {
  id: string;
  category: string;
  exam_type?: string;
  subject?: string;
  subcategory?: string;
  chapter?: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: AnswerOption;
  explanation: string;
  memory_tip?: string;
  solution_step?: string;
  formula?: string;
  difficulty: Difficulty;
  importance: number;
  tags: string[];
  language: Language;
  verified: boolean;
  active: boolean;
  created_at?: string;
}

export interface MockResult {
  id: string;
  user_id: string;
  exam_type: string;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
  time_taken: number;
  total_questions: number;
  category_breakdown?: Record<string, { correct: number; wrong: number; skipped: number }>;
  created_at: string;
}

export interface UserAnswer {
  id: string;
  exam_id: string;
  user_id: string;
  question_id: string;
  selected_answer: AnswerOption | null;
  correct_answer: AnswerOption;
  is_correct: boolean;
  time_spent?: number;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  note?: string;
  created_at: string;
  question?: Question;
}

export interface WrongAnswer {
  id: string;
  user_id: string;
  question_id: string;
  wrong_count: number;
  last_wrong_at: string;
  question?: Question;
}

export interface ExamSession {
  examType: ExamType;
  questions: Question[];
  answers: Record<string, AnswerOption | null>;
  markedForReview: string[];
  currentIndex: number;
  timeLeft: number;
  isRunning: boolean;
  startTime: number;
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
  categoryBreakdown?: Record<string, { correct: number; wrong: number; skipped: number }>;
}

export interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  exam_target?: string;
  district?: string;
  study_streak: number;
  last_study_date?: string;
}

export interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  last_study_date?: string;
  total_study_days: number;
}

export interface UserPerformance {
  subject: string;
  total_questions: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

export const MOCK_DISTRIBUTION: Record<string, number> = {
  Nursing: 60,
  'General Knowledge': 15,
  English: 15,
  Bangla: 10,
};

export const CATEGORY_CONFIG: Record<string, { name: string; icon: string; color: string; bgColor: string; description: string; chapters: string[] }> = {
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
      'Drug Calculation', 'Research', 'Leadership', 'Hospital Management',
    ],
  },
  Bangla: {
    name: 'Bangla',
    icon: 'alphabetical',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    description: 'Bangla Language & Literature',
    chapters: ['Grammar', 'Literature', 'Vocabulary', 'Idioms', 'One Word', 'Authors', 'Books', 'Synonyms', 'Antonyms'],
  },
  English: {
    name: 'English',
    icon: 'book-open-variant',
    color: '#059669',
    bgColor: '#D1FAE5',
    description: 'English Language & Grammar',
    chapters: ['Grammar', 'Vocabulary', 'Sentence Correction', 'Articles', 'Voice', 'Narration', 'Synonyms', 'Antonyms', 'Reading', 'Idioms'],
  },
  'General Knowledge': {
    name: 'General Knowledge',
    icon: 'earth',
    color: '#D97706',
    bgColor: '#FEF3C7',
    description: 'GK, Current Affairs & Bangladesh Affairs',
    chapters: ['Bangladesh Affairs', 'Liberation War', 'Constitution', 'International Affairs', 'ICT', 'Science', 'Geography', 'Organizations', 'Current Affairs', 'Economics', 'Health Programs'],
  },
  Math: {
    name: 'Math',
    icon: 'calculator',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    description: 'Mathematics & Drug Calculation',
    chapters: ['Percentage', 'Ratio', 'Profit Loss', 'Average', 'Simple Interest', 'Time Work', 'Time Distance', 'Age', 'LCM', 'HCF', 'Drug Calculation'],
  },
};
