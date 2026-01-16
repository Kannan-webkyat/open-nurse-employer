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
        <div className="flex min-h-screen w-full bg-background">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-12 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="Open Nurses Logo" width={40} height={40} className="h-10 w-auto" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                Open Nurses
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {showOtpInput ? 'Two-Factor Authentication' : 'Welcome back'}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            {showOtpInput 
                                ? 'Please enter the 6-digit code sent to your email.' 
                                : 'Enter your credentials to access your employer dashboard.'}
                        </p>
                    </div>

                    <form onSubmit={showOtpInput ? handleVerifyOtp : handleSubmit} className="space-y-6">
                        {success && (
                            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
                                {success}
                            </div>
                        )}
                        
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}

                        {!showOtpInput ? (
                            <>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Password
                                        </label>
                                        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                            Forgot password?
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
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="otp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center tracking-widest text-lg"
                                    />
                                </div>
                                <div className="text-center">
                                    <button 
                                        type="button" 
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || isLoading}
                                        className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                                    </button>
                                </div>
                                <div className="text-center pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowOtpInput(false)}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Back to login
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {showOtpInput ? 'Verifying...' : 'Logging in...'}
                                </>
                            ) : (
                                showOtpInput ? 'Verify Code' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-muted">
                <Image
                    src="/login-bg.png"
                    alt="Medical Team"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-12">
                    <div className="text-white max-w-lg">
                        <blockquote className="space-y-2">
                            <p className="text-lg font-medium leading-relaxed">
                                &quot;The Open Nurses platform has completely transformed how we hire medical professionals. It&apos;s efficient, reliable, and user-friendly.&quot;
                            </p>
                            <footer className="text-sm opacity-80">
                                - Dr. Sarah Chen, Hospital Administrator
                            </footer>
                        </blockquote>
                    </div>
                </div>
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
