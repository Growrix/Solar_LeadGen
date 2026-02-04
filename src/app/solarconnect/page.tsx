'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Building2, ShieldCheck, Sparkles } from 'lucide-react';

import { Header } from '@/components/solarconnect/components/layout/Header';
import { Hero } from '@/components/solarconnect/components/home/Hero';
import { NewsSection } from '@/components/solarconnect/components/home/NewsSection';
import { BlogSection } from '@/components/solarconnect/components/home/BlogSection';
import { NewsletterSection } from '@/components/solarconnect/components/home/NewsletterSection';
import { Card } from '@/components/solarconnect/components/ui/Card';
import { Button } from '@/components/solarconnect/components/ui/Button';
import { Container, Heading, PublicShell, Text } from '@/ds';

export default function SolarConnectPreviewPage() {
  const router = useRouter();
  const [activePage, setActivePage] = useState<'home' | 'components'>('home');

  const onNavigate = useCallback(
    (page: string) => {
      if (page === 'components') {
        setActivePage('components');
        router.push('/component-library');
        return;
      }

      setActivePage('home');
    },
    [router]
  );

  return (
    <PublicShell header={<Header onNavigate={onNavigate} activePage={activePage} />}>
      {/* Hero includes its own full-screen layout */}
      <Hero />

      {/* Missing prototype sections (anchors used by Header) */}
      <section id="works" className="py-24 bg-background border-t border-border">
        <Container>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3 text-accent">
              <Sparkles className="w-5 h-5" />
              <span className="uppercase tracking-widest text-body-small">How it Works</span>
            </div>
            <Heading level={2} className="mb-4 tracking-tight">
              Get quotes without the chaos
            </Heading>
            <Text variant="body-large" tone="default">
              This page is a live preview route for the SolarConnect components imported into the app. It’s safe to iterate
              here while keeping the design system enforced across the repo.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <Text as="span" variant="body-large" tone="secondary">
                  Choose a path
                </Text>
              </div>
              <Text variant="body-small" tone="default">
                Consultation, written quotes, or live bidding.
              </Text>
            </Card>

            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <Text as="span" variant="body-large" tone="secondary">
                  Verified installers
                </Text>
              </div>
              <Text variant="body-small" tone="default">
                Compare offers from vetted local providers.
              </Text>
            </Card>

            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-5 h-5 text-accent" />
                <Text as="span" variant="body-large" tone="secondary">
                  Move fast
                </Text>
              </div>
              <Text variant="body-small" tone="default">
                Get to a decision in minutes, not days.
              </Text>
            </Card>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button variant="primary" size="md" onClick={() => router.push('/component-library')}>
              Open Component Library
            </Button>
            <Button variant="outline" size="md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to top
            </Button>
          </div>
        </Container>
      </section>

      <section id="installers" className="py-24 bg-background border-t border-border">
        <Container>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3 text-accent">
              <ShieldCheck className="w-5 h-5" />
              <span className="uppercase tracking-widest text-body-small">Installers</span>
            </div>
            <Heading level={2} className="mb-4 tracking-tight">
              A preview section (safe staging)
            </Heading>
            <Text variant="body-large" tone="default">
              When we hook this into real data, this section becomes the installer directory. For now it exists so the
              header anchors work and you can review the full look/feel end-to-end.
            </Text>
          </div>
        </Container>
      </section>

      <BlogSection />
      <NewsSection />
      <NewsletterSection />
    </PublicShell>
  );
}
