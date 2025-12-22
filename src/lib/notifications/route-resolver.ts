// Route resolver for notifications
// Maps routeKey to validated destination paths per role

import { UserRole } from '@prisma/client';

export type RouteKey =
  | 'admin.dashboard'
  | 'admin.lead.manage'
  | 'installer.leads'
  | 'installer.dashboard'
  | 'homeowner.requests'
  | 'homeowner.requests.review';

export type RouteParams = {
  leadId?: string;
  bidId?: string;
  requestId?: string;
  installerId?: string;
};

const ROUTE_MAP: Record<RouteKey, (params?: RouteParams) => string> = {
  'admin.dashboard': () => '/admin/dashboard',
  'admin.lead.manage': () => '/admin/leads',
  'installer.leads': () => '/installer/leads',
  'installer.dashboard': () => '/installer/dashboard',
  'homeowner.requests': () => '/homeowner/dashboard',
  'homeowner.requests.review': (params) =>
    params?.requestId ? `/homeowner/requests/${params.requestId}` : '/homeowner/dashboard',
};

export function resolveRoute(routeKey: RouteKey, routeParams?: RouteParams): string {
  const resolver = ROUTE_MAP[routeKey];
  if (!resolver) {
    console.warn(`[Route Resolver] Unknown routeKey: ${routeKey}. Falling back to dashboard.`);
    return '/';
  }

  try {
    return resolver(routeParams);
  } catch (error) {
    console.error(`[Route Resolver] Error resolving route for ${routeKey}:`, error);
    return '/';
  }
}

export function validateRouteKey(routeKey: string): routeKey is RouteKey {
  return routeKey in ROUTE_MAP;
}

export function getRouteKeyForRole(role: UserRole, action: string): RouteKey {
  // Map role + action to appropriate routeKey
  if (role === 'ADMIN') {
    if (action.includes('ASSIGNMENT')) return 'admin.dashboard';
    if (action.includes('CONFIG')) return 'admin.lead.manage';
    return 'admin.dashboard';
  }

  if (role === 'INSTALLER') {
    return 'installer.leads';
  }

  if (role === 'HOMEOWNER') {
    if (action.includes('RESPONSES')) return 'homeowner.requests.review';
    return 'homeowner.requests';
  }

  console.warn(`[Route Resolver] Unknown role: ${role}. Defaulting to homepage.`);
  return 'homeowner.requests';
}
