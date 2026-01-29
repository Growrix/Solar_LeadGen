
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCw, 
  Rss, 
  ExternalLink, 
  AlertCircle, 
  Loader2, 
  X,
  Bot,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import SkeletonAdminTable from './SkeletonAdminTable';
import ConfirmationModal from './ConfirmationModal';

type SourceType = 'rss' | 'scraper' | 'manual';

interface SourceItem {
  id: string;
  name: string;
  type: SourceType;
  url?: string;
  description?: string;
  category: string;
  enabled: boolean;
  lastChecked: string;
  itemsFound: number;
}

// Mock Data
const MOCK_SOURCES: SourceItem[] = [
  { 
    id: '1', 
    name: 'CleanTechnica', 
    type: 'rss',
    url: 'https://cleantechnica.com/feed/', 
    category: 'Industry News', 
    enabled: true, 
    lastChecked: '10 mins ago', 
    itemsFound: 124 
  },
  { 
    id: '2', 
    name: 'Competitor Site Pricing', 
    type: 'scraper',
    url: 'https://competitorsolar.com/pricing',
    category: 'Competitor', 
    enabled: true, 
    lastChecked: '45 mins ago', 
    itemsFound: 5 
  },
  { 
    id: '3', 
    name: 'Internal Compliance Memos', 
    type: 'manual',
    description: 'Upload PDF memos from legal team weekly.',
    category: 'Policy', 
    enabled: false, 
    lastChecked: '1 day ago', 
    itemsFound: 12 
  },
  { 
    id: '4', 
    name: 'SEIA News', 
    type: 'rss',
    url: 'https://www.seia.org/rss/news', 
    category: 'Industry News', 
    enabled: true, 
    lastChecked: '2 hours ago', 
    itemsFound: 45 
  },
];

