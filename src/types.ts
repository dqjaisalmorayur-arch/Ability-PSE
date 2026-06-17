export interface StudentProgress {
  attendance: number;
  studyStreak: number;
  quizHistoryCount: number;
  mockTestCount: number;
  rank: number;
  points: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  progress: StudentProgress;
  createdAt: string;
  quizHistory: QuizAttempt[];
  mockTestHistory: MockTestAttempt[];
  bookmarkedNotes: string[]; // notes/topics ids or titles
}

export interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface MockTestAttempt {
  id: string;
  testTitle: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercentage: number;
  negativeMarks: number;
  timeSpentSeconds: number;
  date: string;
}

export interface CurrentAffairsItem {
  id: string;
  category: 'kerala' | 'india' | 'world' | 'science' | 'environment' | 'sports' | 'awards' | 'schemes' | 'economy';
  title: string;
  summary: string;
  date: string;
}

export interface Question {
  id: string;
  text: string; // support english/malayalam
  options: string[]; // four options
  correctAnswer: number; // 0 to 3
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  source: 'youtube' | 'manual';
  sourceUrl?: string;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'ml' | 'en' | 'both';
  createdAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'audio' | 'video' | 'text';
  url: string; // file link or mock link
  category: string;
  description?: string;
  createdAt: string;
  bookmarksCount?: number;
}

export interface MalayalamDateInfo {
  malayalamDate: string;
  englishDate: string;
  nakshatram: string;
  thithi: string;
  importantDay: string;
  keralaEvent: string;
  govObservance: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface TopicStudyNote {
  topic: string;
  explanation: string;
  detailedNotes: string;
  importantFacts: string[];
  examples: string[];
  memoryTechniques: string[];
  previousQuestions: { question: string; answer: string; year?: string }[];
  oneLiners: string[];
  revisionNotes: string;
  practiceQuestions: Question[];
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: number;
  streak: number;
}

export interface CreatorQuiz {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  language: 'ml' | 'en' | 'both';
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionType: 'mcq' | 'boolean' | 'fill' | 'mixed';
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  isCertificateEnabled: boolean;
  participantCount?: number;
}

export interface SharedQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentName: string;
  studentPhone?: string | null;
  studentDistrict?: string | null;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  completedAt: string;
  timeSpentSeconds: number;
  certificateId?: string;
}

export interface MyLearningCertificate {
  id: string;
  studentName: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  date: string;
  organization: string;
}

