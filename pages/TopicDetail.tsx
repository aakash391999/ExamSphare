import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { CheckCircle, Bot, Send, User, ArrowLeft, Play, List, Sparkles, RefreshCw, ChevronDown, Mic, Layers, Network, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { askAITutor, generateTopicStudyMaterial, generateSubtopicDetails, generateMindMap } from '../services/geminiService';
import { Badge } from '../components/ui/Badge';
import { SEO } from '../components/SEO';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';

import { ChatMessage } from '../types';

export const TopicDetail: React.FC = () => {
  const { topicId } = useParams();
  const { currentExam, markTopicCompleted, user, updateTopicContent, updateTopicSubtopicDetails, updateTopicMindMap, updateTopicChatHistory } = useApp();
  const navigate = useNavigate();

  const subject = currentExam?.subjects.find(s => s.topics.some(t => t.id === topicId));
  const topic = subject?.topics.find(t => t.id === topicId);

  const [activeTab, setActiveTab] = useState<'notes' | 'ai' | 'mindmap'>('notes');
  const [aiQuery, setAiQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingMaterial, setIsGeneratingMaterial] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mindMapRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
  }, []);

  // Render Mind Map
  useEffect(() => {
    const renderMindMap = async () => {
      if (activeTab === 'mindmap' && topic?.mindMap && mindMapRef.current) {
        try {
          mindMapRef.current.innerHTML = '';
          const { svg } = await mermaid.render(`mermaid-${topic.id}`, topic.mindMap);
          if (mindMapRef.current) {
            mindMapRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid Render Error:", error);
          if (mindMapRef.current) {
            mindMapRef.current.innerHTML = '<div class="text-rose-500 font-bold p-4 border border-rose-200 bg-rose-50 rounded-xl">Failed to render mind map. Data might be incomplete.</div>';
          }
        }
      }
    };
    renderMindMap();
  }, [activeTab, topic?.mindMap, topic?.id]);

  // Voice Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAiQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setAiQuery('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };



  // Auto-generation Logic
  useEffect(() => {
    const triggerGeneration = async () => {
      if (topic && topic.content.length < 1000 && !isGeneratingMaterial && currentExam && subject) {
        setIsGeneratingMaterial(true);
        try {
          const newContent = await generateTopicStudyMaterial(topic.name, subject.name, currentExam.name);
          if (newContent) {
            await updateTopicContent(currentExam.id, subject.id, topic.id, newContent);
          }
        } finally {
          setIsGeneratingMaterial(false);
        }
      }

      // Check for Subtopic Details
      if (topic && (!topic.subtopicDetails || topic.subtopicDetails.length === 0) && currentExam && subject) {
        try {
          const details = await generateSubtopicDetails(topic.name, topic.subtopics);
          if (details && details.length > 0) {
            await updateTopicSubtopicDetails(currentExam.id, subject.id, topic.id, details);
          }
        } catch (err) {
          console.error("Error generating subtopic details", err);
        }
      }

      // Check for Mind Map
      if (topic && !topic.mindMap && currentExam && subject) {
        try {
          // Only generate if we have subtopics to base it on
          const mindMap = await generateMindMap(topic.name, topic.subtopics);
          if (mindMap) {
            await updateTopicMindMap(currentExam.id, subject.id, topic.id, mindMap);
          }
        } catch (err) {
          console.error("Mind map generation error", err);
        }
      }
    };
    triggerGeneration();
  }, [topicId, topic?.content, topic?.subtopicDetails]); // Added dependencies to re-run if these change

  useEffect(() => {
    if (topic) {
      const savedMessages = user.chatHistory?.[topic.id] || [];
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        // Initial greeting if no history
        const initialMsg: ChatMessage = {
          id: 'init-1',
          role: 'ai',
          text: `Hi! I'm your AI tutor. Ask me anything about ${topic.name}. I can explain concepts, solve doubts, or give examples.`,
          timestamp: Date.now()
        };
        setMessages([initialMsg]);
      }
    }
  }, [topic, user.chatHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  if (!currentExam || !subject || !topic) return <div className="p-8">Topic not found</div>;

  const isCompleted = user.completedTopics.includes(topic.id);

  const handleAiAsk = async (manualQuery?: string) => {
    const queryToUse = manualQuery || aiQuery;
    if (!queryToUse.trim() || isAiLoading || !topic) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryToUse,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setAiQuery('');
    setIsAiLoading(true);
    updateTopicChatHistory(topic.id, newMessages);

    const answer = await askAITutor(topic.content, userMessage.text);

    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'ai',
      text: answer,
      timestamp: Date.now()
    };

    const finalMessages = [...newMessages, aiMessage];
    setMessages(finalMessages);
    setIsAiLoading(false);
    updateTopicChatHistory(topic.id, finalMessages);

    speakResponse(answer);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": topic.name,
    "description": topic.description,
    "learningResourceType": ["Concept Overview", "Mind Map", "AI Tutor"],
    "educationalLevel": currentExam?.name || "General",
    "author": {
      "@type": "Organization",
      "name": "ExamSphere"
    },
    "datePublished": new Date().toISOString().split('T')[0],
    "inLanguage": "en"
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-24 lg:pb-20 animate-fade-in h-auto lg:h-full">
      <SEO
        title={topic.name}
        description={topic.description || `Master ${topic.name} for ${currentExam?.name} with AI-powered notes and mind maps.`}
        structuredData={structuredData}
        keywords={`${topic.name}, ${currentExam?.name}, AI Tutor, Exam Prep, ${subject?.name}`}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-[500px] lg:min-h-[600px]">
        <div className="glass-card flex-1 flex flex-col lg:overflow-hidden border-2 border-theme-border shadow-2xl">
          {/* Header */}
          <header className="p-4 md:p-10 border-b border-theme-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 shrink-0 bg-theme-bg/30">
            <div className="flex items-start gap-4 md:gap-6 w-full md:w-auto">
              <button
                onClick={() => navigate('/syllabus')}
                className="w-10 h-10 md:w-12 md:h-12 bg-theme-bg border-2 border-theme-border hover:border-brand-primary rounded-xl md:rounded-2xl transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                <ArrowLeft size={18} className="text-theme-muted" />
              </button>
              <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h1 className="text-xl md:text-3xl font-black tracking-tight truncate">{topic.name}</h1>
                  <Badge variant={isCompleted ? 'success' : 'outline'} className="py-0.5 px-2 md:py-1 md:px-3 uppercase tracking-widest text-[8px] md:text-[10px] whitespace-nowrap">{isCompleted ? 'Synthesized' : 'Neural Processing'}</Badge>
                </div>
                <p className="text-xs md:text-sm font-bold text-theme-muted line-clamp-2">{topic.description}</p>
              </div>
            </div>

            <button
              onClick={() => markTopicCompleted(topic.id)}
              className={`premium-btn px-4 py-3 md:px-8 md:py-4 transition-all text-xs md:text-base w-full md:w-auto flex items-center justify-center ${isCompleted ? 'bg-emerald-500 shadow-emerald-500/20' : ''}`}
            >
              {isCompleted ? <CheckCircle size={16} /> : <Sparkles size={16} />}
              {isCompleted ? 'Mastered' : 'Complete Topic'}
            </button>
          </header>

          {/* Tabs - Sticky on Mobile */}
          <div className="flex border-b border-theme-border bg-theme-bg/60 backdrop-blur-xl shrink-0 overflow-x-auto no-scrollbar sticky top-0 md:relative z-30">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 md:flex-none py-4 px-4 md:py-6 md:px-10 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap active:bg-theme-bg/10 ${activeTab === 'notes' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
            >
              Intelligence Core
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 md:flex-none py-4 px-4 md:py-6 md:px-10 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-4 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:bg-theme-bg/10 ${activeTab === 'ai' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
            >
              Neural Tutor <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('mindmap')}
              className={`flex-1 md:flex-none py-4 px-4 md:py-6 md:px-10 text-[10px] md:text-xs font-black uppercase tracking-widest border-b-4 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:bg-theme-bg/10 ${activeTab === 'mindmap' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
            >
              Mind Map <Network size={12} className="md:w-3.5 md:h-3.5" />
            </button>
          </div>

          <div className="flex-1 relative min-h-[400px]">
            {activeTab === 'notes' && (
              <div className="lg:absolute lg:inset-0 lg:overflow-y-auto p-4 md:p-8 lg:p-14 custom-scrollbar scroll-smooth">
                {isGeneratingMaterial ? (
                  <div className="space-y-8 md:space-y-12 animate-pulse">
                    <div className="p-8 md:p-16 bg-theme-bg/50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-theme-border flex flex-col items-center justify-center text-center space-y-4 md:space-y-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary">
                        <RefreshCw className="animate-spin" size={32} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl md:text-2xl font-black">Synthesizing Domain Logic</h4>
                        <p className="text-xs md:text-base text-theme-muted font-bold">Constructing high-fidelity study modules via LLM synthesis.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                    <div className="bg-theme-bg p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border-2 border-theme-border prose prose-sm md:prose-lg prose-invert max-w-none prose-headings:font-black prose-p:font-bold prose-p:text-theme-muted">
                      <ReactMarkdown>{topic.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="flex flex-col h-[600px] lg:h-full bg-theme-bg relative">
                {/* Chat History */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar scroll-smooth"
                >
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
                      <div className={`max-w-[85%] md:max-w-[75%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-white border border-theme-border text-brand-primary'}`}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-[1.5rem] shadow-sm text-sm md:text-base leading-relaxed ${msg.role === 'user'
                            ? 'bg-brand-primary text-white rounded-tr-sm'
                            : 'bg-white border border-theme-border text-theme-main rounded-tl-sm'
                            }`}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                          <span className="text-[10px] font-bold text-theme-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isAiLoading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-theme-border text-brand-primary flex items-center justify-center shrink-0 shadow-md">
                          <Bot size={18} />
                        </div>
                        <div className="bg-white border border-theme-border px-5 py-4 rounded-[1.5rem] rounded-tl-sm shadow-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-brand-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-brand-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-brand-primary/40 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-theme-border z-10">
                  <div className="max-w-4xl mx-auto relative">

                    {/* Voice Listening Overlay */}
                    {isListening && (
                      <div className="absolute inset-x-0 -top-24 flex justify-center items-center pointer-events-none">
                        <div className="bg-slate-900/90 text-white backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                          <div className="flex items-center gap-1 h-4">
                            <div className="w-1 bg-rose-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ height: '40%' }}></div>
                            <div className="w-1 bg-rose-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.1s]" style={{ height: '80%' }}></div>
                            <div className="w-1 bg-rose-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.2s]" style={{ height: '50%' }}></div>
                            <div className="w-1 bg-rose-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.3s]" style={{ height: '90%' }}></div>
                            <div className="w-1 bg-rose-400 rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.4s]" style={{ height: '60%' }}></div>
                          </div>
                          <span className="font-bold text-sm tracking-wide">Listening...</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 items-end bg-theme-bg/50 p-2 rounded-[1.5rem] border border-theme-border hover:border-brand-primary/30 transition-colors focus-within:ring-4 focus-within:ring-brand-primary/5 focus-within:border-brand-primary/50">

                      <button
                        onClick={toggleListening}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${isListening
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 text-white animate-pulse'
                          : 'bg-theme-bg text-theme-muted hover:text-brand-primary hover:bg-white border border-transparent hover:border-theme-border'
                          }`}
                        title="Start Voice Input"
                      >
                        {isListening ? <Mic size={20} className="animate-pulse" /> : <Mic size={22} />}
                      </button>

                      <textarea
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Ask anything..."
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-sm md:text-base font-medium resize-none max-h-32 custom-scrollbar placeholder:text-theme-muted/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAiAsk();
                          }
                        }}
                        style={{ minHeight: '48px' }}
                      />

                      <button
                        onClick={() => handleAiAsk()}
                        disabled={isAiLoading || !aiQuery.trim()}
                        className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                      >
                        {isAiLoading ? (
                          <RefreshCw size={20} className="animate-spin" />
                        ) : (
                          <Send size={20} className="ml-0.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-theme-muted font-bold mt-3 uppercase tracking-widest opacity-60">
                      AI Tutor can make mistakes. Check important info.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mindmap' && (
              <div className="flex-1 p-4 md:p-10 flex flex-col items-center justify-center bg-white h-auto min-h-[600px] overflow-hidden relative">
                {!topic.mindMap ? (
                  <div className="space-y-6 text-center animate-pulse">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto text-brand-primary">
                      <Network className="animate-pulse" size={40} />
                    </div>
                    <h4 className="text-xl font-black text-slate-800">Visualizing Connections</h4>
                    <p className="text-slate-500 font-bold">Constructing neural map from topic nodes...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-full flex items-center justify-center overflow-auto cursor-grab active:cursor-grabbing">
                      <div
                        ref={mindMapRef}
                        className="mermaid origin-center transition-transform duration-200 ease-out"
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                      <button onClick={handleZoomIn} className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary active:scale-90 transition-all">
                        <ZoomIn size={20} />
                      </button>
                      <button onClick={handleResetZoom} className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary active:scale-90 transition-all font-black text-xs">
                        {Math.round(zoomLevel * 100)}%
                      </button>
                      <button onClick={handleZoomOut} className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary active:scale-90 transition-all">
                        <ZoomOut size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-4 md:space-y-8 animate-fade-in shrink-0">
        <div className="glass-card p-6 md:p-10 bg-slate-900 text-white border-2 border-slate-800 space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-4">
            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px] md:text-xs">Readiness Verification</Badge>
            <h3 className="text-xl md:text-2xl font-black">Retention Check</h3>
            <p className="text-slate-400 text-xs md:text-sm font-bold leading-relaxed">Optimize your long-term memory via focused assessment on this specific domain.</p>
          </div>
          <button
            onClick={() => navigate(`/practice?topicId=${topic.id}`)}
            className="w-full premium-btn py-4 md:py-5 bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-4"
          >
            <Play size={20} fill="currentColor" className="stroke-none md:w-6 md:h-6" />
            <span className="text-sm md:text-lg">Start Evaluation</span>
          </button>
        </div>

        <div className="glass-card p-6 md:p-10 bg-white border-2 border-slate-100 space-y-6 md:space-y-8 relative overflow-hidden group hover:border-brand-primary/50 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

          <div className="space-y-2 md:space-y-4 relative z-10">
            <Badge variant="outline" className="bg-brand-primary/5 text-brand-primary border-brand-primary/10">Active Recall</Badge>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">Smart Flashcards</h3>
            <p className="text-slate-500 text-xs md:text-sm font-bold leading-relaxed">
              Reinforce memory pathways with AI-generated spaced repetition cards.
            </p>
          </div>

          <button
            onClick={() => navigate(`/flashcards/${topic.id}`)}
            className="w-full py-4 md:py-5 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-600 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all active:scale-95"
          >
            <Layers size={20} />
            <span className="text-sm md:text-base">Open Deck</span>
          </button>
        </div>

        <div className="glass-card p-6 md:p-10 space-y-6 md:space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-theme-border/50 rounded-2xl flex items-center justify-center text-brand-primary">
              <List size={20} className="md:w-6 md:h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-black">Strategic Anchors</h3>
          </div>

          <div className="space-y-4">
            {topic.subtopicDetails && topic.subtopicDetails.length > 0 ? (
              <div className="space-y-4">
                {topic.subtopicDetails.map((detail, idx) => (
                  <div key={idx} className="group/item">
                    <details className="group/details">
                      <summary className="flex items-center justify-between cursor-pointer list-none py-2 gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-brand-primary font-black opacity-30 text-xs md:text-sm">{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="text-xs md:text-sm font-bold text-theme-main leading-relaxed">{detail.title}</span>
                        </div>
                        <div className="text-theme-muted transition-transform group-open/details:rotate-180">
                          <ChevronDown size={14} />
                        </div>
                      </summary>
                      <div className="pl-8 pb-4 space-y-3 animate-fade-in text-xs md:text-sm">
                        <p className="text-theme-muted leading-relaxed">{detail.description}</p>
                        <ul className="space-y-1.5">
                          {detail.keyPoints.map((point, kIdx) => (
                            <li key={kIdx} className="flex gap-2 items-start text-theme-muted/80">
                              <div className="w-1 h-1 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                    {idx < (topic.subtopicDetails?.length || 0) - 1 && <div className="h-px bg-theme-border/50 mt-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4 md:space-y-6">
                {topic.subtopics.map((st, idx) => (
                  <li key={idx} className="flex gap-4 group/item">
                    <span className="text-brand-primary font-black opacity-30 group-hover/item:opacity-100 transition-opacity text-xs md:text-base">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="text-xs md:text-sm font-bold text-theme-muted group-hover:text-theme-main transition-colors leading-relaxed">{st}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};