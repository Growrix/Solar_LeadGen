'use client';

import * as React from 'react';

type HomeownerDashboardNavContextValue = {
	activePage: string;
	setActivePage: (page: string) => void;
};

const HomeownerDashboardNavContext = React.createContext<HomeownerDashboardNavContextValue | null>(null);

export function HomeownerDashboardNavProvider({
	children,
	initialActivePage = 'Dashboard Overview',
}: {
	children: React.ReactNode;
	initialActivePage?: string;
}) {
	const [activePage, setActivePage] = React.useState(initialActivePage);

	const value = React.useMemo(() => ({ activePage, setActivePage }), [activePage]);

	return <HomeownerDashboardNavContext.Provider value={value}>{children}</HomeownerDashboardNavContext.Provider>;
}

export function useHomeownerDashboardNav() {
	const ctx = React.useContext(HomeownerDashboardNavContext);
	if (!ctx) {
		throw new Error('useHomeownerDashboardNav must be used within <HomeownerDashboardNavProvider />');
	}
	return ctx;
}
