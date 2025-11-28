'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Wand2 } from 'lucide-react';

export default function CreateCoursePage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        topic: '',
        description: '',
        level: 'beginner',
        tone: 'professional',
        totalDuration: '',
        goals: '',
    });
    const [syllabus, setSyllabus] = useState<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateSyllabus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/educator/generate-syllabus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: formData.topic,
                    level: formData.level,
                    duration: formData.totalDuration,
                    tone: formData.tone,
                    goals: formData.goals,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || 'Failed to generate syllabus');
            }
            setSyllabus(data);
            setStep(2);
        } catch (error: any) {
            alert(error.message || 'Failed to generate syllabus');
        }
        setLoading(false);
    };

    const generateContentForLesson = async (moduleIndex: number, lessonIndex: number) => {
        const lesson = syllabus.modules[moduleIndex].lessons[lessonIndex];
        if (lesson.content) return; // Already generated

        setLoading(true);
        try {
            const res = await fetch('/api/educator/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseTopic: formData.topic,
                    moduleTitle: syllabus.modules[moduleIndex].title,
                    lessonTitle: lesson.title,
                    tone: formData.tone,
                }),
            });
            const data = await res.json();

            const newSyllabus = { ...syllabus };
            newSyllabus.modules[moduleIndex].lessons[lessonIndex] = {
                ...lesson,
                content: data.content,
                referenceLinks: data.referenceLinks,
            };
            setSyllabus(newSyllabus);
        } catch (error) {
            alert('Failed to generate content');
        }
        setLoading(false);
    };

    const publishCourse = async () => {
        setLoading(true);
        try {
            // Add order to modules and lessons
            const modules = syllabus.modules.map((m: any, i: number) => ({
                ...m,
                order: i + 1,
                lessons: m.lessons.map((l: any, j: number) => ({
                    ...l,
                    order: j + 1,
                })),
            }));

            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    modules,
                    isPublished: true,
                }),
            });

            if (res.ok) {
                router.push('/educator');
            } else {
                alert('Failed to publish course');
            }
        } catch (error) {
            alert('Error publishing course');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-primary px-6 py-4">
                    <h2 className="text-2xl font-bold text-white">Create New Course</h2>
                    <p className="text-white/80">Step {step} of 3</p>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Course Title</label>
                                    <input name="title" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Topic</label>
                                    <input name="topic" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Level</label>
                                    <select name="level" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleChange}>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (e.g. "4 weeks")</label>
                                    <input name="totalDuration" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tone</label>
                                    <select name="tone" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleChange}>
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="academic">Academic</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea name="description" rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Learning Goals</label>
                                    <textarea name="goals" rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="What will students learn?" onChange={handleChange} />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={generateSyllabus}
                                    disabled={loading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                    Generate Syllabus with AI
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && syllabus && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Review Syllabus</h3>
                            <div className="border border-gray-200 rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
                                {syllabus.modules.map((module: any, i: number) => (
                                    <div key={i} className="mb-4">
                                        <h4 className="font-bold text-primary">Module {i + 1}: {module.title}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                                        <ul className="list-disc pl-5 text-sm">
                                            {module.lessons.map((lesson: any, j: number) => (
                                                <li key={j} className="text-gray-800">{lesson.title}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900">Back</button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                                >
                                    Confirm & Generate Content
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && syllabus && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">Generate Lesson Content</h3>
                            <p className="text-sm text-gray-500">Click the wand icon to generate content for each lesson using AI.</p>

                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            // Process sequentially to avoid rate limits
                                            for (let i = 0; i < syllabus.modules.length; i++) {
                                                const module = syllabus.modules[i];
                                                for (let j = 0; j < module.lessons.length; j++) {
                                                    const lesson = module.lessons[j];
                                                    if (!lesson.content) {
                                                        await generateContentForLesson(i, j);
                                                        // Small delay to be nice to the API
                                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                                    }
                                                }
                                            }
                                        } catch (error) {
                                            console.error("Bulk generation error", error);
                                        }
                                        setLoading(false);
                                    }}
                                    disabled={loading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                    Generate All Content
                                </button>
                            </div>

                            <div className="space-y-4">
                                {syllabus.modules.map((module: any, i: number) => (
                                    <div key={i} className="border border-gray-200 rounded-md p-4">
                                        <h4 className="font-bold text-gray-900 mb-2">{module.title}</h4>
                                        <div className="space-y-2">
                                            {module.lessons.map((lesson: any, j: number) => (
                                                <div key={j} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                    <span className="text-sm">{lesson.title}</span>
                                                    <div className="flex items-center space-x-2">
                                                        {lesson.content ? (
                                                            <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded">Ready</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => generateContentForLesson(i, j)}
                                                                disabled={loading}
                                                                className="text-primary hover:text-primary/80"
                                                                title="Generate Content"
                                                            >
                                                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={publishCourse}
                                    disabled={loading}
                                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Publishing...' : 'Publish Course'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
