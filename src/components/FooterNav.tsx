'use client';

import { useRouter } from 'next/navigation';
import { Footer } from '@/ds';

export default function FooterNav() {
  const router = useRouter();

  return (
    <Footer
      onBecomePartnerClick={() => router.push('/installer')}
      onPartnerSignInClick={() => router.push('/installer')}
      onScrollToQuote={() => router.push('/#calculator-section')}
      onScrollToRebate={() => router.push('/#calculator-section')}
      onBlogClick={() => router.push('/blog')}
      onGovernmentNewsClick={() => router.push('/blog')}
    />
  );
}
