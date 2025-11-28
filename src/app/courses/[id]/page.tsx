'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';

import Loader from '@/components/Loader';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
        fetchCourse();
        checkEnrollment();
    }, []);

    const fetchUser = async () => {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
        }
    };

    const fetchCourse = async () => {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
            const data = await res.json();
            setCourse(data);
        }
        setLoading(false);
    };

    const checkEnrollment = async () => {
        const res = await fetch(`/api/courses/${id}/enroll`);
        if (res.ok) {
            const data = await res.json();
            setEnrolled(data.enrolled);
        }
    };

    const handleEnroll = async () => {
        const res = await fetch(`/api/courses/${id}/enroll`, { method: 'POST' });
        if (res.status === 401) {
            router.push('/auth/login');
            return;
        }
        if (res.ok) {
            router.push(`/learning/${id}`);
        }
    };

    if (loading) return <Loader />;
    if (!course) return <div className="p-8 text-center">Course not found</div>;

    const isEducator = user && course.educatorId && (user.userId === course.educatorId._id || user.userId === course.educatorId);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-primary text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/80 text-white mb-4">
                            {course.level}
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{course.title}</h1>
                        <p className="text-xl text-white/90 mb-8">{course.description}</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                    {course.educatorId?.name?.charAt(0)}
                                </div>
                                <span className="ml-3 font-medium">{course.educatorId?.name}</span>
                            </div>
                            <span className="text-white/70">•</span>
                            <span>{course.totalDuration}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {course.modules.map((module: any, mIdx: number) => (
                                    <li key={mIdx} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-medium text-secondary">
                                                Module {mIdx + 1}: {module.title}
                                            </h3>
                                            <span className="text-sm text-secondary/80">{module.lessons.length} lessons</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">{module.description}</p>
                                        <ul className="space-y-2">
                                            {module.lessons.map((lesson: any, lIdx: number) => (
                                                <li key={lIdx} className="flex items-center text-sm text-gray-600 pl-4 border-l-2 border-accent hover:text-primary transition-colors">
                                                    {enrolled || isEducator ? <PlayCircle className="h-4 w-4 mr-2 text-primary" /> : <Lock className="h-4 w-4 mr-2 text-gray-400" />}
                                                    {lesson.title}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6 sticky top-8">
                            <h3 className="text-lg font-medium text-primary mb-4">
                                {isEducator ? 'Manage Course' : 'Ready to start?'}
                            </h3>

                            {isEducator ? (
                                <div className="space-y-3">
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-700">
                                                    You are the instructor of this course.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/learning/${id}`)}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none"
                                    >
                                        Preview Course Content
                                    </button>
                                </div>
                            ) : enrolled ? (
                                <button
                                    onClick={() => router.push(`/learning/${id}`)}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                >
                                    Continue Learning
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none"
                                >
                                    Enroll Now (Free)
                                </button>
                            )}
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <h4 className="text-sm font-medium text-primary">This course includes:</h4>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                        AI-Generated Content
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                        Full Lifetime Access
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                        Access on Mobile
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
