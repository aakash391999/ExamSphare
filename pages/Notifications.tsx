import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, writeBatch, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Notification } from '../types';
import { Heart, UserPlus, MessageCircle, Check, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/helpers';

export const Notifications: React.FC = () => {
    const { user } = useApp();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.uid) return;

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, [user.uid]);

    const handleMarkAllRead = async () => {
        const batch = writeBatch(db);
        const unread = notifications.filter(n => !n.read);
        unread.forEach(n => {
            const ref = doc(db, 'notifications', n.id);
            batch.update(ref, { read: true });
        });
        try {
            await batch.commit();
        } catch (err) {
            console.error("Error marking all read:", err);
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        // Mark as read
        if (!notif.read) {
            await updateDoc(doc(db, 'notifications', notif.id), { read: true });
        }

        // Navigate based on type
        if (notif.type === 'like' || notif.type === 'comment') {
            // In a real app we'd navigate to the specific post. 
            // For now, go to community feed.
            navigate('/community');
        } else if (notif.type === 'follow') {
            navigate(`/profile?uid=${notif.senderId}`); // Use query param or route
        } else if (notif.type === 'message') {
            navigate('/messages');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={16} className="text-rose-500 fill-rose-500" />;
            case 'follow': return <UserPlus size={16} className="text-brand-primary" />;
            case 'connection_request': return <User size={16} className="text-purple-500" />;
            case 'comment': return <MessageCircle size={16} className="text-blue-500" />;
            default: return <MessageCircle size={16} />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20 animate-fade-in">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
                    <p className="text-theme-muted font-bold">Stay updated</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                    >
                        <Check size={14} /> Mark all read
                    </button>
                )}
            </header>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`glass-card p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-theme-bg/50 ${!notif.read ? 'border-l-4 border-l-brand-primary' : 'opacity-80'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-theme-bg flex items-center justify-center shrink-0 border border-theme-border">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-theme-main">
                                    <span className="font-bold">{notif.senderName}</span>
                                    {notif.type === 'like' && " liked your post."}
                                    {notif.type === 'comment' && " commented on your post."}
                                    {notif.type === 'follow' && " started following you."}
                                    {notif.type === 'message' && " sent you a message."}
                                    {notif.type === 'connection_request' && " sent a follow request."}
                                </p>
                                <p className="text-xs text-theme-muted mt-1">{formatTime(notif.timestamp)}</p>

                                {/* Action Buttons for Connection Requests */}
                                {notif.type === 'connection_request' && !notif.read && (
                                    <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={async () => {
                                                const batch = writeBatch(db);
                                                // 1. Add sender to my followers
                                                batch.update(doc(db, 'users', user.uid), { followers: arrayUnion(notif.senderId), pendingRequests: arrayRemove(notif.senderId) });
                                                // 2. Add me to sender's following
                                                batch.update(doc(db, 'users', notif.senderId), { following: arrayUnion(user.uid) });
                                                // 3. Mark notification read
                                                batch.update(doc(db, 'notifications', notif.id), { read: true });
                                                await batch.commit();
                                            }}
                                            className="bg-brand-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const batch = writeBatch(db);
                                                batch.update(doc(db, 'users', user.uid), { pendingRequests: arrayRemove(notif.senderId) });
                                                batch.update(doc(db, 'notifications', notif.id), { read: true });
                                                await batch.commit();
                                            }}
                                            className="bg-theme-bg border border-theme-border text-theme-main px-4 py-1.5 rounded-lg text-xs font-bold active:scale-95 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!notif.read && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-theme-muted opacity-50">
                        <div className="w-16 h-16 bg-theme-bg rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={32} />
                        </div>
                        <p className="font-bold">No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};
