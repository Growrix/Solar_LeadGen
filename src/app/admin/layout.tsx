"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminMobileSidebarMenu from '@/components/AdminMobileSidebarMenu';
import AdminBottomNavBar from '@/components/AdminBottomNavBar';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	
	// If on login page (/admin root), don't show sidebar/header - just return children
	if (pathname === '/admin') {
		return <>{children}</>;
	}
	
	// Determine active page based on pathname
	const getActivePage = () => {
		if (pathname.includes('/leads')) return 'Leads';
		if (pathname.includes('/homeowners')) return 'Homeowners';
		if (pathname.includes('/installers')) return 'Installers';
		if (pathname.includes('/newsletter')) return 'Newsletter';
		if (pathname.includes('/instant-quotes')) return 'Instant Quotes';
		if (pathname.includes('/analytics')) return 'Analytics';
		if (pathname.includes('/users')) return 'User Management';
		if (pathname.includes('/content')) return 'Content Management';
		if (pathname.includes('/theme')) return 'Theme Settings';
		if (pathname.includes('/settings')) return 'Global Settings';
		return 'Dashboard';
	};
	
	const activePage = getActivePage();
	
	// Get page title for header
	const getPageTitle = () => {
		if (pathname.includes('/leads')) return 'Lead Management';
		if (pathname.includes('/homeowners')) return 'Homeowners';
		if (pathname.includes('/installers')) return 'Installer Management';
		if (pathname.includes('/newsletter')) return 'Newsletter Subscribers';
		if (pathname.includes('/instant-quotes')) return 'Guest Instant Quotes';
		return 'Dashboard';
	};
	
	return (
	<div className="flex min-h-screen bg-transparent">
			{/* Desktop Sidebar - Always visible on desktop */}
			<div className="hidden md:block">
				<AdminSidebar activePage={activePage} />
			</div>
			
			{/* Mobile Sidebar Menu */}
			<div className="md:hidden">
				<AdminMobileSidebarMenu
					isOpen={isMobileMenuOpen}
					onClose={() => setIsMobileMenuOpen(false)}
					activePage={activePage}
					setActivePage={() => {}}
					onLogoutClick={() => {}}
				/>
			</div>
			
			{/* Main content area */}
			<div className="flex-1 flex flex-col">
				{/* Header for all pages */}
				<AdminHeader />
				
				<main className="flex-1 overflow-auto">
					{children}
				</main>
				
				{/* Mobile Bottom Navigation */}
				<div className="md:hidden">
					<AdminBottomNavBar
						activePage={activePage}
						setActivePage={() => {}}
						onMenuClick={() => setIsMobileMenuOpen(true)}
						onThemeClick={() => {}}
					/>
				</div>
			</div>
		</div>
	);
}
