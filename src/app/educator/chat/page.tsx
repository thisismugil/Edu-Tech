'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, User, Search, ArrowLeft } from 'lucide-react';

import Loader from '@/components/Loader';

export default function EducatorChatPage() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchMessages(selectedStudent._id);
            const interval = setInterval(() => fetchMessages(selectedStudent._id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedStudent]);

    const fetchUser = async () => {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
        }
    };

    const fetchStudents = async () => {
        const res = await fetch('/api/educator/students');
        if (res.ok) {
            const data = await res.json();
            setStudents(data);
        }
        setLoading(false);
    };

    const fetchMessages = async (studentId: string) => {
        const res = await fetch(`/api/chat/${studentId}`);
        if (res.ok) {
            const data = await res.json();
            setMessages(data);
            // Update unread count locally
            setStudents(prev => prev.map(s =>
                s._id === studentId ? { ...s, unreadCount: 0 } : s
            ));
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedStudent) return;

        await fetch(`/api/chat/${selectedStudent._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: newMessage }),
        });
        setNewMessage('');
        fetchMessages(selectedStudent._id);
    };

    if (loading) return <Loader />;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar - Student List */}
            <div className={`w-80 bg-white border-r border-gray-200 flex flex-col ${selectedStudent ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">Messages</h2>
                    <button onClick={() => router.push('/educator')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {students.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No students found</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <li key={student._id}>
                                    <button
                                        onClick={() => setSelectedStudent(student)}
                                        className={`w-full text-left px-4 py-4 hover:bg-gray-50 flex items-center justify-between ${selectedStudent?._id === student._id ? 'bg-accent/30' : ''}`}
                                    >
                                        <div className="flex items-center min-w-0">
                                            <div className="h-10 w-10 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="ml-3 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                            </div>
                                        </div>
                                        {student.unreadCount > 0 && (
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                                {student.unreadCount}
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
            <div className={`flex-1 flex flex-col ${!selectedStudent ? 'hidden md:flex' : 'flex'}`}>
                {selectedStudent ? (
                    <>
                        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <button onClick={() => setSelectedStudent(null)} className="md:hidden p-2 -ml-2 mr-2 text-gray-500">
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <h2 className="ml-3 text-lg font-medium text-gray-900">{selectedStudent.name}</h2>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg) => (
                                <div key={msg._id} className={`flex flex-col ${msg.senderId._id === user?.userId ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${msg.senderId._id === user?.userId
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                                        }`}>
                                        {msg.message}
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm p-2 border"
                                />
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium">
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p>Select a student to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
