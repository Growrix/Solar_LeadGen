
'use client';
import React, { useEffect, useState } from 'react';
import QuoteBuilderModal from '@/components/QuoteBuilderModal';

export default function QuoteBuilderTestPage() {
  const [leadId, setLeadId] = useState('TEST_LEAD_ID');

  useEffect(() => {
    // Read query param client-side
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) setLeadId(id);
    } catch {}
  }, []);

  const mockLead = {
    id: leadId,
    name: 'Test Lead',
    location: 'Melbourne VIC',
    propertyType: 'Residential',
    systemSize: '6.6',
    estimatedUsage: 'High',
    budget: '$8000-$10000',
    quoteData: {
      postcode: '3000',
      roofType: 'tile',
      roofTilt: 'optimal',
      shadingLevel: 'minimal',
      panelOrientation: ['north'],
      recommendedSize: 6.6,
      usagePattern: 'evening',
      customRetailRate: 0.32,
      customFeedInRate: 0.08,
      budgetRange: '$5000-$6000'
    }
  };

  return (
    <div className="p-4" data-testid="e2e-test-root">
      <QuoteBuilderModal
        isOpen={true}
        lead={mockLead as any}
        onClose={() => {}}
        onSubmitQuote={async () => true}
        mode="bid"
      />
    </div>
  );
}
