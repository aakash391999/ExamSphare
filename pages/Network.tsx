import React, { useState } from 'react';
import { useApp } from '../App';
import { Search, UserPlus, UserCheck, Lock, Users, ExternalLink } from 'lucide-react';
import { collection, query, getDocs, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserState } from '../types';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export const Network: React.FC = () => {
    const { user: currentUser, toggleFollow } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Fetch Suggested Users
    const { data: results = [], isLoading } = useQuery({
        queryKey: ['users', 'suggested', searchTerm],
        queryFn: async () => {
            let q;
            if (searchTerm.trim()) {
                // Simple search query
                q = query(collection(db, 'users'), where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'), limit(20));
            } else {
                // Default suggested
                q = query(collection(db, 'users'), limit(20));
            }
            const snap = await getDocs(q);
            return snap.docs.map(d => d.data() as UserState).filter(u => u.uid !== currentUser.uid);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fade-in space-y-8">
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
                        placeholder="Search students..."
                        className="flex-1 bg-transparent outline-none font-bold text-base text-theme-main placeholder:text-theme-muted/50 min-w-0"
                    />
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center text-theme-muted">Loading...</div>
                ) : results.map(user => {
                    const isFollowing = currentUser.following?.includes(user.uid);
                    return (
                        <div key={user.uid} className="glass-card p-5 flex items-center gap-4 hover:border-brand-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(`/profile?uid=${user.uid}`)}>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-purple-500/20 flex items-center justify-center text-brand-primary font-black text-xl shrink-0">
                                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover rounded-2xl" /> : user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-base truncate text-theme-main group-hover:text-brand-primary transition-colors">{user.name}</h3>
                                    {user.isPrivate && <Lock size={12} className="text-theme-muted" />}
                                </div>
                                <p className="text-xs font-bold text-theme-muted truncate">{user.role === 'admin' ? 'Administrator' : 'Student'}</p>
                                {user.selectedExamId && <p className="text-[10px] uppercase tracking-widest text-brand-primary mt-1 opacity-70">Preparing</p>}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (toggleFollow) toggleFollow(user.uid);
                                }}
                                className={`h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isFollowing
                                        ? 'bg-theme-bg text-theme-muted border border-theme-border hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                                        : 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isFollowing ? (
                                    <>Following</>
                                ) : (
                                    <><UserPlus size={16} /> Follow</>
                                )}
                            </button>
                        </div>
                    );
                })}

                {results.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-20 h-20 bg-theme-bg border-4 border-theme-border rounded-[2rem] flex items-center justify-center mb-6 opacity-50">
                            <Users size={32} className="text-theme-muted" />
                        </div>
                        <h3 className="text-xl font-black text-theme-main mb-2">No students found</h3>
                        <p className="text-theme-muted font-bold max-w-xs mx-auto">Try searching for a different name.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
