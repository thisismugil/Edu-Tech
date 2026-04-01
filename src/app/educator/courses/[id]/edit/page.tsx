'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Save, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        topic: '',
        description: '',
        level: 'beginner',
        tone: 'professional',
        totalDuration: '',
        isPublished: false,
    });
    const [modules, setModules] = useState<any[]>([]);
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', confirmLabel: 'Confirm', variant: 'warning', onConfirm: () => {} });

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/courses/${courseId}`);
            if (!res.ok) throw new Error('Course not found');
            const data = await res.json();
            setFormData({
                title: data.title,
                topic: data.topic,
                description: data.description,
                level: data.level,
                tone: data.tone || 'professional',
                totalDuration: data.totalDuration,
                isPublished: data.isPublished,
            });
            setModules(data.modules || []);
            // Expand first module by default
            if (data.modules?.length > 0) {
                setExpandedModules({ 0: true });
            }
        } catch (e) {
            alert('Failed to load course.');
            router.push('/educator');
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleModuleChange = (moduleIndex: number, field: string, value: string) => {
        const updated = [...modules];
        updated[moduleIndex] = { ...updated[moduleIndex], [field]: value };
        setModules(updated);
    };

    const handleLessonChange = (moduleIndex: number, lessonIndex: number, field: string, value: string) => {
        const updated = [...modules];
        updated[moduleIndex].lessons[lessonIndex] = {
            ...updated[moduleIndex].lessons[lessonIndex],
            [field]: value,
        };
        setModules(updated);
    };

    const addLesson = (moduleIndex: number) => {
        const updated = [...modules];
        updated[moduleIndex].lessons.push({
            title: 'New Lesson',
            content: '',
            order: updated[moduleIndex].lessons.length + 1,
            referenceLinks: [],
        });
        setModules(updated);
    };

    const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Lesson',
            message: `Are you sure you want to delete the lesson "${modules[moduleIndex].lessons[lessonIndex].title}"? This action cannot be undone.`,
            confirmLabel: 'Delete Lesson',
            variant: 'danger',
            onConfirm: () => {
                const updated = [...modules];
                updated[moduleIndex].lessons.splice(lessonIndex, 1);
                setModules(updated);
                setConfirmModal(m => ({ ...m, isOpen: false }));
            },
        });
    };

    const addModule = () => {
        const newIndex = modules.length;
        setModules([...modules, { title: 'New Module', description: '', order: newIndex + 1, lessons: [] }]);
        setExpandedModules({ ...expandedModules, [newIndex]: true });
    };

    const deleteModule = (moduleIndex: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Module',
            message: `Are you sure you want to delete the module "${modules[moduleIndex].title}" and all its lessons? This action cannot be undone.`,
            confirmLabel: 'Delete Module',
            variant: 'danger',
            onConfirm: () => {
                const updated = [...modules];
                updated.splice(moduleIndex, 1);
                setModules(updated);
                setConfirmModal(m => ({ ...m, isOpen: false }));
            },
        });
    };

    const toggleModule = (index: number) => {
        setExpandedModules({ ...expandedModules, [index]: !expandedModules[index] });
    };

    const saveCourse = async (publish?: boolean) => {
        const isActuallyPublishing = publish !== undefined ? publish : formData.isPublished;
        
        // If changing publish status, ask for confirmation
        if (publish !== undefined && publish !== formData.isPublished) {
            setConfirmModal({
                isOpen: true,
                title: publish ? 'Publish Course' : 'Unpublish Course',
                message: publish 
                    ? 'Are you sure you want to publish this course? It will be visible to all enrolled students.'
                    : 'Are you sure you want to unpublish this course? Students will no longer be able to access it.',
                confirmLabel: publish ? 'Yes, Publish' : 'Yes, Unpublish',
                variant: publish ? 'info' : 'warning',
                onConfirm: () => {
                    setConfirmModal(m => ({ ...m, isOpen: false }));
                    performSave(publish);
                }
            });
            return;
        }

        // Just saving changes
        performSave(isActuallyPublishing);
    };

    const performSave = async (isPublished: boolean) => {
        setSaving(true);
        try {
            const orderedModules = modules.map((m, i) => ({
                ...m,
                order: i + 1,
                lessons: (m.lessons || []).map((l: any, j: number) => ({ ...l, order: j + 1 })),
            }));
            const payload = {
                ...formData,
                modules: orderedModules,
                isPublished: isPublished,
            };
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to save');
            router.push('/educator');
        } catch (e) {
            alert('Error saving course. Please try again.');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/educator" className="text-sm text-gray-500 hover:text-primary mb-1 flex items-center gap-1">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => saveCourse(!formData.isPublished)}
                            disabled={saving}
                            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 ${
                                formData.isPublished
                                    ? 'border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                                    : 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100'
                            }`}
                        >
                            {formData.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                            onClick={() => saveCourse()}
                            disabled={saving}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Course Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Course Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                            <input
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                            <input
                                name="topic"
                                type="text"
                                value={formData.topic}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <input
                                name="totalDuration"
                                type="text"
                                value={formData.totalDuration}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                            <select
                                name="tone"
                                value={formData.tone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="academic">Academic</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Modules & Lessons */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">Modules & Lessons</h2>
                        <button
                            onClick={addModule}
                            className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Module
                        </button>
                    </div>

                    <div className="space-y-4">
                        {modules.map((module, mIdx) => (
                            <div key={mIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Module Header */}
                                <div
                                    className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleModule(mIdx)}
                                >
                                    <span className="font-medium text-gray-800 text-sm">
                                        Module {mIdx + 1}: {module.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{module.lessons?.length || 0} lessons</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteModule(mIdx); }}
                                            className="text-red-400 hover:text-red-600 p-1 rounded"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        {expandedModules[mIdx] ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                                    </div>
                                </div>

                                {/* Module Body */}
                                {expandedModules[mIdx] && (
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Module Title</label>
                                                <input
                                                    type="text"
                                                    value={module.title}
                                                    onChange={(e) => handleModuleChange(mIdx, 'title', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Module Description</label>
                                                <input
                                                    type="text"
                                                    value={module.description || ''}
                                                    onChange={(e) => handleModuleChange(mIdx, 'description', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                        </div>

                                        {/* Lessons */}
                                        <div className="space-y-3 mt-2">
                                            {(module.lessons || []).map((lesson: any, lIdx: number) => (
                                                <div key={lIdx} className="border border-gray-100 rounded-md p-3 bg-gray-50">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <span className="text-xs font-semibold text-gray-500 pt-1">Lesson {lIdx + 1}</span>
                                                        <button
                                                            onClick={() => deleteLesson(mIdx, lIdx)}
                                                            className="text-red-400 hover:text-red-600 shrink-0"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                                                            <input
                                                                type="text"
                                                                value={lesson.title}
                                                                onChange={(e) => handleLessonChange(mIdx, lIdx, 'title', e.target.value)}
                                                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">Content (Markdown)</label>
                                                            <textarea
                                                                rows={4}
                                                                value={lesson.content || ''}
                                                                onChange={(e) => handleLessonChange(mIdx, lIdx, 'content', e.target.value)}
                                                                className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono focus:ring-primary focus:border-primary"
                                                                placeholder="Write lesson content in Markdown..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => addLesson(mIdx)}
                                            className="inline-flex items-center text-xs text-primary hover:text-primary/80 font-medium mt-1"
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {modules.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No modules yet. Click "Add Module" to get started.
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Save */}
                <div className="flex justify-end mt-6 gap-3">
                    <Link href="/educator" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md bg-white">
                        Cancel
                    </Link>
                    <button
                        onClick={() => saveCourse()}
                        disabled={saving}
                        className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </button>
                </div>
            </div>
            
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
