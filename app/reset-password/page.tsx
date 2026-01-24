'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi } from '@/lib/api/auth';
import { Loader2, Eye, EyeOff, ArrowLeft, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token || !emailParam) {
            setError('Invalid reset link. Please request a new one.');
            return;
        }

        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.resetPassword({
                token,
                email: emailParam,
                password,
                password_confirmation: confirmPassword,
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(response.message || 'Failed to reset password. Link may be expired.');
                 if (response.errors) {
                    const errorMessages = Object.values(response.errors).flat().join(', ');
                    if (errorMessages) {
                      setError(errorMessages);
                    }
                  }
            }
        } catch (err: any) {
             setError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-neutral-50 via-white to-emerald-50/30 font-sans z-[9999]">
                <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 md:p-12 lg:p-20 relative bg-white/80 backdrop-blur-sm">
                     <div className="w-full max-w-[420px] mx-auto text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-emerald-100 p-4 shadow-sm animate-bounce">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="mb-3 text-3xl font-black text-neutral-900">Password Reset Successful!</h2>
                        <p className="mb-8 text-neutral-600 font-medium leading-relaxed">
                            Your password has been successfully reset. You will be redirected to the login page momentarily.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        >
                            Sign in now
                        </button>
                    </div>
                </div>
                 <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-emerald-600 via-sky-600 to-indigo-600 relative overflow-hidden">
                     {/* Same background as main pages */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-400/30 blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] rounded-full bg-sky-300/30 blur-[120px] animate-pulse" style={{animationDelay: '0.7s'}} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-neutral-50 via-white to-emerald-50/30 font-sans z-[9999]">
             {/* Left Side: Form */}
             <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 md:p-12 lg:p-20 relative bg-white/80 backdrop-blur-sm overflow-hidden">
                 {/* Decorative Background Elements */}
                 <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-emerald-200 to-sky-200 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-gradient-to-tl from-sky-200 to-emerald-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                 {/* Header/Logo */}
                 <div className="relative z-10">
                    <Link href="/" className="inline-block group">
                        <div className="transform transition-all duration-300 hover:scale-105">
                            <Image src="/logo.svg" alt="Open Nurses Logo" width={30} height={30} className="h-8 w-auto drop-shadow-sm" />
                        </div>
                    </Link>
                </div>

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
                        <h1 className="text-[32px] font-black text-center text-neutral-900 mb-3 leading-tight tracking-tight">Set new password</h1>
                        <p className="text-neutral-500 text-center text-sm font-medium">
                            Your new password must be different to previously used passwords.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                         <div className="mb-6 flex items-center space-x-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600 shadow-sm">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                         {/* Password Input */}
                         <div className="space-y-2 group">
                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-white border-2 border-neutral-200 text-neutral-900 rounded-xl py-3.5 px-4 pr-12 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400 text-sm font-medium shadow-sm hover:border-neutral-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-emerald-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                             <p className="text-[11px] font-medium text-neutral-500 pl-1">Must be at least 8 characters.</p>
                        </div>

                         {/* Confirm Password Input */}
                         <div className="space-y-2 group">
                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-white border-2 border-neutral-200 text-neutral-900 rounded-xl py-3.5 px-4 pr-12 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400 text-sm font-medium shadow-sm hover:border-neutral-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-emerald-600 transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
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
                                    <span>Resetting password...</span>
                                </div>
                            ) : (
                                <span>Reset password</span>
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
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
