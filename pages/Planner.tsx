import React, { useState } from 'react';
import { useApp } from '../App';
import { generateStudyPlan } from '../services/geminiService';
import { Calendar, Clock, CheckCircle, Circle, Plus, Trash2, RefreshCw, ArrowRight, AlertCircle, Target } from 'lucide-react';
import { StudyTask } from '../types';
import { Badge } from '../components/ui/Badge';

export const Planner: React.FC = () => {
  const { user, currentExam, updateDailyTasks } = useApp();
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleGeneratePlan = async () => {
    if (!currentExam) return;
    setLoading(true);
    // Use user's configured study hours, defaulting to 4 if not set
    const tasks = await generateStudyPlan(currentExam.name, user.studyHours || 4, user.weakSubjects);
    updateDailyTasks(tasks);
    setLoading(false);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = user.dailyTasks.map(task =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    updateDailyTasks(updatedTasks);
  };

  const removeTask = (taskId: string) => {
    const updatedTasks = user.dailyTasks.filter(task => task.id !== taskId);
    updateDailyTasks(updatedTasks);
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: StudyTask = {
      id: `manual-${Date.now()}`,
      title: newTaskTitle,
      subject: 'Custom',
      duration: 30,
      type: 'Learning',
      isCompleted: false
    };
    updateDailyTasks([...user.dailyTasks, newTask]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const completedCount = user.dailyTasks.filter(t => t.isCompleted).length;
  const totalCount = user.dailyTasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Daily Planner</h1>
          <p className="text-theme-muted font-bold mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex-1 md:w-48">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-theme-muted mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-theme-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {totalCount === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary">
            <Calendar size={40} />
          </div>
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-black">Ready to optimize?</h2>
            <p className="text-theme-muted font-bold leading-relaxed">
              Generate a personalized study roadmap targeting your weak areas ({user.weakSubjects.join(', ') || 'Global Curriculum'}).
            </p>
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="premium-btn px-10 py-5 text-lg"
          >
            {loading ? <RefreshCw className="animate-spin mr-2" /> : <Calendar className="mr-2" />}
            {loading ? "Synthesizing Plan..." : "Generate AI Plan"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {user.dailyTasks.map((task) => (
              <div
                key={task.id}
                className={`glass-card p-5 group flex items-start gap-4 transition-all duration-300 border-2 ${task.isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-transparent'
                  }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-theme-border bg-theme-bg hover:border-brand-primary'
                    }`}
                >
                  {task.isCompleted && <CheckCircle size={20} />}
                </button>

                <div className="flex-1 min-w-0 py-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className={`text-lg font-black truncate transition-all ${task.isCompleted ? 'text-theme-muted line-through opacity-50' : 'text-theme-main'}`}>
                      {task.title}
                    </h3>
                    <Badge variant={
                      task.type === 'Revision' ? 'warning' :
                        task.type === 'Practice' ? 'brand' :
                          'outline'
                    } className="w-fit">
                      {task.type}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 mt-3">
                    <span className="flex items-center text-xs font-black uppercase tracking-widest text-theme-muted gap-2">
                      <Clock size={14} /> {task.duration}m
                    </span>
                    <span className="flex items-center text-xs font-black uppercase tracking-widest text-theme-muted gap-2">
                      <Circle size={8} fill="currentColor" className="text-brand-primary" /> {task.subject}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => removeTask(task.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-8 flex justify-center">
              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="px-6 py-3 rounded-xl border border-theme-border font-bold text-theme-muted hover:text-theme-main transition-all flex items-center gap-3"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                Regenerate Session Plan
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card bg-slate-900 text-white p-8 space-y-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 blur-[60px] rounded-full"></div>
              <div className="relative space-y-2">
                <h3 className="text-xl font-black">Learning Focus</h3>
                <p className="text-slate-400 text-sm font-bold">Optimization targets for this session</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.weakSubjects.map(subj => (
                  <Badge key={subj} className="bg-white/10 text-white border-white/20 px-3 py-1.5">{subj}</Badge>
                ))}
                {user.weakSubjects.length === 0 && <p className="text-sm font-bold opacity-50 italic">No specific targets yet.</p>}
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Session Goal</p>
                  <p className="text-3xl font-black text-brand-primary-light">{user.studyHours}h</p>
                </div>
                <Target size={32} className="text-white/20" />
              </div>
            </div>

            <div className="glass-card p-6 space-y-6">
              <h3 className="font-black flex items-center gap-3">
                <AlertCircle className="text-amber-500" size={20} />
                Strategy Guide
              </h3>
              <ul className="space-y-4">
                {[
                  "Focus on high-impact weak subjects first.",
                  "Take a 5-minute break after each task.",
                  "Drink water to stay sharp."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-4 text-sm font-bold text-theme-muted leading-relaxed">
                    <span className="shrink-0 text-brand-primary">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="glass-card w-full max-w-md p-8 relative animate-fade-in">
            <h3 className="text-2xl font-black mb-6">Custom Objective</h3>
            <input
              autoFocus
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g., Mastery of Thermodynamics"
              className="w-full bg-theme-bg border-2 border-theme-border rounded-2xl px-5 py-4 mb-8 font-bold focus:border-brand-primary outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-14 rounded-2xl border border-theme-border font-bold hover:bg-theme-bg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="flex-[1.5] premium-btn"
              >
                Add Objective
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};