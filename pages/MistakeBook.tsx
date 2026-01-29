import React, { useState } from 'react';
import { useApp } from '../App';
import { BookOpen, AlertTriangle, ChevronDown, CheckCircle, Play, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import ReactMarkdown from 'react-markdown';

export const MistakeBook: React.FC = () => {
  const { user, removeMistake, currentExam, questions } = useApp();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mistakes = questions.filter(q => user.mistakes.includes(q.id));

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRemoveMistake = async (id: string) => {
    setDeletingId(id);
    await new Promise(resolve => setTimeout(resolve, 300));
    removeMistake(id);
    setDeletingId(null);
  };

  const getTopicName = (topicId: string) => {
    const topic = currentExam?.subjects.flatMap(s => s.topics).find(t => t.id === topicId);
    return topic?.name || 'General Knowledge';
  };

  if (mistakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 relative">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-theme-card rounded-full flex items-center justify-center shadow-lg border border-theme-border">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <h2 className="text-3xl font-black mb-4">Pristine Record</h2>
        <p className="text-theme-muted max-w-sm mb-10 font-bold">Your mistake book is empty. Every concept has been conquered. Keep up the excellence!</p>
        <button
          onClick={() => navigate('/practice')}
          className="premium-btn px-10 py-5"
        >
          Start Practice Session <Play size={18} fill="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      <header className="glass-card p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Badge variant="danger" className="font-bold">Knowledge Gap Analysis</Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Mistake Book</h1>
          <p className="text-theme-muted font-bold">Reviewing <span className="text-rose-500">{mistakes.length}</span> critical concepts</p>
        </div>

        <button
          onClick={() => navigate('/practice')}
          className="premium-btn py-4 px-8 self-stretch md:self-auto"
        >
          Flash Review <Play size={18} fill="currentColor" />
        </button>
      </header>

      <div className="space-y-4">
        {mistakes.map((question, index) => {
          const isExpanded = expandedId === question.id;
          const isDeleting = deletingId === question.id;

          return (
            <div
              key={question.id}
              className={`transition-all duration-300 ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100'}`}
            >
              <div className={`glass-card overflow-hidden border-2 transition-all ${isExpanded ? 'border-brand-primary/30 ring-4 ring-brand-primary/5' : 'border-transparent'}`}>
                <div
                  onClick={() => toggleExpand(question.id)}
                  className="p-5 md:p-8 cursor-pointer flex gap-4 md:gap-6 items-start"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'bg-brand-primary text-white' : 'bg-theme-border/50 text-theme-muted'}`}>
                    <AlertTriangle size={isExpanded ? 28 : 24} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest">{getTopicName(question.topicId)}</span>
                      <div className="w-1 h-1 bg-theme-border rounded-full"></div>
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Priority Review</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-theme-main line-clamp-2">{question.text}</h3>
                  </div>

                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={24} className="text-theme-muted" />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 md:px-8 pb-8 space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options.map((opt, idx) => {
                        const isCorrect = idx === question.correctIndex;
                        return (
                          <div key={idx} className={`p-4 rounded-xl border-2 flex gap-3 items-center ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-600' : 'border-theme-border bg-theme-bg/50 text-theme-muted'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-theme-border text-theme-muted'}`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-sm font-bold">{opt}</span>
                            {isCorrect && <CheckCircle size={16} className="ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="explanation-card p-6 bg-brand-primary/5 border border-brand-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen size={18} className="text-brand-primary" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary">Root Cause Analysis</h4>
                      </div>
                      <div className="prose prose-sm prose-invert">
                        <ReactMarkdown>{question.explanation}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleRemoveMistake(question.id)}
                        className="h-12 px-6 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        Mark as Mastered
                      </button>
                      <button
                        onClick={() => navigate(`/practice?topicId=${question.topicId}`)}
                        className="h-12 px-6 rounded-xl bg-theme-card border border-theme-border font-bold text-sm hover:bg-theme-bg transition-colors"
                      >
                        Practice Topic
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};