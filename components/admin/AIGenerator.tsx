
import React, { useState } from 'react';
import { Sparkles, Save, BookOpen, Brain, RefreshCw, Layers, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { generateExamSyllabus, generateQuestions } from '../../services/geminiService';
import { db } from '../../services/firebase';
import { addDoc, collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useApp } from '../../App';
import { Exam, Subject, Topic, Question } from '../../types';

export const AIGenerator: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const { exams, refreshData } = useApp();
    const [activeTab, setActiveTab] = useState<'syllabus' | 'questions'>('syllabus');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Syllabus State
    const [syllabusTopic, setSyllabusTopic] = useState('');
    const [generatedSyllabus, setGeneratedSyllabus] = useState<any>(null);

    // Question State
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

    // --- SYLLABUS HANDLERS ---
    const handleGenerateSyllabus = async () => {
        if (!syllabusTopic) return;
        setLoading(true);
        setError('');
        setGeneratedSyllabus(null);
        try {
            const data = await generateExamSyllabus(syllabusTopic);
            if (data) {
                setGeneratedSyllabus(data);
            } else {
                setError("Failed to generate syllabus. Please try again.");
            }
        } catch (err) {
            setError("AI Generation failed.");
        }
        setLoading(false);
    };

    const handleSaveSyllabus = async () => {
        if (!generatedSyllabus) return;
        setLoading(true);
        try {
            const examId = `exam-${Date.now()}`;
            const newExam: Exam = {
                id: examId,
                name: generatedSyllabus.name,
                description: generatedSyllabus.description,
                subjects: generatedSyllabus.subjects.map((sub: any, idx: number) => ({
                    ...sub,
                    id: `sub-${Date.now()}-${idx}`,
                    topics: sub.topics.map((top: any, tIdx: number) => ({
                        ...top,
                        id: `topic-${Date.now()}-${idx}-${tIdx}`
                    }))
                }))
            };

            await setDoc(doc(db, 'exams', examId), newExam);
            await refreshData();
            setGeneratedSyllabus(null);
            setSyllabusTopic('');
            onSuccess();
            alert(`Exam "${newExam.name}" created successfully!`);
        } catch (err) {
            alert("Error saving exam to database.");
        }
        setLoading(false);
    };

    // --- QUESTION HANDLERS ---
    const handleGenerateQuestions = async () => {
        if (!selectedExamId || !selectedTopicId) return;
        setLoading(true);
        setError('');
        setGeneratedQuestions([]);

        // Find names for context
        const exam = exams.find(e => e.id === selectedExamId);
        const subject = exam?.subjects.find(s => s.id === selectedSubjectId);
        const topic = subject?.topics.find(t => t.id === selectedTopicId);

        if (!exam || !topic) return;

        try {
            const questions = await generateQuestions(exam.name, topic.name, questionCount);
            if (questions && questions.length > 0) {
                // Tag them with IDs
                const taggedQuestions: Question[] = questions.map((q, idx) => ({
                    id: `q-${Date.now()}-${idx}`,
                    examId: selectedExamId,
                    topicId: selectedTopicId,
                    text: q.text,
                    options: q.options,
                    correctIndex: q.correctIndex,
                    explanation: q.explanation
                }));
                setGeneratedQuestions(taggedQuestions);
            } else {
                setError("No questions generated.");
            }
        } catch (err) {
            setError("AI Generation failed.");
        }
        setLoading(false);
    };

    const handleSaveQuestions = async () => {
        if (generatedQuestions.length === 0) return;
        setLoading(true);
        try {
            const batchPromises = generatedQuestions.map(q =>
                setDoc(doc(db, 'questions', q.id), q)
            );
            await Promise.all(batchPromises);

            await refreshData();
            setGeneratedQuestions([]);
            onSuccess();
            alert(`${generatedQuestions.length} questions added to bank!`);
        } catch (err) {
            alert("Error saving questions.");
        }
        setLoading(false);
    };

    const getSubjects = () => exams.find(e => e.id === selectedExamId)?.subjects || [];
    const getTopics = () => getSubjects().find(s => s.id === selectedSubjectId)?.topics || [];

    return (
        <div className="space-y-10">
            <div className="flex p-1.5 bg-slate-100 rounded-3xl w-fit">
                <button
                    className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'syllabus' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setActiveTab('syllabus')}
                >
                    <Layers size={14} /> Curriculum Synthesis
                </button>
                <button
                    className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'questions' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    onClick={() => setActiveTab('questions')}
                >
                    <BookOpen size={14} /> Assessment Engine
                </button>
            </div>

            {activeTab === 'syllabus' && (
                <div className="space-y-10 animate-entrance">
                    <div className="bg-slate-900 text-white p-10 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-primary/20 to-transparent"></div>
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>

                        <div className="relative z-10 max-w-2xl">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                                <Sparkles className="text-brand-primary" size={24} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Architect a Curriculum</h3>
                            <p className="text-slate-400 font-medium leading-relaxed mb-8">
                                AI will analyze the academic landscape for your target subject and construct a multi-dimensional syllabus with nested topics and difficulty mapping.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    value={syllabusTopic}
                                    onChange={e => setSyllabusTopic(e.target.value)}
                                    placeholder="Enter Exam Entity (e.g. MCAT, CFA Level 1)..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-brand-primary/30 outline-none font-bold text-white placeholder:text-white/20 transition-all"
                                />
                                <button
                                    onClick={handleGenerateSyllabus}
                                    disabled={loading || !syllabusTopic}
                                    className="premium-btn px-10 py-5 rounded-2xl flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Brain size={20} />}
                                    {loading ? 'Synthesizing...' : 'Start Research'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <div className="p-6 bg-rose-50 text-rose-600 rounded-[1.5rem] font-bold border border-rose-100 animate-in shake">{error}</div>}

                    {generatedSyllabus && (
                        <div className="glass-card overflow-hidden border-none shadow-2xl animate-in slide-in-from-bottom-6 duration-700">
                            <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white/60 backdrop-blur-xl gap-6">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-2">Synthesis Result</div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{generatedSyllabus.name}</h2>
                                    <p className="text-slate-500 font-medium">{generatedSyllabus.description}</p>
                                </div>
                                <button
                                    onClick={handleSaveSyllabus}
                                    disabled={loading}
                                    className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                >
                                    <Save size={18} /> Commit to Registry
                                </button>
                            </div>
                            <div className="p-8 md:p-12 grid grid-cols-1 gap-12 max-h-[700px] overflow-y-auto custom-scrollbar">
                                {generatedSyllabus.subjects.map((sub: any, idx: number) => (
                                    <div key={idx} className="group">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500">
                                                {idx + 1}
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{sub.name}</h4>
                                        </div>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {sub.topics.map((topic: any, tIdx: number) => (
                                                <div key={tIdx} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group-hover/sub:bg-white transition-all">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="font-bold text-slate-800 leading-tight">{topic.name}</span>
                                                        <Badge variant={topic.difficulty === 'Easy' ? 'success' : topic.difficulty === 'Medium' ? 'warning' : 'danger'} size="sm" className="text-[8px] font-black uppercase">
                                                            {topic.difficulty}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2">{topic.description}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {topic.subtopics.slice(0, 3).map((st: string, sIdx: number) => (
                                                            <span key={sIdx} className="text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-400 font-black uppercase tracking-widest">
                                                                {st}
                                                            </span>
                                                        ))}
                                                        {topic.subtopics.length > 3 && <span className="text-[9px] text-slate-300 font-black">+ {topic.subtopics.length - 3}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'questions' && (
                <div className="space-y-10 animate-entrance">
                    <div className="bg-slate-900 text-white p-10 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.1),transparent_50%)]"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-brand-primary/20 rounded-xl">
                                    <Brain className="text-brand-primary" size={24} />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight">Assessment Generator</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Exam</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-white outline-none cursor-pointer hover:bg-white/10 transition-all" value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)}>
                                        <option value="" className="text-slate-900">Select Exam...</option>
                                        {exams.map(e => <option key={e.id} value={e.id} className="text-slate-900">{e.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Domain</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-white outline-none cursor-pointer hover:bg-white/10 transition-all" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                                        <option value="" className="text-slate-900">Select Subject...</option>
                                        {getSubjects().map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Neural Node</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-white outline-none cursor-pointer hover:bg-white/10 transition-all" value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)}>
                                        <option value="" className="text-slate-900">Select Topic...</option>
                                        {getTopics().map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end gap-3">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Volume</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-white outline-none cursor-pointer hover:bg-white/10 transition-all" value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))}>
                                            <option value="3" className="text-slate-900">3 Items</option>
                                            <option value="5" className="text-slate-900">5 Items</option>
                                            <option value="10" className="text-slate-900">10 Items</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleGenerateQuestions}
                                        disabled={loading || !selectedTopicId}
                                        className="h-12 w-12 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl disabled:opacity-30"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && <div className="p-6 bg-rose-50 text-rose-600 rounded-[1.5rem] font-bold border border-rose-100">{error}</div>}

                    {generatedQuestions.length > 0 && (
                        <div className="glass-card border-none shadow-2xl animate-in slide-in-from-bottom-6 duration-700">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/60 backdrop-blur-xl">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vetted Items</h2>
                                    <p className="text-sm text-slate-500 font-medium">{generatedQuestions.length} Questions drafted by AI</p>
                                </div>
                                <button
                                    onClick={handleSaveQuestions}
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                                >
                                    <Save size={16} /> Deploy to Bank
                                </button>
                            </div>
                            <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {generatedQuestions.map((q, idx) => (
                                    <div key={idx} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                                            <p className="text-lg font-bold text-slate-900 pt-0.5">{q.text}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 ml-12">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className={`p-4 rounded-xl text-sm font-medium border-2 transition-all ${oIdx === q.correctIndex ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-50 bg-slate-50 text-slate-600'}`}>
                                                    <span className="mr-3 opacity-30 font-black">{String.fromCharCode(65 + oIdx)}</span> {opt}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-6 bg-slate-900 text-slate-300 rounded-[1.5rem] text-sm ml-12 border-l-4 border-brand-primary flex items-start gap-4">
                                            <Sparkles size={18} className="text-brand-primary shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-black text-brand-primary text-[10px] uppercase tracking-widest block mb-1">AI Logic</span>
                                                {q.explanation}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
