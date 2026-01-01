
import React, { useState } from 'react';
import { 
  User, 
  Brain, 
  Bell, 
  Globe, 
  Shield, 
  Mail, 
  Save,
  ChevronRight,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';

const SettingSection: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  children: React.ReactNode 
}> = ({ title, description, icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
    <div className="p-6 border-b border-slate-50 flex items-start gap-4">
      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
);

const SettingRow: React.FC<{ 
  label: string; 
  description?: string; 
  children: React.ReactNode 
}> = ({ label, description, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-0.5">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    <div className="flex-shrink-0">
      {children}
    </div>
  </div>
);

const SettingsPage: React.FC = () => {
  const [tone, setTone] = useState('Journalistic');
  const [model, setModel] = useState('Gemini 3 Pro');

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Account Settings */}
      <SettingSection 
        title="Profile & Account" 
        description="Manage your admin profile and personal preferences."
        icon={<User size={20} />}
      >
        <SettingRow label="Full Name">
          <input 
            type="text" 
            defaultValue="John Doe" 
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </SettingRow>
        <SettingRow label="Email Address">
          <input 
            type="email" 
            defaultValue="john.doe@newsengine.ai" 
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </SettingRow>
        <SettingRow label="Interface Theme">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm rounded-md text-xs font-bold text-slate-900">
              <Sun size={14} /> Light
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 rounded-md text-xs font-medium hover:text-slate-700">
              <Moon size={14} /> Dark
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 rounded-md text-xs font-medium hover:text-slate-700">
              <Monitor size={14} /> System
            </button>
          </div>
        </SettingRow>
      </SettingSection>

      {/* AI Personalization */}
      <SettingSection 
        title="AI Engine Configuration" 
        description="Customize how the AI researches and writes stories."
        icon={<Brain size={20} />}
      >
        <SettingRow 
          label="Writing Tone" 
          description="The default personality for generated drafts."
        >
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option>Journalistic</option>
            <option>Professional</option>
            <option>Casual & Engaging</option>
            <option>Technical</option>
            <option>Creative Narrative</option>
          </select>
        </SettingRow>
        <SettingRow 
          label="Default Research Model" 
          description="Higher models provide better accuracy but more latency."
        >
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option>Gemini 3 Pro</option>
            <option>Gemini 3 Flash</option>
            <option>GPT-4o</option>
          </select>
        </SettingRow>
        <SettingRow label="Content Fact-Checking">
          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-indigo-600">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
          </button>
        </SettingRow>
      </SettingSection>

      {/* Notifications */}
      <SettingSection 
        title="Notifications" 
        description="Stay updated on system health and new story drafts."
        icon={<Bell size={20} />}
      >
        <SettingRow label="Email Alerts" description="Receive high-priority system alerts.">
          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-indigo-600">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
          </button>
        </SettingRow>
        <SettingRow label="Weekly Digest" description="Summary of news volume and relevance scores.">
          <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-slate-200">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
          </button>
        </SettingRow>
      </SettingSection>

      {/* Security */}
      <SettingSection 
        title="Security & API" 
        description="Manage access and integration points."
        icon={<Shield size={20} />}
      >
        <SettingRow label="Two-Factor Authentication">
          <button className="text-indigo-600 text-sm font-bold hover:underline">Enable 2FA</button>
        </SettingRow>
        <SettingRow label="Engine API Key" description="Used for external automation integrations.">
          <div className="flex items-center gap-2">
            <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">ne_live_••••••••••••</code>
            <button className="text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors">Regenerate</button>
          </div>
        </SettingRow>
      </SettingSection>

      {/* Footer Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          Reset to Defaults
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98]">
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
