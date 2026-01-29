import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Search, UserPlus, UserCheck, Lock, Users } from 'lucide-react';
import { collection, query, getDocs, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserState } from '../types';
import { useNavigate } from 'react-router-dom';

export const Network: React.FC = () => {
    const { user: currentUser } = useApp(); // Used for follow status
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<UserState[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Initial fetch (Popular/Suggested)
    useEffect(() => {
        const fetchSuggested = async () => {
            setIsLoading(true);
            try {
                // For MVP, just fetch first 20 users
                // Ideally exclude current user and already followed
                const q = query(collection(db, 'users'), limit(20));
                const snap = await getDocs(q);
                const users = snap.docs.map(d => d.data() as UserState).filter(u => u.uid !== currentUser.uid);
                setResults(users);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuggested();
    }, [currentUser.uid]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        try {
            // Firestore doesn't support generic substring search easily without external services like Algolia.
            // For this hackathon scope, we will do a simple prefix match if name matches exactly or client side filter
            // Actually, client side filtering of the "suggested" list is safer for now if the user base is small.
            // But let's try a query.
            const q = query(collection(db, 'users'), where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'), limit(20));
            const snap = await getDocs(q);
            const users = snap.docs.map(d => d.data() as UserState).filter(u => u.uid !== currentUser.uid);
            setResults(users);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in space-y-8">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Network</h1>
                <p className="text-theme-muted font-bold">Find and connect with other students.</p>
            </header>

            {/* Search Bar */}
            <div className="glass-card p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
                <div className="flex-1 flex items-center gap-3 bg-theme-bg/50 px-3 py-2 rounded-xl border border-theme-border focus-within:border-brand-primary transition-colors">
                    <Search className="text-theme-muted shrink-0" size={18} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search students..."
                        className="flex-1 bg-transparent outline-none font-bold text-base text-theme-main placeholder:text-theme-muted/50 min-w-0"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="premium-btn px-6 py-3 md:py-2 text-sm rounded-xl font-bold active:scale-95 transition-transform"
                >
                    Search
                </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map(user => (
                    <div key={user.uid} className="glass-card p-6 flex items-center gap-4 hover:border-brand-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/profile?uid=${user.uid}`)}>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-purple-500/20 flex items-center justify-center text-brand-primary font-black text-xl shrink-0">
                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover rounded-2xl" /> : user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-lg truncate">{user.name}</h3>
                                {user.isPrivate && <Lock size={14} className="text-theme-muted" />}
                            </div>
                            <p className="text-xs font-bold text-theme-muted truncate">{user.email}</p>
                            {user.selectedExamId && <p className="text-[10px] uppercase tracking-widest text-brand-primary mt-1">Preparing for Exam</p>}
                        </div>
                        {/* Visual Indicator if following (Action is on Profile Page for now to keep grid simple) */}
                        {currentUser.following?.includes(user.uid) && (
                            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                                <UserCheck size={20} />
                            </div>
                        )}
                    </div>
                ))}

                {results.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-20 h-20 bg-theme-bg border-4 border-theme-border rounded-[2rem] flex items-center justify-center mb-6 opacity-50">
                            <Users size={32} className="text-theme-muted" />
                        </div>
                        <h3 className="text-xl font-black text-theme-main mb-2">No students found</h3>
                        <p className="text-theme-muted font-bold max-w-xs mx-auto">Try searching for a different name or browse the suggested list.</p>
                        <button
                            onClick={() => { setSearchTerm(''); }}
                            className="mt-6 text-brand-primary font-bold hover:underline text-sm"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
