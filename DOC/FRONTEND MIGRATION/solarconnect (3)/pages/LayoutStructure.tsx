import React, { useState } from 'react';
import { DocsSubNav } from '../components/layout/DocsSubNav';
import { Heading, Text } from '../components/ui/Typography';
import { Container } from '../components/ui/Container';
import { Grid } from '../components/ui/Grid';
import { Stack } from '../components/ui/Stack';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { Accordion } from '../components/ui/Accordion';
import { Tabs } from '../components/ui/Tabs';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Pagination } from '../components/ui/Pagination';
import { ProgressBar, Stepper } from '../components/ui/Progress';
import { Divider } from '../components/ui/Divider';
import { UI_LABELS } from '../constants/labels';
import { Layout, Grid as GridIcon, Layers, Maximize } from 'lucide-react';

interface LayoutStructureProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const LayoutStructure: React.FC<LayoutStructureProps> = ({ onNavigate, activePage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [progressVal, setProgressVal] = useState(45);

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-20">
      <Container>
        {/* Header Area */}
        <div className="mb-8">
            <Heading level={1} className="mb-4">{UI_LABELS.layoutStructure}</Heading>
            <Text size="lg">{UI_LABELS.layoutSubtitle}</Text>
        </div>

        {/* Sub Navigation */}
        <DocsSubNav activePage={activePage} onNavigate={onNavigate} />

        <Stack spacing="xl">
            
            {/* 1. Containers & Grids */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <GridIcon className="w-6 h-6 text-brand-500" />
                    <Heading level={2}>{UI_LABELS.containers}</Heading>
                </div>
                
                <Card className="overflow-hidden">
                    <Card.Header>
                        <Heading level={4}>{UI_LABELS.grid}</Heading>
                    </Card.Header>
                    <Card.Content>
                        <Grid cols={3} gap="md" className="mb-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-slate-700/50 p-4 rounded-lg text-center border border-slate-600 border-dashed">
                                    Col {i}
                                </div>
                            ))}
                        </Grid>
                        <Grid cols={12} gap="xs">
                            {Array.from({length: 12}).map((_, i) => (
                                <div key={i} className="bg-brand-500/20 p-2 rounded text-center text-xs text-brand-300">
                                    {i+1}
                                </div>
                            ))}
                        </Grid>
                    </Card.Content>
                </Card>
            </section>

            {/* 2. Overlays */}
            <section>
                 <div className="flex items-center gap-3 mb-6">
                    <Maximize className="w-6 h-6 text-brand-500" />
                    <Heading level={2}>{UI_LABELS.overlays}</Heading>
                </div>
                
                <Grid cols={2} gap="lg">
                    <Card>
                        <Card.Content className="flex flex-col items-center justify-center h-40 gap-4">
                            <Heading level={4}>{UI_LABELS.modal}</Heading>
                            <Button onClick={() => setIsModalOpen(true)}>{UI_LABELS.openModal}</Button>
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Content className="flex flex-col items-center justify-center h-40 gap-4">
                            <Heading level={4}>{UI_LABELS.drawer}</Heading>
                            <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>{UI_LABELS.openDrawer}</Button>
                        </Card.Content>
                    </Card>
                </Grid>

                {/* Modal Instance */}
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title="Confirmation Required"
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>{UI_LABELS.cancel}</Button>
                            <Button variant="danger" onClick={() => setIsModalOpen(false)}>{UI_LABELS.confirm}</Button>
                        </>
                    }
                >
                    <Text>Are you sure you want to proceed with this action? This cannot be undone.</Text>
                </Modal>

                {/* Drawer Instance */}
                <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Settings Panel">
                    <Stack spacing="lg">
                        <Text>Configure your preferences here.</Text>
                        <Divider />
                        <div className="h-96 bg-slate-800 rounded-lg animate-pulse"></div>
                    </Stack>
                </Drawer>
            </section>

            {/* 3. Navigation & Structure */}
            <section>
                 <div className="flex items-center gap-3 mb-6">
                    <Layers className="w-6 h-6 text-brand-500" />
                    <Heading level={2}>{UI_LABELS.navigation}</Heading>
                </div>

                <Stack spacing="lg">
                    <Card>
                        <Card.Header><Heading level={4}>{UI_LABELS.tabs}</Heading></Card.Header>
                        <Card.Content>
                            <Tabs 
                                tabs={[
                                    { id: '1', label: 'Account', content: <div className="p-4 bg-slate-900 rounded">Account Settings Content</div> },
                                    { id: '2', label: 'Security', content: <div className="p-4 bg-slate-900 rounded">Security Configuration</div> },
                                    { id: '3', label: 'Notifications', content: <div className="p-4 bg-slate-900 rounded">Notification Preferences</div> },
                                ]}
                            />
                        </Card.Content>
                    </Card>

                    <Card>
                         <Card.Header><Heading level={4}>{UI_LABELS.accordion}</Heading></Card.Header>
                         <Card.Content>
                             <Accordion 
                                items={[
                                    { title: "What is SolarConnect?", content: "A platform connecting homeowners with installers." },
                                    { title: "Is it free?", content: "Yes, for homeowners it is completely free." },
                                ]}
                             />
                         </Card.Content>
                    </Card>

                    <Card>
                        <Card.Content className="space-y-8">
                             <div>
                                <Heading level={5} className="mb-4">{UI_LABELS.breadcrumbs}</Heading>
                                <Breadcrumbs items={[{ label: 'Projects', href: '#' }, { label: 'Solar Install', href: '#' }, { label: 'Quote #1234' }]} />
                             </div>
                             
                             <Divider />
                             
                             <div>
                                <Heading level={5} className="mb-4">{UI_LABELS.pagination}</Heading>
                                <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
                             </div>
                        </Card.Content>
                    </Card>
                </Stack>
            </section>

            {/* 4. Feedback & Progress */}
            <section>
                 <div className="flex items-center gap-3 mb-6">
                    <Layout className="w-6 h-6 text-brand-500" />
                    <Heading level={2}>{UI_LABELS.progress}</Heading>
                </div>

                <Card>
                    <Card.Content className="space-y-10">
                        <ProgressBar value={progressVal} label="Installation Progress" showValue />
                        
                        <div className="pt-4">
                            <Stepper 
                                steps={['Quote Request', 'Site Visit', 'Contract', 'Installation']} 
                                currentStep={2} 
                            />
                        </div>
                    </Card.Content>
                </Card>
            </section>

        </Stack>
      </Container>
    </div>
  );
};