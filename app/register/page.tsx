'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { GooglePlacesInput } from '@/components/ui/google-places-input';
import { Loader2, Eye, EyeOff, Building2, User, Mail, Phone, Lock } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        company_location: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.registerEmployer(formData);
            if (response.success) {
                router.push('/login?registered=true');
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : 'Registration failed');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex bg-[#F0F4F8] font-sans z-[9999]">
            {/* Left Side: Ultra Condensed Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center  bg-white shadow-2xl z-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>

                <div className="w-full max-w-xl p-6 md:p-10 flex flex-col justify-center mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/" className="inline-block mb-4">
                            <Image src="/logo.svg" alt="Open Nurses" width={120} height={35} className="h-3 w-auto" />
                        </Link>

                        <h1 className="text-[40px] font-semibold text-slate-900 leading-tight">Create Account</h1>
                        <p className="text-sm text-slate-500 mt-1">Join the leading healthcare network.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 flex-1">
                        {error && (
                            <div className="p-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg font-medium flex items-center gap-2">
                                <span className="w-1 h-1 bg-rose-500 rounded-full shrink-0"></span>
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                <User size={14} />
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Full Name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Company & Location Group */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                    <Building2 size={14} />
                                </div>
                                <input
                                    id="company_name"
                                    name="company_name"
                                    type="text"
                                    placeholder="Company Name"
                                    required
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div className="relative group">
                                <GooglePlacesInput
                                    value={formData.company_location}
                                    onChange={(value: string) => setFormData(prev => ({ ...prev, company_location: value }))}
                                    placeholder="City/Location"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                <Mail size={14} />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Phone */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                <Phone size={14} />
                            </div>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Phone Number"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                    <Lock size={14} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-9 pr-8 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-sky-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                                    <Lock size={14} />
                                </div>
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-9 pr-8 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-sky-600 transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-xs shadow-md shadow-sky-600/20 mt-2"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link href="/login" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>

                </div>
            </div>

            {/* Right Side: Modern Image Layout */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                <Image
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2940&auto=format&fit=crop"
                    alt="Medical Team"
                    fill
                    className="object-cover opacity-90"
                    priority
                />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent"></div>

                {/* Sky Blue Accent Shapes */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-12 md:p-16 lg:p-20 text-white">
                    <div className="max-w-2xl">


                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
                            Build Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300">Dream Medical Team</span>
                        </h2>

                        <p className="text-lg text-slate-300 max-w-xl leading-relaxed font-light mb-10">
                            Connect with skilled, trusted healthcare professionals tailored to your needs.
                        </p>


                    </div>
                </div>
            </div>
        </div>
    );
}
