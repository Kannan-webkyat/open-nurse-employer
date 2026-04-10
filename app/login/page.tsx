'use client';

import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useUser } from '@/components/providers/user-provider';
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const { refreshUser } = useUser();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lockSeconds, setLockSeconds] = useState(0);
    const lockIntervalRef = useRef<number | null>(null);

    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const lockMessage = useMemo(() => {
        if (lockSeconds <= 0) {
            return '';
        }
        const minutes = Math.floor(lockSeconds / 60);
        const seconds = lockSeconds % 60;
        const time = minutes > 0 ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` : `${seconds}s`;
        return `Too many attempts. Try again in ${time}.`;
    }, [lockSeconds]);

    useEffect(() => {
        if (lockIntervalRef.current) {
            window.clearInterval(lockIntervalRef.current);
            lockIntervalRef.current = null;
        }

        if (lockSeconds <= 0) {
            return;
        }

        lockIntervalRef.current = window.setInterval(() => {
            setLockSeconds((s) => Math.max(0, s - 1));
        }, 1000);

        return () => {
            if (lockIntervalRef.current) {
                window.clearInterval(lockIntervalRef.current);
                lockIntervalRef.current = null;
            }
        };
    }, [lockSeconds]);

    // Countdown timer for resend
    React.useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Check for registration success
    React.useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setSuccess('Registration successful! Please check your email.');
        }
    }, [searchParams]);

    // Clear error after 5 seconds
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        if (lockSeconds > 0) {
            setLockSeconds(0);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setIsLoading(true);
        setError('');
        try {
            const response = await authApi.resendTwoFactor({ email: tempEmail });
            if (response.success) {
                setSuccess('Authentication code sent successfully.');
                setResendCooldown(60);
            } else {
                setError(response.message || 'Failed to resend code');
            }
        } catch (err: any) {
            console.error('Resend OTP error:', err);
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.verifyTwoFactor({
                email: tempEmail,
                code: otp
            });

            if (response.success && response.data?.token) {
                // Store token
                localStorage.setItem('auth_token', response.data.token);

                // Refresh user context
                await refreshUser();

                // Redirect to dashboard or return URL
                const returnUrl = searchParams.get('redirect');
                if (returnUrl) {
                    window.location.href = decodeURIComponent(returnUrl);
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                throw new Error(response.message || 'Verification failed');
            }
        } catch (err: any) {
            console.error('OTP Verification error:', err);
            setError(err.response?.data?.message || 'Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lockSeconds > 0) {
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await authApi.loginEmployer(formData);

            if (response.data && response.data.requires_two_factor) {
                setShowOtpInput(true);
                setTempEmail(formData.email);
                setSuccess('Two-factor authentication enabled. Please check your email for the code.');
                setResendCooldown(60);
                setIsLoading(false);
                return;
            }

            if (response.success && response.data?.token) {
                // Store token
                localStorage.setItem('auth_token', response.data.token);

                // Refresh user context
                await refreshUser();

                // Redirect to dashboard or return URL
                const returnUrl = searchParams.get('redirect');
                if (returnUrl) {
                    window.location.href = decodeURIComponent(returnUrl);
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            const retryAfterSecondsRaw = err?.response?.data?.errors?.retry_after_seconds;
            const retryAfterSeconds =
                typeof retryAfterSecondsRaw === 'number' ? retryAfterSecondsRaw : parseInt(retryAfterSecondsRaw, 10);
            if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
                setLockSeconds(retryAfterSeconds);
                setError('');
                setIsLoading(false);
                return;
            }
            // Check if error message is an object (validation errors)
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : 'Login failed');
            } else {
                setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex bg-[#F0F4F8] font-sans z-[9999]">
            {/* Left Side: Ultra Condensed Form (Matching Register Page) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white shadow-2xl z-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>

                <div className="w-full max-w-xl p-6 md:p-10 flex flex-col justify-center mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/" className="inline-block mb-4">
                            <Image src="/logo.svg" alt="Open Nurses" width={120} height={35} className="h-3 w-auto" />
                        </Link>
                        <h1 className="text-[40px] font-semibold text-slate-900 leading-tight">
                            {showOtpInput ? 'Verify Identity' : 'Welcome Back'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {showOtpInput ? 'Enter the code sent to your email.' : 'Sign in to access your dashboard.'}
                        </p>
                    </div>

                    <form onSubmit={showOtpInput ? handleVerifyOtp : handleSubmit} className="space-y-3 flex-1">
                        {success && (
                            <div className="p-2.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg font-medium flex items-center gap-2">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full shrink-0"></span>
                                {success}
                            </div>
                        )}

                        {(lockSeconds > 0 || error) && (
                            <div className="p-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg font-medium flex items-center gap-2">
                                <span className="w-1 h-1 bg-rose-500 rounded-full shrink-0"></span>
                                {lockSeconds > 0 ? lockMessage : error}
                            </div>
                        )}

                        {!showOtpInput ? (
                            <>
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

                                {/* Password */}
                                <div className="space-y-1">
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
                                            {showPassword ? <Eye size={12} /> : <EyeOff size={12} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end">
                                        <Link href="/forgot-password" className="text-sm text-slate-400 hover:text-sky-600 transition-colors font-medium">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* OTP Input */
                            <div className="space-y-3">
                                <div className="relative group">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 px-3 text-center text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 tracking-widest"
                                    />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtpInput(false)}
                                        className="text-[10px] text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || isLoading}
                                        className="text-[10px] font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || (lockSeconds > 0 && !showOtpInput)}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-xs shadow-md shadow-sky-600/20 mt-2"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{showOtpInput ? 'Verifying...' : 'Processing...'}</span>
                                </div>
                            ) : (
                                <span>{showOtpInput ? 'Verify Code' : 'Sign In'}</span>
                            )}
                        </button>

                        {!showOtpInput && (
                            <div className="text-center pt-2">
                                <p className="text-sm text-slate-500">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/register" className="font-bold text-sky-600 hover:text-sky-700 transition-colors">
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Right Side: Modern Image Layout (Same as Register) */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
                <Image
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2940&auto=format&fit=crop"
                    alt="Medical Team"
                    fill
                    className="object-cover opacity-90"
                    priority
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent"></div>

                {/* Sky Blue Accent Shapes */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Content Overlay (simple text like other logins) */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="relative z-10 w-full max-w-xl">
                        <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-10 border border-white/30 shadow-2xl">
                            <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.18em]">
                                Employer Portal
                            </p>
                            <h2 className="mt-4 text-5xl font-black text-white leading-tight tracking-tight drop-shadow-xl">
                                Build your team.<br />
                                Hire with confidence.
                            </h2>
                            <p className="mt-5 text-sm text-white/80 leading-relaxed font-medium max-w-md">
                                Secure access to your dashboard, candidate pipeline, and hiring activity — all in one place.
                            </p>
                            <div className="mt-6 text-xs text-white/70 font-semibold">
                                Sign in to continue.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#F0F4F8]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
