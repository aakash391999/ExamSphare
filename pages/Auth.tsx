import React, { useState } from 'react';
import { Shield, User, Loader2, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { Loader } from '../components/ui/Loader';

export const Auth: React.FC = () => {
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
        setError('Password reset link sent to your email!');
        setTimeout(() => setIsForgotPassword(false), 3000);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Send Email Verification
        await sendEmailVerification(userCredential.user);
        setError('Account created! Please verify your email.'); // Using error state for success msg momentarily
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Authenticating" subtext="Verifying your credentials with deep neural link..." type="shield" />;
  }

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[100px] -ml-40 -mb-40"></div>

      <div className="max-w-md w-full m-auto relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-theme-bg shadow-2xl mb-6 border border-theme-border group">
            <Shield className="w-10 h-10 text-brand-primary group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-theme-main tracking-tighter mb-2">
            {isForgotPassword ? 'Reset Access' : (isLogin ? 'Access Identity' : 'Neural Join')}
          </h1>
          <p className="text-theme-muted font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-80">
            {isForgotPassword ? 'Restore your neural link' : (isLogin ? 'Initialize persistent study session' : 'Begin your academic evolution')}
          </p>
        </div>

        <div className="glass-card p-10 border-theme-border bg-theme-card/40 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-xs font-black mb-6 border border-rose-500/20 flex items-center gap-3 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {(!isLogin && !isForgotPassword) && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted ml-2">Full Identity</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-theme-muted group-focus-within:text-brand-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-14 pr-4 py-5 bg-theme-bg/50 border border-theme-border rounded-[1.5rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:bg-theme-bg outline-none transition-all font-bold text-theme-main"
                    placeholder="Candidate Name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted ml-2">Digital Link</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-theme-muted group-focus-within:text-brand-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-14 pr-4 py-5 bg-theme-bg/50 border border-theme-border rounded-[1.5rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:bg-theme-bg outline-none transition-all font-bold text-theme-main"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            {(isLogin && !isForgotPassword) && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-primary/80">
                  Forgot Password?
                </button>
              </div>
            )}

            {!isForgotPassword && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted ml-2">Access Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-theme-muted group-focus-within:text-brand-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    required={!isForgotPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-14 pr-4 py-5 bg-theme-bg/50 border border-theme-border rounded-[1.5rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:bg-theme-bg outline-none transition-all font-bold text-theme-main"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="premium-btn w-full py-5 flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-brand-primary/30"
            >
              <span className="text-base uppercase tracking-[0.2em] font-black">
                {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Initiate Session' : 'Register Core')}
              </span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-10 text-center">
            {isForgotPassword ? (
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-xs font-black text-theme-muted hover:text-theme-main transition-colors uppercase tracking-widest"
              >
                Back to Login
              </button>
            ) : (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-black text-brand-primary hover:text-brand-primary-dark transition-colors flex flex-col items-center gap-2 m-auto group"
              >
                <span className="opacity-60">{isLogin ? "Neural records missing?" : 'Already in the sphere?'}</span>
                <span className="text-sm border-b-2 border-brand-primary/20 group-hover:border-brand-primary transition-all pb-1 uppercase tracking-widest">
                  {isLogin ? 'Join Distributed Network' : 'Synthesize Identity'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};