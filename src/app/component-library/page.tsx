'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Building, Calculator, ArrowRight, Check, X, 
  Mail, Phone, FileText, AlertCircle, CheckCircle2,
  Sun, Moon, Zap, Battery, Sparkles, Loader2, Circle
} from 'lucide-react';

type TabType = 'buttons' | 'colors' | 'typography' | 'icons' | 'forms' | 'cards' | 'spacing' | 'containers' | 'data-display' | 'semantic';

export default function ComponentLibrary() {
  const [activeTab, setActiveTab] = useState<TabType>('semantic');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'semantic', label: 'Semantic Classes', icon: <CheckCircle2 className="h-4 w-4" /> },
    { id: 'containers', label: 'Containers', icon: <Building className="h-4 w-4" /> },
    { id: 'data-display', label: 'Data Display', icon: <Calculator className="h-4 w-4" /> },
    { id: 'buttons', label: 'Buttons', icon: <Zap className="h-4 w-4" /> },
    { id: 'forms', label: 'Forms', icon: <Mail className="h-4 w-4" /> },
    { id: 'cards', label: 'Cards', icon: <FileText className="h-4 w-4" /> },
    { id: 'colors', label: 'Colors', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'typography', label: 'Typography', icon: <Sun className="h-4 w-4" /> },
    { id: 'icons', label: 'Icons', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'spacing', label: 'Spacing', icon: <Battery className="h-4 w-4" /> },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-heading-2">Component Library</h1>
              <p className="text-body-small text-muted-foreground">Single Source of Truth (SOT) for all UI components</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Dark Theme Locked
            </Badge>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="secondary"
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-body-small whitespace-nowrap ${
                  activeTab === tab.id
                    ? '!text-foreground-secondary !shadow-neu-inset-sm'
                    : ''
                }`}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'semantic' && <SemanticClassesTab />}
        {activeTab === 'containers' && <ContainersTab />}
        {activeTab === 'data-display' && <DataDisplayTab />}
        {activeTab === 'buttons' && <ButtonsTab />}
        {activeTab === 'forms' && <FormsTab />}
        {activeTab === 'cards' && <CardsTab />}
        {activeTab === 'colors' && <ColorsTab />}
        {activeTab === 'typography' && <TypographyTab />}
        {activeTab === 'icons' && <IconsTab />}
        {activeTab === 'spacing' && <SpacingTab />}
      </div>
    </main>
  );
}

// ========================================
// SEMANTIC CLASSES TAB
// ========================================
function SemanticClassesTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Semantic Classes Overview</h2>
        <p className="text-body-small text-muted-foreground">All components use semantic classes from globals.css - NO hardcoded colors or typography</p>
      </div>

      {/* Quick Reference */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-heading-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Design System Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-label text-primary">✅ ALWAYS Use:</div>
              <ul className="text-body-small space-y-1 text-muted-foreground">
                <li>• Semantic classes: <code className="text-caption px-1 py-0.5 bg-background rounded">.theme-card</code>, <code className="text-caption px-1 py-0.5 bg-background rounded">.detail-card</code>, <code className="text-caption px-1 py-0.5 bg-background rounded">.cost-item</code></li>
                <li>• CSS variables: <code className="text-caption px-1 py-0.5 bg-background rounded">bg-primary</code>, <code className="text-caption px-1 py-0.5 bg-background rounded">text-foreground</code></li>
                <li>• Button component: <code className="text-caption px-1 py-0.5 bg-background rounded">&lt;Button variant=&quot;primary&quot;&gt;</code></li>
                <li>• Form classes: <code className="text-caption px-1 py-0.5 bg-background rounded">.form-input</code>, <code className="text-caption px-1 py-0.5 bg-background rounded">.form-select</code></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-label text-destructive">❌ NEVER Use:</div>
              <ul className="text-body-small space-y-1 text-muted-foreground">
                <li>• Hardcoded colors: <code className="text-caption px-1 py-0.5 bg-background rounded line-through">bg-primary</code>, <code className="text-caption px-1 py-0.5 bg-background rounded line-through">text-red-500</code></li>
                <li>• Raw typography: <code className="text-caption px-1 py-0.5 bg-background rounded line-through">text-heading-2</code>, <code className="text-caption px-1 py-0.5 bg-background rounded line-through"></code></li>
                <li>• Inline styles: <code className="text-caption px-1 py-0.5 bg-background rounded line-through">style=&#123;&#123;color: &#39;#fff&#39;&#125;&#125;</code></li>
                <li>• form-select on inputs (shows arrow!)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-heading-4">Container Classes</CardTitle>
            <CardDescription>8 semantic container classes</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-body-small space-y-2">
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.theme-card</code> - Modals, dialogs
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.detail-card</code> - Content cards
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.neu-card</code> - Neumorphic cards
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.info-section</code> - Content sections
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heading-4">Form Classes</CardTitle>
            <CardDescription>Semantic form elements</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-body-small space-y-2">
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.form-input</code> - Text inputs
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.form-select</code> - Dropdowns only
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.toggle-switch</code> - Toggle buttons
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.slider-track</code> - Range sliders
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heading-4">Data Display Classes</CardTitle>
            <CardDescription>18+ display components</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-body-small space-y-2">
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.cost-item</code> - Financial data
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.metric-card</code> - KPI metrics
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.spec-card</code> - Specifications
              </li>
              <li className="flex items-center gap-2">
                <Circle className="h-2 w-2 fill-primary text-primary" />
                <code>.rebate-item</code> - Rebates
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Total Count */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-heading-1 text-primary mb-2">65+</div>
            <div className="text-body-small text-muted-foreground">Total Semantic Classes Available</div>
            <div className="text-caption text-muted-foreground mt-2">See SEMANTIC-CLASSES-REGISTRY.md for full reference</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// CONTAINERS TAB
// ========================================
function ContainersTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Container Components</h2>
        <p className="text-body-small text-muted-foreground">Semantic container classes for modals, cards, and sections</p>
      </div>

      {/* Theme Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">.theme-card</CardTitle>
              <CardDescription>Modal/Dialog Container - Strong Shadow</CardDescription>
            </div>
            <Badge variant="outline">Elevated</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-8 bg-muted/30 rounded-lg">
            <div className="theme-card p-6 max-w-md mx-auto">
              <h3 className="detail-card-header mb-4">Modal Title</h3>
              <p className="text-body-small mb-4">This is a modal container using .theme-card class with strong shadow for elevation.</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1">Cancel</Button>
                <Button variant="primary" className="flex-1">Confirm</Button>
              </div>
            </div>
          </div>
          <div className="text-caption text-muted-foreground font-mono bg-muted/50 p-3 rounded">
            &lt;div className=&quot;theme-card p-8&quot;&gt;...&lt;/div&gt;
          </div>
          <div className="text-caption">
            <strong>Properties:</strong> bg-surface, rounded-xl, shadow-outset-xl, border<br />
            <strong>Use for:</strong> Modals, dialogs, elevated overlays
          </div>
        </CardContent>
      </Card>

      {/* Detail Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">.detail-card</CardTitle>
              <CardDescription>Content Card - Medium Shadow</CardDescription>
            </div>
            <Badge variant="outline">Inline</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="detail-card">
            <h3 className="detail-card-header mb-4">System Details</h3>
            <div className="space-y-3">
              <div className="cost-item">
                <span className="cost-item-label">Panel Count</span>
                <span className="cost-item-value">24 panels</span>
              </div>
              <div className="cost-item">
                <span className="cost-item-label">System Size</span>
                <span className="cost-item-value">9.6 kW</span>
              </div>
              <div className="cost-item">
                <span className="cost-item-label">Total Cost</span>
                <span className="cost-item-value">$16,000</span>
              </div>
            </div>
          </div>
          <div className="text-caption text-muted-foreground font-mono bg-muted/50 p-3 rounded">
            &lt;div className=&quot;detail-card&quot;&gt;...&lt;/div&gt;
          </div>
          <div className="text-caption">
            <strong>Properties:</strong> bg-surface, rounded-lg, shadow-outset-md, p-6, border<br />
            <strong>Use for:</strong> Result cards, data displays, info boxes
          </div>
        </CardContent>
      </Card>

      {/* Neu Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">.neu-card</CardTitle>
              <CardDescription>Neumorphic Card - 3D Effect</CardDescription>
            </div>
            <Badge variant="outline">3D</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="neu-card p-6 text-center">
              <div className="text-caption text-muted-foreground mb-2">Default</div>
              <div className="text-heading-2 mb-1">$45,600</div>
              <div className="text-caption text-muted-foreground">Total Savings</div>
            </div>
            <div className="neu-card-compact p-4 text-center">
              <div className="text-caption text-muted-foreground mb-2">Compact</div>
              <div className="text-heading-3 mb-1">8.5 years</div>
              <div className="text-caption text-muted-foreground">ROI Period</div>
            </div>
            <div className="neu-card-elevated p-6 text-center">
              <div className="text-caption text-muted-foreground mb-2">Elevated</div>
              <div className="text-heading-2 mb-1">24</div>
              <div className="text-caption text-muted-foreground">Panel Count</div>
            </div>
          </div>
          <div className="text-caption text-muted-foreground font-mono bg-muted/50 p-3 rounded">
            .neu-card | .neu-card-compact | .neu-card-elevated
          </div>
          <div className="text-caption">
            <strong>Properties:</strong> Outset shadow, 3D appearance, theme-adaptive<br />
            <strong>Use for:</strong> Enhanced metric displays, feature highlights
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">.info-section</CardTitle>
              <CardDescription>Content Section Container</CardDescription>
            </div>
            <Badge variant="outline">Layout</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="info-section bg-muted/20 rounded-lg">
            <h3 className="text-heading-3 mb-4">Section Title</h3>
            <p className="text-body">This is a content section with standard padding and spacing for consistent layouts.</p>
          </div>
          <div className="text-caption text-muted-foreground font-mono bg-muted/50 p-3 rounded">
            &lt;section className=&quot;info-section&quot;&gt;...&lt;/section&gt;
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// DATA DISPLAY TAB
// ========================================
function DataDisplayTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Data Display Components</h2>
        <p className="text-body-small text-muted-foreground">Semantic classes for displaying financial data, metrics, and specifications</p>
      </div>

      {/* Cost Item */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">Cost Item Pattern</CardTitle>
              <CardDescription>.cost-item, .cost-item-label, .cost-item-value</CardDescription>
            </div>
            <Badge variant="outline">Financial</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="detail-card">
            <h3 className="detail-card-header mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="cost-item">
                <span className="cost-item-label">System Cost</span>
                <span className="cost-item-value">$15,000</span>
              </div>
              <div className="cost-item">
                <span className="cost-item-label">Installation</span>
                <span className="cost-item-value">$3,500</span>
              </div>
              <div className="cost-item">
                <span className="cost-item-label">Rebates</span>
                <span className="cost-item-value text-success">-$2,500</span>
              </div>
              <div className="cost-item border-t border-border pt-3 mt-3">
                <span className="cost-item-label">Total</span>
                <span className="cost-item-value">$16,000</span>
              </div>
            </div>
          </div>
          <div className="text-caption text-muted-foreground font-mono bg-muted/50 p-3 rounded">
{`<div className="cost-item">
  <span className="cost-item-label">System Cost</span>
  <span className="cost-item-value">$15,000</span>
