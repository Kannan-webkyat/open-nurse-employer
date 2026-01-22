'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authApi } from '@/lib/api/auth';
import { Loader2, ArrowLeft, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.forgotPassword(email);

            if (response.success) {
                setSuccessMessage(response.message || 'Password reset link sent to your email.');
                setEmail('');
            } else {
                setError(response.message || 'Failed to send reset link. Please try again.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-neutral-50 via-white to-emerald-50/30 font-sans z-[9999]">
            {/* Left Side: Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 md:p-12 lg:p-20 relative bg-white/80 backdrop-blur-sm overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-emerald-200 to-sky-200 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-gradient-to-tl from-sky-200 to-emerald-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                {/* Header/Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-block group">
                        <div className="transform transition-all duration-300 hover:scale-105">
                            <Image src="/logo.svg" alt="Open Nurses Logo" width={30} height={30} className="h-8 w-auto drop-shadow-sm" />
                        </div>
                    </Link>
                </div>

                {/* Center Content */}
                <div className="w-full max-w-[420px] mx-auto relative z-10">
                    <div className="mb-8">
                        <Link 
                            href="/login" 
                            className="inline-flex items-center text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors group mb-6"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to sign in
                        </Link>
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                                <Building2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700">Employer Portal</span>
                            </div>
                        </div>

                        <h1 className="text-[32px] font-black text-center text-neutral-900 mb-3 leading-tight tracking-tight">
                            Forgot password?
                        </h1>
                        <p className="text-neutral-500 text-center text-sm font-medium">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 flex items-start space-x-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                            <div>
                                <p className="font-bold text-emerald-800">Check your email</p>
                                <p className="mt-1 leading-relaxed font-medium text-emerald-600/90">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 flex items-center space-x-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600 shadow-sm">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-white border-2 border-neutral-200 text-neutral-900 rounded-xl py-3.5 px-4 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400 text-sm font-medium shadow-sm hover:border-neutral-300"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 group relative overflow-hidden"
                        >
                             <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Sending link...</span>
                                </div>
                            ) : (
                                <span>Send reset link</span>
                            )}
                        </button>
                    </form>
                </div>

                 {/* Footer */}
                 <div className="text-center relative z-10">
                    <p className="mt-3 text-xs text-neutral-400 font-medium">
                        © 2024 Open Nurses. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-emerald-600 via-sky-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-400/30 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] rounded-full bg-sky-300/30 blur-[120px] animate-pulse" style={{animationDelay: '0.7s'}} />
                     <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }} />
                    </div>
                </div>

                <div className="relative z-10 text-center text-white max-w-lg">
                    <h2 className="text-4xl font-black mb-6 leading-tight">Secure Access for Employers</h2>
                    <p className="text-lg text-white/90 font-medium">Manage your recruitment pipeline securely and efficiently.</p>
                </div>
            </div>
        </div>
    );
}
