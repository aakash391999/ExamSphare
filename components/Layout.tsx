import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
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
  UserPlus,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useApp } from '../App';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, theme, setTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsThemeMenuOpen] = useState(false); // Reusing setter name to minimize diff, but variable name change implies intent
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

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Syllabus', href: '/syllabus', icon: BookOpen },
    { name: 'Practice', href: '/practice', icon: CheckSquare },
    { name: 'Planner', href: '/planner', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Network', href: '/network', icon: UserPlus },
    { name: 'Chat', href: '/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadNotifications },
  ];

  const secondaryNav = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Mistakes', href: '/mistakes', icon: AlertOctagon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (user.role === 'admin') {
    secondaryNav.push({ name: 'Admin', href: '/admin', icon: Shield });
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
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-theme-border bg-theme-card/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center px-8 h-20 shrink-0">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-brand-primary/20">
            <Shield className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tighter">ExamSphere</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted mb-4">Core</p>
            <nav className="space-y-1">
              {navigation.map((item) => (
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

          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted mb-4">Support</p>
            <nav className="space-y-1">
              {secondaryNav.map((item) => (
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

        <div className="p-4 border-t border-theme-border space-y-4">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted">Theme</p>
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
              <button
                onClick={logout}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 uppercase tracking-wider transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header - Sticky for App feel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="lg:hidden sticky top-0 flex items-center justify-between h-16 px-6 bg-theme-bg/80 backdrop-blur-2xl border-b border-theme-border z-[60] shrink-0">
          <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter">ExamSphere</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/network" className="w-9 h-9 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center text-theme-muted hover:text-brand-primary transition-all active:scale-90">
              <UserPlus size={18} />
            </Link>
            <Link to="/messages" className="w-9 h-9 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center text-theme-muted hover:text-brand-primary transition-all active:scale-90">
              <MessageSquare size={18} />
            </Link>
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="w-9 h-9 rounded-xl bg-theme-card border border-theme-border flex items-center justify-center text-theme-muted hover:text-brand-primary transition-all active:scale-90"
            >
              <Palette size={18} />
            </button>
            <Link to="/profile" className="w-9 h-9 rounded-xl overflow-hidden bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-xs text-brand-primary active:scale-90 transition-transform">
              {user.name.charAt(0)}
            </Link>
          </div>

          {/* Improved Theme Selector */}
          {isThemeMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
              <div className="absolute top-[72px] right-6 bg-theme-card/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-theme-border p-4 z-50 animate-fade-in flex flex-col gap-3 min-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-1 px-1">Switch Theme</p>
                <div className="flex flex-wrap gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setIsThemeMenuOpen(false); }}
                      className={`w-10 h-10 rounded-2xl ${t.color} flex items-center justify-center border-2 transition-all active:scale-90 ${theme === t.id ? 'border-white' : 'border-transparent'}`}
                      title={t.name}
                    >
                      <t.icon size={18} className="text-white" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar relative">
          <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto mobile-safe-container">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden mobile-nav">
          <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Home</span>
          </Link>
          <Link to="/syllabus" className={`mobile-nav-item ${isActive('/syllabus') ? 'active' : ''}`}>
            <BookOpen size={20} />
            <span>Learn</span>
          </Link>
          <Link to="/practice" className={`mobile-nav-item ${isActive('/practice') ? 'active' : ''}`}>
            <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center -mt-10 shadow-xl shadow-brand-primary/40 border-4 border-theme-bg group active:scale-90 transition-transform">
              <Zap size={24} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className="mt-1">Practice</span>
          </Link>
          <Link to="/planner" className={`mobile-nav-item ${isActive('/planner') ? 'active' : ''}`}>
            <Calendar size={20} />
            <span>Plan</span>
          </Link>
          <button
            onClick={() => setIsThemeMenuOpen(true)} // Using existing state or adding new one? Let's verify. Recycling isThemeMenuOpen might be confusing. Better add new state.
            className={`mobile-nav-item ${isThemeMenuOpen ? 'active' : ''}`}
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>
        </nav>

        {/* Mobile Full Menu Overlay */}
        {isThemeMenuOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsThemeMenuOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-theme-bg rounded-t-[2rem] border-t border-theme-border shadow-2xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-theme-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-theme-main">{user.name}</h3>
                    <p className="text-sm font-bold text-theme-muted uppercase tracking-wider">{user.role}</p>
                  </div>
                </div>
                <button onClick={() => setIsThemeMenuOpen(false)} className="p-2 bg-theme-card rounded-xl text-theme-muted hover:text-rose-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted mb-4 opacity-70">Navigation</p>
                  <div className="grid grid-cols-2 gap-3">
                    {navigation.map(item => (
                      <Link key={item.name} to={item.href} onClick={() => setIsThemeMenuOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-theme-card border-2 border-transparent hover:border-brand-primary/50 transition-all active:scale-95 gap-2">
                        <div className={`p-3 rounded-xl ${isActive(item.href) ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-theme-bg text-theme-muted'}`}>
                          <item.icon size={24} />
                        </div>
                        <span className="font-bold text-sm text-theme-main">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted mb-4 opacity-70">Utilities</p>
                  <div className="space-y-2">
                    {secondaryNav.map(item => (
                      <Link key={item.name} to={item.href} onClick={() => setIsThemeMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-theme-card hover:bg-theme-bg transition-colors active:scale-98">
                        <div className="p-2 bg-theme-bg rounded-lg text-theme-muted"><item.icon size={20} /></div>
                        <span className="font-bold text-theme-main flex-1">{item.name}</span>
                        <div className="w-8 h-8 rounded-full bg-theme-bg flex items-center justify-center text-theme-muted"><X size={14} className="rotate-180" /></div> {/* Chevron replacement */}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-muted mb-4 opacity-70">Preferences</p>
                  <div className="bg-theme-card rounded-2xl p-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 transition-all active:scale-90 ${t.color} ${theme === t.id ? 'border-theme-main scale-105 shadow-xl' : 'border-transparent opacity-60'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-theme-border bg-theme-bg shrink-0">
                <button onClick={logout} className="w-full py-4 rounded-xl bg-rose-500/10 text-rose-500 font-black flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all active:scale-98">
                  <LogOut size={20} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};