</div>`}
          </div>
          <div className="text-caption">
            <strong>Use for:</strong> Cost breakdowns, pricing tables, financial summaries
          </div>
        </CardContent>
      </Card>

      {/* Metric Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">Metric Card Pattern</CardTitle>
              <CardDescription>.metric-card, .metric-card-label, .metric-card-value</CardDescription>
            </div>
            <Badge variant="outline">KPI</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="metric-card">
              <div className="metric-card-label">Annual Savings</div>
              <div className="metric-card-value">$2,400</div>
              <div className="metric-card-description">Per year average</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-label">ROI Period</div>
              <div className="metric-card-value">8.5 years</div>
              <div className="metric-card-description">Break-even point</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-label">Total Savings</div>
              <div className="metric-card-value">$45,600</div>
              <div className="metric-card-description">25 year lifetime</div>
            </div>
          </div>
          <div className="text-caption text-muted-foreground font-mono bg-muted/50 p-3 rounded">
{`<div className="metric-card">
  <div className="metric-card-label">Annual Savings</div>
  <div className="metric-card-value">$2,400</div>
  <div className="metric-card-description">Per year</div>
</div>`}
          </div>
          <div className="text-caption">
            <strong>Use for:</strong> Dashboard KPIs, key metrics, statistics
          </div>
        </CardContent>
      </Card>

      {/* Spec Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">Spec Card Pattern</CardTitle>
              <CardDescription>.spec-card, .spec-card-label, .spec-card-value</CardDescription>
            </div>
            <Badge variant="outline">Technical</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="spec-card">
              <div className="spec-card-label">Panel Type</div>
              <div className="spec-card-value">Monocrystalline</div>
            </div>
            <div className="spec-card">
              <div className="spec-card-label">Warranty</div>
              <div className="spec-card-value">25 years</div>
            </div>
            <div className="spec-card">
              <div className="spec-card-label">Inverter</div>
              <div className="spec-card-value">String</div>
            </div>
            <div className="spec-card">
              <div className="spec-card-label">Monitoring</div>
              <div className="spec-card-value">WiFi</div>
            </div>
          </div>
          <div className="text-caption text-muted-foreground font-mono bg-muted/50 p-3 rounded">
{`<div className="spec-card">
  <div className="spec-card-label">Panel Type</div>
  <div className="spec-card-value">Monocrystalline</div>
