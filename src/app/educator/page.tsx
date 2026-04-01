'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Book, Users, MessageSquare, Pencil } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

export default function EducatorDashboard() {
    const [stats, setStats] = useState<any>({ totalCourses: 0, totalStudents: 0, courses: [], unreadMessagesCount: 0 });
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', confirmLabel: 'Confirm', variant: 'warning', onConfirm: () => {} });

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

    const togglePublish = async (courseId: string, currentState: boolean) => {
        const res = await fetch(`/api/courses/${courseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: !currentState }),
        });
        if (res.ok) {
            fetchDashboardData();
        } else {
            alert('Failed to update publish status.');
        }
    };

    const askTogglePublish = (courseId: string, currentState: boolean, courseTitle: string) => {
        setConfirmModal({
            isOpen: true,
            title: currentState ? 'Unpublish Course' : 'Publish Course',
            message: currentState
                ? `Are you sure you want to unpublish "${courseTitle}"? Students will no longer be able to see it.`
                : `Publish "${courseTitle}"? It will become visible to all students.`,
            confirmLabel: currentState ? 'Yes, Unpublish' : 'Yes, Publish',
            variant: currentState ? 'warning' : 'info',
            onConfirm: () => {
                setConfirmModal(m => ({ ...m, isOpen: false }));
                togglePublish(courseId, currentState);
            },
        });
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
                        <Link href="/educator/chat" className="relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-primary transition-colors">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Messages
                            {stats.unreadMessagesCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-pulse shadow-sm min-w-[20px] text-center">
                                    {stats.unreadMessagesCount}
                                </span>
                            )}
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
                    <div 
                        className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => setShowStudentsModal(true)}
                    >
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
                                                {/* {course.students && course.students.length > 0 && (
                                                    <span className="ml-2 text-xs text-gray-400">
                                                        ({course.students.map((s: any) => s.name).join(', ')})
                                                    </span>
                                                )} */}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            <button
                                                onClick={() => askTogglePublish(course._id, course.isPublished, course.title)}
                                                className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                                                    course.isPublished
                                                        ? 'border-yellow-400 text-yellow-700 hover:bg-yellow-50'
                                                        : 'border-green-500 text-green-700 hover:bg-green-50'
                                                }`}
                                            >
                                                {course.isPublished ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <Link
                                                href={`/educator/courses/${course._id}/edit`}
                                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-blue-400 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                                            >
                                                <Pencil className="h-3 w-3" /> Edit
                                            </Link>
                                            <Link href={`/courses/${course._id}`} className="text-sm text-gray-500 hover:text-gray-700">
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

                {/* Students Modal */}
                {showStudentsModal && (
                    <div className="fixed inset-0 bg-transparent backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col mx-4">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Enrolled Students ({stats.totalStudents})
                                </h2>
                                <button onClick={() => setShowStudentsModal(false)} className="text-gray-400 hover:text-gray-900">
                                    <span className="text-2xl font-bold leading-none">&times;</span>
                                </button>
                            </div>
                            <div className="overflow-y-auto flex-1 pr-2">
                                <ul className="divide-y divide-gray-200">
                                    {stats.courses.flatMap((course: any) => 
                                        (course.students || []).map((student: any, idx: number) => (
                                            <li key={`${course._id}-${student.email}-${idx}`} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.name}</p>
                                                    <p className="text-sm text-gray-500">{student.email}</p>
                                                </div>
                                                <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full w-fit max-w-[200px] truncate" title={course.title}>
                                                    Course: {course.title}
                                                </span>
                                            </li>
                                        ))
                                    )}
                                    {stats.totalStudents === 0 && (
                                        <div className="text-center py-8">
                                            <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                            <p className="text-gray-500 text-sm">No students are currently enrolled in any of your courses.</p>
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(m => ({ ...m, isOpen: false }))}
            />
        </div>
    );
}
