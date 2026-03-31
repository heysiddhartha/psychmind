import { useState, useEffect } from "react";
import { Bell, Check, X, ExternalLink } from "lucide-react";
import { supabase, Notification, subscribeToNotifications } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotificationCenter() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();

            // Subscribe to real-time notifications
            const channel = subscribeToNotifications(user.id, (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                supabase.removeChannel(channel);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const fetchNotifications = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', notificationId);

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('is_read', false);

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.data?.link) {
            navigate(notification.data.link as string);
        }
        setIsOpen(false);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'booking_confirmed': return '📅';
            case 'booking_reminder': return '⏰';
            case 'booking_cancelled': return '❌';
            case 'new_message': return '💬';
            case 'therapist_verified': return '✅';
            case 'payment_received': return '💳';
            default: return '🔔';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-cyan-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                {notification.message && (
                                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(notification.created_at)}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t bg-gray-50">
                                <button
                                    onClick={() => { navigate('/notifications'); setIsOpen(false); }}
                                    className="w-full text-center text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                                >
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
