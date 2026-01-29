import React from 'react';
import { Sparkles, Loader2, Zap, Brain, Shield, Rocket } from 'lucide-react';

interface LoaderProps {
    message: string;
    subtext?: string;
    type?: 'brain' | 'shield' | 'zap' | 'sparkle' | 'rocket';
}

export const Loader: React.FC<LoaderProps> = ({ message, subtext, type = 'sparkle' }) => {
    const icons = {
        brain: Brain,
        shield: Shield,
        zap: Zap,
        sparkle: Sparkles,
        rocket: Rocket
    };

    const Icon = icons[type];

    return (
        <div className="fixed inset-0 z-[999] bg-var(--bg-main)/80 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
            <div className="relative mb-12">
                {/* Glowing Orbs */}
                <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-3xl animate-pulse scale-150"></div>

                {/* Main Icon Container */}
                <div className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center border border-slate-100 group">
                    <Icon size={48} className="text-brand-primary loading-pulse" />

                    {/* Rotating Ring */}
                    <div className="absolute inset-[-10px] border-4 border-dashed border-brand-primary/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
                </div>
            </div>

            <div className="max-w-md animate-entrance">
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter leading-none uppercase">
                    {message}
                </h2>
                {subtext && (
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">
                        {subtext}
                    </p>
                )}
            </div>

            {/* Progress Dots */}
            <div className="mt-12 flex gap-3">
                {[0, 150, 300].map((delay) => (
                    <div
                        key={delay}
                        className="w-3 h-3 bg-brand-primary rounded-full animate-bounce shadow-lg shadow-brand-primary/30"
                        style={{ animationDelay: `${delay}ms` }}
                    ></div>
                ))}
            </div>
        </div>
    );
};
