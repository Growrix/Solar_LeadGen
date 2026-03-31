"use client";

import React, { useState } from 'react';
import { Button, Section } from '@/ds';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Send } from '@/ds/icons';


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
        ? 'w-full pl-12 pr-4 py-3 rounded-lg border transition-colors duration-300'
        : `w-full pl-12 pr-4 py-2.5 rounded-xl shadow-inner border ${inputError ? 'border-destructive' : 'border-border'} focus:ring-2 focus:ring-primary focus:border-primary/50 transition-colors duration-300 text-foreground placeholder:text-muted-foreground`;

    const inputSectionStyle = isSection ? {
        background: 'color-mix(in oklab, var(--ds-color-background) 60%, transparent)',
        borderColor: 'color-mix(in oklab, var(--ds-color-foreground-secondary) 10%, transparent)',
        color: 'var(--ds-color-foreground-secondary)',
    } : undefined;

    const form = (
        <form onSubmit={handleSubmit} className={className}>
            <div className="space-y-3">
                {status !== 'success' ? (
                    <>
                        <div className={isSection ? 'flex flex-col gap-3' : 'flex flex-col gap-3'}>
                            <div className="relative flex-grow w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Mail size={20} style={{ color: 'var(--ds-color-text-muted)' }} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="Enter your email address"
                                    aria-label="Email address for newsletter"
                                    className={inputCls}
                                    style={inputSectionStyle}
                                    disabled={status === 'loading'}
                                    autoComplete="email"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant={isSection ? 'primary' : 'secondary'}
                                size="lg"
                                className={isSection ? 'w-full justify-center border-0' : 'w-full justify-center'}
                                style={isSection ? { background: 'var(--ds-color-foreground-secondary)', color: 'var(--ds-color-background)' } : undefined}
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
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </Button>
                        </div>
                        {(inputError || (status === 'error' && message)) && (
                            <p
                                role="alert"
                                className="mt-2 flex items-center gap-2 animate-fade-in text-body-small"
                                style={{ color: isSection ? 'color-mix(in oklab, var(--ds-color-foreground-secondary) 80%, transparent)' : 'var(--ds-color-destructive)' }}
                            >
                                <AlertCircle size={20} /> {inputError || message}
                            </p>
                        )}
                    </>
                ) : (
                    <div
                        role="status"
                        className="border rounded-xl flex flex-col items-center justify-center gap-3 animate-fade-in"
                        style={{
                            padding: 'var(--ds-space-4)',
                            background: isSection ? 'color-mix(in oklab, var(--ds-color-foreground-secondary) 15%, transparent)' : 'color-mix(in oklab, var(--ds-color-success) 10%, transparent)',
                            borderColor: isSection ? 'color-mix(in oklab, var(--ds-color-foreground-secondary) 20%, transparent)' : 'color-mix(in oklab, var(--ds-color-success) 30%, transparent)',
                        }}
                    >
                        <CheckCircle size={24} style={{ color: 'var(--ds-color-success)' }} />
                        <p className="text-center text-body-small" style={{ color: isSection ? 'var(--ds-color-foreground-secondary)' : 'var(--ds-color-success)' }}>{message}</p>
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
        <Section size="xl" tone="surface" container="wide">
                <div className="ui-surface--brand-gradient rounded-3xl shadow-modal relative overflow-hidden" style={{ padding: 'var(--ds-space-8)', outline: '1px solid color-mix(in oklab, var(--ds-color-foreground-secondary) 10%, transparent)' }}>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ background: 'var(--ds-color-accent)' }} />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full opacity-40 blur-3xl" style={{ background: 'var(--ds-color-background)' }} />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12" style={{ padding: 'var(--ds-space-8)' }}>
                        <div style={{ maxWidth: '36rem' }}>
                            <div className="mb-6">
                                <span className="ui-kicker">
                                    <Mail size={16} />
                                    Newsletter
                                </span>
                            </div>
                            <h2 className="text-heading-2 mb-4">
                                Go Solar, Smarter.
                            </h2>
                            <p className="text-body-large" style={{ color: 'color-mix(in oklab, var(--ds-color-foreground-secondary) 80%, transparent)' }}>
                                Get the latest solar news, government rebate updates, and exclusive tips delivered straight to your inbox.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start" style={{ fontSize: 'var(--ds-font-size-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={24} style={{ color: 'var(--ds-color-success)' }} />
                                    <span>Weekly updates</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={24} style={{ color: 'var(--ds-color-success)' }} />
                                    <span>Rebate alerts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={24} style={{ color: 'var(--ds-color-success)' }} />
                                    <span>No spam</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full rounded-2xl" style={{
                            maxWidth: '28rem',
                            background: 'color-mix(in oklab, var(--ds-color-foreground-secondary) 10%, transparent)',
                            backdropFilter: 'blur(12px)',
                            padding: 'var(--ds-space-6)',
                            border: '1px solid color-mix(in oklab, var(--ds-color-foreground-secondary) 10%, transparent)',
                        }}>
                            {form}
                            {status !== 'success' && (
                                <p className="text-center text-caption mt-3" style={{ color: 'color-mix(in oklab, var(--ds-color-foreground-secondary) 60%, transparent)' }}>
                                    We respect your privacy. Unsubscribe at any time.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
        </Section>
    );
};

export default NewsletterSignup;