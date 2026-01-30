import React from 'react';
import { useApp } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Play, AlertTriangle, ArrowRight, Target, Zap, Brain, Clock, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { SEO } from '../components/SEO';

export const Dashboard: React.FC = () => {
  const { currentExam, user } = useApp();

  if (!currentExam) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-theme-border rounded-full"></div>
        <div className="h-4 w-32 bg-theme-border rounded"></div>
      </div>
    </div>
  );

  const totalTopics = currentExam.subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
  const completedCount = user.completedTopics.length;
  const progress = totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100);
  const remainingCount = Math.max(0, totalTopics - completedCount);

  const data = [
    { name: 'Completed', value: completedCount },
    { name: 'Remaining', value: remainingCount },
  ];

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <SEO
        title="Dashboard"
        description={`Track your progress for ${currentExam.name}. You have completed ${progress}% of the syllabus.`}
      />
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-theme-bg p-8 md:p-12 text-theme-main border-2 border-theme-border shadow-inner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-black shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Welcome Back</p>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">{user.name.split(' ')[0]}</h1>
              </div>
            </div>

            <p className="text-sm md:text-lg text-theme-muted font-bold leading-relaxed max-w-md">
              Your preparation for <span className="text-brand-primary">{currentExam.name}</span> is <span className="text-theme-main">{progress}% complete</span>. You are performing above average!
            </p>

            <Link to="/syllabus" className="inline-block pt-2">
              <button className="premium-btn px-6 py-3 text-sm shadow-xl shadow-brand-primary/30">
                Continue Learning
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="45" fill="none" stroke="var(--brand-primary)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${progress * 2.83} 283`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{progress}%</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-theme-muted">Overall</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid - App Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mastery', value: `${progress}%`, icon: Target, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: 'Topics', value: completedCount, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Assessed', value: user.completedTopics.length, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Mistakes', value: user.mistakes.length, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 flex flex-col items-center text-center gap-3 active:scale-95 transition-all">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-lg font-black">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-3">
                <Brain className="text-brand-primary" size={24} />
                Learning Stability
              </h2>
              <Badge variant="outline" className="text-theme-muted border-theme-border">Live Data</Badge>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={12}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="var(--brand-primary)" />
                    <Cell fill="var(--border-subtle)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-10 md:mt-8">
                <p className="text-3xl font-black">{progress}%</p>
                <p className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Mastered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="space-y-6">
          <h3 className="text-lg font-black px-2 mb-4">Quick Study</h3>
          <Link to="/practice" className="block transform transition-all hover:scale-[1.02] active:scale-95">
            <div className="glass-card p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                  <Play size={20} fill="currentColor" />
                </div>
                <ChevronRight size={20} className="text-theme-muted" />
              </div>
              <h4 className="font-bold text-lg mb-1">Adaptive Practice</h4>
              <p className="text-sm text-theme-muted">AI-powered smart sessions</p>
            </div>
          </Link>

          <Link to="/mistakes" className="block transform transition-all hover:scale-[1.02] active:scale-95">
            <div className="glass-card p-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                  <AlertTriangle size={20} />
                </div>
                <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full">{user.mistakes.length}</div>
              </div>
              <h4 className="font-bold text-lg mb-1">Error Analysis</h4>
              <p className="text-sm text-theme-muted">Fix your weak points</p>
            </div>
          </Link>

          <Link to="/planner" className="block transform transition-all hover:scale-[1.02] active:scale-95">
            <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                  <Calendar size={20} />
                </div>
                <ChevronRight size={20} className="text-theme-muted" />
              </div>
              <h4 className="font-bold text-lg mb-1">Study Planner</h4>
              <p className="text-sm text-theme-muted">Your roadmap to success</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};