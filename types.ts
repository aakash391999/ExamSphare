export interface Exam {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
}

export interface SubtopicDetail {
  title: string;
  description: string;
  keyPoints: string[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  content: string;
  subtopics: string[];
  subtopicDetails?: SubtopicDetail[]; // Added for detailed view
  mindMap?: string; // Mermaid.js syntax
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Question {
  id: string;
  examId?: string; // Added for easier filtering
  topicId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  duration: number;
  isCompleted: boolean;
  type: 'Learning' | 'Practice' | 'Revision';
}


export interface QuizResult {
  id: string;
  date: string; // ISO Date string
  score: number;
  total: number;
  examId: string;
}

export interface UserState {
  uid: string;
  isAuthenticated: boolean;
  name: string;
  email: string;
  emailVerified: boolean;
  selectedExamId: string | null;
  completedTopics: string[];
  mistakes: string[];
  examSetupComplete: boolean;
  weakSubjects: string[];
  dailyTasks: StudyTask[];
  studyHours: number;
  history: QuizResult[];
  chatHistory: Record<string, ChatMessage[]>; // Mapped by topicId
  role?: 'admin' | 'student';
  isPrivate?: boolean; // New Privacy Flag

  // New Profile Fields
  bio?: string;
  avatarUrl?: string;
  followers?: string[]; // List of User UIDs
  following?: string[]; // List of User UIDs
  pendingRequests?: string[]; // List of User UIDs expecting approval
  achievements?: Achievement[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };

  stats?: {
    accuracy: number;
    points: number;
    rank: string;
    streak?: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  dateEarned: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: number;
  likes: string[]; // List of User UIDs
  commentsCount: number;
  tags?: string[];
  attachmentUrl?: string; // Image or Note link
  type: 'general' | 'note' | 'question' | 'milestone';
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: number;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  read: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
}

export interface Conversation {
  id: string;
  participants: string[]; // [uid1, uid2]
  lastMessage?: DirectMessage;
  unreadCounts: Record<string, number>; // { uid1: 0, uid2: 3 }
  updatedAt: number;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdBy?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AnalyticsData {
  subject: string;
  accuracy: number;
  questionsSolved: number;
}