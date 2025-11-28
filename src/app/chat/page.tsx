'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, User, Search, ArrowLeft, Send } from 'lucide-react';

import Loader from '@/components/Loader';

export default function StudentChatPage() {
    const router = useRouter();
    const [educators, setEducators] = useState<any[]>([]);
    const [selectedEducator, setSelectedEducator] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
        fetchEducators();
    }, []);

    useEffect(() => {
        if (selectedEducator) {
            fetchMessages(selectedEducator._id);
            const interval = setInterval(() => fetchMessages(selectedEducator._id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedEducator]);

    const fetchUser = async () => {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
        } else {
            router.push('/auth/login');
        }
    };

    const fetchEducators = async () => {
        const res = await fetch('/api/student/educators');
        if (res.ok) {
            const data = await res.json();
            setEducators(data);
        }
        setLoading(false);
    };

    const fetchMessages = async (educatorId: string) => {
        const res = await fetch(`/api/chat/${educatorId}`);
        if (res.ok) {
            const data = await res.json();
            setMessages(data);
            // Update unread count locally
            setEducators(prev => prev.map(e =>
                e._id === educatorId ? { ...e, unreadCount: 0 } : e
            ));
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedEducator) return;

        await fetch(`/api/chat/${selectedEducator._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: newMessage }),
        });
        setNewMessage('');
        fetchMessages(selectedEducator._id);
    };

    if (loading) return <Loader />;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar - Educator List */}
            <div className={`w-80 bg-white border-r border-gray-200 flex flex-col ${selectedEducator ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-primary text-white">
                    <h2 className="font-bold text-lg">Instructors</h2>
                    <button onClick={() => router.push('/courses')} className="text-white hover:text-gray-200">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search instructors..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {educators.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No instructors found. Enroll in a course to chat with instructors.</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {educators.map((educator) => (
                                <li key={educator._id}>
                                    <button
                                        onClick={() => setSelectedEducator(educator)}
                                        className={`w-full text-left px-4 py-4 hover:bg-gray-50 flex items-center justify-between ${selectedEducator?._id === educator._id ? 'bg-accent/30' : ''}`}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <div className="h-10 w-10 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="ml-3 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{educator.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{educator.email}</p>
                                            </div>
                                        </div>
                                        {educator.unreadCount > 0 && (
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                                {educator.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Main Content - Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedEducator ? 'hidden md:flex' : 'flex'}`}>
                {selectedEducator ? (
                    <>
                        <header className="bg-primary shadow-sm h-16 flex items-center justify-between px-4 text-white">
                            <div className="flex items-center">
                                <button onClick={() => setSelectedEducator(null)} className="md:hidden p-2 -ml-2 mr-2 text-white">
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="ml-3 text-lg font-medium">Chat with {selectedEducator.name}</h2>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex flex-col ${msg.senderId._id === user?.userId ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.senderId._id === user?.userId
                                        ? 'bg-white text-gray-900 rounded-tr-none border border-gray-200'
                                        : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                                        }`}>
                                        {/* Name label for context if needed, though usually omitted in 1-on-1 */}
                                        <div className="font-bold text-xs mb-1 text-gray-500 hidden">
                                            {msg.senderId._id === user?.userId ? 'You' : selectedEducator.name}
                                        </div>
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={sendMessage} className="flex gap-2 items-center">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Ask a question..."
                                        className="w-full border-gray-300 rounded-full focus:ring-primary focus:border-primary text-sm py-3 px-4 border shadow-sm"
                                    />
                                </div>
                                <button type="submit" className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 shadow-md transition-colors">
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="h-16 w-16 mx-auto text-primary/30 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700">Welcome to Student Chat</h3>
                            <p className="text-gray-500 mt-2">Select an instructor from the list to start a conversation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
