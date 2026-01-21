
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2,
  Loader2,
  Calendar,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';

interface TimeWindow {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

const EngineLogic: React.FC = () => {
  // Simulation States
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>('Just now');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Configuration State
  const [config, setConfig] = useState({
    autoDraft: true,
    autoSchedule: false,
    autoPublish: false,
    maxDailyDrafts: 15,
    maxDailyPosts: 5,
    minConfidenceScore: 85,
    requireImages: true,
    requireMeta: true,
    requireTags: false,
    enforceWordCount: true,
    minWordCount: 500,
    // Image Gen Settings
    autoGenerateImages: true,
    imageStyle: 'photorealistic',
    maxDailyImages: 10,
    requireImageReview: true,
  });

  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([
    { id: '1', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '17:00' },
  ]);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Simulate Auto-Save on change
  const handleConfigChange = (key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    triggerSave();
  };

  const triggerSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      const now = new Date();
      setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 800);
  };

  const addTimeWindow = () => {
    const newWindow: TimeWindow = {
      id: Math.random().toString(36).substr(2, 9),
      days: ['Mon', 'Fri'],
      startTime: '09:00',
      endTime: '12:00'
    };
    setTimeWindows([...timeWindows, newWindow]);
    setNotification({ message: 'New publishing window added.', type: 'success' });
    triggerSave();
  };

  const removeTimeWindow = (id: string) => {
    setTimeWindows(timeWindows.filter(t => t.id !== id));
    setNotification({ message: 'Publishing window removed.', type: 'success' });
    triggerSave();
  };

  // Helper Components
  const Toggle = ({ 
    label, 
    description, 
    checked, 
    onChange 
  }: { 
    label: string; 
    description: string; 
    checked: boolean; 
    onChange: (val: boolean) => void 
  }) => (
    <div className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="pr-4">
        <h4 className="text-sm font-medium text-slate-900">{label}</h4>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-solar-500 focus:ring-offset-2 ${checked ? 'bg-solar-600' : 'bg-slate-200'}`}
      >
        <span 
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} 
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Automation Logic</h2>
          <p className="text-sm text-slate-500">Configure how the engine generates, schedules, and publishes content.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-500">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-solar-500" />
              Saving changes...
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 text-green-500" />
              Saved {lastSaved && `at ${lastSaved}`}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Core Toggles & Time */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Zap className="w-4 h-4 text-solar-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Core Automation</h3>
            </div>
            <div className="p-4">
              <Toggle 
                label="Auto-Draft Creation" 
                description="Engine will automatically generate drafts based on trending topics."
                checked={config.autoDraft}
                onChange={(val) => handleConfigChange('autoDraft', val)}
              />
              <Toggle 
                label="Auto-Schedule" 
                description="Drafts passing confidence checks are automatically added to calendar."
                checked={config.autoSchedule}
                onChange={(val) => handleConfigChange('autoSchedule', val)}
              />
              <Toggle 
                label="Auto-Publish" 
                description="Allow the system to publish content without manual approval."
                checked={config.autoPublish}
                onChange={(val) => handleConfigChange('autoPublish', val)}
              />
            </div>
            {config.autoPublish && (
               <div className="bg-amber-50 px-4 py-3 border-t border-amber-100 flex gap-2">
                 <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                 <p className="text-xs text-amber-800 leading-relaxed">
                   <strong>Caution:</strong> Auto-publish is enabled. Content will go live immediately when scheduled times are reached.
                 </p>
               </div>
            )}
          </div>

          {/* AI Image Generation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-pink-600" />
              <h3 className="font-semibold text-slate-900 text-sm">AI Image Generation</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-900">Auto-Generate Images</label>
                  <p className="text-xs text-slate-500">Create cover art for new drafts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={config.autoGenerateImages}
                    onChange={(e) => handleConfigChange('autoGenerateImages', e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              {config.autoGenerateImages && (
                <div className="pt-2 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Art Style</label>
                    <select 
                      value={config.imageStyle}
                      onChange={(e) => handleConfigChange('imageStyle', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                    >
                      <option value="photorealistic">Photorealistic</option>
                      <option value="minimalist">Minimalist Vector</option>
                      <option value="abstract">Abstract Tech</option>
                      <option value="illustration">Digital Illustration</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Max Images / Day</label>
                      <input 
                        type="number" 
                        value={config.maxDailyImages}
                        onChange={(e) => handleConfigChange('maxDailyImages', parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-end">
                      <label className="text-xs font-medium text-slate-700 mb-1">Require Review</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={config.requireImageReview}
                          onChange={(e) => handleConfigChange('requireImageReview', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publishing Windows */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Publishing Windows</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">UTC</span>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {timeWindows.map((window) => (
                  <div key={window.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <span 
                            key={day}
                            className={`text-[9px] px-1 py-0.5 rounded ${
                              window.days.includes(day) 
                                ? 'bg-blue-600 text-white font-semibold' 
                                : 'text-slate-300 bg-white border border-slate-100'
                            }`}
                          >
                            {day.charAt(0)}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => removeTimeWindow(window.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-100 w-fit">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {window.startTime} - {window.endTime}
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addTimeWindow}
                  className="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-solar-600 hover:border-solar-300 hover:bg-solar-50 transition-all text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Time Window
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Operational Rules */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Operational Rules & Safeguards</h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
               
               {/* Throughput Limits */}
               <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-3 h-3" /> Throughput Limits
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Drafts Per Day</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={config.maxDailyDrafts}
                        onChange={(e) => handleConfigChange('maxDailyDrafts', parseInt(e.target.value))}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <span className="text-xs text-slate-500">Limits AI generation costs</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Published Posts Per Day</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={config.maxDailyPosts}
                        onChange={(e) => handleConfigChange('maxDailyPosts', parseInt(e.target.value))}
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <span className="text-xs text-slate-500">Prevents audience fatigue</span>
                    </div>
                  </div>
               </div>

               {/* Quality Standards */}
               <div className="space-y-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" /> Quality Standards
                  </h4>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-slate-700">Min. Confidence Score</label>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.minConfidenceScore > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{config.minConfidenceScore}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={config.minConfidenceScore}
                      onChange={(e) => handleConfigChange('minConfidenceScore', parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <p className="text-xs text-slate-500 mt-1">AI content below this score is flagged for review.</p>
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="block text-sm font-medium text-slate-700">Minimum Word Count</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={config.enforceWordCount}
                          onChange={(e) => handleConfigChange('enforceWordCount', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </div>
                    </label>
                    <input 
                      type="number" 
                      disabled={!config.enforceWordCount}
                      value={config.minWordCount}
                      onChange={(e) => handleConfigChange('minWordCount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
               </div>

               {/* Blocking Rules (Full Width) */}
               <div className="md:col-span-2 pt-6 border-t border-slate-100">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Shield className="w-3 h-3" /> Pre-Publish Blocking Rules
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${config.requireImages ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                     <div className="relative flex items-center">
                       <input 
                          type="checkbox"
                          checked={config.requireImages}
                          onChange={(e) => handleConfigChange('requireImages', e.target.checked)} 
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                       />
                     </div>
                     <div>
                        <span className="text-sm text-slate-900 font-medium">Require Cover Image</span>
                        <p className="text-xs text-slate-500">Prevent posts without visuals.</p>
                     </div>
                   </label>

                   <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${config.requireMeta ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                     <div className="relative flex items-center">
                       <input 
                          type="checkbox"
                          checked={config.requireMeta}
                          onChange={(e) => handleConfigChange('requireMeta', e.target.checked)} 
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                       />
                     </div>
                     <div>
                        <span className="text-sm text-slate-900 font-medium">Require Meta Data</span>
                        <p className="text-xs text-slate-500">Ensure SEO description exists.</p>
                     </div>
                   </label>

                   <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${config.requireTags ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                     <div className="relative flex items-center">
                       <input 
                          type="checkbox"
                          checked={config.requireTags}
                          onChange={(e) => handleConfigChange('requireTags', e.target.checked)} 
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                       />
                     </div>
                     <div>
                        <span className="text-sm text-slate-900 font-medium">Require Tags</span>
                        <p className="text-xs text-slate-500">At least one tag required.</p>
                     </div>
                   </label>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EngineLogic;
