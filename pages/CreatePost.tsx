import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { Send, Image as ImageIcon, FileText, X, ChevronLeft, Loader, Globe, Lock, Smile } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Post } from '../types';
import { uploadFile } from '../services/storage';
import { useNavigate } from 'react-router-dom';

export const CreatePost: React.FC = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [privacy, setPrivacy] = useState<'public' | 'connections'>('public');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            navigate('/community');
        } catch (err) {
            console.error("Error posting:", err);
            setIsPosting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto min-h-screen bg-theme-bg flex flex-col animate-fade-in relative z-50">
            {/* Header - Fixed & Premium */}
            <header className="sticky top-0 z-40 bg-theme-bg/80 backdrop-blur-xl border-b border-theme-border p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-theme-card rounded-full transition-colors text-theme-muted hover:text-theme-main"
                >
                    <ChevronLeft size={28} />
                </button>

                <h1 className="text-lg font-black tracking-tight opacity-0 md:opacity-100 transition-opacity">Create Post</h1>

                <button
                    onClick={handlePost}
                    disabled={(!newPostContent.trim() && !attachment) || isPosting}
                    className="bg-brand-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-brand-primary/25 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center gap-2"
                >
                    {isPosting ? <Loader className="animate-spin" size={16} /> : 'Post'}
                </button>
            </header>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
                <div className="flex gap-4">
                    {/* User Avatar */}
                    <div className="shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-theme-bg">
                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover rounded-full" /> : user.name.charAt(0)}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {/* User Name & Privacy Selector */}
                        <div>
                            <h3 className="font-bold text-theme-main leading-tight">{user.name}</h3>
                            <button
                                onClick={() => setPrivacy(privacy === 'public' ? 'connections' : 'public')}
                                className="mt-1 flex items-center gap-1 text-[10px] font-bold text-brand-primary border border-brand-primary/30 rounded-full px-2 py-0.5 w-fit hover:bg-brand-primary/5 transition-colors"
                            >
                                {privacy === 'public' ? <Globe size={10} /> : <Lock size={10} />}
                                {privacy === 'public' ? 'Public' : 'Connections Only'}
                            </button>
                        </div>

                        {/* Input Area */}
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="What do you want to share today?"
                            className="w-full bg-transparent border-none outline-none resize-none text-xl md:text-2xl text-theme-main placeholder:text-theme-muted/40 font-medium min-h-[150px] leading-relaxed"
                            autoFocus
                        />

                        {/* Attachment Preview */}
                        {attachment && (
                            <div className="relative rounded-2xl overflow-hidden border border-theme-border group inline-block max-w-full">
                                <img src={URL.createObjectURL(attachment)} className="max-w-full max-h-80 object-cover" />
                                <button
                                    onClick={() => setAttachment(null)}
                                    className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 backdrop-blur-sm transition-all shadow-lg active:scale-95"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar - Sticky above keyboard */}
            <div className={`sticky bottom-0 bg-theme-bg border-t border-theme-border p-4 transition-all pb-safe`}>
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className="flex gap-1 text-brand-primary">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 hover:bg-theme-card rounded-full transition-colors active:scale-95"
                            title="Add Photo"
                        >
                            <ImageIcon size={24} />
                        </button>
                        <button className="p-3 hover:bg-theme-card rounded-full transition-colors active:scale-95 text-theme-muted hover:text-brand-primary">
                            <FileText size={24} />
                        </button>
                        <button className="p-3 hover:bg-theme-card rounded-full transition-colors active:scale-95 text-theme-muted hover:text-brand-primary">
                            <Smile size={24} />
                        </button>
                    </div>

                    <div className="px-4 py-2">
                        <span className={`text-xs font-bold ${newPostContent.length > 280 ? 'text-rose-500' : 'text-theme-muted'}`}>
                            {newPostContent.length}/500
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
