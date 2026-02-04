'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';

import HomeownerSidebar from '@/components/homeowner/HomeownerSidebar';
import HomeownerMobileSidebarMenu from '@/components/HomeownerMobileSidebarMenu';
import HomeownerBottomNavBar from '@/components/HomeownerBottomNavBar';
import { HomeownerDashboardHeader } from '@/components/homeowner/HomeownerDashboardHeader';
import { DashboardShell } from '@/ds';
import { cn } from '@/lib/utils';

import { HomeownerDashboardNavProvider, useHomeownerDashboardNav } from './nav-context';

function HomeownerDashboardChrome({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { activePage, setActivePage } = useHomeownerDashboardNav();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

	const handleLogout = React.useCallback(async () => {
		const { signOut } = await import('next-auth/react');
		await signOut({ redirect: false });
		router.push('/');
	}, [router]);

	const handleHomeClick = React.useCallback(() => {
		router.push('/homeowner');
	}, [router]);

	const handleMessagesClick = React.useCallback(() => {
		setActivePage('Messages');
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new Event('homeowner:open-messages'));
		}
	}, [setActivePage]);

	return (
		<DashboardShell
			className="bg-background text-foreground animate-fade-in"
			contentClassName={cn('transition-colors duration-300', isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64')}
			sidebar={
				<div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex">
					<HomeownerSidebar
						activePage={activePage}
						onNavigate={setActivePage}
						onLogoutClick={handleLogout}
						onHomeClick={handleHomeClick}
						onMessagesClick={handleMessagesClick}
						isCollapsed={isSidebarCollapsed}
						setIsCollapsed={setIsSidebarCollapsed}
					/>
				</div>
			}
			header={
				<div className="sticky top-0 z-20">
					<HomeownerDashboardHeader pageTitle={activePage} />
				</div>
			}
			mainClassName="p-3 sm:p-4 md:p-6 pb-24 sm:pb-8"
			footer={
				<>
					<div className="md:hidden">
						<HomeownerMobileSidebarMenu
							isOpen={isMobileMenuOpen}
							onClose={() => setIsMobileMenuOpen(false)}
							activePage={activePage}
							setActivePage={setActivePage}
							onLogoutClick={handleLogout}
							onMessagesClick={handleMessagesClick}
							unreadMessagesCount={3}
						/>
					</div>
					<div className="md:hidden">
						<HomeownerBottomNavBar
							activePage={activePage}
							setActivePage={setActivePage}
							onNewQuoteClick={() => {}}
							currentPage="dashboard"
							onHomeClick={handleHomeClick}
							onDashboardClick={() => setActivePage('Dashboard Overview')}
							onMenuClick={() => setIsMobileMenuOpen(true)}
							onMessagesClick={handleMessagesClick}
							unreadMessagesCount={3}
							onLogoutClick={handleLogout}
						/>
					</div>
				</>
			}
		>
			{children}
		</DashboardShell>
	);
}

export default function HomeownerDashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<HomeownerDashboardNavProvider>
			<HomeownerDashboardChrome>{children}</HomeownerDashboardChrome>
		</HomeownerDashboardNavProvider>
	);
}
