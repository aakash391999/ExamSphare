import React from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, BookOpen, Target, BarChart3, Clock } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const Syllabus: React.FC = () => {
  const { currentExam, user } = useApp();

  React.useEffect(() => {
    if (currentExam) {
      document.title = `${currentExam.name} Syllabus | ExamSphere`;
    }
  }, [currentExam]);

  if (!currentExam) return <div>Loading...</div>;

  const getDifficultyVariant = (level: string) => {
    switch (level) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'danger';
      default: return 'neutral';
    }
  };

  const totalTopics = currentExam.subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
  const completedTopics = user.completedTopics.length;
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <div className="space-y-12 pb-24 animate-fade-in">
      {/* Header Section */}
      <div className="glass-card bg-slate-900 border-slate-800 p-8 md:p-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full -mr-48 -mt-48 transition-all"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/10 blur-[100px] rounded-full -ml-32 -mb-32 transition-all"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-6 max-w-2xl">
            <Badge className="bg-brand-primary/20 text-brand-primary-light border-brand-primary/30 py-2 px-4 shadow-[0_0_12px_rgba(99,102,241,0.3)]">Mission Control</Badge>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                Academic <span className="text-brand-primary">Locus</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 font-bold leading-relaxed">
                Structured intelligence path for <span className="text-white">{currentExam.name}</span>. Precision mapping of {totalTopics} core domains.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between min-w-[180px] group transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 group-hover:text-brand-primary">Curriculum Size</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{currentExam.subjects.length}</span>
                <span className="text-slate-500 font-bold pb-1">Subjects</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between min-w-[180px] group transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 group-hover:text-emerald-500">Mastery Index</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{completedTopics}</span>
                <span className="text-slate-500 font-bold pb-1">/ {totalTopics}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-12 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Overall Synthesis Progress</span>
            <span className="text-2xl font-black text-brand-primary">{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-accent transition-all duration-1000 ease-out shadow-[0_0_12px_var(--brand-primary)]"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subjects Stack */}
      <div className="space-y-16">
        {currentExam.subjects.map((subject, sIdx) => {
          const subjectTopics = subject.topics.length;
          const completedSubjectTopics = subject.topics.filter(topic =>
            user.completedTopics.includes(topic.id)
          ).length;
          const subjectProgress = subjectTopics > 0 ? (completedSubjectTopics / subjectTopics) * 100 : 0;

          return (
            <div key={subject.id} className="space-y-8 animate-fade-in translate-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-theme-card border-2 border-theme-border rounded-3xl flex items-center justify-center font-black text-2xl shadow-2xl relative">
                    {sIdx + 1}
                    {subjectProgress === 100 && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-theme-bg">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{subject.name}</h2>
                    <p className="text-theme-muted font-bold text-sm">{subjectTopics} Topics • Overall complexity: <span className="text-amber-500 uppercase tracking-widest text-xs">Standard</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-1">Subject Proficiency</p>
                    <p className="text-2xl font-black">{Math.round(subjectProgress)}%</p>
                  </div>
                  <div className="w-32 h-2 bg-theme-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary transition-all duration-700"
                      style={{ width: `${subjectProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subject.topics.map((topic) => {
                  const isCompleted = user.completedTopics.includes(topic.id);
                  const topicProgress = topic.subtopics.length > 0
                    ? (topic.subtopics.filter(st => user.completedTopics.includes(st)).length / topic.subtopics.length) * 100
                    : 0;

                  return (
                    <Link
                      key={topic.id}
                      to={`/topic/${topic.id}`}
                      className="group"
                    >
                      <div className={`glass-card p-6 h-full flex flex-col gap-6 transition-all duration-300 border-2 ${isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-transparent hover:border-brand-primary/30'}`}>
                        <div className="flex justify-between items-start">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-theme-bg text-theme-muted group-hover:bg-brand-primary group-hover:text-white'}`}>
                            {isCompleted ? <CheckCircle size={24} /> : <BookOpen size={24} />}
                          </div>
                          <Badge variant={getDifficultyVariant(topic.difficulty)} className="font-black uppercase tracking-widest text-[10px]">{topic.difficulty}</Badge>
                        </div>

                        <div className="space-y-2 flex-grow">
                          <h3 className="text-xl font-black group-hover:text-brand-primary transition-colors">{topic.name}</h3>
                          <p className="text-sm font-bold text-theme-muted leading-relaxed line-clamp-2">{topic.description}</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-theme-border">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-theme-muted">
                            <span>{topic.subtopics.length} Sections</span>
                            {topicProgress > 0 && <span className="text-brand-primary">{Math.round(topicProgress)}% Read</span>}
                          </div>
                          {topicProgress > 0 && (
                            <div className="h-1 bg-theme-border rounded-full overflow-hidden">
                              <div className="h-full bg-brand-primary" style={{ width: `${topicProgress}%` }} />
                            </div>
                          )}
                          <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                            <span className="text-xs font-black uppercase tracking-widest opacity-60">Initialize Domain</span>
                            <ArrowRight size={18} className="text-brand-primary" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};