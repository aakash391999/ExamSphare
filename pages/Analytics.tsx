import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { generateAnalyticsTips } from '../services/geminiService';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TrendingUp, Target, CheckCircle, AlertOctagon, ArrowUpRight, Sparkles, Brain, Lightbulb, ChevronRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const Analytics: React.FC = () => {
  const { user, currentExam, questions } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);

  const mistakeCountsByTopic: Record<string, number> = {};

  user.mistakes.forEach(qId => {
    const question = questions.find(q => q.id === qId);
    if (question) {
      const subject = currentExam?.subjects.find(s => s.topics.some(t => t.id === question.topicId));
      if (selectedSubject === 'All' || subject?.name === selectedSubject) {
        mistakeCountsByTopic[question.topicId] = (mistakeCountsByTopic[question.topicId] || 0) + 1;
      }
    }
  });

  const weakAreas = Object.entries(mistakeCountsByTopic)
    .map(([topicId, count]) => {
      const topic = currentExam?.subjects.flatMap(s => s.topics).find(t => t.id === topicId);
      return { name: topic?.name || 'Unknown Topic', count, id: topicId };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const subjectData = currentExam?.subjects.map(sub => ({
    subject: sub.name,
    A: user.weakSubjects.includes(sub.name) ? 45 : 85,
    fullMark: 100,
  })) || [];

  const chartData = useMemo(() => {
    if (!user.history || user.history.length === 0) return [];
    const sorted = [...user.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last7 = sorted.slice(-7);
    return last7.map((h, idx) => ({
      day: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }) + (idx + 1),
      solved: h.total,
      accuracy: Math.round((h.score / h.total) * 100)
    }));
  }, [user.history]);

  const avgAccuracy = chartData.length > 0
    ? Math.round(chartData.reduce((acc, cur) => acc + cur.accuracy, 0) / chartData.length)
    : 0;

  const totalQuestionsSolved = user.history.reduce((acc, curr) => acc + curr.total, 0);

  const handleGenerateInsights = async () => {
    setLoadingTips(true);
    const weakTopicNames = weakAreas.map(w => w.name);
    const tips = await generateAnalyticsTips(currentExam?.name || 'Exam', weakTopicNames, avgAccuracy);
    setAiTips(tips);
    setLoadingTips(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">Intelligence Report</h1>
        <p className="text-theme-muted font-bold">Neural performance analysis and optimization trends</p>
      </header>

      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar shrink-0">
        <button
          onClick={() => setSelectedSubject('All')}
          className={`flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedSubject === 'All' ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-theme-card border-theme-border text-theme-muted'}`}
        >
          All Domains
        </button>
        {currentExam?.subjects.map(subject => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject.name)}
            className={`flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedSubject === subject.name ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-theme-card border-theme-border text-theme-muted'}`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          icon={TrendingUp}
          label="Engagements"
          value={user.history.length.toString()}
          subValue="Session History"
          variant="brand"
        />
        <StatsCard
          icon={Target}
          label="Precision"
          value={`${avgAccuracy}%`}
          subValue="Mean Accuracy"
          variant="accent1"
        />
        <StatsCard
          icon={CheckCircle}
          label="Resolved"
          value={totalQuestionsSolved.toString()}
          subValue="Total Questions"
          variant="accent2"
        />
        <StatsCard
          icon={AlertOctagon}
          label="Anomalies"
          value={(weakAreas.length).toString()}
          subValue="Weak Areas"
          variant="danger"
        />
      </div>

      {/* AI Insights Section */}
      <div className="glass-card bg-slate-900 border-slate-800 text-white p-6 md:p-10 space-y-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent/20 blur-[80px] rounded-full -ml-24 -mb-24"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <Badge className="bg-brand-primary/20 text-brand-primary-light border-brand-primary/30">AI Neural Analysis</Badge>
            <h3 className="text-2xl font-black">Strategic Synthesis</h3>
          </div>
          <button
            onClick={handleGenerateInsights}
            disabled={loadingTips}
            className="premium-btn py-4 px-8 self-stretch md:self-auto bg-white text-slate-900 hover:bg-slate-100"
          >
            {loadingTips ? 'Synthesizing...' : 'Re-Analyze Trends'} <Sparkles size={18} />
          </button>
        </div>

        {aiTips.length > 0 ? (
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiTips.map((tip, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 backdrop-blur-sm">
                <div className="w-10 h-10 bg-brand-primary/20 text-brand-primary rounded-xl flex items-center justify-center shrink-0">
                  <Lightbulb size={20} />
                </div>
                <p className="text-sm font-bold text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Awaiting performance data injection</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 md:p-8 space-y-8">
          <h3 className="text-xl font-black">Accuracy Architecture</h3>
          <div className="h-[300px] md:h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F020" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1e293b', color: 'white' }}
                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Bar dataKey="solved" name="Questions" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-theme-muted space-y-4">
                <Brain size={48} className="opacity-20" />
                <p className="font-bold">No Neural Data Available</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 flex flex-col items-center justify-between gap-8">
          <h3 className="text-xl font-black self-start">Proficiency Radar</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <Radar
                  name="Proficiency"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Overall Readiness</p>
            <div className="h-3 bg-theme-border rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary w-[74%] rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 md:p-10 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Knowledge Deficit Analysis</h3>
            <p className="text-theme-muted font-bold">Targeted topics requiring immediate cognitive reinforcement</p>
          </div>
          <Badge variant="danger" className="py-2 px-4">{weakAreas.length} Critical Areas</Badge>
        </header>

        {weakAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakAreas.map((area, idx) => (
              <div key={idx} className="p-6 bg-theme-bg/50 border border-theme-border rounded-3xl flex items-center justify-between group hover:border-rose-500/30 transition-all">
                <div className="space-y-1">
                  <p className="font-black text-lg">{area.name}</p>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">{area.count} Recorded Errors</p>
                </div>
                <button className="w-12 h-12 rounded-2xl bg-theme-border/50 text-theme-muted group-hover:bg-rose-500 group-hover:text-white transition-all flex items-center justify-center">
                  <ChevronRight size={24} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
            <p className="font-black text-theme-muted">Zero critical anomalies detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, subValue, variant }: any) => {
  const styles: Record<string, string> = {
    brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-brand-primary/5",
    accent1: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
    accent2: "bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-purple-500/5",
    danger: "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5"
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between space-y-6">
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl border-2 ${styles[variant]} transition-all shrink-0`}>
          <Icon size={24} />
        </div>
        <div className="hidden sm:block">
          <Badge variant="outline" className="opacity-50">Active Tracker</Badge>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">{label}</p>
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        <p className="text-xs font-bold text-theme-muted/70">{subValue}</p>
      </div>
    </div>
  );
};