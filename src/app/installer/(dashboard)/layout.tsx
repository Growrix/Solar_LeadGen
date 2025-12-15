"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import InstallerSidebar from '@/components/installer/InstallerSidebar';
import InstallerMobileSidebarMenu from '@/components/InstallerMobileSidebarMenu';
import InstallerBottomNavBar from '@/components/InstallerBottomNavBar';
import { InstallerDashboardHeader } from '@/components/installer/InstallerDashboardHeader';

export default function InstallerDashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
	
	// Determine active page based on pathname
	const getActivePage = () => {
		if (pathname.includes('/purchased-leads')) return 'Purchased Leads';
		if (pathname.includes('/leads')) return 'Lead Feed';
		if (pathname.includes('/profile')) return 'Profile';
		return 'Dashboard';
	};
	
	const activePage = getActivePage();
	
	const handleLogout = async () => {
		const { signOut } = await import('next-auth/react');
		await signOut({ redirect: false });
		window.location.href = '/';
	};
	
	const handleHomeClick = () => {
		window.location.href = '/installer';
	};
	
	return (
		<div className="homeowner-dashboard-bg min-h-screen text-foreground animate-fade-in">
			<div className={`transition-colors duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
				{/* Desktop Sidebar - Always visible on desktop */}
				<div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex">
					<InstallerSidebar 
						activePage={activePage}
						onLogoutClick={handleLogout}
						onHomeClick={handleHomeClick}
						isCollapsed={isSidebarCollapsed}
						setIsCollapsed={setIsSidebarCollapsed}
					/>
				</div>
				
				{/* Mobile Sidebar Menu */}
				<div className="md:hidden">
					<InstallerMobileSidebarMenu
						isOpen={isMobileMenuOpen}
						onClose={() => setIsMobileMenuOpen(false)}
						activePage={activePage}
						setActivePage={() => {}}
						onLogoutClick={handleLogout}
						unreadMessagesCount={3}
						newLeadsCount={5}
					/>
				</div>
				
				{/* Main content area */}
				<div className="flex-1 flex flex-col min-h-screen">
					{/* Header */}
					<div className="sticky top-0 z-20">
						<InstallerDashboardHeader />
					</div>
					
					<main className="flex-1 p-3 sm:p-4 md:p-6 pb-24 sm:pb-8">
						{children}
					</main>
					
					{/* Mobile Bottom Navigation */}
					<div className="md:hidden">
						<InstallerBottomNavBar
							activePage={activePage}
							setActivePage={() => {}}
							onNewBidClick={() => console.log('New bid clicked')}
							onMenuClick={() => setIsMobileMenuOpen(true)}
							currentPage="installerDashboard"
							onHomeClick={handleHomeClick}
							onDashboardClick={() => {}}
							unreadMessagesCount={3}
							newLeadsCount={5}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
