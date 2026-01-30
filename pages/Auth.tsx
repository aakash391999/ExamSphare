import React, { useState } from 'react';
import { Shield, User, Mail, Lock, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { Loader } from '../components/ui/Loader';
import { SEO } from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setError('Password reset link sent to your email!'); // Using error field for success message temporarily
        setTimeout(() => setIsForgotPassword(false), 3000);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Send Email Verification
        await sendEmailVerification(userCredential.user);
        setError('Account created! Please verify your email.');
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Authenticating" subtext="Verifying credentials..." type="sparkle" />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative font-sans selection:bg-indigo-500/30 flex items-center justify-center p-6">
      <SEO
        title={isForgotPassword ? 'Reset Password' : (isLogin ? 'Login' : 'Join Now')}
        description="Access your ExamSphere account to continue your adaptive learning journey."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ExamSphere",
          "applicationCategory": "EducationalApplication",
          "operatingSystem": "Web, Android, iOS",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": "AI-powered adaptive learning platform for exam preparation using neural networks and personalized study plans.",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1205"
          },
          "featureList": "Neural Mind Maps, AI Voice Tutor, Smart Flashcards, Adaptive Testing, Mistake Analysis"
        }}
      />

      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/welcome')}
          className="absolute -top-16 left-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card bg-slate-900/60 border border-slate-700/50 backdrop-blur-2xl shadow-2xl rounded-[2rem] p-8 md:p-10 relative overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {isForgotPassword ? 'Reset Access' : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {isForgotPassword ? 'Restore your neural link' : (isLogin ? 'Initialize persistent study session' : 'Begin your academic evolution')}
            </p>
          </div>

          {/* Error/Success Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, mb: 0 }}
                animate={{ opacity: 1, height: 'auto', mb: 24 }}
                exit={{ opacity: 0, height: 0, mb: 0 }}
                className={`rounded-xl p-4 text-xs font-bold flex items-center gap-3 border ${error.includes('sent') || error.includes('created') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${error.includes('sent') || error.includes('created') ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse shrink-0`} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <AnimatePresence mode='wait'>
              {(!isLogin && !isForgotPassword) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-3">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-3">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-3">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            {(isLogin && !isForgotPassword) && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="group relative w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Initiate Session' : 'Register Core')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
            {isForgotPassword ? (
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                Return to Login
              </button>
            ) : (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium group"
              >
                {isLogin ? "Neural records missing?" : 'Already in the sphere?'} <span className="text-indigo-400 group-hover:underline decoration-2 underline-offset-4 decoration-indigo-400/50 ml-1">{isLogin ? 'Join Network' : 'Log In'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};