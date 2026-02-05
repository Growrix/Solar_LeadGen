'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/solarconnect/components/layout/Header';
import { Hero } from '@/components/solarconnect/components/home/Hero';
import { NewsSection } from '@/components/solarconnect/components/home/NewsSection';
import { BlogSection } from '@/components/solarconnect/components/home/BlogSection';
import { NewsletterSection } from '@/components/solarconnect/components/home/NewsletterSection';

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
    <main className="w-full min-h-screen bg-background text-foreground font-sans">
      <Header onNavigate={onNavigate} activePage={activePage} />
      <Hero />
      <BlogSection />
      <NewsSection />
      <NewsletterSection />
    </main>
  );
}
