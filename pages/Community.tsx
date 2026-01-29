import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Heart, MessageCircle, Share2, MoreHorizontal, Plus, Filter, Send, Trash2 } from 'lucide-react';
import { collection, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, addDoc, onSnapshot, deleteDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Post } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Comment Interface
interface Comment {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    timestamp: number;
}

export const Community: React.FC = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'following'>('all');
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Comment State
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // Real-time Posts Listener
    useEffect(() => {
        setIsLoading(true);
        const q = query(
            collection(db, 'posts'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

            // Client-side filtering for 'following' since Firestore 'in' query is limited and complex with ordering
            const filteredPosts = filter === 'following'
                ? fetchedPosts.filter(p => user.following?.includes(p.authorId) || p.authorId === user.uid)
                : fetchedPosts;

            setPosts(filteredPosts);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching posts:", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [filter, user.following, user.uid]);

    // Real-time Comments Listener (for expanded post)
    useEffect(() => {
        if (!expandedPostId) return;

        const q = query(
            collection(db, `posts/${expandedPostId}/comments`),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
            setComments(prev => ({ ...prev, [expandedPostId]: fetchedComments }));
        });

        return () => unsubscribe();
    }, [expandedPostId]);

    const handleLike = async (post: Post) => {
        if (!user.uid) return;
        const postRef = doc(db, 'posts', post.id);
        const isLiked = post.likes.includes(user.uid);

        // Optimistic Update (handled by onSnapshot, but we can do local for instant feel if snapshot is slow)
        // With onSnapshot, it's usually fast enough (<50ms).

        try {
            if (isLiked) {
                await updateDoc(postRef, { likes: arrayRemove(user.uid) });
            } else {
                await updateDoc(postRef, { likes: arrayUnion(user.uid) });
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

    const handleComment = async (postId: string) => {
        if (!newComment.trim() || !user.uid) return;
        setIsSubmittingComment(true);

        try {
            await addDoc(collection(db, `posts/${postId}/comments`), {
                text: newComment,
                authorId: user.uid,
                authorName: user.name,
                authorAvatar: user.avatarUrl || '',
                timestamp: Date.now()
            });

            // Increment comment count on post
            const postRef = doc(db, 'posts', postId);
            // We need to read current count or increment. Firestore 'increment' is best.
            // keeping it simple for now, relying on listener to update UI if we used increment
            // But we can just rely on the subcollection length in a real app, 
            // though syncing a counter on the parent doc is better for performance.
            // For now, let's just add the comment. The Post interface has 'commentsCount'.
            // We should update that too.
            // Get current post to find count? Or just increment blindly.
            // Since we are inside the map, we have the post object 'posts.find...'.
            const post = posts.find(p => p.id === postId);
            if (post) {
                await updateDoc(postRef, { commentsCount: (post.commentsCount || 0) + 1 });
            }

            setNewComment('');
        } catch (err) {
            console.error("Error adding comment:", err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const toggleComments = (postId: string) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
        }
    };

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
        <div className="max-w-3xl mx-auto pb-32 animate-fade-in relative min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Community</h1>
                    <p className="text-theme-muted font-bold">Connect with fellow aspirants</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/create-post')}
                        className="p-2 bg-brand-primary text-white border border-brand-primary rounded-xl hover:bg-brand-primary-dark transition-colors font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                        <Plus size={16} strokeWidth={3} /> New Post
                    </button>
                    <button
                        onClick={() => setFilter(filter === 'all' ? 'following' : 'all')}
                        className="p-2 bg-theme-bg border border-theme-border rounded-xl text-theme-muted hover:text-brand-primary transition-colors font-bold text-xs flex items-center gap-2"
                    >
                        <Filter size={16} /> {filter === 'all' ? 'All' : 'Following'}
                    </button>
                </div>
            </header>

            {/* Posts Feed */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-card p-6 h-48 animate-pulse" />
                        ))}
                    </div>
                ) : posts.map(post => (
                    <div key={post.id} className="glass-card p-4 md:p-6 space-y-4 animate-fade-in">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center font-black shrink-0 overflow-hidden">
                                    {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover" /> : post.authorName.charAt(0)}
                                </div>
                                <div onClick={() => navigate(`/profile?uid=${post.authorId}`)} className="cursor-pointer">
                                    <h4 className="font-black text-theme-main leading-tight hover:underline">{post.authorName}</h4>
                                    <p className="text-xs text-theme-muted font-bold">{timeAgo(post.timestamp)}</p>
                                </div>
                            </div>
                            {user.uid === post.authorId && (
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this post?')) {
                                            deleteDoc(doc(db, 'posts', post.id));
                                        }
                                    }}
                                    className="text-theme-muted hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="text-theme-main leading-relaxed whitespace-pre-wrap text-[15px]">
                            {post.content}
                        </div>

                        {post.attachmentUrl && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-theme-border bg-black/5">
                                <img src={post.attachmentUrl} alt="Post Attachment" className="w-full max-h-[500px] object-contain" />
                            </div>
                        )}

                        <div className="flex items-center gap-6 pt-4 border-t border-theme-border text-theme-muted">
                            <button
                                onClick={() => handleLike(post)}
                                className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.likes.includes(user.uid) ? 'text-rose-500' : 'hover:text-rose-500'}`}
                            >
                                <motion.div whileTap={{ scale: 0.8 }}>
                                    <Heart size={20} fill={post.likes.includes(user.uid) ? "currentColor" : "none"} />
                                </motion.div>
                                {post.likes.length || 0}
                            </button>
                            <button
                                onClick={() => toggleComments(post.id)}
                                className={`flex items-center gap-2 text-sm font-bold transition-colors ${expandedPostId === post.id ? 'text-blue-500' : 'hover:text-blue-500'}`}
                            >
                                <MessageCircle size={20} />
                                {post.commentsCount || 0}
                            </button>
                            <button className="flex items-center gap-2 text-sm font-bold hover:text-brand-primary transition-colors ml-auto">
                                <Share2 size={20} />
                            </button>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                            {expandedPostId === post.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-4 bg-theme-bg/30 -mx-4 md:-mx-6 px-4 md:px-6 pb-2 border-t border-theme-border mt-4">
                                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                            {comments[post.id]?.length > 0 ? (
                                                comments[post.id].map(comment => (
                                                    <div key={comment.id} className="flex gap-3 text-sm">
                                                        <div className="w-6 h-6 rounded-full bg-theme-card border border-theme-border flex items-center justify-center font-bold text-[10px] shrink-0">
                                                            {comment.authorAvatar ? <img src={comment.authorAvatar} className="w-full h-full rounded-full object-cover" /> : comment.authorName.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="font-bold text-theme-main text-xs">{comment.authorName}</span>
                                                                <span className="text-[10px] text-theme-muted">{timeAgo(comment.timestamp)}</span>
                                                            </div>
                                                            <p className="text-theme-muted leading-relaxed">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-xs text-theme-muted py-4">No comments yet. Be the first!</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="w-8 h-8 rounded-full bg-theme-card border border-theme-border flex items-center justify-center font-bold text-xs shrink-0">
                                                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 bg-theme-bg border border-theme-border rounded-full flex items-center px-4 py-1.5 focus-within:border-brand-primary transition-colors">
                                                <input
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="flex-1 bg-transparent border-none outline-none text-sm"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                />
                                                <button
                                                    onClick={() => handleComment(post.id)}
                                                    disabled={!newComment.trim() || isSubmittingComment}
                                                    className="text-brand-primary disabled:opacity-50"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {posts.length === 0 && !isLoading && (
                    <div className="text-center py-20 text-theme-muted opacity-50">
                        <MessageCircle size={48} className="mx-auto mb-4" />
                        <p className="font-bold text-lg">No posts yet</p>
                        <p className="text-sm">Be the first to share something!</p>
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) for Create Post */}

        </div>
    );
};

