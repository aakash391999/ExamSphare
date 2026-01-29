import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatTime } from '../utils/helpers';
import { Question } from '../types';
import { useApp } from '../App';
import { Clock, CheckCircle, XCircle, ArrowRight, BookOpen, AlertOctagon, Play, RotateCcw, ChevronDown, Sparkles, Target, Zap, Brain, Trophy, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { generateQuestions } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Loader } from '../components/ui/Loader';

// Simple progress component since the original import was failing
const Progress = ({ value, className = "" }: { value: number, className?: string }) => (
  <div className={`w-full bg-theme-border rounded-full h-2.5 overflow-hidden ${className}`}>
    <div
      className="h-full bg-brand-primary transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const Practice: React.FC = () => {
  const { user, addMistake, removeMistake, saveQuizResult, questions: allQuestions, currentExam, addQuestions } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State for flow control
  const [status, setStatus] = useState<'setup' | 'active' | 'finished'>('setup');
  const [quizType, setQuizType] = useState<'standard' | 'mistakes' | 'topic'>('standard');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [isGeneratingAssess, setIsGeneratingAssess] = useState(false);

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fixedMistakesCount, setFixedMistakesCount] = useState(0);

  // Error state for validation
  const [errorMsg, setErrorMsg] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const pendingMistakes = user.mistakes.length;

  // Auto-start if topicId is present in URL
  useEffect(() => {
    const topicId = searchParams.get('topicId');
    if (topicId && status === 'setup') {
      startPractice('topic', topicId);
    }
  }, [searchParams, status]);

  useEffect(() => {
    if (status === 'active' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (status === 'active' && timeLeft === 0) {
      handleFinish();
    }
  }, [timeLeft, status]);

  const startPractice = (type: 'standard' | 'mistakes' | 'topic', topicId?: string) => {
    setErrorMsg('');
    let q: Question[] = [];

    // Filter questions relevant to the current exam
    const examQuestions = allQuestions.filter(q => q.examId === currentExam?.id || !q.examId);

    if (type === 'mistakes') {
      q = allQuestions.filter(mq => user.mistakes.includes(mq.id));
    } else if (type === 'topic' || (type === 'standard' && selectedTopicId !== 'all')) {
      const targetId = topicId || selectedTopicId;
      q = examQuestions.filter(eq => eq.topicId === targetId);
      setQuizType('topic');
    } else {
      q = [...examQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuizType('standard');
    }

    if (q.length === 0) {
      if (type === 'topic' || (type === 'standard' && selectedTopicId !== 'all')) {
        const targetId = topicId || selectedTopicId;
        const topicObj = currentExam?.subjects.flatMap(s => s.topics).find(t => t.id === targetId);
        const topicName = topicObj?.name || "this topic";

        setIsGeneratingAssess(true);
        setErrorMsg('');

        generateQuestions(currentExam?.name || "Global Exam", topicName, 10).then(async (newQs) => {
          if (newQs.length > 0) {
            const formattedQs = newQs.map(q => ({
              ...q,
              topicId: targetId,
              examId: currentExam?.id || ""
            }));
            await addQuestions(formattedQs);

            setQuestions(formattedQs as Question[]);
            setQuizType('topic');
            setStatus('active');
            setTimeLeft(formattedQs.length * 60);
            setCurrentQuestionIndex(0);
            setScore(0);
            setFixedMistakesCount(0);
            setSelectedOption(null);
            setIsSubmitted(false);
          } else {
            setErrorMsg("Failed to generate assessment. Please try again later.");
          }
          setIsGeneratingAssess(false);
        });
        return;
      }

      setErrorMsg(type === 'mistakes' ? "No mistakes recorded! Great job!" : "No questions available for this exam yet.");
      if (type === 'standard') {
        setTimeout(() => setErrorMsg(''), 3000);
      }
      return;
    }

    setQuestions(q);
    setQuizType(type);
    setStatus('active');
    setTimeLeft(q.length * 60);

    setCurrentQuestionIndex(0);
    setScore(0);
    setFixedMistakesCount(0);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleOptionSelect = (index: number) => {
    if (!isSubmitted) setSelectedOption(index);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
      if (quizType === 'mistakes') {
        removeMistake(currentQuestion.id);
        setFixedMistakesCount(prev => prev + 1);
      }
    } else {
      addMistake(currentQuestion.id);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setStatus('finished');
    if (quizType === 'standard') {
      saveQuizResult(score, questions.length);
    }
  };

  if (isGeneratingAssess) {
    return <Loader message="Neural Synthesis" subtext="Constructing a precision-engineered assessment specifically for this topic..." type="brain" />;
  }

  if (status === 'setup') {
    return (
      <div className="space-y-6 md:space-y-8 animate-fade-in px-4 md:px-0 pb-20">
        <header className="text-center space-y-4 pt-4 md:pt-0">
          <div className="inline-flex w-14 h-14 md:w-16 md:h-16 bg-brand-primary/10 rounded-2xl items-center justify-center text-brand-primary">
            <Brain size={28} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Practice Zone</h1>
          <p className="text-theme-muted max-w-xl mx-auto text-sm md:text-base">Select your training mode to begin your personalized learning journey</p>
        </header>

        {errorMsg && (
          <div className="glass-card bg-rose-500/10 border-rose-500/20 p-4 text-center">
            <p className="text-rose-500 font-bold flex items-center justify-center gap-2 text-sm md:text-base">
              <AlertOctagon size={18} /> {errorMsg}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          {/* Practice Card */}
          <div className="glass-card p-6 md:p-10 space-y-6 md:space-y-8 flex flex-col">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-primary/30">
                <Target size={24} className="md:w-[28px]" />
              </div>
              <Badge variant="brand">Focus Mode</Badge>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl md:text-2xl font-black">Standard Session</h3>
              <p className="text-theme-muted text-xs md:text-sm leading-relaxed">Target specific topics or take a randomized assessment from your entire syllabus.</p>

              <div className="space-y-3">
                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-theme-muted flex items-center gap-2">
                  <Sparkles size={12} className="text-brand-primary md:w-3.5 md:h-3.5" /> Focus Area
                </label>
                <div className="relative">
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full h-12 md:h-14 px-4 bg-theme-bg border border-theme-border rounded-xl font-bold text-xs md:text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  >
                    <option value="all">🎲 All Topics (Mixed)</option>
                    {currentExam?.subjects.map(subject => (
                      <optgroup key={subject.id} label={subject.name}>
                        {subject.topics.map(topic => (
                          <option key={topic.id} value={topic.id}>📚 {topic.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted" size={16} />
                </div>
              </div>
            </div>

            <button
              onClick={() => startPractice('standard')}
              className="premium-btn w-full py-4 md:py-5 text-base md:text-lg"
            >
              Start Session <Play size={18} fill="currentColor" className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Revise Mistakes Card */}
          <div className="glass-card p-6 md:p-10 space-y-6 md:space-y-8 flex flex-col">
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${pendingMistakes > 0 ? 'bg-rose-500 shadow-rose-500/30' : 'bg-theme-border text-theme-muted'}`}>
                <Zap size={24} className="md:w-[28px]" />
              </div>
              <Badge variant={pendingMistakes > 0 ? 'danger' : 'outline'}>
                {pendingMistakes > 0 ? `${pendingMistakes} Pending` : 'Clean Slate'}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl md:text-2xl font-black">Revise Mistakes</h3>
              <p className="text-theme-muted text-xs md:text-sm leading-relaxed">Re-attempt questions you missed to reinforce concepts and fix knowledge gaps.</p>

              <div className="p-4 bg-theme-bg/50 rounded-xl border border-theme-border">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-theme-muted">Error History</span>
                  <span className="font-black">{pendingMistakes} questions</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => startPractice('mistakes')}
              disabled={pendingMistakes === 0}
              className={`premium-btn w-full py-4 md:py-5 text-base md:text-lg ${pendingMistakes === 0 ? 'grayscale opacity-50' : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/30'}`}
            >
              Begin Revision <RotateCcw size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const accuracy = questions.length > 0 ? (score / questions.length) * 100 : 0;

    return (
      <div className="max-w-3xl mx-auto animate-fade-in py-6 md:py-10 px-4 md:px-0 pb-24">
        <div className="glass-card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-primary to-brand-primary-dark p-8 md:p-12 text-center text-white">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 backdrop-blur-md">
              <Trophy size={32} className="md:w-10 md:h-10" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">Session Complete!</h2>
            <p className="text-white/70 text-xs md:text-base">Neural assessment data synthesized</p>
          </div>

          <div className="p-6 md:p-10 space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center">
                <p className="text-3xl md:text-4xl font-black text-emerald-500 mb-1">{score}</p>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Correct</p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center">
                <p className="text-3xl md:text-4xl font-black text-rose-500 mb-1">{questions.length - score}</p>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-rose-600/70">Mistakes</p>
              </div>
            </div>

            <div className="space-y-2 md:space-y-4">
              <div className="flex justify-between items-end px-2">
                <h4 className="font-black text-theme-main text-sm md:text-base">Accuracy</h4>
                <span className="text-xl md:text-2xl font-black text-brand-primary">{Math.round(accuracy)}%</span>
              </div>
              <Progress value={accuracy} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-4">
              <button
                onClick={() => setStatus('setup')}
                className="premium-btn py-3 md:py-4 text-sm md:text-base"
              >
                <RotateCcw size={18} className="md:w-5 md:h-5" /> New Session
              </button>
              <button
                onClick={() => navigate('/')}
                className="h-12 md:h-14 px-8 border border-theme-border rounded-xl font-bold bg-theme-bg hover:bg-theme-card transition-colors text-sm md:text-base"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 lg:pb-20 animate-fade-in px-4 md:px-0">
      {/* Quiz Header */}
      <div className="glass-card p-3 md:p-6 sticky top-2 md:top-4 z-40 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-primary/20">
              <span className="text-lg md:text-xl font-black">{currentQuestionIndex + 1}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-0.5">Question</p>
              <p className="text-sm font-bold">of {questions.length}</p>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
          </div>

          <div className={`px-3 py-2 md:px-4 md:py-2 rounded-xl flex items-center gap-2 md:gap-3 border ${timeLeft < 60 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'}`}>
            <Clock size={16} className="md:w-[18px]" />
            <span className="text-base md:text-lg font-black font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>
        {/* Mobile progress bar below */}
        <div className="mt-3 md:hidden">
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-1.5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-10 min-h-[400px] flex flex-col justify-between border-2 border-theme-border shadow-2xl relative overflow-hidden">
            {/* Background branding subtle */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 md:space-y-8 relative z-10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-bold border-theme-border text-theme-muted text-[10px] md:text-xs px-3 py-1 bg-white/5">
                  {currentQuestion.topicId ? "Domain Focus" : "Neural Assessment"}
                </Badge>
                {quizType === 'mistakes' && <Badge variant="danger" className="text-[10px] md:text-xs">Error Correction</Badge>}
              </div>

              <h2 className="text-xl md:text-3xl font-black leading-tight text-theme-main">
                {currentQuestion.text}
              </h2>

              <div className="space-y-3.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let stateClasses = "border-theme-border bg-theme-bg text-theme-main hover:border-brand-primary";
                  if (isSelected && !isSubmitted) stateClasses = "border-brand-primary bg-brand-primary/5 text-brand-primary ring-4 ring-brand-primary/10 scale-[1.02] shadow-lg";
                  if (isSubmitted) {
                    if (isCorrect) stateClasses = "border-emerald-500 bg-emerald-500/10 text-emerald-600 scale-[1.02] shadow-xl shadow-emerald-500/10 z-10";
                    else if (isSelected) stateClasses = "border-rose-500 bg-rose-500/10 text-rose-600 grayscale-0 opacity-100 z-10";
                    else stateClasses = "border-theme-border opacity-40 grayscale blur-[1px] bg-theme-bg";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isSubmitted}
                      className={`w-full p-4 md:p-6 text-left rounded-[1.5rem] border-2 transition-all flex items-center gap-4 group active:scale-95 ${stateClasses}`}
                    >
                      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black transition-all shrink-0 ${isSelected && !isSubmitted ? 'bg-brand-primary text-white scale-110 shadow-lg' :
                        isSubmitted && isCorrect ? 'bg-emerald-500 text-white scale-110' :
                          isSubmitted && isSelected ? 'bg-rose-500 text-white' : 'bg-theme-border/50 text-theme-muted'
                        }`}>
                        <span className="text-xs md:text-lg">{String.fromCharCode(65 + idx)}</span>
                      </div>
                      <span className="font-bold text-sm md:text-lg flex-1">{option}</span>
                      {isSubmitted && isCorrect && <CheckCircle className="text-emerald-500 shrink-0" size={20} />}
                      {isSubmitted && isSelected && !isCorrect && <XCircle className="text-rose-500 shrink-0" size={20} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop-only action area (redundant on mobile but kept for desktop flexibility) */}
            <div className="mt-10 hidden md:block">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="premium-btn w-full py-5 text-xl font-black"
                >
                  Confirm Choice <ArrowRight size={22} className="ml-2" />
                </button>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="explanation-card p-6 border-l-8 border-brand-primary bg-theme-bg/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                        <Sparkles size={20} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Logic Synthesis</p>
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none font-bold text-theme-muted leading-relaxed">
                      <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="premium-btn w-full py-5 text-xl bg-emerald-600 shadow-xl shadow-emerald-600/20 font-black"
                  >
                    {currentQuestionIndex < questions.length - 1 ? "Next Phase" : "Neural Analysis"}
                    <ArrowRight size={22} className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Explanation in separate card on mobile when submitted */}
          {isSubmitted && (
            <div className="md:hidden glass-card p-6 border-l-8 border-brand-primary bg-theme-bg/50 animate-fade-in mb-32">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary text-xs">
                  <Sparkles size={16} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Domain Explanation</p>
              </div>
              <div className="prose prose-sm prose-invert text-xs font-bold text-theme-muted leading-relaxed">
                <ReactMarkdown>{currentQuestion.explanation}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Fixed Action Bar */}
        <div className="md:hidden fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-theme-bg via-theme-bg/90 to-transparent z-[70] transition-transform animate-fade-in">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="premium-btn w-full py-5 text-lg font-black shadow-2xl active:scale-90"
            >
              Verify Answer <ArrowRight size={20} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="premium-btn w-full py-5 text-lg bg-emerald-600 shadow-2xl shadow-emerald-600/30 font-black active:scale-95"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Node" : "Complete Neural Sweep"}
              <ArrowRight size={20} className="ml-2" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:mb-0 mb-20">
        <div className="glass-card p-5 md:p-6 space-y-4 md:space-y-6 md:sticky md:top-28">
          <h3 className="font-black text-base md:text-lg">Session Score</h3>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 bg-theme-bg rounded-2xl border border-theme-border">
              <p className="text-2xl md:text-3xl font-black">{score}</p>
              <p className="text-[8px] md:text-[10px] font-bold text-theme-muted uppercase tracking-widest">Correct</p>
            </div>
            <div className="p-4 bg-theme-bg rounded-2xl border border-theme-border">
              <p className="text-2xl md:text-3xl font-black">{currentQuestionIndex + 1}</p>
              <p className="text-[8px] md:text-[10px] font-bold text-theme-muted uppercase tracking-widest">Handled</p>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3 pt-4 border-t border-theme-border">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-xs md:text-sm font-bold text-theme-muted hover:text-theme-main transition-colors"
            >
              Quit Session
            </button>
            <button
              onClick={() => setStatus('setup')}
              className="w-full py-3 text-xs md:text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
            >
              Reset Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};