'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Book, Users, BarChart, MessageSquare } from 'lucide-react';

export default function EducatorDashboard() {
    const [stats, setStats] = useState<any>({ totalCourses: 0, totalStudents: 0, courses: [] });
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
        fetchDashboardData();
    }, []);

    const fetchUser = async () => {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user);
    };

    const fetchDashboardData = async () => {
        const res = await fetch('/api/educator/dashboard');
        if (res.ok) {
            const data = await res.json();
            setStats(data);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-primary">Educator Portal</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.name}</span>
                            <button onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/')} className="text-sm text-red-600 hover:text-red-800">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex space-x-3">
                        <Link href="/educator/chat" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Messages
                        </Link>
                        <Link href="/educator/courses/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Course
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-primary rounded-md p-3">
                                    <Book className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.totalCourses}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.totalStudents}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Your Courses</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {stats.courses.map((course: any) => (
                            <li key={course._id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium text-primary truncate">{course.title}</p>
                                            <p className="text-sm text-gray-500">{course.topic} • {course.level}</p>
                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                {course.studentCount} Students
                                                {course.students && course.students.length > 0 && (
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        ({course.students.map((s: any) => s.name).join(', ')})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            <Link href={`/courses/${course._id}`} className="ml-4 text-sm text-gray-500 hover:text-gray-700">
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {stats.courses.length === 0 && !loading && (
                            <li className="px-4 py-8 text-center text-gray-500">You haven't created any courses yet.</li>
                        )}
                    </ul>
                </div>
            </main>
        </div>
    );
}
