'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import Loader from '@/components/Loader';

export default function LearningPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const mainContentRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        fetchCourse();
    }, []);

    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo(0, 0);
        }
    }, [currentLesson]);



    const fetchCourse = async () => {
        const res = await fetch(`/api/courses/${id}`);
        if (res.ok) {
            const data = await res.json();
            setCourse(data);
            if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
                setCurrentLesson(data.modules[0].lessons[0]);
            }
        }
    };

    const getNavigationLessons = () => {
        if (!course || !currentLesson) return { prev: null, next: null };

        let allLessons: any[] = [];
        course.modules.forEach((mod: any) => {
            allLessons = [...allLessons, ...mod.lessons];
        });

        const currentIndex = allLessons.findIndex((l: any) => l._id === currentLesson._id);
        const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

        return { prev, next };
    };



    if (!course) return <div className="flex items-center justify-center h-screen"><Loader /></div>;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden`}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-primary text-white">
                    <h2 className="font-bold truncate">{course.title}</h2>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                        <ChevronLeft />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {course.modules.map((module: any, mIdx: number) => (
                        <div key={mIdx} className="mb-6">
                            <h3 className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-2">
                                Module {mIdx + 1}: {module.title}
                            </h3>
                            <ul className="space-y-1">
                                {module.lessons.map((lesson: any, lIdx: number) => (
                                    <li key={lIdx}>
                                        <button
                                            onClick={() => setCurrentLesson(lesson)}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center ${currentLesson?._id === lesson._id
                                                ? 'bg-accent/30 text-primary font-medium'
                                                : 'text-gray-600 hover:bg-accent/10 hover:text-primary'
                                                }`}
                                        >
                                            <span className="mr-2">{lIdx + 1}.</span>
                                            <span className="truncate">{lesson.title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md text-primary hover:bg-accent/20 focus:outline-none">
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="ml-4 text-lg font-medium text-primary truncate">
                            {currentLesson?.title}
                        </h1>
                    </div>

                </header>

                <main ref={mainContentRef} className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                        {currentLesson ? (
                            <>
                                <div className="prose max-w-none prose-headings:text-primary prose-a:text-primary prose-strong:text-secondary prose-blockquote:border-l-primary">
                                    <ReactMarkdown>{currentLesson.content || 'No content available for this lesson.'}</ReactMarkdown>

                                    {currentLesson.referenceLinks && currentLesson.referenceLinks.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-gray-200">
                                            <h3 className="text-lg font-medium text-primary mb-4">References & Resources</h3>
                                            <ul className="list-disc pl-5 space-y-2">
                                                {currentLesson.referenceLinks.map((link: string, idx: number) => (
                                                    <li key={idx}>
                                                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                                            {link}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {(() => {
                                    const { prev, next } = getNavigationLessons();
                                    return (
                                        <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-200">
                                            {prev ? (
                                                <button
                                                    onClick={() => setCurrentLesson(prev)}
                                                    className="flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-primary transition-colors"
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                                    Previous
                                                </button>
                                            ) : (
                                                <div></div>
                                            )}

                                            {next ? (
                                                <button
                                                    onClick={() => setCurrentLesson(next)}
                                                    className="flex items-center px-4 py-2 rounded-md border border-transparent text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm transition-colors"
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4 ml-2" />
                                                </button>
                                            ) : (
                                                <div></div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="text-center text-gray-500">Select a lesson to start learning</div>
                        )}
                    </div>
                </main>
            </div>


        </div>
    );
}
