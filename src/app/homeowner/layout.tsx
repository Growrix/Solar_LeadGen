"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import HomeownerSidebar from '@/components/homeowner/HomeownerSidebar';
import HomeownerMobileSidebarMenu from '@/components/HomeownerMobileSidebarMenu';
import HomeownerBottomNavBar from '@/components/HomeownerBottomNavBar';
import { HomeownerDashboardHeader } from '@/components/homeowner/HomeownerDashboardHeader';

export default function HomeownerLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
	const [showMessagingModal, setShowMessagingModal] = React.useState(false);
	
	// Determine active page based on pathname
	const getActivePage = () => {
		if (pathname.includes('/profile')) return 'My Profile';
		if (pathname.includes('/messages')) return 'Messages';
		if (pathname.includes('/dashboard')) return 'Dashboard Overview';
		return 'Dashboard Overview';
	};
	
	const activePage = getActivePage();
	
	const handleLogout = async () => {
		const { signOut } = await import('next-auth/react');
		await signOut({ redirect: false });
		window.location.href = '/';
	};
	
	const handleHomeClick = () => {
		window.location.href = '/';
	};
	
	const handleMessagesClick = () => {
		setShowMessagingModal(true);
	};
	
	return (
		<div className="bg-background min-h-screen text-foreground animate-fade-in">
			<div className={`transition-colors duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
				{/* Desktop Sidebar - Always visible on desktop */}
				<div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex">
					<HomeownerSidebar 
						activePage={activePage}
						onLogoutClick={handleLogout}
						onHomeClick={handleHomeClick}
						onMessagesClick={handleMessagesClick}
						isCollapsed={isSidebarCollapsed}
						setIsCollapsed={setIsSidebarCollapsed}
					/>
				</div>
				
				{/* Mobile Sidebar Menu */}
				<div className="md:hidden">
					<HomeownerMobileSidebarMenu
						isOpen={isMobileMenuOpen}
						onClose={() => setIsMobileMenuOpen(false)}
						activePage={activePage}
						setActivePage={() => {}}
						onLogoutClick={handleLogout}
					/>
				</div>
				
				{/* Main content area */}
				<div className="flex-1 flex flex-col min-h-screen">
					{/* Header */}
					<div className="sticky top-0 z-20">
						<HomeownerDashboardHeader pageTitle={activePage} />
					</div>
					
					<main className="flex-1 p-3 sm:p-4 md:p-6 pb-24 sm:pb-8">
						{children}
					</main>
					
				{/* Mobile Bottom Navigation */}
				<div className="md:hidden">
					<HomeownerBottomNavBar
						activePage={activePage}
						setActivePage={() => {}}
						onNewQuoteClick={() => {}}
						onMenuClick={() => setIsMobileMenuOpen(true)}
						currentPage="dashboard"
						onHomeClick={handleHomeClick}
						onDashboardClick={() => {}}
						onMessagesClick={handleMessagesClick}
					/>
				</div>
				</div>
			</div>
		</div>
	);
}
