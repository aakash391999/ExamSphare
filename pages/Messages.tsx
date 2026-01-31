import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Send, User as UserIcon, MessageSquare, Search, MoreVertical, Phone, Video, PlusCircle, UserPlus, Image as ImageIcon, X, Users, ArrowLeft } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc, serverTimestamp, setDoc, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Conversation, DirectMessage, UserState } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { uploadFile } from '../services/storage';

export const Messages: React.FC = () => {
    const { user: currentUser } = useApp();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<UserState | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // "New Chat" modal state
    const [showNewChat, setShowNewChat] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const [following, setFollowing] = useState<UserState[]>([]);
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Listen for Conversations
    useEffect(() => {
        if (!currentUser.uid) return;
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
            setConversations(convs);
        });
        return () => unsubscribe();
    }, [currentUser.uid]);

    // 2. Handle URL param (e.g., coming from Profile page)
    useEffect(() => {
        const targetUserId = searchParams.get('userId');
        if (targetUserId && conversations.length > 0) {
            // Check if conversation exists
            const existing = conversations.find(c => c.participants.includes(targetUserId));
            if (existing) {
                setActiveConversationId(existing.id);
            } else {
                // Create new conversation placeholder logic or handle creation immediately
                // For simplicity, we create it active immediately if we want to force start
                createNewConversation(targetUserId);
            }
        }
    }, [searchParams, conversations]);

    // 3. Listen for Messages in Active Conversation
    useEffect(() => {
        if (!activeConversationId) return;

        // Identify other user
        const conv = conversations.find(c => c.id === activeConversationId);
        if (conv) {
            const otherId = conv.participants.find(p => p !== currentUser.uid);
            if (otherId) fetchOtherUser(otherId);
        }

        const q = query(
            collection(db, 'conversations', activeConversationId, 'messages'),
            orderBy('timestamp', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DirectMessage));
            setMessages(msgs);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [activeConversationId, conversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchOtherUser = async (uid: string) => {
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) setOtherUser(snap.data() as UserState);
        } catch (err) {
            console.error(err);
        }
    };

    const createNewConversation = async (targetUid: string) => {
        // Check if trying to chat with self
        if (targetUid === currentUser.uid) return;

        // Check if exists again to be safe (client-side check)
        const existing = conversations.find(c => c.participants.includes(targetUid));
        if (existing) {
            setActiveConversationId(existing.id);
            setShowNewChat(false);
            return;
        }

        try {
            const newConvRef = await addDoc(collection(db, 'conversations'), {
                participants: [currentUser.uid, targetUid],
                updatedAt: Date.now(),
                unreadCounts: { [currentUser.uid]: 0, [targetUid]: 0 }
            });
            setActiveConversationId(newConvRef.id);
            setShowNewChat(false);
        } catch (err) {
            console.error("Error creating chat:", err);
        }
    };

    const fetchFollowing = async () => {
        if (!currentUser.following || currentUser.following.length === 0) return;
        // Ideally batch fetch, but loop for MVP
        const users: UserState[] = [];
        for (const uid of currentUser.following) {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) users.push(snap.data() as UserState);
        }
        setFollowing(users);
    };

    const toggleUserSelection = (uid: string) => {
        if (selectedUsers.includes(uid)) {
            setSelectedUsers(prev => prev.filter(id => id !== uid));
        } else {
            setSelectedUsers(prev => [...prev, uid]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

        try {
            const participants = [currentUser.uid, ...selectedUsers];
            const newConvRef = await addDoc(collection(db, 'conversations'), {
                participants,
                updatedAt: Date.now(),
                unreadCounts: participants.reduce((acc, uid) => ({ ...acc, [uid]: 0 }), {}),
                isGroup: true,
                groupName: groupName,
                createdBy: currentUser.uid,
                groupAvatar: '' // Could add upload logic here later
            });

            setActiveConversationId(newConvRef.id);
            setShowNewChat(false);
            setIsCreatingGroup(false);
            setGroupName('');
            setSelectedUsers([]);
        } catch (err) {
            console.error("Error creating group:", err);
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !attachment) || !activeConversationId || !currentUser.uid) return;

        const content = newMessage;
        setNewMessage(''); // Optimistic clear
        const tempAttachment = attachment;
        setAttachment(null);

        try {
            let attachmentUrl = undefined;
            let attachmentType: 'image' | 'file' | undefined = undefined;

            if (tempAttachment) {
                attachmentUrl = await uploadFile(tempAttachment, `chat/${activeConversationId}`);
                attachmentType = tempAttachment.type.startsWith('image/') ? 'image' : 'file';
            }

            const msgData: Omit<DirectMessage, 'id'> = {
                senderId: currentUser.uid,
                content: content,
                timestamp: Date.now(),
                read: false,
                attachmentUrl,
                attachmentType
            };

            // Add message
            await addDoc(collection(db, 'conversations', activeConversationId, 'messages'), msgData);

            // Update conversation lastMessage
            await updateDoc(doc(db, 'conversations', activeConversationId), {
                lastMessage: msgData,
                updatedAt: Date.now()
                // Increment unread count logic would go here (requires cloud function or more complex client logic)
            });

        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] max-w-6xl mx-auto glass-card flex overflow-hidden animate-fade-in relative">
            {/* Sidebar - Hidden on mobile if chat is active */}
            <div className={`w-full md:w-80 border-r border-theme-border flex-col bg-theme-bg/50 backdrop-blur-sm absolute md:relative z-10 h-full transition-transform duration-300 ${activeConversationId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <div className="p-4 border-b border-theme-border flex justify-between items-center">
                    <h2 className="font-black text-xl">Messages</h2>
                    <button
                        onClick={() => { setShowNewChat(!showNewChat); fetchFollowing(); }}
                        className="p-2 hover:bg-theme-bg rounded-xl transition-colors text-brand-primary"
                    >
                        <PlusCircle size={20} />
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {showNewChat ? (
                        <div className="p-2 space-y-1">
                            <p className="px-3 py-2 text-xs font-bold text-theme-muted uppercase">New Chat</p>
                            {following.length > 0 ? following.map(u => (
                                <button
                                    key={u.uid}
                                    onClick={() => createNewConversation(u.uid)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-theme-bg rounded-xl text-left transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shrink-0">
                                        {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover rounded-full" /> : u.name.charAt(0)}
                                    </div>
                                    <span className="font-bold truncate">{u.name}</span>
                                </button>
                            )) : (
                                <div className="p-4 text-center text-sm text-theme-muted">
                                    <p>You aren't following anyone yet.</p>
                                    <button onClick={() => navigate('/network')} className="text-brand-primary hover:underline mt-2">Find People</button>
                                </div>
                            )}
                        </div>
                    ) : conversations.length > 0 ? (
                        conversations.map(conv => {
                            // We assume conversation fetch includes basic details. 
                            // In reality, we'd need to fetch user details for each conv if not stored in conv doc.
                            // For MVP, simplistic view:
                            const isActive = conv.id === activeConversationId;
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`w-full p-4 flex items-start gap-3 border-b border-theme-border/50 transition-colors hover:bg-theme-bg/50 ${isActive ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${conv.isGroup ? 'bg-indigo-500' : 'bg-slate-200 text-slate-500'}`}>
                                        {conv.isGroup ? <Users size={20} /> : <UserIcon size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-sm truncate">{conv.isGroup ? conv.groupName : 'Chat'}</h4>
                                            {conv.updatedAt && <span className="text-[10px] text-theme-muted">{new Date(conv.updatedAt).toLocaleDateString()}</span>}
                                        </div>
                                        <p className="text-xs text-theme-muted truncate">
                                            {conv.lastMessage ? (
                                                <>
                                                    {conv.isGroup && <span className="font-bold text-theme-main/70">User: </span>}
                                                    {conv.lastMessage.content || (conv.lastMessage.attachmentUrl ? 'Sent an attachment' : '')}
                                                </>
                                            ) : "No messages yet"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-theme-muted">
                            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-bold">No conversations.</p>
                            <p className="text-xs">Start a chat with a friend!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area - Full width on mobile, absolute positioning to slide in */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white/50 absolute md:relative z-20 h-full w-full md:w-auto transition-transform duration-300 bg-theme-bg md:bg-transparent ${activeConversationId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {activeConversationId ? (
                    <>
                        <div className="p-4 border-b border-theme-border flex justify-between items-center bg-white/80 backdrop-blur-md z-10 sticky top-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActiveConversationId(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-theme-bg rounded-lg text-theme-main"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${conversations.find(c => c.id === activeConversationId)?.isGroup ? 'bg-indigo-500' : 'bg-gradient-to-br from-brand-primary to-purple-600'}`}>
                                    {conversations.find(c => c.id === activeConversationId)?.isGroup ? <Users size={20} /> : (otherUser?.avatarUrl ? <img src={otherUser.avatarUrl} className="w-full h-full object-cover rounded-full" /> : otherUser?.name?.charAt(0) || <UserIcon size={20} />)}
                                </div>
                                <div>
                                    <h3 className="font-black text-theme-main">
                                        {conversations.find(c => c.id === activeConversationId)?.isGroup
                                            ? conversations.find(c => c.id === activeConversationId)?.groupName
                                            : (otherUser?.name || "Loading...")}
                                    </h3>
                                    {conversations.find(c => c.id === activeConversationId)?.isGroup ? (
                                        <p className="text-xs font-bold text-theme-muted">{conversations.find(c => c.id === activeConversationId)?.participants.length} members</p>
                                    ) : (
                                        (otherUser?.selectedExamId) && <p className="text-xs font-bold text-brand-primary">{otherUser.selectedExamId}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 text-theme-muted">
                                <button className="p-2 hover:bg-theme-bg rounded-lg"><Phone size={20} /></button>
                                <button className="p-2 hover:bg-theme-bg rounded-lg"><Video size={20} /></button>
                                <button className="p-2 hover:bg-theme-bg rounded-lg"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser.uid;
                                return (
                                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white border border-theme-border rounded-bl-none'}`}>
                                            {msg.attachmentUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden">
                                                    {msg.attachmentType === 'image' ? (
                                                        <img src={msg.attachmentUrl} className="w-full max-h-60 object-cover" />
                                                    ) : (
                                                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                                                            Attachment
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            <p className="font-medium text-sm md:text-base leading-relaxed">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-theme-border">
                            {attachment && (
                                <div className="mb-2 flex items-center gap-2 text-sm bg-theme-bg p-2 rounded-lg w-fit">
                                    <ImageIcon size={14} /> <span>{attachment.name}</span>
                                    <button onClick={() => setAttachment(null)}><X size={14} /></button>
                                </div>
                            )}
                            <form
                                className="flex gap-2 items-end"
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            >
                                <button type="button" className="p-3 text-theme-muted hover:bg-theme-bg rounded-xl transition-colors">
                                    <PlusCircle size={24} />
                                </button>
                                <div className="flex-1 bg-theme-bg rounded-2xl p-2 border border-theme-border focus-within:border-brand-primary transition-colors flex items-center gap-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                e.stopPropagation(); // Stop event bubbling
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="w-full bg-transparent border-none outline-none resize-none max-h-32 min-h-[24px] py-1 px-1 font-medium text-theme-main"
                                        rows={1}
                                    />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) setAttachment(e.target.files[0]);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-2 hover:text-brand-primary transition-colors ${attachment ? 'text-brand-primary' : 'text-theme-muted'}`}
                                    >
                                        <ImageIcon size={20} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !attachment)}
                                    className="p-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-24 h-24 bg-gradient-to-br from-brand-primary/20 to-purple-500/20 rounded-[2rem] flex items-center justify-center mb-6 animate-float">
                            <MessageSquare size={48} className="text-brand-primary" />
                        </div>
                        <h3 className="text-3xl font-black text-theme-main mb-2 tracking-tight">Your Messages</h3>
                        <p className="font-medium text-theme-muted max-w-sm mb-8">
                            Connect with other students, form study groups, and share resources in real-time.
                        </p>
                        <button
                            onClick={() => { setShowNewChat(true); fetchFollowing(); }}
                            className="premium-btn px-8 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-brand-primary/20"
                        >
                            <PlusCircle size={20} /> Start New Chat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
