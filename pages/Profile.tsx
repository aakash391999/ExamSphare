import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { User, MapPin, Link as LinkIcon, Calendar, Edit2, Save, X, Award, Flame, Target, Users, Share2, Github, Linkedin, Globe, Twitter, Lock, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove, addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserState } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
    const { user: currentUser, toggleFollow } = useApp();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const viewUid = searchParams.get('uid'); // Check if viewing another user

    const [profileUser, setProfileUser] = useState<UserState>(currentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'network'>('overview');

    const isOwnProfile = !viewUid || viewUid === currentUser.uid;
    const isPrivate = profileUser.isPrivate && !isOwnProfile;

    // Form State
    const [formData, setFormData] = useState({
        name: currentUser.name,
        bio: currentUser.bio || '',
        socialLinks: {
            github: currentUser.socialLinks?.github || '',
            linkedin: currentUser.socialLinks?.linkedin || '',
            twitter: currentUser.socialLinks?.twitter || '',
            website: currentUser.socialLinks?.website || '',
        }
    });

    // Fetch Profile if viewing someone else
    useEffect(() => {
        const fetchProfile = async () => {
            if (viewUid && viewUid !== currentUser.uid) {
                setIsLoading(true);
                try {
                    const docSnap = await getDoc(doc(db, 'users', viewUid));
                    if (docSnap.exists()) {
                        setProfileUser(docSnap.data() as UserState);
                    }
                } catch (err) {
                    console.error("Error fetching profile:", err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setProfileUser(currentUser);
            }
        };
        fetchProfile();
    }, [viewUid, currentUser]);


    const handleSave = async () => {
        if (!currentUser.uid) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                name: formData.name,
                bio: formData.bio,
                socialLinks: formData.socialLinks
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleFollow = async () => {
        if (!currentUser.uid || !profileUser.uid) return;

        // Optimistic local update for profileUser state (follower count)
        const isFollowing = currentUser.following?.includes(profileUser.uid);

        if (isFollowing) {
            setProfileUser(prev => ({
                ...prev,
                followers: prev.followers?.filter(id => id !== currentUser.uid) || []
            }));
        } else {
            setProfileUser(prev => ({
                ...prev,
                followers: [...(prev.followers || []), currentUser.uid]
            }));
        }

        // Call global toggle
        await toggleFollow(profileUser.uid);
    };

    const stats = [
        { label: 'Study Streak', value: `${profileUser.stats?.streak || 0} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Total Points', value: profileUser.stats?.points || 0, icon: Target, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        { label: 'Global Rank', value: profileUser.stats?.rank || 'Unranked', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Connections', value: (profileUser.followers?.length || 0) + (profileUser.following?.length || 0), icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    const hasAccess = isOwnProfile || !isPrivate || (currentUser.following?.includes(profileUser.uid));

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-fade-in">
                <div className="glass-card overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="px-10 pb-10">
                        <div className="flex items-end -mt-16 mb-6 gap-6">
                            <Skeleton className="w-32 h-32 rounded-[2rem] border-4 border-white" />
                            <div className="space-y-2 mb-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-6 md:space-y-8 animate-fade-in">
            {/* Profile Header Card */}
            <div className="glass-card relative overflow-hidden group">
                {/* Banner with gradient */}
                <div className="h-32 md:h-48 bg-gradient-to-r from-brand-primary via-purple-600 to-rose-500 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-6 md:px-10 pb-6 md:pb-10 relative">
                    {/* Avatar & Action Bar */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-end -mt-10 md:-mt-16 mb-4 md:mb-6">
                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2rem] bg-theme-bg border-4 border-theme-bg shadow-2xl flex items-center justify-center relative overflow-hidden shrink-0">
                            {profileUser.avatarUrl ? (
                                <img src={profileUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white text-2xl md:text-5xl font-black">
                                    {profileUser.name.charAt(0)}
                                </div>
                            )}
                            {isOwnProfile && (
                                <button className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-md">
                                    <Edit2 size={10} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1 md:space-y-2 mt-1 md:mt-0 w-full">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-transparent border-b-2 border-brand-primary text-xl md:text-4xl font-black text-theme-main focus:outline-none w-full"
                                />
                            ) : (
                                <h1 className="text-xl md:text-4xl font-black text-theme-main tracking-tight truncate flex items-center gap-2 md:gap-3">
                                    {profileUser.name}
                                    {profileUser.role === 'admin' && <Badge variant="brand" className="text-[10px] md:text-xs align-middle">Admin</Badge>}
                                </h1>
                            )}
                            <p className="text-theme-muted font-bold flex items-center gap-2 text-xs md:text-base">
                                <span className="truncate">{profileUser.email}</span>
                                <span className="w-1 h-1 rounded-full bg-theme-border"></span>
                                <span className="text-brand-primary">Student</span>
                            </p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                            {isOwnProfile ? (
                                isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 md:flex-none py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-bold border border-theme-border hover:bg-theme-bg/50 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 md:flex-none premium-btn py-2.5 md:py-3 px-4 md:px-6 text-sm flex items-center justify-center gap-2"
                                        >
                                            <Save size={16} /> Save
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 md:flex-none py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-bold border border-theme-border hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2 active:scale-95 bg-white/50 backdrop-blur-sm text-sm"
                                    >
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )
                            ) : (
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                        onClick={handleFollow}
                                        className={`flex-1 md:flex-none py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-bold border flex items-center justify-center gap-2 active:scale-95 transition-all text-sm ${currentUser.following?.includes(profileUser.uid)
                                            ? 'border-theme-border bg-theme-bg text-theme-muted'
                                            : profileUser.pendingRequests?.includes(currentUser.uid)
                                                ? 'border-brand-primary text-brand-primary bg-brand-primary/10'
                                                : 'bg-brand-primary text-white border-brand-primary hover:bg-brand-primary-dark'
                                            }`}
                                    >
                                        {currentUser.following?.includes(profileUser.uid) ? (
                                            <><UserCheck size={16} /> Following</>
                                        ) : profileUser.pendingRequests?.includes(currentUser.uid) ? (
                                            <><User size={16} /> Requested</>
                                        ) : (
                                            <><UserPlus size={16} /> Follow</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/messages?userId=${profileUser.uid}`)}
                                        className="flex-1 md:flex-none py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-bold border border-theme-border hover:bg-theme-bg/50 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <MessageCircle size={16} /> Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {hasAccess ? (
                        /* Full View Logic */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-theme-muted font-bold uppercase tracking-widest text-xs">
                                        <User size={14} /> Bio
                                    </div>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-theme-bg/50 border-2 border-theme-border rounded-xl p-4 min-h-[100px] focus:border-brand-primary outline-none transition-colors resize-none font-medium"
                                            placeholder="Tell the world about yourself..."
                                        />
                                    ) : (
                                        <p className="text-theme-main leading-relaxed font-medium">
                                            {profileUser.bio || "No bio added yet."}
                                        </p>
                                    )}
                                </div>

                                {/* Social Links View/Edit logic */}
                                {isEditing && (
                                    <div className="space-y-4 pt-4 border-t border-theme-border">
                                        <div className="flex items-center gap-2 text-theme-muted font-bold uppercase tracking-widest text-xs">
                                            <LinkIcon size={14} /> Social Links
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 bg-theme-bg/50 p-3 rounded-xl border border-theme-border focus-within:border-brand-primary transition-colors">
                                                <Github size={18} className="text-theme-muted" />
                                                <input
                                                    type="text"
                                                    placeholder="GitHub Username"
                                                    value={formData.socialLinks.github}
                                                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                                                    className="bg-transparent outline-none w-full text-sm font-bold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 bg-theme-bg/50 p-3 rounded-xl border border-theme-border focus-within:border-brand-primary transition-colors">
                                                <Linkedin size={18} className="text-theme-muted" />
                                                <input
                                                    type="text"
                                                    placeholder="LinkedIn URL"
                                                    value={formData.socialLinks.linkedin}
                                                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                                                    className="bg-transparent outline-none w-full text-sm font-bold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 bg-theme-bg/50 p-3 rounded-xl border border-theme-border focus-within:border-brand-primary transition-colors">
                                                <Twitter size={18} className="text-theme-muted" />
                                                <input
                                                    type="text"
                                                    placeholder="Twitter Handle"
                                                    value={formData.socialLinks.twitter}
                                                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                                                    className="bg-transparent outline-none w-full text-sm font-bold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 bg-theme-bg/50 p-3 rounded-xl border border-theme-border focus-within:border-brand-primary transition-colors">
                                                <Globe size={18} className="text-theme-muted" />
                                                <input
                                                    type="text"
                                                    placeholder="Personal Website"
                                                    value={formData.socialLinks.website}
                                                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
                                                    className="bg-transparent outline-none w-full text-sm font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isEditing && profileUser.socialLinks && Object.values(profileUser.socialLinks).some(Boolean) && (
                                    <div className="flex gap-3 pt-2">
                                        {profileUser.socialLinks.github && (
                                            <a href={`https://github.com/${profileUser.socialLinks.github}`} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-theme-bg border border-theme-border hover:border-black hover:text-black transition-colors text-theme-muted">
                                                <Github size={20} />
                                            </a>
                                        )}
                                        {profileUser.socialLinks.linkedin && (
                                            <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-theme-bg border border-theme-border hover:border-blue-600 hover:text-blue-600 transition-colors text-theme-muted">
                                                <Linkedin size={20} />
                                            </a>
                                        )}
                                        {profileUser.socialLinks.twitter && (
                                            <a href={`https://twitter.com/${profileUser.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-theme-bg border border-theme-border hover:border-sky-500 hover:text-sky-500 transition-colors text-theme-muted">
                                                <Twitter size={20} />
                                            </a>
                                        )}
                                        {profileUser.socialLinks.website && (
                                            <a href={profileUser.socialLinks.website} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-theme-bg border border-theme-border hover:border-brand-primary hover:text-brand-primary transition-colors text-theme-muted">
                                                <Globe size={20} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stats Side Card */}
                            <div className="space-y-4">
                                <div className="p-6 bg-theme-bg/50 rounded-3xl border border-theme-border space-y-6">
                                    <h3 className="font-black text-lg">Performance Stats</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                                        {stats.map((stat, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                                    <stat.icon size={22} />
                                                </div>
                                                <div>
                                                    <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-xs font-bold text-theme-muted uppercase tracking-wider">{stat.label}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Private Account View */
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                            <div className="w-20 h-20 bg-theme-bg border-4 border-theme-border rounded-full flex items-center justify-center text-theme-muted">
                                <Lock size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-theme-main">This Account is Private</h3>
                                <p className="text-theme-muted font-bold max-w-sm mx-auto">Follow this user to see their posts, achievements, and stats.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {hasAccess && (
                <div className="space-y-6">
                    <div className="flex border-b border-theme-border overflow-x-auto no-scrollbar">
                        {['overview', 'achievements', 'network'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-8 py-4 font-black text-xs md:text-sm uppercase tracking-widest border-b-4 transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-theme-muted hover:text-theme-main'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-full py-12 text-center text-theme-muted border-2 border-dashed border-theme-border rounded-[2rem] bg-theme-bg/30">
                                <div className="w-16 h-16 bg-theme-border/50 rounded-full flex items-center justify-center mx-auto mb-4 text-theme-muted">
                                    <Edit2 size={24} />
                                </div>
                                <h3 className="text-xl font-black text-theme-main">Activity Feed</h3>
                                <p className="max-w-md mx-auto mt-2">Recent activity is hidden or empty.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {profileUser.achievements?.map(ach => (
                                <div key={ach.id} className="glass-card p-6 flex flex-col items-center text-center space-y-3 hover:border-brand-primary/50 transition-colors cursor-default">
                                    <div className="text-4xl">{ach.icon}</div>
                                    <div>
                                        <h4 className="font-black text-theme-main">{ach.title}</h4>
                                        <p className="text-xs text-theme-muted leading-tight mt-1">{ach.description}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{new Date(ach.dateEarned).toLocaleDateString()}</Badge>
                                </div>
                            )) || (
                                    <div className="col-span-full py-12 text-center text-theme-muted">
                                        <Award size={40} className="mx-auto mb-4 opacity-50" />
                                        <p>No achievements yet.</p>
                                    </div>
                                )}
                        </div>
                    )}
                    {activeTab === 'network' && (
                        <div className="col-span-full py-12 text-center text-theme-muted border-2 border-dashed border-theme-border rounded-[2rem] bg-theme-bg/30">
                            <Users size={40} className="mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-black text-theme-main">Network</h3>
                            <p className="max-w-md mx-auto mt-2 text-sm">{profileUser.followers?.length || 0} Followers • {profileUser.following?.length || 0} Following</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
