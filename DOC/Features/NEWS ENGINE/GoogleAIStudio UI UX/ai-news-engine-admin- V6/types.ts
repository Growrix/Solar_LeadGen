
import React from 'react';

export enum NewsStatus {
  DRAFT = 'Draft',
  NEEDS_REVIEW = 'Needs Review',
  PUBLISHED = 'Published',
  SCHEDULED = 'Scheduled',
  ERROR = 'Error',
  RESEARCH_DONE = 'Research Done',
  DRAFT_READY = 'Draft Ready',
  REJECTED = 'Rejected'
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  status: NewsStatus;
  category: string;
  relevanceScore: number;
  aiModel: string;
  createdAt: string;
  publishedAt?: string; // Track exact time of publication
  slug?: string;
  content?: string;
  tags?: string[];
  sourceType: 'RSS Feed' | 'AI Agent' | 'Manual Entry';
}

export interface KPI {
  label: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  description: string;
}

export enum SourceStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  ERROR = 'Error'
}

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  status: SourceStatus;
  lastSync: string;
  articleCount: number;
}

export type AppView = 'dashboard' | 'sources' | 'drafts' | 'automation' | 'control' | 'audit' | 'settings' | 'public-news' | 'public-news-details';

export interface BoardColumn {
  id: NewsStatus;
  title: string;
  color: string;
}

export interface AutomationRule {
  id: string;
  type: 'max_daily' | 'priority' | 'category_limit' | 'publish_window';
  value: any;
  isActive: boolean;
}

export interface SystemFeature {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  status: 'healthy' | 'warning' | 'degraded' | 'stopped';
  lastActivity: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  origin: 'AI' | 'Manual';
  promptUsed?: string;
  action: string;
  admin: string;
  status: NewsStatus | 'System';
}
