import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, Layers, FileText, Check, Database, Trash2, ArrowRight, RefreshCw, ChevronDown, ChevronUp, Search, Shield, Sparkles, X, BookOpen, Settings, Users, MessageSquare, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { db } from '../services/firebase';
import { addDoc, collection, doc, updateDoc, arrayUnion, deleteDoc, query, limit, getDocs } from 'firebase/firestore';
import { Subject, Topic } from '../types';
import { seedDatabase } from '../services/seedService';

import { AIGenerator } from '../components/admin/AIGenerator';

export const Admin: React.FC = () => {
  const { user, exams, questions, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState<'create-exam' | 'create-structure' | 'add-question' | 'manage' | 'ai-studio' | 'users' | 'content'>('ai-studio');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. New Exam Form
  const [newExamName, setNewExamName] = useState('');
  const [newExamDesc, setNewExamDesc] = useState('');

  // 2. Structure Form
  const [targetExamId, setTargetExamId] = useState('');
  const [structureType, setStructureType] = useState<'subject' | 'topic'>('subject');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicSubtopics, setNewTopicSubtopics] = useState(''); // Comma separated

  // 3. Question Form
  const [qExamId, setQExamId] = useState('');
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTopicId, setQTopicId] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplanation, setQExplanation] = useState('');

  // 4. Manage Data State
  const [manageType, setManageType] = useState<'exams' | 'questions'>('exams');
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 5. User & Content Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminPosts, setAdminPosts] = useState<any[]>([]);

  // --- Helpers ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), limit(50));
      const snap = await getDocs(q);
      setAdminUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    } catch (err) { alert('Error fetching users'); }
    setLoading(false);
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'posts'), limit(50));
      const snap = await getDocs(q);
      setAdminPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { alert('Error fetching content'); }
    setLoading(false);
  };

  const handleUpdateRole = async (targetUid: string, newRole: 'student' | 'admin') => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, 'users', targetUid), { role: newRole });
      showSuccess('User role updated');
      fetchUsers();
    } catch (err) { alert('Error updating role'); }
  };

  const handleDeleteUser = async (targetUid: string) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await deleteDoc(doc(db, 'users', targetUid));
      showSuccess('User deleted');
      fetchUsers();
    } catch (err) { alert('Error deleting user'); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      showSuccess('Post deleted');
      fetchContent();
    } catch (err) { alert('Error deleting post'); }
  };
  const getSubjects = (examId: string) => exams.find(e => e.id === examId)?.subjects || [];
  const getTopics = (examId: string, subId: string) => getSubjects(examId).find(s => s.id === subId)?.topics || [];

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Filter questions based on search
  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- Handlers: SEED ---
  const handleSeedData = async () => {
    if (!window.confirm("This will overwrite/add sample data to your Firestore. Continue?")) return;
    setLoading(true);
    try {
      await seedDatabase();
      showSuccess('Sample data seeded successfully!');
      await refreshData();
    } catch (err) {
      alert('Error seeding data: ' + err);
    }
    setLoading(false);
  };

  // --- Handlers: CREATE ---
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'exams'), {
        name: newExamName,
        description: newExamDesc,
        subjects: []
      });
      showSuccess('Exam created successfully!');
      setNewExamName(''); setNewExamDesc('');
      await refreshData();
    } catch (err) { alert('Error creating exam'); }
    setLoading(false);
  };

  const handleAddStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const examRef = doc(db, 'exams', targetExamId);
      const exam = exams.find(e => e.id === targetExamId);
      if (!exam) return;

      if (structureType === 'subject') {
        const newSubject: Subject = {
          id: `sub-${Date.now()}`,
          name: newSubjectName,
          icon: 'BookOpen',
          topics: []
        };
        await updateDoc(examRef, { subjects: arrayUnion(newSubject) });
        showSuccess('Subject added successfully!');
      } else {
        const updatedSubjects = exam.subjects.map(sub => {
          if (sub.id === targetSubjectId) {
            return {
              ...sub,
              topics: [...sub.topics, {
                id: `topic-${Date.now()}`,
                name: newTopicName,
                description: newTopicDesc,
                content: newTopicContent,
                subtopics: newTopicSubtopics.split(',').map(s => s.trim()).filter(Boolean),
                difficulty: 'Medium'
              } as Topic]
            };
          }
          return sub;
        });
        await updateDoc(examRef, { subjects: updatedSubjects });
        showSuccess('Topic added successfully!');
      }
      setNewSubjectName(''); setNewTopicName(''); setNewTopicDesc(''); setNewTopicContent(''); setNewTopicSubtopics('');
      await refreshData();
    } catch (err) { alert('Error updating structure: ' + err); }
    setLoading(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'questions'), {
        examId: qExamId,
        topicId: qTopicId,
        text: qText,
        options: qOptions,
        correctIndex: qCorrect,
        explanation: qExplanation
      });
      showSuccess('Question added successfully!');
      setQText(''); setQExplanation(''); setQOptions(['', '', '', '']);
      await refreshData();
    } catch (err) { alert('Error adding question'); }
    setLoading(false);
  };

  // --- Handlers: DELETE ---
  const handleDeleteExam = async (id: string) => {
    if (!window.confirm("Are you sure? This will delete the Exam and all its subjects/topics.")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'exams', id));
      showSuccess('Exam deleted.');
      await refreshData();
    } catch (err) { alert('Error deleting exam'); }
    setLoading(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Delete this question?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'questions', id));
      showSuccess('Question deleted.');
      await refreshData();
    } catch (err) { alert('Error deleting question'); }
    setLoading(false);
  };

  const handleDeleteSubject = async (examId: string, subjectId: string) => {
    if (!window.confirm("Delete this subject and all its topics?")) return;
    setLoading(true);
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      const updatedSubjects = exam.subjects.filter(s => s.id !== subjectId);
      await updateDoc(doc(db, 'exams', examId), { subjects: updatedSubjects });
      showSuccess('Subject deleted');
      refreshData();
    } catch (err) { alert('Error deleting subject'); }
    setLoading(false);
  };

  const handleDeleteTopic = async (examId: string, subjectId: string, topicId: string) => {
    if (!window.confirm("Delete this topic?")) return;
    setLoading(true);
    try {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return;
      const updatedSubjects = exam.subjects.map(sub => {
        if (sub.id === subjectId) {
          return { ...sub, topics: sub.topics.filter(t => t.id !== topicId) };
        }
        return sub;
      });
      await updateDoc(doc(db, 'exams', examId), { subjects: updatedSubjects });
      showSuccess('Topic deleted');
      refreshData();
    } catch (err) { alert('Error deleting topic'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 pb-20 pt-6 px-4 md:px-6">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-primary/5 via-purple-400/5 to-transparent rounded-full blur-[120px] -mr-60 -mt-60 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-brand-accent/5 via-pink-400/5 to-transparent rounded-full blur-[100px] -ml-40 -mb-40 opacity-60"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-xl shadow-lg">
                  <Shield size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  System Administration
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Command Center
              </h1>
              <p className="text-slate-600 font-medium max-w-2xl">
                Orchestrating the next generation of academic excellence through intelligent content management.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSeedData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 font-semibold rounded-xl hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-slate-200"
              >
                <Database size={18} />
                Initialize Base
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/20"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Synchronize Data
              </button>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Active Exams</p>
                  <p className="text-2xl font-bold text-slate-900">{exams.length}</p>
                </div>
                <div className="p-3 bg-brand-primary/10 rounded-xl">
                  <BookOpen size={20} className="text-brand-primary" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Questions</p>
                  <p className="text-2xl font-bold text-slate-900">{questions.length}</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                  <FileText size={20} className="text-indigo-500" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">AI Features</p>
                  <p className="text-2xl font-bold text-slate-900">Active</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Sparkles size={20} className="text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-1.5 rounded-2xl border border-slate-200 mb-8">
            <div className="flex overflow-x-auto no-scrollbar">
              {[
                { id: 'ai-studio', label: 'AI Studio', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
                { id: 'create-exam', label: 'Create Exam', icon: Plus, color: 'from-brand-primary to-brand-accent' },
                { id: 'create-structure', label: 'Syllabus', icon: Layers, color: 'from-amber-500 to-orange-500' },
                { id: 'add-question', label: 'Questions', icon: FileText, color: 'from-indigo-500 to-blue-500' },
                { id: 'users', label: 'Users', icon: Users, color: 'from-emerald-500 to-teal-500' },
                { id: 'content', label: 'Moderation', icon: MessageSquare, color: 'from-rose-500 to-red-500' },
                { id: 'manage', label: 'Manage', icon: Settings, color: 'from-slate-700 to-slate-600' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap relative group ${activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}></div>
                  )}
                  <div className={`relative z-10 flex items-center gap-3 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`}>
                    <tab.icon size={18} />
                    {tab.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-8 animate-fade-in-down">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Check size={20} />
                </div>
                <div>
                  <p className="font-semibold">{message}</p>
                  <p className="text-sm text-emerald-100/80 opacity-90">Operation completed successfully</p>
                </div>
              </div>
              <button
                onClick={() => setMessage('')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'ai-studio' && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-2">
                <AIGenerator onSuccess={() => showSuccess('Intelligence layer updated successfully.')} />
              </div>
            </div>
          )}

          {/* 1. Create Exam Tab */}
          {activeTab === 'create-exam' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                  <div className="p-4 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-2xl">
                    <Plus size={28} className="text-brand-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Create New Exam</h2>
                    <p className="text-slate-600 font-medium">Define the core metadata for a new assessment</p>
                  </div>
                </div>

                <form onSubmit={handleCreateExam} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Exam Name</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        required
                        value={newExamName}
                        onChange={e => setNewExamName(e.target.value)}
                        placeholder="e.g., UPSC Prelims 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Description</label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 min-h-[120px]"
                        required
                        value={newExamDesc}
                        onChange={e => setNewExamDesc(e.target.value)}
                        placeholder="Brief overview of the exam's purpose and scope..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !newExamName.trim()}
                    className="w-full py-4 px-6 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    Register Exam
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. Create Structure Tab */}
          {activeTab === 'create-structure' && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-2xl">
                  <Layers size={28} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Manage Syllabus Structure</h2>
                  <p className="text-slate-600 font-medium">Connect subjects and topics to your exam blueprints</p>
                </div>
              </div>

              <form onSubmit={handleAddStructure} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Target Exam</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-slate-900 appearance-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all cursor-pointer"
                      value={targetExamId}
                      onChange={e => setTargetExamId(e.target.value)}
                      required
                    >
                      <option value="">Select an exam...</option>
                      {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Structure Type</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-slate-900 appearance-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all cursor-pointer"
                      value={structureType}
                      onChange={e => setStructureType(e.target.value as any)}
                    >
                      <option value="subject">Add New Subject</option>
                      <option value="topic">Add New Topic</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
                  {structureType === 'subject' ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Subject Name</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-slate-900 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                          required
                          value={newSubjectName}
                          onChange={e => setNewSubjectName(e.target.value)}
                          placeholder="e.g., Behavioral Economics"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">Parent Subject</label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-slate-900 appearance-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                            value={targetSubjectId}
                            onChange={e => setTargetSubjectId(e.target.value)}
                            required
                          >
                            <option value="">Select subject...</option>
                            {getSubjects(targetExamId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">Topic Name</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-slate-900 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                            required
                            value={newTopicName}
                            onChange={e => setNewTopicName(e.target.value)}
                            placeholder="e.g., Game Theory Dynamics"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Description</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-slate-600 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                          required
                          value={newTopicDesc}
                          onChange={e => setNewTopicDesc(e.target.value)}
                          placeholder="Detailed mental model of strategic interactions..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Subtopics <span className="text-slate-400 font-normal">(comma separated)</span></label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 font-medium text-slate-600 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                          value={newTopicSubtopics}
                          onChange={e => setNewTopicSubtopics(e.target.value)}
                          placeholder="Nash Equilibrium, Zero-Sum, Cooperative..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Content <span className="text-slate-400 font-normal">(Markdown supported)</span></label>
                        <textarea
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-700 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all min-h-[200px]"
                          required
                          value={newTopicContent}
                          onChange={e => setNewTopicContent(e.target.value)}
                          placeholder="# Introduction to..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!targetExamId || loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {structureType === 'subject' ? 'Add Subject' : 'Add Topic'}
                  <Check size={18} />
                </button>
              </form>
            </div>
          )}

          {/* 3. Add Question Tab */}
          {activeTab === 'add-question' && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-2xl">
                  <FileText size={28} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Add New Question</h2>
                  <p className="text-slate-600 font-medium">Add assessment items to the question bank</p>
                </div>
              </div>

              <form onSubmit={handleAddQuestion} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Exam</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-slate-900 appearance-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                      value={qExamId}
                      onChange={e => setQExamId(e.target.value)}
                      required
                    >
                      <option value="">Select exam...</option>
                      {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Subject</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-slate-900 appearance-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                      value={qSubjectId}
                      onChange={e => setQSubjectId(e.target.value)}
                      required
                    >
                      <option value="">Select subject...</option>
                      {getSubjects(qExamId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Topic</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-slate-900 appearance-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                      value={qTopicId}
                      onChange={e => setQTopicId(e.target.value)}
                      required
                    >
                      <option value="">Select topic...</option>
                      {getTopics(qExamId, qSubjectId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Question</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-slate-900 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all min-h-[120px]"
                    placeholder="Enter the question text..."
                    required
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  <label className="block text-sm font-semibold text-slate-700">Answer Options</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {qOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-4 items-center p-4 rounded-xl border-2 transition-all duration-300 ${qCorrect === idx
                          ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-indigo-50/50 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                      >
                        <input
                          type="radio"
                          name="correct"
                          checked={qCorrect === idx}
                          onChange={() => setQCorrect(idx)}
                          className="w-5 h-5 text-indigo-500 cursor-pointer shrink-0"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-mono text-sm font-bold text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                          <input
                            type="text"
                            className="flex-1 bg-transparent border-none p-0 focus:ring-0 font-medium text-slate-900 text-sm placeholder:text-slate-400"
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            required
                            value={opt}
                            onChange={e => {
                              const newOps = [...qOptions];
                              newOps[idx] = e.target.value;
                              setQOptions(newOps);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Explanation</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-slate-700 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all min-h-[100px]"
                    placeholder="Explain why the answer is correct..."
                    required
                    value={qExplanation}
                    onChange={e => setQExplanation(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!qTopicId || loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  Publish Question
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* 4. Manage Data Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
                  <button
                    onClick={() => setManageType('exams')}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${manageType === 'exams'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Exam Registry
                  </button>
                  <button
                    onClick={() => setManageType('questions')}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${manageType === 'questions'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Question Vault
                  </button>
                </div>

                {manageType === 'questions' && (
                  <div className="relative w-full md:w-auto">
                    <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-80 bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {manageType === 'exams' ? (
                <div className="space-y-6">
                  {exams.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen size={32} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No exams found</h3>
                      <p className="text-slate-500 font-medium">Create your first exam to get started</p>
                    </div>
                  ) : (
                    exams.map(exam => (
                      <div key={exam.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="p-6 md:p-8">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1">
                              <button
                                onClick={() => setExpandedExamId(expandedExamId === exam.id ? null : exam.id)}
                                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${expandedExamId === exam.id
                                  ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                              >
                                {expandedExamId === exam.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{exam.name}</h3>
                                <p className="text-slate-600 font-medium">{exam.description}</p>
                                <div className="flex items-center gap-4 mt-4">
                                  <span className="text-sm text-slate-500 font-medium">
                                    {exam.subjects.length} subjects • {exam.subjects.reduce((acc, sub) => acc + sub.topics.length, 0)} topics
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="px-5 py-3 bg-gradient-to-r from-rose-50 to-rose-50/50 text-rose-600 font-semibold rounded-xl hover:from-rose-100 hover:to-rose-100/50 transition-all duration-300 hover:shadow-sm flex items-center gap-2"
                            >
                              <Trash2 size={18} />
                              Delete
                            </button>
                          </div>
                        </div>

                        {expandedExamId === exam.id && (
                          <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white p-6 md:p-8 animate-fade-in">
                            <h4 className="text-lg font-semibold text-slate-900 mb-6">Syllabus Structure</h4>
                            {exam.subjects.length === 0 ? (
                              <p className="text-slate-500 text-center py-8 font-medium">No subjects added yet</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exam.subjects.map(sub => (
                                  <div key={sub.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-lg">
                                          <Layers size={16} className="text-brand-primary" />
                                        </div>
                                        <h5 className="font-semibold text-slate-900">{sub.name}</h5>
                                      </div>
                                      <button onClick={() => handleDeleteSubject(exam.id, sub.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="space-y-2">
                                      {sub.topics.map(topic => (
                                        <div key={topic.id} className="flex items-center justify-between group py-1">
                                          <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                                            • {topic.name}
                                          </span>
                                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteTopic(exam.id, sub.id, topic.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Question Vault</h3>
                        <p className="text-slate-600 font-medium">
                          {filteredQuestions.length} of {questions.length} questions
                          {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                      </div>
                    </div>

                    {filteredQuestions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FileText size={24} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">
                          {searchQuery ? 'No questions match your search' : 'No questions found'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredQuestions.map(q => (
                          <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge variant="brand" className="text-xs">
                                    Question
                                  </Badge>
                                  <span className="text-xs text-slate-500 font-medium">ID: {q.id.slice(0, 8)}...</span>
                                </div>
                                <p className="text-lg font-semibold text-slate-900 mb-4 leading-relaxed">{q.text}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                  {q.options.map((opt, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-3 rounded-lg text-sm font-medium border transition-all ${idx === q.correctIndex
                                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-50/50 text-emerald-900'
                                        : 'border-slate-100 bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                      <span className="font-mono text-sm font-bold opacity-50 mr-2">
                                        {String.fromCharCode(65 + idx)}.
                                      </span>
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-50/50 rounded-lg border border-slate-100">
                                  <p className="text-sm text-slate-700 font-medium">
                                    <span className="font-semibold text-slate-900">Explanation:</span> {q.explanation}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="px-4 py-2 bg-gradient-to-r from-rose-50 to-rose-50/50 text-rose-600 font-semibold rounded-lg hover:from-rose-100 hover:to-rose-100/50 transition-all duration-300 hover:shadow-sm flex items-center gap-2 self-start"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">User Management</h2>
                <div className="flex gap-2">
                  <button onClick={fetchUsers} className="p-2 hover:bg-slate-100 rounded-lg"><RefreshCw size={18} /></button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-4 font-semibold text-slate-600 text-sm">User</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Email</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Role</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsers.map(u => (
                      <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                              {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover" /> : u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.uid.slice(0, 6)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{u.email}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                              {u.role || 'Student'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateRole(u.uid, u.role === 'admin' ? 'student' : 'admin')}
                              className="p-2 text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                              title="Toggle Admin Role"
                            >
                              <Shield size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.uid)}
                              className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Content Moderation Tab */}
          {activeTab === 'content' && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Content Moderation</h2>
                <button onClick={fetchContent} className="p-2 hover:bg-slate-100 rounded-lg"><RefreshCw size={18} /></button>
              </div>
              <div className="divide-y divide-slate-100">
                {adminPosts.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">No posts found or feed empty.</div>
                ) : (
                  adminPosts.map(post => (
                    <div key={post.id} className="p-6 hover:bg-slate-50/50 transition-colors flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500">
                        {post.authorName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{post.authorName}</p>
                            <p className="text-xs text-slate-500">{new Date(post.timestamp).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete Post
                          </button>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {post.content}
                        </p>
                        {post.attachmentUrl && (
                          <div className="mt-2">
                            <a href={post.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-primary underline truncate block max-w-xs">{post.attachmentUrl}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};