</div>`}
          </div>
          <div className="text-caption">
            <strong>Use for:</strong> Technical specifications, system details, product features
          </div>
        </CardContent>
      </Card>

      {/* Performance Item */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">Performance Item Pattern</CardTitle>
              <CardDescription>.performance-item, .performance-item-label, .performance-item-value</CardDescription>
            </div>
            <Badge variant="outline">Performance</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="detail-card">
            <h3 className="detail-card-header mb-4">System Performance</h3>
            <div className="space-y-2">
              <div className="performance-item">
                <span className="performance-item-label">Panel Efficiency</span>
                <span className="performance-item-value">22.5%</span>
              </div>
              <div className="performance-item">
                <span className="performance-item-label">Capacity Factor</span>
                <span className="performance-item-value">18.2%</span>
              </div>
              <div className="performance-item">
                <span className="performance-item-label">Annual Production</span>
                <span className="performance-item-value">12,480 kWh</span>
              </div>
            </div>
          </div>
          <div className="text-caption">
            <strong>Use for:</strong> System performance metrics, efficiency data
          </div>
        </CardContent>
      </Card>

      {/* Summary Box */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">Summary Box Pattern</CardTitle>
              <CardDescription>.summary-box, .summary-box-label, .summary-box-value</CardDescription>
            </div>
            <Badge variant="outline">Highlight</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="summary-box">
            <div className="summary-box-label">Your Estimated Quote</div>
            <div className="summary-box-value">$16,000</div>
          </div>
          <div className="text-caption">
            <strong>Use for:</strong> Important summaries, final totals, highlighted values
          </div>
        </CardContent>
      </Card>

      {/* Rebate Item */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-heading-4">Rebate Item Pattern</CardTitle>
              <CardDescription>.rebate-item, .rebate-item-label, .rebate-item-value</CardDescription>
            </div>
            <Badge variant="outline">Incentives</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="detail-card">
            <h3 className="detail-card-header mb-4">Available Rebates</h3>
            <div className="space-y-2">
              <div className="rebate-item">
                <span className="rebate-item-label">Federal Tax Credit (30%)</span>
                <span className="rebate-item-value">$4,800</span>
              </div>
              <div className="rebate-item">
                <span className="rebate-item-label">State Rebate</span>
                <span className="rebate-item-value">$1,500</span>
              </div>
              <div className="rebate-item">
                <span className="rebate-item-label">Utility Incentive</span>
                <span className="rebate-item-value">$750</span>
              </div>
            </div>
          </div>
          <div className="text-caption">
            <strong>Use for:</strong> Rebate information, incentives, discounts
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// BUTTONS TAB
// ========================================
function ButtonsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Neumorphic Button System</h2>
        <p className="text-body-small text-muted-foreground">Centralized button component with dark theme neumorphism</p>
      </div>

      <div className="grid gap-6">
        {/* Primary Variant */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-heading-4">primary</CardTitle>
              <Badge>White Border + Transparent</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Button variant="primary">Instant Quote</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
            <div className="text-caption text-muted-foreground">
              <div className="font-mono bg-muted/50 p-2 rounded">
                <div>variant=&quot;primary&quot;</div>
                <div className="text-[10px] mt-1">border border-white bg-transparent text-foreground-secondary shadow-neu-outset-sm hover:shadow-neu-inset-sm</div>
              </div>
            </div>
            <div className="text-caption">
              <strong>Used in:</strong> Hero (Instant Quote), Instant Quote Form (main CTAs)
            </div>
          </CardContent>
        </Card>

        {/* Secondary Variant */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-heading-4">secondary</CardTitle>
              <Badge variant="outline">Filled Neumorphic</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Button variant="secondary">Rebates</Button>
              <Button variant="secondary" disabled>Disabled</Button>
            </div>
            <div className="text-caption text-muted-foreground">
              <div className="font-mono bg-muted/50 p-2 rounded">
                <div>variant=&quot;secondary&quot;</div>
                <div className="text-[10px] mt-1">bg-neumorphic-background text-muted-foreground shadow-neu-outset-sm hover:shadow-neu-inset-sm</div>
              </div>
            </div>
            <div className="text-caption">
              <strong>Used in:</strong> Hero (Rebates), Instant Quote Form (Back, Next Step)
            </div>
          </CardContent>
        </Card>

        {/* Ghost Variant */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-heading-4">ghost</CardTitle>
              <Badge variant="outline">Subtle</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Button variant="ghost">Dashboard</Button>
              <Button variant="ghost" disabled>Disabled</Button>
            </div>
            <div className="text-caption text-muted-foreground">
              <div className="font-mono bg-muted/50 p-2 rounded">
                <div>variant=&quot;ghost&quot;</div>
                <div className="text-[10px] mt-1">bg-transparent hover:bg-surface/10</div>
              </div>
            </div>
            <div className="text-caption">
              <strong>Used in:</strong> HeaderMenu (Dashboard), QuoteOptionsModal
            </div>
          </CardContent>
        </Card>

        {/* Outline Variant */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-heading-4">outline</CardTitle>
              <Badge variant="outline">Bordered</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Button variant="outline">Login</Button>
              <Button variant="outline" disabled>Disabled</Button>
            </div>
            <div className="text-caption text-muted-foreground">
              <div className="font-mono bg-muted/50 p-2 rounded">
                <div>variant=&quot;outline&quot;</div>
                <div className="text-[10px] mt-1">border-2 border-border bg-transparent shadow-neu-outset-sm</div>
              </div>
            </div>
            <div className="text-caption">
              <strong>Used in:</strong> HeaderMenu (Login), ProfileManagement
            </div>
          </CardContent>
        </Card>

        {/* Minimal Variant */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-heading-4">minimal</CardTitle>
              <Badge variant="outline">Text-like</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Button variant="minimal">Edit Profile</Button>
              <Button variant="minimal" disabled>Disabled</Button>
            </div>
            <div className="text-caption text-muted-foreground">
              <div className="font-mono bg-muted/50 p-2 rounded">
                <div>variant=&quot;minimal&quot;</div>
                <div className="text-[10px] mt-1">bg-transparent hover:text-primary shadow-none border-none</div>
              </div>
            </div>
            <div className="text-caption">
              <strong>Used in:</strong> QuoteBuilderModal (7x), ProfileManagement (10x)
            </div>
          </CardContent>
        </Card>

        {/* Destructive Variant */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-heading-4">destructive</CardTitle>
              <Badge variant="destructive">Danger</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Button variant="destructive">Delete</Button>
              <Button variant="destructive" disabled>Disabled</Button>
            </div>
            <div className="text-caption text-muted-foreground">
              <div className="font-mono bg-muted/50 p-2 rounded">
                <div>variant=&quot;destructive&quot;</div>
                <div className="text-[10px] mt-1">bg-destructive text-destructive-foreground shadow-lg</div>
              </div>
            </div>
            <div className="text-caption">
              <strong>Used in:</strong> ProfileManagement (Delete actions 2x)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========================================
// COLORS TAB
// ========================================
function ColorsTab() {
  const colors = [
    { name: 'Primary', var: '--primary', usage: 'Main brand color, CTAs', class: 'bg-primary' },
    { name: 'Background', var: '--background', usage: 'Page background', class: 'bg-background' },
    { name: 'Foreground', var: '--foreground', usage: 'Text on background', class: 'bg-foreground' },
    { name: 'Muted', var: '--muted', usage: 'Subtle backgrounds', class: 'bg-muted' },
    { name: 'Muted Foreground', var: '--muted-foreground', usage: 'Secondary text', class: 'bg-muted-foreground' },
    { name: 'Card', var: '--card', usage: 'Card backgrounds', class: 'bg-card' },
    { name: 'Border', var: '--border', usage: 'All borders', class: 'bg-border' },
    { name: 'Destructive', var: '--destructive', usage: 'Error, danger', class: 'bg-destructive' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Color System</h2>
        <p className="text-body-small text-muted-foreground">All colors use CSS variables from globals.css. NEVER use hardcoded colors.</p>
      </div>

      <div className="grid gap-4">
        {colors.map((color) => (
          <Card key={color.name}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-lg border ${color.class}`}></div>
                <div className="flex-1">
                  <div className="">{color.name}</div>
                  <div className="text-caption text-muted-foreground font-mono">{color.var}</div>
                  <div className="text-caption text-muted-foreground mt-1">{color.usage}</div>
                </div>
                <div className="text-right">
                  <div className="text-caption font-mono bg-muted px-2 py-1 rounded">{color.class}</div>
                  <div className="text-caption font-mono bg-muted px-2 py-1 rounded mt-1">text-{color.class.replace('bg-', '')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-destructive/20 bg-destructive/5 shadow-neu-inset">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-body-small">
              <strong>❌ NEVER use:</strong> bg-teal-600, bg-surface, text-primary, border-border, etc.
              <br />
              <strong>✅ ALWAYS use:</strong> bg-primary, bg-muted, text-foreground, border-border
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// TYPOGRAPHY TAB
// ========================================
function TypographyTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Typography Tokens</h2>
        <p className="text-body-small text-muted-foreground">Use semantic tokens instead of raw Tailwind classes</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-heading-4">Headings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <h1 className="text-heading-1">Heading 1</h1>
                <div className="text-caption text-muted-foreground font-mono mt-1">text-heading-1 (text-heading-1)</div>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h2 className="text-heading-1">Heading 2</h2>
                <div className="text-caption text-muted-foreground font-mono mt-1">text-heading-2 (text-heading-1)</div>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-heading-2">Heading 3</h3>
                <div className="text-caption text-muted-foreground font-mono mt-1">text-heading-3 (text-heading-2)</div>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="text-heading-3">Heading 4</h4>
                <div className="text-caption text-muted-foreground font-mono mt-1">text-heading-4 (text-heading-3)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-heading-4">Body Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border-l-4 border-muted pl-4">
                <p className="text-body">Body text - Default size for paragraphs and content</p>
                <div className="text-caption text-muted-foreground font-mono mt-1">text-body (text-body)</div>
              </div>
              <div className="border-l-4 border-muted pl-4">
                <p className="text-body-small">Small body text - For secondary content</p>
                <div className="text-caption text-muted-foreground font-mono mt-1">text-body-small (text-body-small)</div>
              </div>
              <div className="border-l-4 border-muted pl-4">
                <p className="text-caption">Caption text - For hints and metadata</p>
                <div className="text-caption text-muted-foreground font-mono mt-1">text-caption (text-caption)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5 shadow-neu-inset">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-body-small">
                <strong>❌ NEVER use:</strong> text-caption, text-body-small, text-heading-2, text-heading-1,, directly
                <br />
                <strong>✅ ALWAYS use:</strong> text-heading-*, text-body, text-caption (tokens to be defined in Tailwind config)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========================================
// ICONS TAB
// ========================================
function IconsTab() {
  const iconSizes = [
    { name: 'XS', class: 'h-3 w-3', px: '12px', usage: 'Badges, inline icons' },
    { name: 'SM', class: 'h-4 w-4', px: '16px', usage: 'Buttons, form labels' },
    { name: 'MD', class: 'h-5 w-5', px: '20px', usage: 'Cards, list items' },
    { name: 'LG', class: 'h-6 w-6', px: '24px', usage: 'Headers, navigation' },
    { name: 'XL', class: 'h-8 w-8', px: '32px', usage: 'Hero sections, modals' },
  ];

  const commonIcons = [
    { Icon: Home, name: 'Home' },
    { Icon: Building, name: 'Building' },
    { Icon: Calculator, name: 'Calculator' },
    { Icon: ArrowRight, name: 'ArrowRight' },
    { Icon: Check, name: 'Check' },
    { Icon: X, name: 'X' },
    { Icon: Mail, name: 'Mail' },
    { Icon: Phone, name: 'Phone' },
    { Icon: FileText, name: 'FileText' },
    { Icon: AlertCircle, name: 'AlertCircle' },
    { Icon: CheckCircle2, name: 'CheckCircle2' },
    { Icon: Sun, name: 'Sun' },
    { Icon: Moon, name: 'Moon' },
    { Icon: Zap, name: 'Zap' },
    { Icon: Battery, name: 'Battery' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Icon System</h2>
        <p className="text-body-small text-muted-foreground">All icons use lucide-react. NO inline SVGs allowed.</p>
      </div>

      {/* Icon Sizes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heading-4">Icon Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {iconSizes.map((size) => (
              <div key={size.name} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-20 font-mono text-label">{size.name}</div>
                <Sun className={size.class} />
                <div className="flex-1">
                  <div className="text-body-small font-mono">{size.class}</div>
                  <div className="text-caption text-muted-foreground">{size.px} - {size.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Icons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-heading-4">Common Icons (lucide-react)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {commonIcons.map(({ Icon, name }) => (
              <div key={name} className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Icon className="h-6 w-6" />
                <div className="text-caption text-center font-mono">{name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5 shadow-neu-inset">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-body-small">
              <strong>❌ NEVER use:</strong> Inline &lt;svg&gt; tags
              <br />
              <strong>✅ ALWAYS use:</strong> import {'{IconName}'} from &apos;lucide-react&apos;
              <br />
              <strong>Example:</strong> <code className="bg-muted px-1 rounded">import {'{Calculator}'} from &apos;lucide-react&apos;; &lt;Calculator className=&quot;h-5 w-5&quot; /&gt;</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// FORMS TAB
// ========================================
function FormsTab() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Neumorphic Form Components</h2>
        <p className="text-body-small text-muted-foreground">Centralized form components with inset shadows and consistent styling</p>
      </div>

      {/* Neumorphic Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading-4">Neumorphic Input</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">shadow-neu-inset</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Normal State */}
            <div className="space-y-2">
              <Label className="text-body-small text-foreground">Normal Input</Label>
              <Input 
                type="text" 
                placeholder="Enter your email..." 
                className="bg-background shadow-neu-inset border border-border/50 focus:shadow-neu-inset-sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            {/* With Label & Value */}
            <div className="space-y-2">
              <Label className="text-body-small text-foreground">Filled Input</Label>
              <Input 
                type="text" 
                placeholder="Enter your name..." 
                className="bg-background shadow-neu-inset border border-border/50 focus:shadow-neu-inset-sm"
                value="John Doe"
                readOnly
              />
            </div>

            {/* Error State */}
            <div className="space-y-2">
              <Label className="text-body-small text-foreground">Error State</Label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                className="bg-background shadow-neu-inset border border-destructive/50 focus:shadow-neu-inset-sm"
              />
              <p className="text-body-small text-destructive">Please enter a valid email</p>
            </div>

            {/* Disabled State */}
            <div className="space-y-2">
              <Label className="text-body-small text-muted-foreground">Disabled Input</Label>
              <Input 
                type="text" 
                placeholder="Disabled..." 
                className="bg-background shadow-neu-inset border border-border/50 opacity-50"
                disabled
              />
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-background/50 p-4 rounded-xl border border-border/30">
            <p className="text-caption text-muted-foreground font-mono mb-2">Usage:</p>
            <pre className="text-caption text-foreground font-mono overflow-x-auto">
{`<Input 
  type="text" 
  placeholder="Enter text..." 
  className="bg-background shadow-neu-inset border border-border/50 focus:shadow-neu-inset-sm"
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Neumorphic Select */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading-4">Neumorphic Select</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">shadow-neu-inset</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Normal Select */}
            <div className="space-y-2">
              <Label className="text-body-small text-foreground">Select Option</Label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 bg-background rounded-xl shadow-neu-inset border border-border/50 text-foreground focus:outline-none focus:shadow-neu-inset-sm appearance-none"
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                >
                  <option value="">Choose an option</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* With Selection */}
            <div className="space-y-2">
              <Label className="text-body-small text-foreground">Selected State</Label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 bg-background rounded-xl shadow-neu-inset border border-border/50 text-foreground focus:outline-none focus:shadow-neu-inset-sm appearance-none"
                  value="residential"
                  disabled
                >
                  <option value="residential">Residential</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-background/50 p-4 rounded-xl border border-border/30">
            <p className="text-caption text-muted-foreground font-mono mb-2">Usage:</p>
            <pre className="text-caption text-foreground font-mono overflow-x-auto">
{`<select className="w-full px-4 py-3 bg-background rounded-xl shadow-neu-inset border border-border/50 text-foreground focus:outline-none focus:shadow-neu-inset-sm appearance-none">
  <option>Choose option</option>
</select>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Neumorphic Checkbox */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading-4">Neumorphic Checkbox</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Interactive</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Unchecked */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input type="checkbox" className="peer sr-only" id="check1" />
                <div className="w-5 h-5 bg-background rounded-md shadow-neu-inset border border-border/50 peer-checked:shadow-neu-outset peer-checked:border-primary/50 transition-colors cursor-pointer flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <label htmlFor="check1" className="text-body-small text-foreground cursor-pointer">Unchecked State</label>
            </div>

            {/* Checked */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input type="checkbox" className="peer sr-only" id="check2" checked readOnly />
                <div className="w-5 h-5 bg-background rounded-md shadow-neu-outset border border-primary/50 transition-colors cursor-pointer flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <label htmlFor="check2" className="text-body-small text-foreground cursor-pointer">Checked State</label>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="p-6 bg-background rounded-xl shadow-neu-inset border border-border/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  id="checkDemo" 
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />
                <label htmlFor="checkDemo" className={`
                  w-5 h-5 bg-background rounded-md border transition-colors cursor-pointer flex items-center justify-center
                  ${checkboxChecked ? 'shadow-neu-outset border-primary/50' : 'shadow-neu-inset border-border/50'}
                `}>
                  <svg className={`w-3 h-3 text-primary transition-opacity ${checkboxChecked ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </label>
              </div>
              <label htmlFor="checkDemo" className="text-body-small text-foreground cursor-pointer">
                Click to toggle (Interactive Demo)
              </label>
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-background/50 p-4 rounded-xl border border-border/30">
            <p className="text-caption text-muted-foreground font-mono mb-2">Usage:</p>
            <pre className="text-caption text-foreground font-mono overflow-x-auto">
{`<div className="flex items-center gap-3">
  <input type="checkbox" className="peer sr-only" id="check" />
  <div className="w-5 h-5 bg-background rounded-md shadow-neu-inset border border-border/50 peer-checked:shadow-neu-outset peer-checked:border-primary/50">
    <svg className="w-3 h-3 text-primary opacity-0 peer-checked:opacity-100">
      <path d="M5 13l4 4L19 7" />
    </svg>
  </div>
  <label htmlFor="check">Label text</label>
</div>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-body-small">
              <strong className="text-primary">Neumorphic Form Best Practices:</strong>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Always use <code className="text-caption px-1 py-0.5 bg-background rounded">shadow-neu-inset</code> for input fields</li>
                <li>• Use <code className="text-caption px-1 py-0.5 bg-background rounded">focus:shadow-neu-inset-sm</code> for focus states</li>
                <li>• Checkbox: unchecked = inset, checked = outset</li>
                <li>• Use centralized colors: <code className="text-caption px-1 py-0.5 bg-background rounded">bg-background</code>, <code className="text-caption px-1 py-0.5 bg-background rounded">border-border</code>, <code className="text-caption px-1 py-0.5 bg-background rounded">text-foreground</code></li>
                <li>• Error states: <code className="text-caption px-1 py-0.5 bg-background rounded">border-destructive/50</code> + error message with <code className="text-caption px-1 py-0.5 bg-background rounded">text-destructive</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// CARDS TAB
// ========================================
function CardsTab() {
  const iconCards = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      title:"Web Development",
      description:"Crafting high-performance websites and applications with modern, scalable technologies."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a2.25 2.25 0 012.4-2.245 4.5 4.5 0 00-8.4 2.245c0 .399.078.78.22 1.128zm0 0a15.998 15.998 0 00-3.388 1.62m5.043-.025a15.998 15.998 0 01-1.622 3.385m1.622-3.385a2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385" />
        </svg>
      ),
      title:"UI/UX Design",
      description:"Designing intuitive and engaging user interfaces that provide a seamless user experience."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
      title:"SEO & Marketing",
      description:"Boosting your online presence and driving organic traffic through proven SEO strategies."
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Neumorphic Card System</h2>
        <p className="text-body-small text-muted-foreground">Centralized shadcn/ui Card with dark theme and neumorphic shadows</p>
      </div>

      {/* Icon Card Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-heading-4">Icon Card</h3>
            <p className="text-body-small text-muted-foreground">Service cards with neumorphic icons</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Pixel Perfect
          </Badge>
        </div>

        {/* Live Example */}
        <div className="grid md:grid-cols-3 gap-8 p-8 bg-background rounded-xl">
          {iconCards.map((card, index) => (
            <div 
              key={index} 
              className="bg-background p-8 rounded-2xl shadow-neu-outset text-center transition-colors duration-300 hover:shadow-neu-outset-lg"
            >
              <div className="w-20 h-20 rounded-full bg-background shadow-neu-inset flex items-center justify-center mx-auto mb-6 text-primary">
                {card.icon}
              </div>
              <h3 className="text-heading-3 text-foreground mb-2">{card.title}</h3>
              <p className="text-muted-foreground text-body-small leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Code Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-heading-4">Usage & Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-body-small font-mono bg-muted p-4 rounded-lg overflow-x-auto">
              <div className="text-primary">{`// Icon Card Structure`}</div>
              <div>&lt;div className=&quot;bg-background p-8 rounded-2xl shadow-neu-outset text-center&quot;&gt;</div>
              <div className="ml-4">&lt;div className=&quot;w-20 h-20 rounded-full bg-background shadow-neu-inset flex items-center justify-center mx-auto mb-6&quot;&gt;</div>
              <div className="ml-8">&lt;Icon className=&quot;w-8 h-8 text-primary&quot; /&gt;</div>
              <div className="ml-4">&lt;/div&gt;</div>
              <div className="ml-4">&lt;h3 className=&quot;text-heading-3 text-foreground mb-2&quot;&gt;Title&lt;/h3&gt;</div>
              <div className="ml-4">&lt;p className=&quot;text-muted-foreground text-body-small&quot;&gt;Description&lt;/p&gt;</div>
              <div>&lt;/div&gt;</div>
            </div>
            <div className="text-caption space-y-2">
              <div><strong>Used in:</strong> Services Section, Feature Cards</div>
              <div><strong>Key Classes:</strong></div>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li><span className="font-mono">shadow-neu-outset</span> - Raised card effect</li>
                <li><span className="font-mono">shadow-neu-inset</span> - Inset icon container</li>
                <li><span className="font-mono">rounded-2xl</span> - Card border radius</li>
                <li><span className="font-mono">rounded-full</span> - Icon container circle</li>
                <li><span className="font-mono">p-8</span> - Card padding</li>
                <li><span className="font-mono">w-20 h-20</span> - Icon container size</li>
              </ul>
              <div className="mt-4 p-3 border border-border/30 rounded-lg shadow-neu-inset bg-muted/20">
                <strong className="text-primary">Design Notes:</strong>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-muted-foreground">
                  <li>Icons use <span className="font-mono">text-primary</span> for brand color</li>
                  <li>Hover effect adds <span className="font-mono">shadow-neu-outset-lg</span></li>
                  <li>Perfect for service cards, feature highlights, or benefit sections</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Standard Cards */}
      <div className="space-y-4">
        <h3 className="text-heading-4">Standard Cards</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Standard Card */}
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Default card with border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-small text-muted-foreground">Uses border-border, bg-card, rounded-xl</p>
            </CardContent>
          </Card>

          {/* Card with Neumorphic Shadow */}
          <Card className="shadow-neu-outset">
            <CardHeader>
              <CardTitle>Neumorphic Card</CardTitle>
              <CardDescription>With shadow-neu-outset</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-small text-muted-foreground">Add shadow-neu-outset class for depth</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-heading-4">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-body-small font-mono bg-muted p-3 rounded-lg">
            <div>&lt;Card&gt; or &lt;Card className=&quot;shadow-neu-outset&quot;&gt;</div>
            <div className="ml-4">&lt;CardHeader&gt;&lt;CardTitle&gt;...&lt;/CardTitle&gt;&lt;/CardHeader&gt;</div>
            <div className="ml-4">&lt;CardContent&gt;...&lt;/CardContent&gt;</div>
            <div>&lt;/Card&gt;</div>
          </div>
          <div className="text-caption space-y-1">
            <div><strong>Used in:</strong> Instant Quote Form, Admin Dashboard, Profile Management</div>
            <div><strong>Classes:</strong> bg-card, border-border, rounded-xl</div>
          </div>
        </CardContent>
      </Card>

      {/* Neumorphic Alerts */}
      <div className="space-y-4">
        <div>
          <h3 className="text-heading-4">Neumorphic Alerts</h3>
          <p className="text-body-small text-muted-foreground">Status messages with neumorphic inset style</p>
        </div>

        <div className="space-y-4">
          {/* Error Alert */}
          <div className="rounded-xl p-4 border shadow-neu-inset bg-destructive/10 border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-destructive" />
              <div className="flex-1">
                <h4 className="mb-1 text-destructive">Error</h4>
                <div className="text-body-small text-destructive/90">
                  Something went wrong. Please try again later.
                </div>
              </div>
            </div>
          </div>

          {/* Success Alert */}
          <div className="rounded-xl p-4 border shadow-neu-inset bg-success/10 border-success/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-success" />
              <div className="flex-1">
                <h4 className="mb-1 text-success">Success</h4>
                <div className="text-body-small text-success/90">
                  Your changes have been saved successfully.
                </div>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="rounded-xl p-4 border shadow-neu-inset bg-warning/10 border-warning/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-warning" />
              <div className="flex-1">
                <h4 className="mb-1 text-warning">Warning</h4>
                <div className="text-body-small text-warning/90">
                  This action cannot be undone. Please proceed with caution.
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="rounded-xl p-4 border shadow-neu-inset bg-info/10 border-info/30">
            <div className="flex items-start gap-3">
              <Circle className="h-5 w-5 flex-shrink-0 mt-0.5 text-info" />
              <div className="flex-1">
                <h4 className="mb-1 text-info">Information</h4>
                <div className="text-body-small text-info/90">
                  New features are now available. Check out the latest updates.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Code Example */}
        <div className="bg-background/50 p-4 rounded-xl border border-border/30">
          <p className="text-caption text-muted-foreground font-mono mb-2">Usage:</p>
          <pre className="text-caption text-foreground font-mono overflow-x-auto">
{`<div className="rounded-xl p-4 border bg-background shadow-neu-inset bg-destructive/10 border-destructive/30">
  <div className="flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-destructive" />
    <div>
      <h4 className="text-destructive">Error</h4>
      <p className="text-body-small text-destructive/90">Error message</p>
    </div>
  </div>
</div>`}
          </pre>
        </div>
      </div>

      {/* Reserved Space */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-heading-4 text-muted-foreground">More Card Styles (Reserved)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-small text-muted-foreground">Space reserved for hover effects, interactive cards, and custom variants.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// SPACING TAB
// ========================================
function SpacingTab() {
  const spacing = [
    { name: 'space-1', value: '4px', usage: 'Tight spacing between related items' },
    { name: 'space-2', value: '8px', usage: 'Default gap between elements' },
    { name: 'space-3', value: '12px', usage: 'Medium gap' },
    { name: 'space-4', value: '16px', usage: 'Standard padding, margins' },
    { name: 'space-6', value: '24px', usage: 'Card padding, section spacing' },
    { name: 'space-8', value: '32px', usage: 'Large section spacing' },
    { name: 'space-12', value: '48px', usage: 'Major section breaks' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-heading-3 mb-2">Spacing Scale</h2>
        <p className="text-body-small text-muted-foreground">Consistent spacing using Tailwind default scale</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-heading-4">Spacing Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spacing.map((s) => (
              <div key={s.name} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-24 font-mono text-label">{s.name}</div>
                <div className="bg-primary rounded" style={{ width: s.value, height: '24px' }}></div>
                <div className="flex-1">
                  <div className="text-body-small font-mono">{s.value}</div>
                  <div className="text-caption text-muted-foreground">{s.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-heading-4">Common Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 space-y-2">
            <div className="text-body-small">Card Padding</div>
            <div className="text-caption text-muted-foreground font-mono">p-4 or p-6 (CardContent default)</div>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <div className="text-body-small">Section Spacing</div>
            <div className="text-caption text-muted-foreground font-mono">py-12 or py-16 for major sections</div>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <div className="text-body-small">Button Spacing</div>
            <div className="text-caption text-muted-foreground font-mono">gap-2 or gap-4 between buttons</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
