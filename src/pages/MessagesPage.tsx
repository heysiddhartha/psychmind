import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search, Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Image, Smile, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
    getUserConversations,
    getConversationMessages,
    sendMessage,
    markMessagesAsRead,
    subscribeToConversation,
    sendTypingIndicator,
    formatMessageTime,
    isUserOnline,
    uploadMessageAttachment,
    ConversationWithParticipant,
    MessageWithSender,
} from "@/lib/services/messageService";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function MessagesPage() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [conversations, setConversations] = useState<ConversationWithParticipant[]>([]);
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeConversation = conversations.find(c => c.id === conversationId);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Load conversations
    useEffect(() => {
        if (!user) return;

        const loadConversations = async () => {
            const { data, error } = await getUserConversations(user.id);
            if (!error) {
                setConversations(data);
            }
            setLoading(false);
        };

        loadConversations();
    }, [user]);

    // Load messages when conversation changes
    useEffect(() => {
        if (!conversationId || !user) return;

        const loadMessages = async () => {
            setMessagesLoading(true);
            const { data, error } = await getConversationMessages(conversationId);
            if (!error) {
                setMessages(data);
                // Mark messages as read
                await markMessagesAsRead(conversationId, user.id);
            }
            setMessagesLoading(false);
        };

        loadMessages();

        // Cleanup previous subscription
        if (channelRef.current) {
            channelRef.current.unsubscribe();
        }

        // Subscribe to realtime messages
        channelRef.current = subscribeToConversation(conversationId, {
            onNewMessage: (message) => {
                setMessages(prev => [...prev, message as MessageWithSender]);
                // Mark as read if it's from the other person
                if (message.sender_id !== user.id) {
                    markMessagesAsRead(conversationId, user.id);
                }
            },
            onMessageUpdate: (message) => {
                setMessages(prev => prev.map(m => m.id === message.id ? message as MessageWithSender : m));
            },
            onTyping: (userId) => {
                if (userId !== user.id) {
                    setTypingUser(userId);
                    // Clear typing indicator after 2 seconds
                    setTimeout(() => setTypingUser(null), 2000);
                }
            },
        });

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
            }
        };
    }, [conversationId, user]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        if (!channelRef.current || !user) return;

        sendTypingIndicator(channelRef.current, user.id);

        // Debounce typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            // Stop sending typing indicator
        }, 1000);
    }, [user]);

    const handleSend = async () => {
        if (!newMessage.trim() || !conversationId || !user || sending) return;

        setSending(true);
        const receiverId = activeConversation?.otherParticipant?.id;
        if (!receiverId) {
            toast({
                title: "Message failed",
                description: "Recipient not found for this conversation.",
                variant: "destructive",
            });
            setSending(false);
            return;
        }

        const { error } = await sendMessage(conversationId, user.id, newMessage.trim(), receiverId);

        if (!error) {
            setNewMessage("");
        } else {
            toast({
                title: "Message failed",
                description: error.message,
                variant: "destructive",
            });
        }
        setSending(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !conversationId || !user) return;

        setUploadingFile(true);
        const { url, error } = await uploadMessageAttachment(file, conversationId);

        if (url && !error) {
            const receiverId = activeConversation?.otherParticipant?.id;
            if (!receiverId) {
                toast({
                    title: "Attachment failed",
                    description: "Recipient not found for this conversation.",
                    variant: "destructive",
                });
            } else {
                const { error: sendError } = await sendMessage(
                    conversationId,
                    user.id,
                    `Sent a file: ${file.name}`,
                    receiverId,
                    url,
                    file.type,
                    file.name
                );
                if (sendError) {
                    toast({
                        title: "Attachment failed",
                        description: sendError.message,
                        variant: "destructive",
                    });
                }
            }
        } else if (error) {
            toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive",
            });
        }
        setUploadingFile(false);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.otherParticipant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Messages | psychmind</title>
            </Helmet>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar - Conversations List */}
                <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                            <Link to="/dashboard" className="text-primary text-sm font-medium">
                                Dashboard
                            </Link>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No conversations yet</p>
                                <p className="text-sm text-gray-400 mt-1">Book a session to start chatting with a therapist</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    to={`/messages/${conv.id}`}
                                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${conversationId === conv.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                                >
                                    <div className="relative">
                                        {conv.otherParticipant?.avatar_url ? (
                                            <img
                                                src={conv.otherParticipant.avatar_url}
                                                alt={conv.otherParticipant.full_name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-semibold">
                                                    {conv.otherParticipant?.full_name?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                        )}
                                        {isUserOnline(conv.otherParticipant?.last_seen_at) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-gray-900 truncate">
                                                {conv.otherParticipant?.full_name || 'Unknown'}
                                            </p>
                                            {conv.last_message_at && (
                                                <span className="text-xs text-gray-400">
                                                    {formatMessageTime(conv.last_message_at)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {conv.last_message_preview || 'No messages yet'}
                                        </p>
                                    </div>
                                    {(conv.unreadCount || 0) > 0 && (
                                        <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {conversationId && activeConversation ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link to="/messages" className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                {activeConversation.otherParticipant?.avatar_url ? (
                                    <img
                                        src={activeConversation.otherParticipant.avatar_url}
                                        alt={activeConversation.otherParticipant.full_name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold">
                                            {activeConversation.otherParticipant?.full_name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {activeConversation.otherParticipant?.full_name || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-green-500">
                                        {typingUser ? 'Typing...' :
                                            isUserOnline(activeConversation.otherParticipant?.last_seen_at) ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100"
                                    onClick={() => navigate(`/call/${conversationId}?mode=audio`)}
                                >
                                    <Phone className="w-5 h-5 text-gray-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100"
                                    onClick={() => navigate(`/call/${conversationId}?mode=video`)}
                                >
                                    <Video className="w-5 h-5 text-gray-600" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                        >
                            {messagesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No messages yet</p>
                                    <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                                                {/* File attachment */}
                                                {msg.file_url && (
                                                    <a
                                                        href={msg.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`block mb-1 px-3 py-2 rounded-lg text-sm ${isMe ? 'bg-primary/80 text-white' : 'bg-white border text-gray-700'
                                                            }`}
                                                    >
                                                        📎 {msg.file_name || 'Attachment'}
                                                    </a>
                                                )}
                                                {/* Message bubble */}
                                                {msg.content && (
                                                    <div
                                                        className={`px-4 py-2.5 rounded-2xl ${isMe
                                                            ? 'bg-primary text-white rounded-br-md'
                                                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md'
                                                            }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                )}
                                                {/* Time & read status */}
                                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <span className="text-xs text-gray-400">
                                                        {formatMessageTime(msg.created_at)}
                                                    </span>
                                                    {isMe && msg.is_read && (
                                                        <span className="text-xs text-primary">✓✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white p-4 border-t border-gray-100">
                            <div className="flex gap-3 items-end">
                                {/* File upload */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*,application/pdf,.doc,.docx"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100 shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                >
                                    {uploadingFile ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                    ) : (
                                        <Paperclip className="w-5 h-5 text-gray-500" />
                                    )}
                                </Button>

                                {/* Message input */}
                                <div className="flex-1 relative">
                                    <textarea
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyPress={handleKeyPress}
                                        rows={1}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none max-h-32"
                                        style={{ minHeight: '48px' }}
                                    />
                                </div>

                                {/* Send button */}
                                <Button
                                    onClick={handleSend}
                                    className="btn-icy px-6 shrink-0"
                                    disabled={!newMessage.trim() || sending}
                                >
                                    {sending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h3>
                            <p className="text-gray-500">Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
