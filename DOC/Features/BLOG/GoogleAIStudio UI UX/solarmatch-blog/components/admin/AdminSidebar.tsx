
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Sun,
  ExternalLink,
  Zap,
  Image,
  MessageSquare,
  X,
  BarChart3,
  Users
} from 'lucide-react';

interface AdminSidebarProps {
  currentRoute: string;
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentRoute, isOpen, onClose }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  const menuItems = [
    { label: 'Overview', icon: BarChart3, route: '#/admin/overview' },
    { label: 'Blog Manager', icon: LayoutDashboard, route: '#/admin/blog' },
    { label: 'Media Library', icon: Image, route: '#/admin/blog/media' },
    { label: 'Engine Hub', icon: Zap, route: '#/admin/blog/engine' },
  ];

  const handleNavigation = (route: string) => {
    window.location.hash = route;
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setLogoutMessage('Logged out (demo)');
    // Simulate cleanup and redirect
    setTimeout(() => {
      window.location.hash = ''; // Redirect to public home
    }, 800);
  };

  const isActive = (itemRoute: string) => {
    // Overview Logic
    if (itemRoute === '#/admin/overview') {
      return currentRoute === '#/admin' || currentRoute === '#/admin/overview';
    }
    
    // Exact match for Blog Manager base route to avoid it staying active for sub-routes that are distinct features
    if (itemRoute === '#/admin/blog') {
       // Blog Manager now handles posts, categories, tags, comments, and authors
       return currentRoute === '#/admin/blog' || 
              currentRoute.startsWith('#/admin/blog/new') || 
              (currentRoute.startsWith('#/admin/blog/') && !['media', 'engine'].some(p => currentRoute.includes(p)));
    }
    return currentRoute.startsWith(itemRoute);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-40 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <Sun className="w-6 h-6 text-solar-500" />
            <span>SolarMatch</span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Management
          </div>
          {menuItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNavigation(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.route)
                  ? 'bg-solar-600 text-white shadow-sm'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}

          <div className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            System
          </div>
          <button
            disabled
            aria-disabled="true"
            title="Not in scope"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed opacity-70"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
           <button
            onClick={() => {
              window.location.hash = '';
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            View Site
          </button>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-solar-500 flex items-center justify-center text-white font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@solarmatch.com</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors relative"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className={`w-5 h-5 ${isLoggingOut ? 'text-red-400 animate-pulse' : ''}`} />
              {isLoggingOut && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                  {logoutMessage || 'Logging out...'}
                </div>
              )}
            </button>
          </div>

          {logoutMessage && (
            <div className="mt-3 text-xs text-green-200 bg-green-900/20 border border-green-900/40 rounded-md px-3 py-2">
              {logoutMessage}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
