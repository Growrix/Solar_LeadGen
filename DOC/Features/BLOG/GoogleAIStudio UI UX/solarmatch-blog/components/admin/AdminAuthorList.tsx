
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, CheckCircle, 
  AlertCircle, RefreshCw, Mail, User, Shield, Eye
} from 'lucide-react';
import { AuthorProfile, ViewState } from '../../types';
import { useBlog } from '../../context/BlogContext';
import SkeletonAdminTable from './SkeletonAdminTable';
import ConfirmationModal from './ConfirmationModal';
import ManageAuthorModal from './ManageAuthorModal';
import AuthorPreviewModal from './AuthorPreviewModal';

interface AdminAuthorListProps {
  isTabbed?: boolean;
}

const AdminAuthorList: React.FC<AdminAuthorListProps> = ({ isTabbed = false }) => {
  const { authors, addAuthor, updateAuthor, deleteAuthor } = useBlog();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<AuthorProfile | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewAuthor, setPreviewAuthor] = useState<AuthorProfile | null>(null);
  
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Initial Data Load
  useEffect(() => {
    setViewState('loading');
    setTimeout(() => {
      setViewState('success');
    }, 600);
  }, []);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    author.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    author.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingAuthor(null);
    setIsManageModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const author = authors.find(a => a.id === id);
    if (author) {
      setEditingAuthor(author);
      setIsManageModalOpen(true);
    }
  };

  const handlePreview = (author: AuthorProfile) => {
    setPreviewAuthor(author);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAuthorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!authorToDelete) return;
    setIsDeleting(true);
    setTimeout(() => {
      deleteAuthor(authorToDelete);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setAuthorToDelete(null);
      setNotification({ message: 'Author removed successfully.', type: 'success' });
    }, 600);
  };

  const handleSaveAuthor = (data: Omit<AuthorProfile, 'id' | 'joinedAt'>) => {
    if (editingAuthor) {
      updateAuthor(editingAuthor.id, data);
      setNotification({ message: 'Author updated successfully.', type: 'success' });
    } else {
      const newAuthor: AuthorProfile = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      addAuthor(newAuthor);
      setNotification({ message: 'New author added successfully.', type: 'success' });
    }
    setIsManageModalOpen(false);
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      editor: 'bg-blue-100 text-blue-700 border-blue-200',
      contributor: 'bg-green-100 text-green-700 border-green-200',
      guest: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${styles[role as keyof typeof styles] || styles.guest}`}>
        {role}
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 ${isTabbed ? '' : 'pt-0'}`}>
      {/* Toast */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <CheckCircle className="w-5 h-5 text-green-400" />
             <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ManageAuthorModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onSave={handleSaveAuthor}
        initialData={editingAuthor}
      />

      <AuthorPreviewModal 
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        author={previewAuthor}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Remove Author?"
        message="Are you sure you want to remove this author? This action cannot be undone."
        confirmLabel="Remove"
        isDestructive={true}
      />

      {/* Header - Conditionally Rendered */}
      {!isTabbed && (
        <div className="bg-white border-b border-slate-200 px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Authors & Team</h1>
              <p className="text-slate-500 text-sm mt-1">Manage contributors, editors, and administrators.</p>
            </div>
            <button 
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Author
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`${isTabbed ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-6 py-8 pb-32`}>
        
        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-solar-500 focus:border-solar-500 outline-none transition-all"
              />
           </div>
           
           {isTabbed && (
             <button 
               onClick={handleAddNew}
               className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-solar-600 hover:bg-solar-700 text-white font-medium rounded-lg shadow-sm transition-colors"
             >
               <Plus className="w-4 h-4 mr-2" />
               Add Author
             </button>
           )}
        </div>

        {viewState === 'loading' && <SkeletonAdminTable />}

        {viewState === 'success' && filteredAuthors.length === 0 && (
           <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
             <div className="bg-slate-50 p-4 rounded-full mb-4">
               <User className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900 mb-1">No authors found</h3>
             <p className="text-slate-500 text-sm mb-6">Get started by adding your team members.</p>
             <button 
               onClick={handleAddNew}
               className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
             >
               Add Author
             </button>
           </div>
        )}

        {viewState === 'success' && filteredAuthors.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredAuthors.map((author) => (
                    <tr key={author.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                           <img src={author.avatar} alt={author.name} className="w-9 h-9 rounded-full bg-slate-200 object-cover" />
                           <div>
                             <div className="text-sm font-medium text-slate-900">{author.name}</div>
                             <div className="text-xs text-slate-500">Joined {author.joinedAt}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <RoleBadge role={author.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center text-sm text-slate-600 gap-2">
                           <Mail className="w-3.5 h-3.5 text-slate-400" />
                           {author.email}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                           author.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                         }`}>
                           <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${author.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                           {author.status === 'active' ? 'Active' : 'Inactive'}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handlePreview(author)}
                            className="p-1.5 text-slate-400 hover:text-solar-600 hover:bg-solar-50 rounded transition-colors" 
                            title="Preview Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(author.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(author.id)} 
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
    </div>
  );
};

export default AdminAuthorList;
