import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Heading, Text } from '../components/ui/Typography';
import { QuoteOptionCard } from '../components/home/QuoteOptionCard';
import { BlogCard } from '../components/home/BlogCard';
import { NewsCard } from '../components/home/NewsCard';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Radio } from '../components/ui/Radio';
import { Switch } from '../components/ui/Switch';
import { Avatar } from '../components/ui/Avatar';
import { Tooltip } from '../components/ui/Tooltip';
import { Spinner } from '../components/ui/Spinner';
import { Divider } from '../components/ui/Divider';
import { Phone, Zap, Mail, Plus, Search, User, CheckCircle2 } from 'lucide-react';

export const ComponentLibrary: React.FC = () => {
  const [switchVal, setSwitchVal] = useState(false);
  const [multiSelectVal, setMultiSelectVal] = useState<string | string[]>([]);
  const [singleSelectVal, setSingleSelectVal] = useState<string | string[]>("");
  const [radioVal, setRadioVal] = useState("1");

  const selectOptions = [
    { value: 'solar', label: 'Solar Panels' },
    { value: 'battery', label: 'Battery Storage' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'hvac', label: 'HVAC' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-10">
          <Heading level={1} className="mb-4">Design System</Heading>
          <Text size="lg">A robust collection of atomic primitives and molecules used to build the SolarConnect experience.</Text>
        </div>

        {/* 1. Colors */}
        <section className="space-y-6">
          <Heading level={2} className="border-b border-slate-800 pb-4">Colors</Heading>
          <div className="space-y-8">
            <div>
              <Text variant="muted" className="font-semibold uppercase tracking-wider mb-4">Brand Scale</Text>
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                  <div key={shade} className="space-y-2">
                    <div className={`h-16 w-full rounded-lg bg-brand-${shade} shadow-lg border border-white/5`}></div>
                    <div className="text-xs text-center text-slate-500 font-medium">{shade}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Text variant="muted" className="font-semibold uppercase tracking-wider mb-4">Slate Scale</Text>
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 gap-4">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                  <div key={shade} className="space-y-2">
                    <div className={`h-16 w-full rounded-lg bg-slate-${shade} shadow-lg border border-white/5`}></div>
                    <div className="text-xs text-center text-slate-500 font-medium">{shade}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Typography */}
        <section className="space-y-6">
          <Heading level={2} className="border-b border-slate-800 pb-4">Typography</Heading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <Text variant="muted" size="xs" className="mb-2">Heading 1</Text>
                <Heading level={1}>Power Your Future</Heading>
              </div>
              <div>
                <Text variant="muted" size="xs" className="mb-2">Heading 2</Text>
                <Heading level={2}>Latest Insights</Heading>
              </div>
              <div>
                <Text variant="muted" size="xs" className="mb-2">Heading 3</Text>
                <Heading level={3}>Why Choose Solar?</Heading>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <Text variant="muted" size="xs" className="mb-2">Body Large</Text>
                <Text size="lg">Join thousands of homeowners saving money and the planet. Switch to clean energy today.</Text>
              </div>
              <div>
                <Text variant="muted" size="xs" className="mb-2">Body Regular</Text>
                <Text>Solar panels absorb sunlight as a source of energy to generate direct current electricity.</Text>
              </div>
              <div>
                <Text variant="muted" size="xs" className="mb-2">Muted / Caption</Text>
                <Text size="sm" variant="muted">Last updated: March 15, 2024</Text>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Atoms & Utilities */}
        <section className="space-y-6">
          <Heading level={2} className="border-b border-slate-800 pb-4">Atoms & Utilities</Heading>
          
          <Card className="p-8 space-y-8">
            <div>
                <Heading level={4} className="mb-4">Badges</Heading>
                <div className="flex flex-wrap gap-4">
                    <Badge variant="solid">Solid</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="soft">Soft</Badge>
                    <Badge variant="glass">Glass</Badge>
                    <Badge variant="surface">Surface</Badge>
                    <Badge variant="solid" icon={<Zap className="w-3 h-3"/>}>With Icon</Badge>
                </div>
            </div>

            <Divider />

            <div>
                <Heading level={4} className="mb-4">Avatars & Tooltips</Heading>
                <div className="flex items-center gap-8">
                    <Tooltip content="User Profile">
                        <Avatar fallback="JD" src="https://i.pravatar.cc/150?u=1" size="lg" />
                    </Tooltip>
                    <Avatar fallback="AB" size="md" />
                    <Avatar fallback="SM" size="sm" />
                </div>
            </div>

            <Divider />

            <div>
                <Heading level={4} className="mb-4">Loaders</Heading>
                <div className="flex items-center gap-8">
                   <Spinner size="sm" />
                   <Spinner size="md" variant="white" />
                   <Spinner size="lg" variant="muted" />
                   <Spinner size="xl" />
                </div>
            </div>
          </Card>
        </section>

        {/* 4. Buttons */}
        <section className="space-y-6">
          <Heading level={2} className="border-b border-slate-800 pb-4">Buttons</Heading>
          <Card className="p-8 space-y-8">
            <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="white">White</Button>
                <Button variant="link">Link Button</Button>
            </div>
            
            <Divider text="States & Sizes" />

            <div className="flex flex-wrap gap-4 items-center">
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" isLoading>Loading</Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button variant="secondary" size="icon"><Plus className="w-5 h-5"/></Button>
                <Button variant="primary" size="fab"><Plus className="w-6 h-6"/></Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" leftIcon={<Mail className="w-4 h-4"/>}>With Left Icon</Button>
                <Button variant="outline" rightIcon={<Plus className="w-4 h-4"/>}>With Right Icon</Button>
            </div>
          </Card>
        </section>

        {/* 5. Inputs & Forms */}
        <section className="space-y-6">
          <Heading level={2} className="border-b border-slate-800 pb-4">Inputs & Forms</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 space-y-6">
               <Heading level={4}>Text Inputs</Heading>
               <Input label="Standard Input" placeholder="Placeholder..." fullWidth />
               <Input label="With Icon" placeholder="Search..." startIcon={<Search className="w-4 h-4"/>} fullWidth />
               <Input label="Password" type="password" placeholder="Enter password" fullWidth />
               <Input label="Error State" error="This field is required" placeholder="Invalid input" fullWidth />
            </Card>
            
            <Card className="p-8 space-y-6">
               <Heading level={4}>Select & Controls</Heading>
               <Select 
                 label="Single Select"
                 options={selectOptions}
                 value={singleSelectVal}
                 onChange={(v) => setSingleSelectVal(v)}
                 fullWidth
               />
               <Select 
                 label="Multi Select"
                 options={selectOptions}
                 value={multiSelectVal}
                 onChange={(v) => setMultiSelectVal(v)}
                 multiple
                 fullWidth
               />
               <div className="pt-4 space-y-4">
                 <Checkbox id="chk1" label="Accept terms and conditions" />
                 <Checkbox id="chk2" label="Subscribe to newsletter" defaultChecked />
               </div>
               <div className="pt-2 space-y-4">
                 <Radio name="r1" id="r1" label="Option One" checked={radioVal === "1"} onChange={() => setRadioVal("1")} />
                 <Radio name="r1" id="r2" label="Option Two" checked={radioVal === "2"} onChange={() => setRadioVal("2")} />
               </div>
               <div className="pt-4 flex items-center gap-8">
                  <Switch checked={switchVal} onCheckedChange={setSwitchVal} label="Airplane Mode" />
                  <Switch checked={true} onCheckedChange={() => {}} disabled label="Disabled" />
               </div>
            </Card>
          </div>
        </section>

        {/* 6. Molecules */}
        <section className="space-y-6">
          <Heading level={2} className="border-b border-slate-800 pb-4">Molecules</Heading>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
                <Text variant="muted" className="text-sm font-semibold">Quote Option Card</Text>
                <div className="h-full">
                    <QuoteOptionCard 
                        title="Book Consultation"
                        description="Schedule a direct call or home visit with a certified expert to discuss your solar needs."
                        ctaLabel="Schedule Now"
                        icon={Phone}
                        onClick={() => {}}
                        index={0}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <Text variant="muted" className="text-sm font-semibold">Blog Card</Text>
                <div className="h-full">
                     <BlogCard post={{
                         id: '1',
                         title: 'Understanding Solar Tax Credits',
                         excerpt: 'Everything you need to know about the Federal Investment Tax Credit (ITC).',
                         category: 'Finance',
                         imageUrl: 'https://picsum.photos/seed/solar-finance/800/600',
                         date: 'Mar 15, 2024',
                         readTime: '5 min',
                         author: 'Sarah J.'
                     }} />
                </div>
            </div>

            <div className="space-y-4">
                <Text variant="muted" className="text-sm font-semibold">News Card</Text>
                <div className="h-full">
                     <Card className="p-2">
                        <NewsCard article={{
                            id: '1',
                            source: 'TechCrunch',
                            title: 'New Battery Tech Revealed',
                            snippet: 'Breakthrough in storage.',
                            date: '2h ago',
                            url: '#',
                            imageUrl: 'https://picsum.photos/seed/tech/800/600'
                        }} />
                     </Card>
                </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};