const EngineSources: React.FC = () => {
  const [viewState, setViewState] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<SourceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // New/Edit Source Form State
  const [formData, setFormData] = useState<{
    name: string;
    type: SourceType;
    url: string;
    description: string;
    category: string;
  }>({
    name: '',
    type: 'rss',
    url: '',
    description: '',
    category: 'Industry News'
  });

  // Fetch Data Simulation
  useEffect(() => {
    const fetchData = () => {
      setViewState('loading');
      setTimeout(() => {
        setSources(MOCK_SOURCES);
        setViewState('success');
      }, 800);
    };
    fetchData();
  }, []);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleToggle = (id: string) => {
    const updatedSources = sources.map(s => {
      if (s.id === id) {
        const newEnabled = !s.enabled;
        setNotification({ 
          message: `Source "${s.name}" ${newEnabled ? 'enabled' : 'disabled'}.`, 
          type: 'success' 
        });
        return { ...s, enabled: newEnabled };
      }
      return s;
    });
    setSources(updatedSources);
  };

  const handleDelete = (id: string) => {
    const source = sources.find(s => s.id === id);
    if (source) {
      setSourceToDelete(source);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!sourceToDelete) return;
    
    setIsDeleting(true);
    // Simulate API call
    setTimeout(() => {
      setSources(sources.filter(s => s.id !== sourceToDelete.id));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSourceToDelete(null);
      setNotification({ message: 'Source removed successfully.', type: 'success' });
    }, 1000);
  };

  const handleEdit = (source: SourceItem) => {
    setFormData({
      name: source.name,
      type: source.type,
      url: source.url || '',
      description: source.description || '',
      category: source.category
    });
    setEditingId(source.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', type: 'rss', url: '', description: '', category: 'Industry News' });
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (editingId) {
        // Edit Mode
        setSources(prev => prev.map(s => s.id === editingId ? {
          ...s,
          name: formData.name,
          type: formData.type,
          url: formData.type !== 'manual' ? formData.url : undefined,
          description: formData.type === 'manual' ? formData.description : undefined,
          category: formData.category
        } : s));
        setNotification({ message: 'Source updated successfully.', type: 'success' });
      } else {
        // Create Mode
        const newSource: SourceItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          type: formData.type,
          url: formData.type !== 'manual' ? formData.url : undefined,
          description: formData.type === 'manual' ? formData.description : undefined,
          category: formData.category,
          enabled: true,
          lastChecked: 'Just now',
          itemsFound: 0
        };
        setSources(prev => [newSource, ...prev]);
        setNotification({ message: 'Source added successfully.', type: 'success' });
      }
      
      setIsSubmitting(false);
      handleCloseModal();
      setViewState('success'); // Ensure we switch from empty if it was empty
    }, 1000);
  };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'rss': return <Rss className="w-4 h-4" />;
      case 'scraper': return <Bot className="w-4 h-4" />;
      case 'manual': return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (type: SourceType) => {
    switch (type) {
      case 'rss': return 'RSS Feed';
      case 'scraper': return 'Web Scraper';
      case 'manual': return 'Manual Input';
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Remove source?"
        message="Are you sure you want to remove this source? The engine will stop monitoring it for new topics."
        confirmLabel="Remove Source"
        isDestructive={true}
      />

      {/* Add/Edit Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {getSourceIcon(formData.type)}
                {editingId ? 'Edit Source' : 'Add Source'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSource} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. TechCrunch Solar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['rss', 'scraper', 'manual'] as SourceType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, type})}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                        formData.type === type 
                          ? 'border-solar-500 bg-solar-50 text-solar-700 ring-1 ring-solar-500' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {getSourceIcon(type)}
                      {getSourceLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type !== 'manual' ? (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {formData.type === 'rss' ? 'RSS Feed URL' : 'Target Website URL'}
                  </label>
                  <div className="relative">
                     <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                      required
                      type="url" 
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none text-sm font-mono"
                    />
                  </div>
                  {formData.type === 'scraper' && (
                    <p className="text-xs text-slate-500 mt-1">The engine will periodically crawl this URL for updates.</p>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Context / Instructions</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe what kind of manual input this source represents (e.g. 'Upload quarterly PDFs')..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:outline-none text-sm bg-white"
                >
                  <option value="Industry News">Industry News</option>
                  <option value="Technology">Technology</option>
                  <option value="Policy">Policy</option>
                  <option value="Competitor">Competitor</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-solar-600 rounded-lg text-sm font-medium hover:bg-solar-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Add Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Research Sources</h2>
          <p className="text-sm text-slate-500">Manage ingestion channels used by the engine to discover topics.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', type: 'rss', url: '', description: '', category: 'Industry News' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-solar-600 text-white text-sm font-medium rounded-lg hover:bg-solar-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Content */}
      {viewState === 'loading' && <SkeletonAdminTable />}

      {viewState === 'error' && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load sources</h3>
          <button onClick={() => window.location.reload()} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {viewState === 'success' && sources.length === 0 && (
         <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
           <div className="bg-slate-50 p-4 rounded-full mb-4">
             <Rss className="w-6 h-6 text-slate-400" />
           </div>
           <h3 className="text-lg font-medium text-slate-900">No sources configured</h3>
           <p className="text-slate-500 mt-1 mb-6 max-w-sm">Add data sources to help the automation engine discover relevant content topics.</p>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
           >
             <Plus className="w-4 h-4" /> Add Your First Source
           </button>
         </div>
      )}

      {viewState === 'success' && sources.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Source Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sources.map((source) => (
                  <tr key={source.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded text-slate-500 ${
                          source.type === 'rss' ? 'bg-orange-50 text-orange-600' :
                          source.type === 'scraper' ? 'bg-purple-50 text-purple-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                           {getSourceIcon(source.type)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 block">{source.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide">{getSourceLabel(source.type)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {source.type !== 'manual' ? (
                        <a href={source.url} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-solar-600 flex items-center gap-1 max-w-[200px] truncate" title={source.url}>
                          {source.url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <p className="text-sm text-slate-500 truncate max-w-[200px]" title={source.description}>
                          {source.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                         {source.category}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggle(source.id)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-solar-500 focus:ring-offset-2 ${source.enabled ? 'bg-green-500' : 'bg-slate-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${source.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-slate-500">{source.lastChecked}</div>
                       <div className="text-xs text-slate-400 mt-0.5">{source.itemsFound} items found</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleEdit(source)}
                           className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                           title="Edit"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleDelete(source.id)} 
                           className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                           title="Remove"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineSources;
