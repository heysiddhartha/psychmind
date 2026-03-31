import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, Trash2, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    Notification,
} from "@/lib/services/notificationService";
import type { RealtimeChannel } from "@supabase/supabase-js";

export default function NotificationBell() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Load notifications
    useEffect(() => {
        if (user?.id) {
            loadNotifications();

            // Subscribe to real-time notifications
            channelRef.current = subscribeToNotifications(user.id, (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Play sound for new notifications
                playNotificationSound();
            });
        }

        return () => {
            if (channelRef.current) {
                unsubscribeFromNotifications(channelRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        if (!user?.id) return;

        setLoading(true);
        const { data, unreadCount: count } = await getUserNotifications(user.id, { limit: 20 });
        setNotifications(data);
        setUnreadCount(count);
        setLoading(false);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await markAsRead(notificationId);
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const handleDelete = async (notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        await deleteNotification(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => { /* Audio playback failed - user interaction may be required */ });
        } catch (_) { /* Notification sound not available */ }
    };

    if (!user) return null;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    <CheckCheck className="w-4 h-4 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Bell className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative group px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <Link
                                        to={notification.link || '#'}
                                        onClick={() => {
                                            if (!notification.is_read) {
                                                handleMarkAsRead(notification.id);
                                            }
                                            setIsOpen(false);
                                        }}
                                        className="flex items-start gap-3"
                                    >
                                        {/* Icon */}
                                        <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </span>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatNotificationTime(notification.created_at)}
                                            </p>
                                        </div>

                                        {/* Unread dot */}
                                        {!notification.is_read && (
                                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                                        )}
                                    </Link>

                                    {/* Actions - show on hover */}
                                    <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="p-1.5 bg-white rounded-full shadow-sm hover:bg-green-50 text-gray-400 hover:text-green-600"
                                                title="Mark as read"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-600"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-t">
                            <Link
                                to="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-primary hover:text-primary/80 font-medium"
                            >
                                View all notifications →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
