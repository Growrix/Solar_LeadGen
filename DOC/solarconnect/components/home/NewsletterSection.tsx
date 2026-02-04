import React from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Heading, Text } from '../ui/Typography';
import { NEWSLETTER_CONTENT } from '../../constants/labels';

export const NewsletterSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
        {/* Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-8 md:p-16 text-center md:text-left shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-900/40 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl">
                        <div className="mb-6">
                            <Badge variant="glass" icon={<Mail className="w-4 h-4" />}>
                                Newsletter
                            </Badge>
                        </div>
                        <Heading level={2} className="mb-4 tracking-tight">
                            {NEWSLETTER_CONTENT.headline}
                        </Heading>
                        <Text variant="brand" className="text-brand-100 text-lg">
                            {NEWSLETTER_CONTENT.subheadline}
                        </Text>
                        
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start text-sm text-brand-50 font-medium">
                            {NEWSLETTER_CONTENT.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-inner">
                        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder={NEWSLETTER_CONTENT.placeholder}
                                    fullWidth
                                />
                            </div>
                            <Button variant="white" fullWidth size="lg">
                                {NEWSLETTER_CONTENT.cta}
                            </Button>
                            <p className="text-center text-xs text-brand-200 mt-2 opacity-80">
                                {NEWSLETTER_CONTENT.disclaimer}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};