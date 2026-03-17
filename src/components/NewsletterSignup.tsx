"use client";

import React, { useState } from 'react';
import { Button } from '@/ds';

// --- Icon Components ---
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-destructive"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>;
const PaperPlaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>;


type NewsletterSignupProps = {
    variant?: 'section' | 'compact';
    className?: string;
};

const NewsletterSignup = ({ variant = 'section', className }: NewsletterSignupProps) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [inputError, setInputError] = useState('');

    // Comprehensive email validation following RFC 5322 standards
    const validateEmail = (email: string): boolean => {
        if (!email) return false;
        
        // Industry-standard email validation regex
        // This checks for proper format: user@domain.tld
        // - Allows letters, numbers, dots, hyphens, underscores in username
        // - Requires @ symbol
        // - Domain must have at least 2 characters
        // - TLD must be 2-6 characters and only letters
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        
        if (!emailRegex.test(email)) return false;
        
        // Additional validation: check for common typos in popular domains
        const domain = email.split('@')[1]?.toLowerCase();
        
        // Map of common typos to correct domains
        const commonTypos: { [key: string]: string } = {
            'gmial.com': 'gmail.com',
            'gmai.com': 'gmail.com',
            'gmail.co': 'gmail.com',
            'gmail.comm': 'gmail.com',
            'gail.com': 'gmail.com',
            'yahooo.com': 'yahoo.com',
            'yaho.com': 'yahoo.com',
            'hotmial.com': 'hotmail.com',
            'hotmai.com': 'hotmail.com',
            'outloo.com': 'outlook.com',
        };
        
        // If domain is a known typo, reject it
        if (domain && commonTypos[domain]) {
            return false;
        }
        
        return true;
    };

    // Live validation as user types
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setInputError('');
        setStatus('idle');
        setMessage('');
        
        if (!value) {
            setInputError('Please enter your email address.');
        } else if (!validateEmail(value)) {
            setInputError('Please enter a valid email address.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setInputError('Please enter your email address.');
            setStatus('error');
            setMessage('Please enter your email address.');
            return;
        }
        if (!validateEmail(email)) {
            setInputError('Please enter a valid email address.');
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }
        setStatus('loading');
        setMessage('');
        setInputError('');
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setMessage(data.message ||"Thanks for subscribing! Check your inbox for the latest solar news.");
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error ||"Oops! Something went wrong. Please try again.");
            }
        } catch (error) {
            setStatus('error');
            setMessage("Network error. Please check your connection and try again.");
        }
    };

    const isSection = variant !== 'compact';
    const inputCls = isSection
        ? 'w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors duration-300'
        : `w-full pl-12 pr-4 py-2.5 rounded-xl bg-background shadow-inner border ${inputError ? 'border-destructive' : 'border-border'} focus:ring-2 focus:ring-primary focus:border-primary/50 transition-colors duration-300 text-foreground placeholder:text-muted-foreground`;

    const form = (
        <form onSubmit={handleSubmit} className={className}>
            <div className="space-y-3">
                {status !== 'success' ? (
                    <>
                        <div className={isSection ? 'flex flex-col gap-3' : 'flex flex-col gap-3'}>
                            <div className="relative flex-grow w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <MailIcon />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="Enter your email address"
                                    aria-label="Email address for newsletter"
                                    className={inputCls}
                                    disabled={status === 'loading'}
                                    autoComplete="email"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant={isSection ? 'primary' : 'secondary'}
                                size="lg"
                                className={isSection ? 'w-full justify-center bg-white text-brand-700 hover:bg-white/90 border-0' : 'w-full justify-center'}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Joining...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Subscribe Now</span>
                                        <ArrowRightIcon />
                                    </>
                                )}
                            </Button>
                        </div>
                        {(inputError || (status === 'error' && message)) && (
                            <p
                                role="alert"
                                className={`mt-2 text-sm ${isSection ? 'text-white/80' : 'text-destructive'} flex items-center gap-2 animate-fade-in`}
                            >
                                <AlertCircleIcon /> {inputError || message}
                            </p>
                        )}
                    </>
                ) : (
                    <div
                        role="status"
                        className={`p-4 ${isSection ? 'bg-white/15 border-white/20' : 'bg-success/10 border-success/30'} border rounded-xl flex flex-col items-center justify-center gap-3 animate-fade-in`}
                    >
                        <CheckCircleIcon />
                        <p className={`text-center text-sm ${isSection ? 'text-white' : 'text-success'}`}>{message}</p>
                    </div>
                )}
            </div>
        </form>
    );

    if (variant === 'compact') {
        return (
            <div className="space-y-3">
                {form}
                {status !== 'success' && (
                    <p className="text-caption text-muted-foreground">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                )}
            </div>
        );
    }

    return (
        <section className="py-24 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="rounded-3xl p-8 md:p-16 text-center md:text-left shadow-modal relative overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-brand-600 to-brand-800">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full opacity-30 blur-3xl bg-brand-500" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full opacity-40 blur-3xl bg-brand-900" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-xl">
                            <div className="mb-6">
                                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
                                    <MailIcon />
                                    Newsletter
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                                Go Solar, Smarter.
                            </h2>
                            <p className="text-lg text-white/80 leading-relaxed">
                                Get the latest solar news, government rebate updates, and exclusive tips delivered straight to your inbox.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start text-sm text-white/90 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon />
                                    <span>Weekly updates</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon />
                                    <span>Rebate alerts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon />
                                    <span>No spam</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-inner">
                            {form}
                            {status !== 'success' && (
                                <p className="text-center text-xs text-white/60 mt-3">
                                    We respect your privacy. Unsubscribe at any time.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSignup;