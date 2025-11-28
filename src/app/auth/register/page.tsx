'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<'student' | 'educator'>('student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        experienceYears: '',
        institution: '',
        qualification: '',
        bio: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const payload: any = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role,
            };

            if (role === 'educator') {
                payload.experienceYears = Number(formData.experienceYears);
                payload.institution = formData.institution;
                payload.qualification = formData.qualification;
                payload.bio = formData.bio;
            }

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            if (role === 'educator') {
                router.push('/educator');
            } else {
                router.push('/courses');
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
                </div>

                <div className="flex justify-center space-x-4 mb-4">
                    <button
                        onClick={() => setRole('student')}
                        className={`px-4 py-2 rounded-md ${role === 'student' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Student
                    </button>
                    <button
                        onClick={() => setRole('educator')}
                        className={`px-4 py-2 rounded-md ${role === 'educator' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Educator
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <input
                            name="name"
                            type="text"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm mb-2"
                            placeholder="Full Name"
                            onChange={handleChange}
                        />
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm mb-2"
                            placeholder="Email address"
                            onChange={handleChange}
                        />
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm mb-2"
                            placeholder="Password"
                            onChange={handleChange}
                        />

                        {role === 'educator' && (
                            <>
                                <input
                                    name="experienceYears"
                                    type="number"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm mb-2"
                                    placeholder="Years of Experience"
                                    onChange={handleChange}
                                />
                                <input
                                    name="institution"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm mb-2"
                                    placeholder="Institution/Organization"
                                    onChange={handleChange}
                                />
                                <input
                                    name="qualification"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm mb-2"
                                    placeholder="Qualification"
                                    onChange={handleChange}
                                />
                                <textarea
                                    name="bio"
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Short Bio"
                                    onChange={handleChange}
                                />
                            </>
                        )}
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Sign up
                        </button>
                    </div>
                    <div className="text-center">
                        <Link href="/auth/login" className="text-primary hover:text-primary/80 text-sm">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
