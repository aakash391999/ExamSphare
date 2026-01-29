import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserState, Exam, StudyTask, Question, QuizResult, ChatMessage } from './types';
import { Layout } from './components/Layout';
const Auth = React.lazy(() => import('./pages/Auth').then(module => ({ default: module.Auth })));
const Setup = React.lazy(() => import('./pages/Setup').then(module => ({ default: module.Setup })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Syllabus = React.lazy(() => import('./pages/Syllabus').then(module => ({ default: module.Syllabus })));
const TopicDetail = React.lazy(() => import('./pages/TopicDetail').then(module => ({ default: module.TopicDetail })));
const Practice = React.lazy(() => import('./pages/Practice').then(module => ({ default: module.Practice })));
const Planner = React.lazy(() => import('./pages/Planner').then(module => ({ default: module.Planner })));
const Analytics = React.lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const MistakeBook = React.lazy(() => import('./pages/MistakeBook').then(module => ({ default: module.MistakeBook })));
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Flashcards = React.lazy(() => import('./pages/Flashcards').then(module => ({ default: module.Flashcards })));
const Admin = React.lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Community = React.lazy(() => import('./pages/Community').then(module => ({ default: module.Community })));
const Network = React.lazy(() => import('./pages/Network').then(module => ({ default: module.Network })));
const Messages = React.lazy(() => import('./pages/Messages').then(module => ({ default: module.Messages })));
const Notifications = React.lazy(() => import('./pages/Notifications').then(module => ({ default: module.Notifications })));
const CreatePost = React.lazy(() => import('./pages/CreatePost').then(module => ({ default: module.CreatePost })));
import { Button } from './components/ui/Button';
import { Key, AlertTriangle, Database, ExternalLink, Shield, Sparkles } from 'lucide-react';
import { auth, db, isFirebaseConfigured } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, getDocs, arrayUnion, updateDoc } from 'firebase/firestore';
import { Card } from './components/ui/Card';
import { Loader } from './components/ui/Loader';


interface AppContextType {
  user: UserState;
  loading: boolean;
  dataLoading: boolean;
  logout: () => void;
  completeSetup: (examId: string, weakSubjects: string[], studyHours: number) => void;
  currentExam: Exam | undefined;
  exams: Exam[]; // All available exams
  questions: Question[]; // All questions (or filtered subset)
  markTopicCompleted: (topicId: string) => void;
  addMistake: (questionId: string) => void;
  removeMistake: (questionId: string) => void;
  updateDailyTasks: (tasks: StudyTask[]) => void;
  saveQuizResult: (score: number, total: number) => void;
  refreshData: () => Promise<void>;
  updateTopicContent: (examId: string, subjectId: string, topicId: string, content: string) => Promise<void>;
  updateTopicSubtopicDetails: (examId: string, subjectId: string, topicId: string, details: any[]) => Promise<void>;
  updateTopicMindMap: (examId: string, subjectId: string, topicId: string, mindMap: string) => Promise<void>;
  updateTopicChatHistory: (topicId: string, messages: ChatMessage[]) => Promise<void>;
  addQuestions: (newQuestions: Omit<Question, 'id'>[]) => Promise<void>;
  toggleFollow: (targetUserId: string) => Promise<void>;
  theme: 'default' | 'midnight' | 'aurora' | 'rose';
  setTheme: (theme: 'default' | 'midnight' | 'aurora' | 'rose') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const initialUser: UserState = {
  uid: '',
  isAuthenticated: false,
  name: '',
  email: '',
  selectedExamId: null,
  completedTopics: [],
  mistakes: [],
  examSetupComplete: false,
  weakSubjects: [],
  dailyTasks: [],
  studyHours: 4,
  history: [],
  chatHistory: {},
  role: 'student'
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [user, setUser] = useState<UserState>(initialUser);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [theme, setThemeState] = useState<'default' | 'midnight' | 'aurora' | 'rose'>((localStorage.getItem('theme') as any) || 'default');

  const setTheme = (newTheme: 'default' | 'midnight' | 'aurora' | 'rose') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 1. Check API Key for Gemini
  useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiKeyReady(hasKey);
      } else {
        setApiKeyReady(true);
      }
    };
    checkApiKey();
  }, []);

  // 2. Fetch Global Data (Exams & Questions)
  const refreshData = async () => {
    if (!isFirebaseConfigured) return;
    setDataLoading(true);
    try {
      // Fetch Exams
      const examsSnap = await getDocs(collection(db, 'exams'));
      const examsData = examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
      setExams(examsData);

      // Fetch Questions
      const questionsSnap = await getDocs(collection(db, 'questions'));
      const questionsData = questionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      setQuestions(questionsData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      // If we can't connect, it might be a config issue or network issue
      if (error.code === 'permission-denied') {
        setConfigError(false); // It's not a config error, it's permissions
        // You might want to handle this separately, but for now we'll rely on the console log advice
        alert("Permission Denied: Please check your Firestore Security Rules in the Firebase Console.");
      } else {
        setConfigError(true);
      }
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setConfigError(true);
      return;
    }
    refreshData();
  }, []);

  // 3. Auth Listener & User Data Sync
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);

        // Listen to realtime updates on user profile
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              isAuthenticated: true,
              name: userData.name || firebaseUser.displayName || 'Student',
              email: firebaseUser.email || '',
              selectedExamId: userData.selectedExamId || null,
              completedTopics: userData.completedTopics || [],
              mistakes: userData.mistakes || [],
              examSetupComplete: !!userData.selectedExamId,
              weakSubjects: userData.weakSubjects || [],
              dailyTasks: userData.dailyTasks || [],
              studyHours: userData.studyHours || 4,
              history: userData.history || [],
              chatHistory: userData.chatHistory || {},
              role: (userData.role as 'admin' | 'student') || 'student',

              // New Fields for Social/Profile
              bio: userData.bio || '',
              avatarUrl: userData.avatarUrl || '',
              followers: userData.followers || [],
              following: userData.following || [],
              pendingRequests: userData.pendingRequests || [],
              socialLinks: userData.socialLinks || {},
              stats: userData.stats || { accuracy: 0, points: 0, rank: 'Unranked' },
              isPrivate: userData.isPrivate || false
            });
          } else {
            // New user, init profile
            const newUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Student',
              email: firebaseUser.email || '',
              selectedExamId: null,
              completedTopics: [],
              mistakes: [],
              weakSubjects: [],
              dailyTasks: [],
              studyHours: 4,
              history: [],
              chatHistory: {} as Record<string, ChatMessage[]>,
              role: 'student' as const
            };
            setDoc(userRef, newUser);
            setUser({ ...newUser, isAuthenticated: true, examSetupComplete: false });
          }
          setLoading(false);
        }, (error) => {
          console.error("Auth snapshot error:", error);
          setConfigError(true);
          setLoading(false);
        });

        return () => unsubUser();
      } else {
        setUser(initialUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Actions
  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setApiKeyReady(true);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserDoc = async (data: Partial<UserState>) => {
    if (!user.uid) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
  };

  const completeSetup = (examId: string, weakSubjects: string[], studyHours: number) => {
    updateUserDoc({ selectedExamId: examId, weakSubjects, studyHours });
  };

  const markTopicCompleted = (topicId: string) => {
    if (!user.completedTopics.includes(topicId)) {
      updateUserDoc({ completedTopics: [...user.completedTopics, topicId] });
    }
  };

  const addMistake = (questionId: string) => {
    if (!user.mistakes.includes(questionId)) {
      updateUserDoc({ mistakes: [...user.mistakes, questionId] });
    }
  };

  const removeMistake = (questionId: string) => {
    updateUserDoc({ mistakes: user.mistakes.filter(id => id !== questionId) });
  };

  const updateDailyTasks = (tasks: StudyTask[]) => {
    updateUserDoc({ dailyTasks: tasks });
  };

  const saveQuizResult = (score: number, total: number) => {
    if (!user.uid || !user.selectedExamId) return;
    const result: QuizResult = {
      id: `quiz-${Date.now()}`,
      date: new Date().toISOString(),
      score,
      total,
      examId: user.selectedExamId
    };
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, {
      history: arrayUnion(result)
    });
  };

  const updateTopicContent = async (examId: string, subjectId: string, topicId: string, content: string) => {
    try {
      const examRef = doc(db, 'exams', examId);
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;

      const updatedSubjects = exam.subjects.map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            topics: sub.topics.map(t => {
              if (t.id === topicId) {
                return { ...t, content };
              }
              return t;
            })
          };
        }
        return sub;
      });

      await updateDoc(examRef, { subjects: updatedSubjects });
      await refreshData();
    } catch (err) {
      console.error("Error updating topic content:", err);
    }
  };

  const updateTopicSubtopicDetails = async (examId: string, subjectId: string, topicId: string, subtopicDetails: any[]) => {
    try {
      const examRef = doc(db, 'exams', examId);
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;

      const updatedSubjects = exam.subjects.map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            topics: sub.topics.map(t => {
              if (t.id === topicId) {
                return { ...t, subtopicDetails };
              }
              return t;
            })
          };
        }
        return sub;
      });

      await updateDoc(examRef, { subjects: updatedSubjects });
      await refreshData();
    } catch (err) {
      console.error("Error updating topic subtopic details:", err);
    }
  };

  const updateTopicMindMap = async (examId: string, subjectId: string, topicId: string, mindMap: string) => {
    try {
      const examRef = doc(db, 'exams', examId);
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;

      const updatedSubjects = exam.subjects.map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            topics: sub.topics.map(t => {
              if (t.id === topicId) {
                return { ...t, mindMap };
              }
              return t;
            })
          };
        }
        return sub;
      });

      await updateDoc(examRef, { subjects: updatedSubjects });
      await refreshData();
    } catch (err) {
      console.error("Error updating topic mind map:", err);
    }
  };

  const updateTopicChatHistory = async (topicId: string, messages: ChatMessage[]) => {
    if (!user.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedChatHistory = { ...user.chatHistory, [topicId]: messages };

      // We update the local state optimistically or wait for the snapshot
      // But for chat, local state update is often handled by the component.
      // Here we just persist to firebase.
      await updateDoc(userRef, {
        [`chatHistory.${topicId}`]: messages
      });
      // Note: dot notation update requires the map field "chatHistory" to exist. 
      // If it doesn't, we might need setDoc with merge or ensure init.
      // Since we init it in initialUser/auth listener, it should be fine.

    } catch (err) {
      console.error("Error updating chat history:", err);
    }
  };

  const addQuestions = async (newQuestions: Omit<Question, 'id'>[]) => {
    try {
      const promises = newQuestions.map(q => {
        const newRef = doc(collection(db, 'questions'));
        return setDoc(newRef, { ...q, id: newRef.id });
      });
      await Promise.all(promises);
      await refreshData();
    } catch (err) {
      console.error("Error adding generated questions:", err);
    }
  };

  const toggleFollow = async (targetUserId: string) => {
    if (!user.uid) return;

    // 1. Optimistic Update
    const isFollowing = user.following?.includes(targetUserId);
    const newFollowing = isFollowing
      ? user.following.filter(id => id !== targetUserId)
      : [...(user.following || []), targetUserId];

    setUser(prev => ({ ...prev, following: newFollowing }));

    // 2. Firestore Update
    try {
      const currentUserRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      if (isFollowing) {
        // Unfollow
        await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
        await updateDoc(targetUserRef, { followers: arrayRemove(user.uid) });
      } else {
        // Follow
        await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
        await updateDoc(targetUserRef, { followers: arrayUnion(user.uid) });

        // Notification (only on follow)
        await addDoc(collection(db, 'notifications'), {
          type: 'connection_request',
          recipientId: targetUserId,
          senderId: user.uid,
          senderName: user.name,
          senderAvatar: user.avatarUrl || '',
          read: false,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      // Rollback on error
      setUser(prev => ({ ...prev, following: user.following })); // Revert to original
    }
  };

  const currentExam = exams.find(e => e.id === user.selectedExamId);

  // --- ERROR SCREEN FOR FIREBASE CONFIG ---
  if (configError || !isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 md:p-10 font-sans">
        <div className="glass-card max-w-2xl w-full p-10 md:p-14 border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] bg-white/80">
          <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <Database className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Connectivity Required</h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
            The platform's neural core cannot established a secure connection to the database. Please verify your <span className="text-slate-900 font-bold">Firebase Configuration</span>.
          </p>

          <div className="bg-slate-900 p-8 rounded-[2rem] text-left text-sm font-mono mb-10 overflow-x-auto shadow-2xl">
            <p className="text-slate-500 mb-3 ml-1 uppercase tracking-widest text-[10px] font-black underline decoration-brand-primary decoration-2 underline-offset-4">services/firebase.ts</p>
            <div className="space-y-1">
              <p className="text-emerald-400"><span className="text-slate-500">apiKey:</span> "VALID_API_KEY_REQUIRED",</p>
              <p className="text-emerald-400"><span className="text-slate-500">projectId:</span> "your-project-id",</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start text-left p-6 bg-brand-primary/5 rounded-[1.5rem] border border-brand-primary/10">
              <Shield className="w-6 h-6 text-brand-primary mr-4 shrink-0 mt-0.5" />
              <div className="text-sm text-brand-primary font-bold leading-relaxed">
                Critical Alert: Replace the placeholder configuration object in your source files to activate the synchronization engine.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xl"
              >
                Console <ExternalLink className="ml-2 w-4 h-4" />
              </a>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 premium-btn px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-widest active:scale-95"
              >
                Retry Auth
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- API KEY SCREEN ---
  if (!apiKeyReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-12 text-center border-none shadow-2xl bg-white/70">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 text-brand-primary">
            <Sparkles size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Neural Core<br />Authentication</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Initialize the Google Artificial Intelligence layer to enable smart tutoring.</p>
          <button
            onClick={handleSelectKey}
            className="premium-btn w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95"
          >
            Connect AI <Key size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <Loader
      message="Synchronizing Core"
      subtext="Establishing secure connection to ExamSphere Cloud"
      type="shield"
    />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{
        user, loading, dataLoading, logout, completeSetup, currentExam, exams, questions,
        markTopicCompleted, addMistake, removeMistake, updateDailyTasks, saveQuizResult, refreshData,
        updateTopicContent, updateTopicSubtopicDetails, updateTopicMindMap, updateTopicChatHistory, addQuestions, toggleFollow, theme, setTheme
      }}>
        <HashRouter>
          <React.Suspense fallback={<Loader message="Loading App..." type="sparkle" />}>
            <Routes>
              <Route path="/auth" element={!user.isAuthenticated ? <Auth /> : <Navigate to="/" />} />
              <Route path="/" element={user.isAuthenticated ? (
                user.examSetupComplete ? <Layout><Dashboard /></Layout> : <Navigate to="/setup" />
              ) : <Navigate to="/auth" />} />
              <Route path="/setup" element={user.isAuthenticated && !user.examSetupComplete ? <Setup /> : <Navigate to="/" />} />
              <Route path="/syllabus" element={<ProtectedRoute><Layout><Syllabus /></Layout></ProtectedRoute>} />
              <Route path="/topic/:topicId" element={<ProtectedRoute><Layout><TopicDetail /></Layout></ProtectedRoute>} />
              <Route path="/practice" element={<ProtectedRoute><Layout><Practice /></Layout></ProtectedRoute>} />
              <Route path="/planner" element={<ProtectedRoute><Layout><Planner /></Layout></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
              <Route path="/mistakes" element={<ProtectedRoute><Layout><MistakeBook /></Layout></ProtectedRoute>} />
              <Route path="/mistakes" element={<ProtectedRoute><Layout><MistakeBook /></Layout></ProtectedRoute>} />
              <Route path="/flashcards/:topicId" element={<ProtectedRoute><Layout><Flashcards /></Layout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />



              // ... inside Routes
              {/* Social Features */}
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute><Layout><CreatePost /></Layout></ProtectedRoute>} />
              <Route path="/network" element={<ProtectedRoute><Layout><Network /></Layout></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />

              <Route path="/admin" element={<AdminOnlyRoute><Layout><Admin /></Layout></AdminOnlyRoute>} />
            </Routes>
          </React.Suspense>
        </HashRouter>
      </AppContext.Provider>
    </QueryClientProvider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();
  if (!user.isAuthenticated) return <Navigate to="/auth" />;
  if (!user.examSetupComplete) return <Navigate to="/setup" />;
  return children;
};

const AuthOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();
  if (!user.isAuthenticated) return <Navigate to="/auth" />;
  return children;
};

const AdminOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();
  if (!user.isAuthenticated) return <Navigate to="/auth" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

export default App;