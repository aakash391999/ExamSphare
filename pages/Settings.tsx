import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { User, Bell, LogOut, Trash2, RefreshCw, ChevronRight, Palette, Shield, Sparkles, Moon, Sun, Zap, Heart, AlertTriangle, Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const Settings: React.FC = () => {
  const { user, logout, currentExam, theme, setTheme } = useApp();

  const [notifications, setNotifications] = useState(true);

  const togglePrivacy = async () => {
    if (!user.uid) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        isPrivate: !user.isPrivate
      });
    } catch (err) {
      console.error("Error updating privacy:", err);
    }
  };

  const themes: { id: 'default' | 'midnight' | 'aurora' | 'rose', name: string, icon: any, color: string, desc: string }[] = [
    { id: 'default', name: 'Indigo Deep', icon: Shield, color: 'bg-indigo-600', desc: 'Knowledge & Stability' },
    { id: 'midnight', name: 'Midnight', icon: Moon, color: 'bg-slate-900', desc: 'Focus & Depth' },
    { id: 'aurora', name: 'Aurora', icon: Zap, color: 'bg-emerald-500', desc: 'Energy & Growth' },
    { id: 'rose', name: 'Rose Petal', icon: Heart, color: 'bg-rose-500', desc: 'Creativity & Passion' },
  ];

  const handleChangeExam = () => {
    if (window.confirm("Are you sure? This will redirect you to the setup screen.")) {
      const appState = JSON.parse(localStorage.getItem('examSphereUser') || '{}');
      appState.examSetupComplete = false;
      appState.selectedExamId = null;
      localStorage.setItem('examSphereUser', JSON.stringify(appState));
      window.location.reload();
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("DANGER: This will delete all your progress, mistakes, and history. This cannot be undone.")) {
      logout();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-entrance">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Neural Preferences</h1>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.2em] opacity-60">Control your academic ecosystem</p>
      </div>

      {/* Profile Section */}
      {/* Profile Section */}
      <Link to="/profile">
        <Card className="overflow-hidden border-none shadow-2xl group cursor-pointer hover:scale-[1.01] transition-transform">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-2xl transform group-hover:rotate-6 transition-transform">
              <span className="text-4xl font-black">{user.name.charAt(0)}</span>
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-brand-primary transition-colors">{user.name}</h2>
                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                <Shield size={14} className="text-brand-primary" />
                {user.role} Identity
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target</span>
                <span className="text-sm font-black text-slate-700">{currentExam?.name || 'Initialization Pending'}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* Visual Identity / Themes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <Palette className="text-brand-primary" size={20} />
          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-[0.1em]">Visual Identity</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-6 rounded-3xl text-left transition-all duration-300 relative group overflow-hidden border-2 ${theme === t.id
                ? 'bg-white border-brand-primary shadow-2xl scale-[1.02]'
                : 'bg-white/50 border-slate-100 hover:border-slate-300'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${t.color} flex items-center justify-center text-white shadow-lg`}>
                  <t.icon size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900 leading-none mb-1">{t.name}</p>
                  <p className="text-xs font-bold text-slate-400">{t.desc}</p>
                </div>
                {theme === t.id && (
                  <div className="ml-auto w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                    <Sparkles size={12} className="text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* App Control */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <Zap className="text-brand-primary" size={20} />
          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-[0.1em]">Neural Control</h3>
        </div>
        <Card className="p-0 overflow-hidden divide-y divide-slate-100">
          <div className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center space-x-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Bell size={24} />
              </div>
              <div>
                <p className="font-black text-slate-900 leading-none mb-1">Push Notifications</p>
                <p className="text-sm font-bold text-slate-400">Daily study reminders & mission alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary shadow-inner"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors border-t border-slate-100">
            <div className="flex items-center space-x-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Lock size={24} />
              </div>
              <div>
                <p className="font-black text-slate-900 leading-none mb-1">Private Profile</p>
                <p className="text-sm font-bold text-slate-400">Hide stats & posts from non-followers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.isPrivate || false}
                onChange={togglePrivacy}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary shadow-inner"></div>
            </label>
          </div>

          <button onClick={handleChangeExam} className="w-full flex items-center justify-between p-8 hover:bg-slate-100/50 transition-all text-left group">
            <div className="flex items-center space-x-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw size={24} />
              </div>
              <div>
                <p className="font-black text-slate-900 leading-none mb-1">Re-evaluate Objective</p>
                <p className="text-sm font-bold text-slate-400">Change your target exam goal</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </Card>
      </section>

      {/* High Alert Zone */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <AlertTriangle className="text-rose-500" size={20} />
          <h3 className="text-lg font-black text-rose-500 tracking-tight uppercase tracking-[0.1em]">Danger Node</h3>
        </div>
        <Card className="p-0 overflow-hidden border-rose-100 bg-rose-50/10">
          <button onClick={handleResetProgress} className="w-full flex items-center justify-between p-8 hover:bg-rose-500/10 transition-all text-left group">
            <div className="flex items-center space-x-5 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Trash2 size={24} />
              </div>
              <div>
                <p className="font-black leading-none mb-1">Purge Local intelligence</p>
                <p className="text-sm font-bold opacity-60">Permanent deletion of all progress & history</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-rose-500 text-white px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Irreversible</span>
          </button>
        </Card>
      </section>

      <div className="text-center pt-8 text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">
        <p className="mb-2">ExamSphere Quantum Core v1.2.4</p>
        <p>&copy; 2024 Neural intelligence Systems Inc.</p>
      </div>
    </div>
  );
};