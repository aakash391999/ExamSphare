import React, { useState } from 'react';
import { useApp } from '../App';
import { CheckCircle, Clock, GraduationCap, Target, ChevronRight, AlertTriangle, Sparkles, ArrowRight, Zap, Brain } from 'lucide-react';
import { Loader } from '../components/ui/Loader';
import { SEO } from '../components/SEO';

export const Setup: React.FC = () => {
  const { completeSetup, exams, dataLoading, user } = useApp();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [studyHours, setStudyHours] = useState<number>(4);

  const handleExamSelect = (id: string) => {
    setSelectedExam(id);
    setWeakSubjects([]);
  };

  const toggleSubject = (subjectName: string) => {
    if (weakSubjects.includes(subjectName)) {
      setWeakSubjects(weakSubjects.filter(s => s !== subjectName));
    } else {
      setWeakSubjects([...weakSubjects, subjectName]);
    }
  };

  const handleSubmit = () => {
    if (selectedExam) {
      completeSetup(selectedExam, weakSubjects, studyHours);
    }
  };

  const currentExam = exams.find(e => e.id === selectedExam);

  if (dataLoading) {
    return (
      <Loader
        message="Consulting Syllabus"
        subtext="Fetching available academic paths and evaluations..."
        type="brain"
      />
    );
  }

  if (exams.length === 0) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
            <AlertTriangle size={32} className="text-rose-500" />
          </div>
          <h2 className="text-3xl font-black mb-3">Academic Vacuum</h2>
          <p className="text-theme-muted mb-8 font-bold leading-relaxed">
            The database currently has no exams configured. Please contact the administrator.
          </p>
          {user.role === 'admin' && (
            <div className="space-y-4">
              <a
                href="/#/admin"
                className="premium-btn w-full py-4"
              >
                Access Admin Core <ChevronRight size={18} />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col p-4 md:p-10 relative overflow-hidden">
      <SEO
        title="Setup Profile"
        description="Configure your academic goals and study plan."
      />
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-accent/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none"></div>

      <div className="max-w-4xl w-full mx-auto relative z-10 animate-fade-in space-y-12">
        <header className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-brand-primary/30 blur-xl rounded-3xl animate-pulse"></div>
            <div className="relative w-20 h-20 bg-theme-card rounded-3xl flex items-center justify-center border border-theme-border shadow-2xl">
              <Target size={40} className="text-brand-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">Define Your Mission</h1>
            <p className="text-theme-muted font-bold uppercase tracking-[0.2em] text-xs">Architect your learning precision path</p>
          </div>
        </header>

        <div className="glass-card p-6 md:p-12 space-y-16">
          {/* Step 1 */}
          <section className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-brand-primary text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0">1</div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black">Target Objective</h2>
                <p className="text-theme-muted text-xs font-bold uppercase tracking-widest">Select your core academic path</p>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 space-y-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => handleExamSelect(exam.id)}
                    className={`p-5 rounded-2xl text-left border-2 transition-all group relative overflow-hidden flex flex-col h-full ${selectedExam === exam.id
                      ? 'border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20 shadow-xl shadow-brand-primary/10'
                      : 'border-theme-border bg-theme-bg/30 hover:bg-theme-bg/50 hover:border-theme-muted/50'
                      }`}
                  >
                    <div className="flex items-start justify-between w-full mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedExam === exam.id ? 'bg-brand-primary text-white' : 'bg-theme-card border border-theme-border text-theme-muted'}`}>
                        <GraduationCap size={20} />
                      </div>
                      {selectedExam === exam.id && (
                        <div className="text-brand-primary animate-in zoom-in duration-300">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>

                    <div className="mt-auto space-y-2">
                      <h3 className={`font-black text-base line-clamp-1 ${selectedExam === exam.id ? 'text-brand-primary' : 'text-theme-main'}`}>{exam.name}</h3>
                      <p className="text-[10px] text-theme-muted font-bold leading-relaxed line-clamp-2">{exam.description}</p>
                    </div>

                    {/* Active Glow Effect */}
                    {selectedExam === exam.id && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {currentExam && (
            <div className="animate-fade-in space-y-16">
              {/* Step 2 */}
              <section className="space-y-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-amber-500 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">2</div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black">Daily Commitment</h2>
                    <p className="text-theme-muted text-xs font-bold uppercase tracking-widest">Optimize your focus bandwidth</p>
                  </div>
                </div>

                <div className="p-8 bg-theme-bg/50 rounded-3xl border border-theme-border space-y-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-brand-primary">{studyHours}</span>
                        <span className="text-xl font-bold text-theme-muted">hours/day</span>
                      </div>
                      <p className="text-sm font-black text-amber-500 flex items-center gap-2">
                        <Clock size={16} /> {studyHours >= 8 ? 'Mastery Mode' : studyHours >= 5 ? 'Standard Path' : 'Moderate Pace'}
                      </p>
                    </div>
                  </div>

                  <div className="relative px-2">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="0.5"
                      value={studyHours}
                      onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                      className="w-full h-2 bg-theme-border rounded-full appearance-none cursor-pointer accent-brand-primary"
                    />
                    <div className="flex justify-between mt-4">
                      {[1, 4, 8, 12].map(h => (
                        <span key={h} className="text-[10px] font-black text-theme-muted">{h}h</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 3 */}
              <section className="space-y-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-rose-500 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">3</div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black">Focus Intelligence</h2>
                    <p className="text-theme-muted text-xs font-bold uppercase tracking-widest">Map your current proficiency gaps</p>
                  </div>
                </div>

                <div className="p-8 bg-theme-bg/50 rounded-3xl border border-theme-border space-y-6">
                  <p className="text-sm font-bold text-theme-muted flex items-center gap-2">
                    <Brain size={18} className="text-rose-500" />
                    Select subjects requiring reinforced synthesis ({weakSubjects.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentExam.subjects.map((subject) => {
                      const isSelected = weakSubjects.includes(subject.name);
                      return (
                        <button
                          key={subject.id}
                          onClick={() => toggleSubject(subject.name)}
                          className={`px-5 py-3 rounded-xl text-sm font-black transition-all border-2 ${isSelected
                            ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                            : 'bg-theme-bg border-theme-border text-theme-muted hover:border-theme-muted'
                            }`}
                        >
                          {subject.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <div className="pt-10 border-t border-theme-border">
                <button
                  onClick={handleSubmit}
                  className="premium-btn w-full py-5 text-xl"
                >
                  Initiate Learning Module <ArrowRight size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};