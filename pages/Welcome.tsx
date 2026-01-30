import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Shield, ArrowRight, BookOpen, Target } from 'lucide-react';
import { SEO } from '../components/SEO';

const features = [
    {
        icon: Brain,
        title: "Neural Learning",
        description: "Adaptive AI that evolves with your unique learning patterns and pace.",
        color: "text-rose-400"
    },
    {
        icon: Zap,
        title: "Instant Recall",
        description: "Smart flashcards and mind maps designed to maximize memory retention.",
        color: "text-amber-400"
    },
    {
        icon: Target,
        title: "Precision Focus",
        description: "AI-generated study plans that target your weak spots automatically.",
        color: "text-emerald-400"
    }
];

export const Welcome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative font-sans selection:bg-indigo-500/30">
            <SEO
                title="Welcome"
                description="Experience the future of exam preparation with ExamSphere."
            />

            {/* Dynamic Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
                <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-rose-500/10 rounded-full blur-[80px] mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex flex-col min-h-screen">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Sparkles className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">ExamSphere</span>
                    </div>
                    <button
                        onClick={() => navigate('/auth')}
                        className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        Log In
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">

                    {/* Hero Text */}
                    <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                AI-Powered Evolution
                            </div>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                                Master Any <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-gradient bg-300%">
                                    Exam Reality
                                </span>
                            </h1>
                            <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Stop memorizing, start evolving. Our neural engine adapts to your brain's unique signature to unlock
                                your maximum academic potential in record time.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={() => navigate('/auth')}
                                className="group relative px-8 py-4 bg-white text-indigo-950 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative flex items-center gap-2">
                                    Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            <button
                                onClick={() => navigate('/syllabus')}
                                className="px-8 py-4 bg-slate-800/50 text-white border border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all backdrop-blur-sm"
                            >
                                Explore Syllabus
                            </button>
                        </motion.div>
                    </div>

                    {/* Feature Cards / Visual */}
                    <div className="flex-1 w-full max-w-md lg:max-w-xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-[2.5rem] blur-3xl -z-10" />

                        <div className="grid gap-4">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.15), duration: 0.6 }}
                                    className="p-6 rounded-[1.5rem] bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl hover:bg-slate-800/60 transition-colors group cursor-default"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1 group-hover:text-white transition-colors">{feature.title}</h3>
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </main>

                <footer className="mt-12 text-center text-slate-600 text-xs font-medium uppercase tracking-widest">
                    © 2024 ExamSphere Intelligence Layer
                </footer>
            </div>
        </div>
    );
};
