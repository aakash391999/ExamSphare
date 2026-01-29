import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  BookOpen,
  GraduationCap,
  CheckSquare,
  BarChart2,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  AlertOctagon,
  Shield,
  Palette,
  Sun,
  Moon,
  Zap,
  Heart,
  User,
  Users,
  UsersRound,
  UserPlus,
  MessageSquare,
  MessageCircle,
  Bell,
  Search,
  Briefcase,
  Brain
} from 'lucide-react';
import { useApp } from '../App';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, theme, setTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Renamed from isThemeMenuOpen
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Listen for unread notifications
  React.useEffect(() => {
    if (!user.uid) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setUnreadNotifications(snap.size);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const bottomTabs = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Network', href: '/network', icon: UsersRound },
    { name: 'Practice', href: '/practice', icon: Brain, isAction: true }, // Changed to Brain
    { name: 'Community', href: '/community', icon: MessageCircle },
    { name: 'Learn', href: '/syllabus', icon: GraduationCap },
  ];

  // Drawer Items (Secondary)
  const drawerItems = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Planner', href: '/planner', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Mistakes', href: '/mistakes', icon: AlertOctagon },
    { name: 'Flashcards', href: `/flashcards/${user.selectedExamId || 'general'}`, icon: Zap }, // Added Flashcards
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (user.role === 'admin') {
    drawerItems.push({ name: 'Admin', href: '/admin', icon: Shield });
  }

  const themes: { id: 'default' | 'midnight' | 'aurora' | 'rose', name: string, icon: any, color: string }[] = [
    { id: 'default', name: 'Indigo Deep', icon: Shield, color: 'bg-indigo-600' },
    { id: 'midnight', name: 'Midnight', icon: Moon, color: 'bg-slate-900' },
    { id: 'aurora', name: 'Aurora', icon: Zap, color: 'bg-emerald-500' },
    { id: 'rose', name: 'Rose Petal', icon: Heart, color: 'bg-rose-500' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-theme-bg text-theme-main">
      {/* 1. Sidebar for Desktop (Unchanged mostly, just ensure it covers all links) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-theme-border bg-theme-card/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center px-8 h-20 shrink-0">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-brand-primary/20">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter">ExamSphere</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted mb-4">Menu</p>
            <nav className="space-y-1">
              {[...bottomTabs, ...drawerItems].filter((i: any) => !i.isAction).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 group ${isActive(item.href)
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                    : 'text-theme-muted hover:bg-theme-bg hover:text-theme-main'
                    }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        {/* Desktop User Footer */}
        <div className="p-4 border-t border-theme-border space-y-4">
          {/* Theme Logic stored here or drawer? Keeping simple here for desktop */}
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${t.color} ${theme === t.id ? 'border-theme-main scale-110' : 'border-transparent opacity-50'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-theme-bg rounded-2xl border border-theme-border">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center font-black text-white shadow-lg shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate">{user.name}</p>
              <button onClick={logout} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider">Disconnect</button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Layout Structure */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden relative">

        {/* Mobile Header (LinkedIn Style) */}
        <header className="lg:hidden sticky top-0 flex items-center gap-4 h-16 px-4 bg-theme-bg/90 backdrop-blur-xl border-b border-theme-border z-[60] shrink-0">
          {/* Avatar (Drawer Trigger) */}
          <button onClick={() => setIsDrawerOpen(true)} className="shrink-0 relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-black text-sm shadow-md border-2 border-theme-bg">
              {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
            </div>
            {/* Online/Badge indicator? */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-theme-bg rounded-full"></div>
          </button>

          {/* Search Bar (Fake) */}
          <div className="flex-1 h-9 bg-theme-card/80 rounded-lg flex items-center px-3 gap-2 border border-theme-border hover:border-brand-primary/50 transition-colors cursor-text" onClick={() => navigate('/network')}>
            <Search size={16} className="text-theme-muted" />
            <span className="text-xs font-bold text-theme-muted truncate">Search for students, exams...</span>
          </div>

          {/* Right Icons: Chat & Notifications */}
          <div className="flex items-center gap-1">
            <Link to="/messages" className="p-2 text-theme-muted hover:text-theme-main relative">
              <MessageSquare size={22} />
              {/* Badge if needed */}
            </Link>
            <Link to="/notifications" className="p-2 text-theme-muted hover:text-theme-main relative">
              <Bell size={22} />
              {unreadNotifications > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>}
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar relative">
          <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto pb-40 lg:pb-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (5 Tabs) */}
        <nav className="lg:hidden mobile-nav">
          {bottomTabs.map((tab, idx) => {
            const active = isActive(tab.href);
            if (tab.isAction) {
              // Center Action Button Style (Practice) - Circular Gradient FAB
              return (
                <Link key={tab.name} to={tab.href} className="mobile-nav-item active flex flex-col items-center justify-center pb-1 relative z-20">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      boxShadow: "0 8px 20px -6px rgba(99, 102, 241, 0.5)",
                      y: [0, -2, 0]
                    }}
                    transition={{
                      y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                    }}
                    className="w-14 h-14 bg-gradient-to-tr from-brand-primary to-brand-accent text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-theme-bg -mt-10"
                  >
                    <tab.icon size={26} fill="white" />
                  </motion.div>
                  <span className="text-[10px] font-black mt-1 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent opacity-100">{tab.name}</span>
                </Link>
              );
            }

            return (
              <Link key={tab.name} to={tab.href} className={`mobile-nav-item ${active ? 'active' : ''} relative`}>
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative z-10 p-1"
                >
                  <tab.icon
                    size={24}
                    strokeWidth={active ? 2.5 : 2}
                    // Fill logic: simple fill for active, outline for inactive
                    fill={active ? "currentColor" : "none"}
                    className={active ? "text-brand-primary drop-shadow-sm" : "text-theme-muted"}
                  />
                </motion.div>

                {/* No text for non-action items to keep it clean? Or keep text? User liked previous. keeping text. */}
                <span className={`text-[10px] font-bold transition-all ${active ? 'opacity-100 text-brand-primary' : 'opacity-60 text-theme-muted'}`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Mobile Left Drawer (Slide-over) */}
        {/* Overlay */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden h-[100dvh]">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsDrawerOpen(false)}
            />
            {/* Drawer Content */}
            <div className="absolute top-0 bottom-0 left-0 w-[80%] max-w-xs bg-theme-bg border-r border-theme-border shadow-2xl animate-slide-right flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 border-b border-theme-border bg-theme-card/30 pt-12">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-theme-bg">
                    {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black text-theme-main truncate">{user.name}</h2>
                    <Link to="/profile" onClick={() => setIsDrawerOpen(false)} className="text-brand-primary text-xs font-bold hover:underline">View Profile</Link>
                  </div>
                </div>
                {/* Stats Row */}
                <div className="flex gap-4 text-xs font-bold text-theme-muted">
                  <span><b className="text-theme-main">{user.followers?.length || 0}</b> Followers</span>
                  <span><b className="text-theme-main">{user.following?.length || 0}</b> Following</span>
                </div>
              </div>

              {/* Drawer Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="px-2 text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 mt-2">Shortcuts</p>
                {drawerItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center px-4 py-3.5 rounded-xl gap-4 font-bold text-sm transition-colors ${isActive(item.href) ? 'bg-brand-primary/10 text-brand-primary' : 'text-theme-muted hover:bg-theme-card hover:text-theme-main'}`}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Drawer Footer (Theme & Logout) */}
              <div className="p-4 border-t border-theme-border bg-theme-card/30 space-y-4 pb-10">
                {/* Compact Theme Switcher */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-theme-muted flex items-center gap-2"><Palette size={14} /> Theme</span>
                  <div className="flex gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`w-6 h-6 rounded-full border-2 ${t.color} ${theme === t.id ? 'border-theme-main ring-2 ring-offset-1 ring-theme-main/20' : 'border-transparent opacity-50'}`}
                      />
                    ))}
                  </div>
                </div>

                <button onClick={logout} className="w-full py-3 rounded-xl border border-theme-border font-bold text-sm text-theme-muted hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex items-center justify-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};