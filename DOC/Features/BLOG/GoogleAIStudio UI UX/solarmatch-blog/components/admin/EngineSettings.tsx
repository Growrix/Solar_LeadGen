
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Zap, 
  Clock, 
  Shield, 
  Database,
  Loader2,
  AlertCircle,
  Bot,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Key,
  GitBranch
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import ModelProfileModal, { ModelProfileData } from './ModelProfileModal';
import CredentialModal from './CredentialModal';

const MOCK_PROFILES: ModelProfileData[] = [
  { id: '1', name: 'Gemini 1.5 Pro', provider: 'Google (Vertex AI)', description: 'High reasoning capabilities for complex drafts.', enabled: true },
  { id: '2', name: 'GPT-4o', provider: 'OpenAI', description: 'General purpose fast generation.', enabled: true },
  { id: '3', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Excellent nuance and tone matching.', enabled: false },
];

interface CredentialItem {
  id: string;
  label: string;
  provider: string;
  lastUsed: string;
  enabled: boolean;
  maskedKey: string;
}

const MOCK_CREDENTIALS: CredentialItem[] = [
  { id: 'c1', label: 'Primary Google Key', provider: 'Google (Vertex AI)', lastUsed: '5 mins ago', enabled: true, maskedKey: '...8f2a' },
  { id: 'c2', label: 'Backup OpenAI', provider: 'OpenAI', lastUsed: '2 days ago', enabled: true, maskedKey: '...k92l' },
];

const EngineSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Model Profile State
  const [profiles, setProfiles] = useState<ModelProfileData[]>(MOCK_PROFILES);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ModelProfileData | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Delete Profile State
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [isDeleteProfileModalOpen, setIsDeleteProfileModalOpen] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  // Routing Rules State
  const [routingRules, setRoutingRules] = useState({
    draft: '1',
    review: '2',
    seo: '2'
  });

  // Credential State
  const [credentials, setCredentials] = useState<CredentialItem[]>(MOCK_CREDENTIALS);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isSavingCredential, setIsSavingCredential] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [isDeleteCredentialModalOpen, setIsDeleteCredentialModalOpen] = useState(false);
  const [isDeletingCredential, setIsDeletingCredential] = useState(false);

  // Form State
  const [settings, setSettings] = useState({
    defaultPaused: false,
    draftGenEnabled: true,
    draftGenFrequency: 'daily',
    autoAssignReview: true,
    minConfidence: 85,
    sourceRefreshRate: '1hour'
  });

  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage('Settings saved successfully (UI-only).');
    }, 1000);
  };

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    setSettings({
      defaultPaused: false,
      draftGenEnabled: true,
      draftGenFrequency: 'daily',
      autoAssignReview: true,
      minConfidence: 85,
      sourceRefreshRate: '1hour'
    });
    setProfiles(MOCK_PROFILES);
    setRoutingRules({ draft: '1', review: '2', seo: '2' });
    setCredentials(MOCK_CREDENTIALS);
    setIsResetModalOpen(false);
    setToastMessage('Settings reset to defaults.');
  };

  // Model Profile Handlers
  const handleAddModel = () => {
    setEditingProfile(null);
    setIsModelModalOpen(true);
  };

  const handleEditModel = (profile: ModelProfileData) => {
    setEditingProfile(profile);
    setIsModelModalOpen(true);
  };

  const handleDeleteModel = (id: string) => {
    setProfileToDelete(id);
    setIsDeleteProfileModalOpen(true);
  };

  const handleToggleModel = (id: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    setToastMessage('Profile status updated.');
  };

  const confirmDeleteModel = () => {
    if (!profileToDelete) return;
    setIsDeletingProfile(true);
    setTimeout(() => {
      setProfiles(prev => prev.filter(p => p.id !== profileToDelete));
      
      // Reset routing if deleted model was selected
      if (Object.values(routingRules).includes(profileToDelete)) {
         // Naive reset to first available or empty
         const firstAvailable = profiles.find(p => p.id !== profileToDelete && p.enabled)?.id || '';
         setRoutingRules(prev => ({
           draft: prev.draft === profileToDelete ? firstAvailable : prev.draft,
           review: prev.review === profileToDelete ? firstAvailable : prev.review,
           seo: prev.seo === profileToDelete ? firstAvailable : prev.seo,
         }));
      }

      setIsDeletingProfile(false);
      setIsDeleteProfileModalOpen(false);
      setProfileToDelete(null);
      setToastMessage('Model profile deleted.');
    }, 500);
  };

  const saveModelProfile = (data: Omit<ModelProfileData, 'id'>) => {
    setIsSavingProfile(true);
    setTimeout(() => {
      if (editingProfile) {
        setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...p, ...data } : p));
        setToastMessage('Model profile updated.');
      } else {
        const newProfile = { ...data, id: Math.random().toString(36).substr(2, 9) };
        setProfiles(prev => [...prev, newProfile]);
        setToastMessage('New model profile added.');
      }
      setIsSavingProfile(false);
      setIsModelModalOpen(false);
    }, 800);
  };

  // Credential Handlers
  const handleAddCredential = () => {
    setIsCredentialModalOpen(true);
  };

  const saveCredential = (data: { label: string; provider: string; apiKey: string }) => {
    setIsSavingCredential(true);
    setTimeout(() => {
      const newCredential = {
        id: Math.random().toString(36).substr(2, 9),
        label: data.label,
        provider: data.provider,
        lastUsed: 'Never',
        enabled: true,
        maskedKey: '...' + data.apiKey.slice(-4)
      };
      setCredentials(prev => [...prev, newCredential]);
      setIsSavingCredential(false);
      setIsCredentialModalOpen(false);
      setToastMessage('API credential added to pool.');
    }, 800);
  };

  const handleToggleCredential = (id: string) => {
    setCredentials(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    setToastMessage('Credential status updated.');
  };

  const handleDeleteCredential = (id: string) => {
    setCredentialToDelete(id);
    setIsDeleteCredentialModalOpen(true);
  };

  const confirmDeleteCredential = () => {
    if (!credentialToDelete) return;
    setIsDeletingCredential(true);
    setTimeout(() => {
      setCredentials(prev => prev.filter(c => c.id !== credentialToDelete));
      setIsDeletingCredential(false);
      setIsDeleteCredentialModalOpen(false);
      setCredentialToDelete(null);
      setToastMessage('Credential removed from pool.');
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
           <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">{toastMessage}</span>
           </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        title="Reset to defaults?"
        message="Are you sure you want to discard all unsaved changes and restore the default engine configuration?"
        confirmLabel="Reset Settings"
        isDestructive={true}
      />

      {/* Delete Profile Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteProfileModalOpen}
        onClose={() => setIsDeleteProfileModalOpen(false)}
        onConfirm={confirmDeleteModel}
        isLoading={isDeletingProfile}
        title="Delete Model Profile?"
        message="This action cannot be undone. Any workflows relying on this model may fail."
        confirmLabel="Delete Profile"
        isDestructive={true}
      />

      {/* Delete Credential Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteCredentialModalOpen}
        onClose={() => setIsDeleteCredentialModalOpen(false)}
        onConfirm={confirmDeleteCredential}
        isLoading={isDeletingCredential}
        title="Delete API Credential?"
        message="Are you sure you want to remove this key? Any models relying on it will stop working immediately."
        confirmLabel="Delete Key"
        isDestructive={true}
      />

      {/* Model Profile Edit Modal */}
      <ModelProfileModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onSave={saveModelProfile}
        initialData={editingProfile}
        isLoading={isSavingProfile}
      />

      {/* Credential Modal */}
      <CredentialModal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        onSave={saveCredential}
        isLoading={isSavingCredential}
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Engine Configuration</h2>
          <p className="text-sm text-slate-500">Global defaults for the content automation engine.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleResetClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-white bg-solar-600 hover:bg-solar-700 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Automation Controls */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Zap className="w-5 h-5 text-solar-600" />
            <h3 className="font-semibold text-slate-900">Automation Controls</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-900">Start in Paused State</label>
                <p className="text-xs text-slate-500 max-w-md">If enabled, the engine will require manual activation after system restarts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.defaultPaused}
                  onChange={(e) => handleChange('defaultPaused', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-solar-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solar-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Section 2: Draft Generation */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Draft Generation</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <label className="text-sm font-medium text-slate-900">Enable Auto-Drafting</label>
                <p className="text-xs text-slate-500">Allow the engine to proactively create drafts from sources.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.draftGenEnabled}
                  onChange={(e) => handleChange('draftGenEnabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Generation Frequency</label>
                <select 
                  value={settings.draftGenFrequency}
                  onChange={(e) => handleChange('draftGenFrequency', e.target.value)}
                  disabled={!settings.draftGenEnabled}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="hourly">Hourly (High Volume)</option>
                  <option value="daily">Daily (Recommended)</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">How often the engine attempts to synthesize new topics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: AI Model Profiles */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">AI Model Profiles</h3>
            </div>
            <button 
              onClick={handleAddModel}
              className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-md hover:bg-indigo-100 transition-colors font-medium border border-indigo-100"
            >
              <Plus className="w-3.5 h-3.5" /> Add Profile
            </button>
          </div>
          <div className="p-0">
            {profiles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No model profiles configured. Add one to start generating content.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {profiles.map((profile) => (
                  <div key={profile.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-slate-900 text-sm">{profile.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {profile.provider}
                        </span>
                        {!profile.enabled && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{profile.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={profile.enabled}
                          onChange={() => handleToggleModel(profile.id)}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                      
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditModel(profile)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteModel(profile.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Model Routing Rules */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-slate-900">Model Routing</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-6 max-w-2xl">
              Define which AI profile handles specific automation tasks. Disabled profiles are hidden from selection.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Draft Generation */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Draft Generation</label>
                 <div className="relative">
                   <select 
                     value={routingRules.draft}
                     onChange={(e) => setRoutingRules(prev => ({...prev, draft: e.target.value}))}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none bg-white appearance-none"
                   >
                     {profiles.filter(p => p.enabled).map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                     {profiles.filter(p => p.enabled).length === 0 && <option value="">No enabled profiles</option>}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                     <Bot className="w-4 h-4 text-slate-400" />
                   </div>
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Model used for initial content creation.</p>
               </div>
               
               {/* Content Review */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Content Review</label>
                 <div className="relative">
                   <select 
                     value={routingRules.review}
                     onChange={(e) => setRoutingRules(prev => ({...prev, review: e.target.value}))}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none bg-white appearance-none"
                   >
                      {profiles.filter(p => p.enabled).map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                     {profiles.filter(p => p.enabled).length === 0 && <option value="">No enabled profiles</option>}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                     <Shield className="w-4 h-4 text-slate-400" />
                   </div>
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Model used for QA and fact-checking.</p>
               </div>

               {/* SEO Optimization */}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">SEO Optimization</label>
                 <div className="relative">
                   <select 
                     value={routingRules.seo}
                     onChange={(e) => setRoutingRules(prev => ({...prev, seo: e.target.value}))}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none bg-white appearance-none"
                   >
                      {profiles.filter(p => p.enabled).map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                     {profiles.filter(p => p.enabled).length === 0 && <option value="">No enabled profiles</option>}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                     <Zap className="w-4 h-4 text-slate-400" />
                   </div>
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Model used for metadata generation.</p>
               </div>
            </div>
          </div>
        </section>

        {/* Section 5: API Credential Pool */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-slate-900">API Credential Pool</h3>
            </div>
            <button 
              onClick={handleAddCredential}
              className="text-xs flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-md hover:bg-amber-100 transition-colors font-medium border border-amber-100"
            >
              <Plus className="w-3.5 h-3.5" /> Add Credential
            </button>
          </div>
          <div className="p-0">
            {credentials.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No credentials configured. Add API keys to power the models.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {credentials.map((cred) => (
                  <div key={cred.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-slate-900 text-sm">{cred.label}</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {cred.provider}
                        </span>
                        {!cred.enabled && (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                        <span className="bg-slate-100 px-1.5 rounded text-slate-600">{cred.maskedKey}</span>
                        <span className="text-slate-400">•</span>
                        <span>Last used: {cred.lastUsed}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={cred.enabled}
                          onChange={() => handleToggleCredential(cred.id)}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                      
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeleteCredential(cred.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Credential"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 6: Review Queue Rules */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Review Queue Rules</h3>
          </div>
          <div className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Minimum Confidence Threshold</label>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{settings.minConfidence}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="99" 
                    value={settings.minConfidence}
                    onChange={(e) => handleChange('minConfidence', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <p className="text-xs text-slate-500 mt-2">Drafts below this score are automatically flagged for heavy review.</p>
               </div>
               
               <div className="flex items-start justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-900">Auto-Assign Reviewers</label>
                    <p className="text-xs text-slate-500 mt-1">Round-robin assignment to active admins.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.autoAssignReview}
                      onChange={(e) => handleChange('autoAssignReview', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
               </div>
             </div>
          </div>
        </section>

        {/* Section 7: Sources */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-slate-900">Data Sources</h3>
          </div>
          <div className="p-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Source Refresh Rate</label>
                <select 
                  value={settings.sourceRefreshRate}
                  onChange={(e) => handleChange('sourceRefreshRate', e.target.value)}
                  className="w-full md:w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none bg-white"
                >
                  <option value="15min">Every 15 Minutes</option>
                  <option value="30min">Every 30 Minutes</option>
                  <option value="1hour">Every Hour</option>
                  <option value="6hours">Every 6 Hours</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Frequency of polling RSS feeds and external APIs for new topics.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default EngineSettings;
