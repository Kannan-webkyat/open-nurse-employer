'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useUser } from '@/components/providers/user-provider';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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

    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [tempEmail, setTempEmail] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

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
            setSuccess('Registration successful! Your account is pending administrator approval. Please wait for confirmation.');
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
            setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex bg-gradient-to-br from-neutral-50 via-white to-emerald-50/30 font-sans z-[9999]">
            {/* Left Side: Enhanced Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 md:p-12 lg:p-20 relative bg-white/80 backdrop-blur-sm overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-emerald-200 to-sky-200 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-gradient-to-tl from-sky-200 to-emerald-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                    
                    {/* Subtle Grid Pattern */}
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

                {/* Center Content - Enhanced Form */}
                <div className="w-full max-w-[420px] mx-auto relative z-10">
                    {/* Welcome Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-emerald-700">Employer Portal</span>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-[36px] font-black text-neutral-900 mb-3 leading-tight tracking-tight">
                            {showOtpInput ? 'Two-Factor Authentication' : 'Welcome back'}
                        </h1>
                        <p className="text-neutral-500 text-sm font-medium">
                            {showOtpInput
                                ? 'Please enter the 6-digit code sent to your email'
                                : 'Sign in to access your employer dashboard'}
                        </p>
                    </div>

                    <form onSubmit={showOtpInput ? handleVerifyOtp : handleSubmit} className="space-y-5">
                        {success && (
                            <div className="p-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl font-medium">
                                {success}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-medium">
                                {error}
                            </div>
                        )}

                        {!showOtpInput ? (
                            <>
                                {/* Email Input - Enhanced */}
                                <div className="space-y-2 group">
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-white border-2 border-neutral-200 text-neutral-900 rounded-xl py-3.5 px-4 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400 text-sm font-medium shadow-sm hover:border-neutral-300"
                                        />
                                    </div>
                                </div>

                                {/* Password Input - Enhanced */}
                                <div className="space-y-2 group">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                            Password
                                        </label>
                                        <Link href="/forgot-password" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors relative group/link">
                                            Forgot password?
                                            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-600 group-hover/link:w-full transition-all duration-300" />
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
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
                                </div>
                            </>
                        ) : (
                            /* OTP Input - Enhanced */
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide mb-2">
                                        Verification Code
                                    </label>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full bg-white border-2 border-neutral-200 text-neutral-900 rounded-xl py-3.5 px-4 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400 text-lg font-medium shadow-sm hover:border-neutral-300 text-center tracking-widest"
                                    />
                                </div>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || isLoading}
                                        className="text-sm font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                                    </button>
                                </div>
                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtpInput(false)}
                                        className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                                    >
                                        ← Back to login
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Submit Button - Premium */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 mt-8 group relative overflow-hidden"
                        >
                            {/* Button Shimmer Effect */}
                            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
                            
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{showOtpInput ? 'Verifying...' : 'Signing in...'}</span>
                                </div>
                            ) : (
                                <span>{showOtpInput ? 'Verify Code' : 'Sign in to Dashboard'}</span>
                            )}
                        </button>
                    </form>

                    {!showOtpInput && (
                        <p className="mt-8 text-center text-sm text-neutral-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                Register now
                            </Link>
                        </p>
                    )}

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-neutral-500 font-medium">
                            Protected by enterprise-grade security
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600">All systems operational</span>
                        </div>
                    </div>
                </div>

                {/* Footer - Enhanced */}
                <div className="text-center relative z-10">
                    <div className="flex items-center justify-center gap-6 text-xs text-neutral-500 font-medium">
                        <Link href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</Link>
                        <span>•</span>
                        <Link href="#" className="hover:text-neutral-900 transition-colors">Terms of Service</Link>
                        <span>•</span>
                        <Link href="#" className="hover:text-neutral-900 transition-colors">Support</Link>
                    </div>
                    <p className="mt-3 text-xs text-neutral-400">
                        © 2024 Open Nurses. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side: Premium Dashboard Preview with Animations */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-emerald-600 via-sky-600 to-indigo-600 relative overflow-hidden">
                {/* Animated Gradient Mesh Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-400/30 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[35%] h-[35%] rounded-full bg-sky-300/30 blur-[120px] animate-pulse" style={{animationDelay: '0.7s'}} />
                    <div className="absolute top-[40%] left-[-5%] w-[25%] h-[25%] rounded-full bg-indigo-300/20 blur-[100px] animate-pulse" style={{animationDelay: '1.4s'}} />
                    
                    {/* Floating Particles */}
                    <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-white/20 rounded-full animate-ping" style={{animationDelay: '0.3s'}} />
                    <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 bg-white/15 rounded-full animate-ping" style={{animationDelay: '1.1s'}} />
                    <div className="absolute top-[45%] right-[40%] w-2.5 h-2.5 bg-white/10 rounded-full animate-ping" style={{animationDelay: '2.3s'}} />
                    
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }} />
                    </div>
                </div>

                {/* Dashboard Preview - Employer Theme */}
                <div className="relative z-10 w-full max-w-2xl">
                    <div className="space-y-6 transform hover:scale-[1.02] transition-all duration-700" style={{animation: 'float 6s ease-in-out infinite'}}>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white mb-2">Hire Top Nursing Talent</h2>
                            <p className="text-white/80 text-sm">Streamline your recruitment process</p>
                        </div>

                        {/* Stats Preview */}
                        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Active Jobs', value: '12', icon: '💼' },
                                    { label: 'Applications', value: '248', icon: '📋' },
                                    { label: 'Interviews', value: '18', icon: '📅' },
                                    { label: 'Hired', value: '6', icon: '✓' }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-2xl mb-1">{stat.icon}</div>
                                        <div className="text-2xl font-black text-neutral-900">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-neutral-500 uppercase">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Post Jobs', desc: 'Reach qualified nurses', icon: '🎯' },
                                { title: 'Review Applicants', desc: 'Find the perfect match', icon: '👥' },
                                { title: 'Schedule Interviews', desc: 'Streamlined process', icon: '🗓️' },
                                { title: 'Track Progress', desc: 'Real-time analytics', icon: '📊' }
                            ].map((feature, i) => (
                                <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 hover:bg-white transition-all">
                                    <div className="text-3xl mb-2">{feature.icon}</div>
                                    <div className="text-sm font-bold text-neutral-900">{feature.title}</div>
                                    <div className="text-xs text-neutral-600">{feature.desc}</div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <p className="text-white text-sm font-bold">Powered by Open Nurses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Animation Keyframes */}
                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
