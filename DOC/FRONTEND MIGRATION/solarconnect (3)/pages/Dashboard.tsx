import React from 'react';
import { Container } from '../components/ui/Container';
import { Grid } from '../components/ui/Grid';
import { Card } from '../components/ui/Card';
import { Heading, Text } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Stepper, ProgressBar } from '../components/ui/Progress';
import { Zap, DollarSign, Leaf, Bell, Calendar, ChevronRight } from 'lucide-react';

interface DashboardProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-20">
      <Container>
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="soft" icon={<Zap className="w-3 h-3" />}>Premium Member</Badge>
            </div>
            <Heading level={1}>Welcome back, Alex!</Heading>
            <Text size="lg" className="mt-2">Here is what's happening with your solar project today.</Text>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Bell className="w-4 h-4" />}>Notifications</Button>
            <Button variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>Schedule Visit</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <Grid cols={3} gap="lg" className="mb-10">
          <Card className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Zap className="w-24 h-24 text-brand-500" />
            </div>
            <div className="relative z-10">
               <Text variant="muted" size="sm" className="font-semibold uppercase tracking-wider mb-2">Energy Potential</Text>
               <Heading level={2} className="mb-1">12.4 MWh</Heading>
               <Text size="sm" className="text-green-400 font-medium flex items-center gap-1">
                 ↑ 12% <span className="text-slate-500">vs avg home</span>
               </Text>
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <DollarSign className="w-24 h-24 text-green-500" />
            </div>
            <div className="relative z-10">
               <Text variant="muted" size="sm" className="font-semibold uppercase tracking-wider mb-2">Est. Annual Savings</Text>
               <Heading level={2} className="mb-1">$2,450</Heading>
               <Text size="sm" className="text-slate-400">
                 Payback period: <span className="text-white font-medium">5.2 years</span>
               </Text>
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Leaf className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="relative z-10">
               <Text variant="muted" size="sm" className="font-semibold uppercase tracking-wider mb-2">CO₂ Offset</Text>
               <Heading level={2} className="mb-1">8.5 Tons</Heading>
               <Text size="sm" className="text-slate-400">
                 Equivalent to <span className="text-white font-medium">420 trees</span> planted
               </Text>
            </div>
          </Card>
        </Grid>

        {/* Main Content Layout */}
        <Grid cols={12} gap="lg">
          
          {/* Left Column: Project Status */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Heading level={3}>Active Project: Residential Solar Install</Heading>
                  <Badge variant="solid">In Progress</Badge>
                </div>
              </Card.Header>
              <Card.Content className="space-y-8">
                <div>
                   <div className="flex justify-between items-end mb-4">
                      <Text variant="muted" className="font-medium">Overall Progress</Text>
                      <Text className="font-bold text-brand-400">65%</Text>
                   </div>
                   <ProgressBar value={65} />
                </div>
                
                <div className="py-4">
                  <Stepper 
                    steps={['Consultation', 'Site Survey', 'Permitting', 'Installation', 'Activation']} 
                    currentStep={2} 
                  />
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <Heading level={4} className="mb-2 text-base">Current Step: Permitting</Heading>
                  <Text size="sm" className="mb-4">
                    Your design documents have been submitted to the city planning department. We are currently waiting for approval, which typically takes 5-7 business days.
                  </Text>
                  <Button variant="outline" size="sm">View Documents</Button>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                 <Heading level={3}>Recommended Actions</Heading>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {[
                    { title: "Upload Utility Bill", desc: "We need your latest bill to finalize energy calculations.", urgent: true },
                    { title: "Sign Interconnection Agreement", desc: "Required for grid connection approval.", urgent: false },
                    { title: "Review Preliminary Design", desc: "Check the panel layout proposed for your roof.", urgent: false }
                  ].map((action, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors">
                       <div className="flex items-start gap-4">
                          <div className={`w-2 h-2 mt-2 rounded-full ${action.urgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-brand-500'}`} />
                          <div>
                             <h4 className="font-bold text-white text-sm md:text-base">{action.title}</h4>
                             <p className="text-slate-400 text-xs md:text-sm">{action.desc}</p>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon">
                         <ChevronRight className="w-5 h-5 text-slate-400" />
                       </Button>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Right Column: Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
             {/* Installers Info */}
             <Card>
                <Card.Header>
                   <Heading level={4}>Selected Installer</Heading>
                </Card.Header>
                <Card.Content>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-black text-xl">S</div>
                      <div>
                         <div className="font-bold text-white">SunPower Elite</div>
                         <div className="text-xs text-slate-400">License #948210</div>
                      </div>
                   </div>
                   <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                         <span className="text-slate-400">Contact</span>
                         <span className="text-white">Mike Ross</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                         <span className="text-slate-400">Phone</span>
                         <span className="text-white">(555) 123-4567</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-400">Email</span>
                         <span className="text-white">support@sunpower.com</span>
                      </div>
                   </div>
                   <div className="mt-6">
                      <Button variant="secondary" fullWidth size="sm">Message Installer</Button>
                   </div>
                </Card.Content>
             </Card>

             {/* System Specs */}
             <Card>
               <Card.Header>
                  <Heading level={4}>System Specifications</Heading>
               </Card.Header>
               <Card.Content>
                  <ul className="space-y-3">
                     {[
                       { label: "System Size", val: "8.4 kW" },
                       { label: "Panel Type", val: "Monocrystalline 400W" },
                       { label: "Inverter", val: "Enphase IQ8+" },
                       { label: "Battery", val: "Tesla Powerwall 2" },
                     ].map((spec, i) => (
                       <li key={i} className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">{spec.label}</span>
                          <span className="font-medium text-white bg-slate-900 px-2 py-1 rounded">{spec.val}</span>
                       </li>
                     ))}
                  </ul>
               </Card.Content>
             </Card>
          </div>

        </Grid>
      </Container>
    </div>
  );
};