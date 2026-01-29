import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { User, Heart, MessageCircle, Share2, MoreHorizontal, Send, Image as ImageIcon, FileText, Search, UserPlus, X } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { collection, addDoc, query, orderBy, onSnapshot, where, getDocs, limit, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Post } from '../types';
import { formatTime } from '../utils/helpers';
import { uploadFile } from '../services/storage';

export const Community: React.FC = () => {
    const { user } = useApp();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [filter, setFilter] = useState<'all' | 'following'>('all');
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Posts
    useEffect(() => {
        // Ideally we filter by following if filter === 'following'
        // For now, let's just show global feed for MVP Phase 1
        const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
            setPosts(fetchedPosts);
        });

        return () => unsubscribe();
    }, [filter]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handlePost = async () => {
        if ((!newPostContent.trim() && !attachment) || !user.uid) return;
        setIsPosting(true);

        try {
            let attachmentUrl = '';
            if (attachment) {
                attachmentUrl = await uploadFile(attachment, `posts/${user.uid}`);
            }

            const newPost: Omit<Post, 'id'> = {
                authorId: user.uid,
                authorName: user.name,
                authorAvatar: user.avatarUrl,
                content: newPostContent,
                timestamp: Date.now(),
                likes: [],
                commentsCount: 0,
                type: 'general',
                tags: [],
                attachmentUrl
            };

            await addDoc(collection(db, 'posts'), newPost);
            setNewPostContent('');
            setAttachment(null);
        } catch (err) {
            console.error("Error posting:", err);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (post: Post) => {
        if (!user.uid) return;
        const postRef = doc(db, 'posts', post.id);
        const isLiked = post.likes.includes(user.uid);

        try {
            if (isLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(user.uid)
                });

                // Create Notification (only if not liking own post)
                if (post.authorId !== user.uid) {
                    await addDoc(collection(db, 'notifications'), {
                        type: 'like',
                        recipientId: post.authorId,
                        senderId: user.uid,
                        senderName: user.name,
                        senderAvatar: user.avatarUrl || '',
                        postId: post.id,
                        read: false,
                        timestamp: Date.now()
                    });
                }
            }
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };

    // Time ago helper
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in flex gap-8 items-start">
            {/* Main Feed */}
            <div className="flex-1 min-w-0 space-y-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Community</h1>
                        <p className="text-theme-muted font-bold">Connect with {user.selectedExamId ? 'fellow aspirants' : 'students'}</p>
                    </div>
                </header>

                {/* Create Post Box */}
                <div className="glass-card p-4 md:p-6 space-y-4">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-black shrink-0">
                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover rounded-xl" /> : user.name.charAt(0)}
                        </div>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Share a study tip, question, or milestone..."
                            className="flex-1 bg-transparent border-none outline-none resize-none text-theme-main placeholder:text-theme-muted/70 font-medium min-h-[80px]"
                        />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-theme-border">
                        <div className="flex gap-2 text-theme-muted">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-theme-bg rounded-lg transition-colors"
                                title="Add Image"
                            >
                                <ImageIcon size={20} className={attachment ? 'text-brand-primary' : ''} />
                            </button>
                            <button className="p-2 hover:bg-theme-bg rounded-lg transition-colors" title="Add Note/Resource">
                                <FileText size={20} />
                            </button>
                        </div>
                        <button
                            onClick={handlePost}
                            disabled={(!newPostContent.trim() && !attachment) || isPosting}
                            className="premium-btn py-2 px-6 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPosting ? 'Posting...' : <>Post <Send size={16} /></>}
                        </button>
                    </div>
                    {attachment && (
                        <div className="relative inline-block mt-2">
                            <div className="text-xs bg-theme-bg p-2 rounded-lg border border-theme-border flex items-center gap-2">
                                <ImageIcon size={12} /> {attachment.name}
                                <button onClick={() => setAttachment(null)} className="hover:text-red-500"><X size={12} /></button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Feed Tabs */}
                <div className="flex border-b border-theme-border">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${filter === 'all' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-theme-muted'}`}
                    >
                        Global Feed
                    </button>
                    <button
                        onClick={() => setFilter('following')}
                        className={`px-6 py-3 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${filter === 'following' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-theme-muted'}`}
                    >
                        Following
                    </button>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post.id} className="glass-card p-4 md:p-6 space-y-4 animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center font-black shrink-0">
                                        {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover rounded-xl" /> : post.authorName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-theme-main leading-tight hover:underline cursor-pointer">{post.authorName}</h4>
                                        <p className="text-xs text-theme-muted font-bold">{timeAgo(post.timestamp)}</p>
                                    </div>
                                </div>
                                <button className="text-theme-muted hover:text-theme-main">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="text-theme-main leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </div>

                            {post.attachmentUrl && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-theme-border">
                                    <img src={post.attachmentUrl} alt="Post Attachment" className="w-full max-h-96 object-cover" />
                                </div>
                            )}

                            <div className="flex items-center gap-6 pt-4 border-t border-theme-border text-theme-muted">
                                <button
                                    onClick={() => handleLike(post)}
                                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.likes.includes(user.uid) ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                >
                                    <Heart size={18} fill={post.likes.includes(user.uid) ? "currentColor" : "none"} />
                                    {post.likes.length || 0}
                                </button>
                                <button className="flex items-center gap-2 text-sm font-bold hover:text-blue-500 transition-colors">
                                    <MessageCircle size={18} />
                                    {post.commentsCount || 0}
                                </button>
                                <button className="flex items-center gap-2 text-sm font-bold hover:text-brand-primary transition-colors ml-auto">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-10 text-theme-muted">
                            <MessageCircle size={40} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">No posts yet. Be the first to share something!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar (Desktop) */}
            <div className="hidden lg:block w-80 shrink-0 space-y-6">
                {/* Suggested connections */}
                <div className="glass-card p-5 space-y-4">
                    <h3 className="font-black text-lg flex items-center gap-2">
                        <UserPlus size={18} className="text-brand-primary" /> Suggested
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-theme-bg border border-theme-border" />
                                <div className="flex-1 min-w-0">
                                    <div className="h-4 bg-theme-bg rounded w-2/3 mb-1.5 animate-pulse" />
                                    <div className="h-3 bg-theme-bg rounded w-1/2 animate-pulse" />
                                </div>
                                <button className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors">
                                    <UserPlus size={16} />
                                </button>
                            </div>
                        ))}
                        <p className="text-xs text-center text-theme-muted">Real suggestions coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
