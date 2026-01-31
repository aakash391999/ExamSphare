import React from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { GraduationCap, ArrowRight, Globe, Search } from 'lucide-react';

export const Directory: React.FC = () => {
    const { exams } = useApp();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30">
            <SEO
                title="Exam Directory - Browse All Courses"
                description="Explore our comprehensive catalog of AI-powered exam preparation courses. Find the right path for your academic goals."
                keywords="exam list, course directory, entrance exams, ai tutor, study plans"
            />

            {/* Navbar Placeholder (if you want one for public pages) or just a simple header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            <Globe size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ExamSphere</span>
                    </Link>
                    <Link to="/auth" className="premium-btn py-2 px-6 text-sm">
                        Login / Sign Up
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto space-y-12">

                    <div className="text-center max-w-2xl mx-auto space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-cyan-400">
                            Academic Directory
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">
                            Browse our complete database of {exams.length}+ supported examinations.
                            Each course is powered by our Neural Tutor engine.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map((exam) => (
                            <Link
                                key={exam.id}
                                to={`/exam/${exam.id}`}
                                className="group relative bg-slate-900/50 border border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                        <GraduationCap className="text-indigo-400" size={28} />
                                    </div>

                                    <h2 className="text-2xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">
                                        {exam.name}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">
                                        {exam.description}
                                    </p>

                                    <div className="mt-auto flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-wider">
                                        View Syllabus <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* SEO Text Block (Content below the fold to help ranking) */}
                    <div className="mt-24 pt-12 border-t border-white/5 text-slate-500 space-y-6 max-w-4xl">
                        <h3 className="text-xl font-bold text-white">Why Choose ExamSphere?</h3>
                        <p>
                            ExamSphere isn't just a question bank; it's an adaptive learning ecosystem.
                            We leverage advanced AI to create personalized study plans for exams like {exams.slice(0, 3).map(e => e.name).join(', ')}.
                            Our platform understands your weak areas and creates a "Mistake Book" to ensure you never repeat an error.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 pt-6">
                            <div>
                                <h4 className="text-white font-bold mb-2">Neural Mind Maps</h4>
                                <p className="text-sm">Visualize connections between topics to enhance retention.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2">Voice AI Tutor</h4>
                                <p className="text-sm">Speak to your tutor for doubts, just like a real classroom.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-2">Adaptive Drills</h4>
                                <p className="text-sm">Questions get harder as you get smarter.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};
