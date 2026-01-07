
import React, { ReactNode, useState } from 'react';
import { Menu, Sun } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
  currentRoute: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentRoute }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar 
        currentRoute={currentRoute} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
         <div className="flex items-center gap-2 font-bold text-lg">
           <Sun className="w-6 h-6 text-solar-500" /> 
           SolarMatch
         </div>
         <button 
           onClick={() => setIsMobileMenuOpen(true)}
           className="p-2 -mr-2 text-slate-300 hover:text-white transition-colors"
         >
           <Menu className="w-6 h-6" />
         </button>
      </div>

      {/* Content Area - Offset by Sidebar width on desktop */}
      <div className="md:ml-64 min-h-screen transition-all">
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
