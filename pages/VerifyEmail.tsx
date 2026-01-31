import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Mail, RefreshCw, LogOut, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const VerifyEmail: React.FC = () => {
    const { user, logout } = useApp();
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleResend = async () => {
        if (!auth.currentUser) return;
        setSending(true);
        setMessage('');
        setError('');
        try {
            await sendEmailVerification(auth.currentUser);
            setMessage('Verification code sent! Please check your inbox (and spam folder).');
        } catch (err: any) {
            setError(err.message || "Failed to send email. Please try again later.");
        } finally {
            setSending(false);
        }
    };

    const checkVerification = async () => {
        if (!auth.currentUser) return;
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
            window.location.reload(); // Reload to update App state
        } else {
            setMessage('Email not verified yet. Please check your inbox.');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (auth.currentUser) {
                auth.currentUser.reload().then(() => {
                    if (auth.currentUser?.emailVerified) {
                        navigate('/');
                        window.location.reload();
                    }
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [navigate]);

    if (!user.isAuthenticated) {
        navigate('/auth');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <SEO
                title="Verify Email"
                description="Verify your email address to access ExamSphere."
            />
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="glass-card max-w-md w-full p-8 md:p-12 text-center relative z-10 space-y-8 animate-fade-in">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                    <Mail size={40} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Check Your Inbox</h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        We sent a verification link to <br />
                        <span className="text-white font-bold">{user.email}</span>
                    </p>
                </div>

                {message && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl flex items-center gap-3 text-left">
                        <CheckCircle size={20} className="shrink-0" />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold rounded-xl flex items-center gap-3 text-left">
                        <AlertTriangle size={20} className="shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="premium-btn w-full py-4 rounded-xl flex items-center justify-center gap-2 group"
                    >
                        {sending ? <RefreshCw className="animate-spin" /> : <Mail size={18} />}
                        {sending ? 'Sending...' : 'Resend Email'}
                    </button>

                    <button
                        onClick={checkVerification}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
                    >
                        I've Verified It <ArrowRight size={18} />
                    </button>

                    <button
                        onClick={logout}
                        className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto pt-4"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};
