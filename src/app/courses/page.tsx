'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, MessageSquare, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
    _id: string;
    title: string;
    description: string;
    educatorId: { name: string };
    level: string;
    totalDuration: string;
    thumbnailUrl?: string;
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchCourses();
        fetchUser();
    }, [search, level]);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    const fetchCourses = async () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (level) params.append('level', level);

        const res = await fetch(`/api/courses?${params.toString()}`);
        const data = await res.json();
        setCourses(data);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/" className="text-xl font-bold text-primary">EduTech</Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link href="/courses" className="border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Courses
                                </Link>
                                {user && user.role === 'student' && (
                                    <Link href="/chat" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        My Chat
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-700 flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        {user.name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium text-sm">
                                    Login / Signup
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="pl-10 w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary p-2 border"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary p-2 border"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link key={course._id} href={`/courses/${course._id}`} className="group">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                                <div className="h-48 bg-gray-200 w-full object-cover flex items-center justify-center text-gray-500">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                                            course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                        </span>
                                        <span className="text-gray-500 text-xs">{course.totalDuration}</span>
                                    </div>
                                    <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-primary">
                                        {course.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                                    <div className="mt-4 flex items-center pt-4 border-t border-gray-100">
                                        <div className="flex-shrink-0">
                                            <span className="sr-only">{course.educatorId?.name}</span>
                                            <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center text-primary font-bold">
                                                {course.educatorId?.name?.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{course.educatorId?.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
