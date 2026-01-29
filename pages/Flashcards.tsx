import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ArrowLeft, RotateCw, Check, X, Sparkles, Layers } from 'lucide-react';
import { SubtopicDetail } from '../types';

export const Flashcards: React.FC = () => {
    const { topicId } = useParams();
    const { currentExam } = useApp();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [cards, setCards] = useState<SubtopicDetail[]>([]);

    const subject = currentExam?.subjects.find(s => s.topics.some(t => t.id === topicId));
    const topic = subject?.topics.find(t => t.id === topicId);

    useEffect(() => {
        if (topic && topic.subtopicDetails) {
            setCards(topic.subtopicDetails);
        }
    }, [topic]);

    if (!topic) return <div>Topic not found</div>;
    if (cards.length === 0) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-theme-border rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Layers className="text-theme-muted" />
                </div>
                <p className="text-theme-muted font-bold">Generating Flashcards...</p>
                <button onClick={() => navigate(-1)} className="text-brand-primary font-bold hover:underline">Go Back</button>
            </div>
        </div>
    );

    const currentCard = cards[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 200);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 200);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="z-10 w-full max-w-2xl space-y-8">
                <header className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="text-slate-600" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-sm font-black uppercase tracking-widest text-brand-primary mb-1">Flashcard Session</h2>
                        <p className="font-bold text-slate-700">{topic.name}</p>
                    </div>
                    <div className="w-12" /> {/* Spacer */}
                </header>

                {/* Card Container */}
                <div className="perspective-1000 h-[400px] w-full cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden">
                            <div className="w-full h-full bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 flex flex-col items-center justify-center p-10 text-center space-y-6 hover:border-brand-primary/30 transition-colors">
                                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="text-brand-primary w-8 h-8" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                                    {currentCard.title}
                                </h3>
                                <p className="text-sm font-bold text-slate-400">Tap to flip</p>
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180">
                            <div className="w-full h-full bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-slate-800 flex flex-col items-center justify-center p-10 text-center space-y-6">
                                <p className="text-lg md:text-xl font-medium text-slate-200 leading-relaxed">
                                    {currentCard.description}
                                </p>
                                <ul className="text-left space-y-2 w-full max-w-md">
                                    {currentCard.keyPoints.slice(0, 3).map((point, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-400">
                                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand-primary rounded-full mt-1.5 shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-6">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="flex-1 py-4 rounded-xl font-bold text-slate-500 hover:bg-white hover:shadow-md transition-all active:scale-95"
                    >
                        Previous
                    </button>
                    <div className="text-sm font-black text-slate-300 tracking-widest">
                        {currentIndex + 1} / {cards.length}
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="flex-1 py-4 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 font-bold hover:brightness-110 active:scale-95 transition-all"
                    >
                        Next Card
                    </button>
                </div>
            </div>
        </div>
    );
};
