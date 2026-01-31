import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../App';
import { SEO } from '../components/SEO';
import { GraduationCap, ArrowRight, Brain, BookOpen, Target, CheckCircle2, Globe } from 'lucide-react';

export const ExamLanding: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const { exams, dataLoading } = useApp();

    const exam = exams.find(e => e.id === examId);

    if (dataLoading) {
        return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>;
    }

    if (!exam) {
        return <Navigate to="/directory" />;
    }

    // Schema Markup for Course/Product
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": `${exam.name} Preparation`,
        "description": exam.description,
        "provider": {
            "@type": "Organization",
            "name": "ExamSphere",
            "sameAs": "https://examsphare.web.app"
        },
        "courseCode": exam.name,
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "Online"
        },
        "offers": {
            "@type": "Offer",
            "category": "Free",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30">
            <SEO
                title={`${exam.name} Exam Preparation - Syllabus, Mock Tests & AI Tutor`}
                description={`Crack the ${exam.name} with ExamSphere's AI-Powered adaptive learning. Full syllabus coverage, mind maps, and personalized practice for ${exam.name}.`}
                keywords={`${exam.name}, ${exam.name} syllabus, ${exam.name} preparation, ai exam prep, ${exam.subjects.map(s => s.name).join(', ')}`}
                structuredData={structuredData}
            />

            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                            <Globe size={24} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ExamSphere</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/directory" className="text-sm font-bold text-slate-400 hover:text-white transition-colors hidden sm:block">
                            All Exams
                        </Link>
                        <Link to="/auth" className="premium-btn py-2 px-6 text-sm">
                            Start {exam.name} Prep
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                {/* Background Orbs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none -mr-40 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -ml-20"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Brain size={14} /> AI-Powered Preparation
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                        Master the {exam.name}
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
                        {exam.description}. Our adaptive AI analyzes your weak spots and builds a personalized roadmap to ace the {exam.name}.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/auth" className="premium-btn py-4 px-10 text-lg w-full sm:w-auto">
                            Start Practicing Free
                        </Link>
                        <Link to="/directory" className="py-4 px-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all w-full sm:w-auto">
                            View Other Exams
                        </Link>
                    </div>
                </div>
            </section>

            {/* Syllabus / Content Preview */}
            <section className="py-20 bg-slate-900/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black mb-4">Complete Syllabus Coverage</h2>
                        <p className="text-slate-400">Everything you need to know for {exam.name}, structured for deep learning.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {exam.subjects.map((subject) => (
                            <div key={subject.id} className="bg-[#0f172a] border border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                                        {subject.icon}
                                    </div>
                                    <h3 className="text-xl font-bold">{subject.name}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {subject.topics.slice(0, 5).map(topic => (
                                        <li key={topic.id} className="flex items-start gap-3 text-slate-400 text-sm">
                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{topic.name}</span>
                                        </li>
                                    ))}
                                    {subject.topics.length > 5 && (
                                        <li className="text-indigo-400 text-sm font-bold pl-7">
                                            + {subject.topics.length - 5} more topics
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Footer */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl font-black">Ready to top the {exam.name}?</h2>
                        <p className="text-indigo-200 text-lg">Join thousands of students using AI to learn faster and retain more.</p>
                        <Link to="/auth" className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 py-4 px-10 rounded-xl font-black text-lg transition-transform hover:scale-105 hover:shadow-xl shadow-white/10">
                            Get Started Now <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
