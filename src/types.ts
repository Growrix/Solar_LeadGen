export interface Post {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

export interface QuoteRequest {
  id: number;
  location: string;
  status: 'Awaiting Bids' | 'Bids Received' | 'Completed' | 'Cancelled';
  requestDate: string;
  cost: {
    finalPrice: number;
    totalRebates: number;
    totalSystemCost: number;
  };
  system: {
    size: string; // e.g."6.6kW"
    battery: string; // e.g."10kWh" or"Not Included"
    annualProduction: number;
  };
  details: {
    propertyType: string;
    roofType: string;
    budget: string;
  };
  performance: {
    annualSavings: number;
    paybackPeriod: number | null;
    co2Reduction: number;
  };
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
}

export interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileName?: string;
  fileUrl?: string;
  read: boolean;
  sent: boolean;
}

export interface Conversation {
  id: number;
  installer: {
    id: number;
    name: string;
    avatar: string;
    online: boolean;
    lastSeen?: Date;
  };
  messages: Message[];
  unreadCount: number;
  pinned: boolean;
  starred: boolean;
  lastMessage: Date;
  isTyping: boolean;
}

export interface AIQuoteAnalysis {
  summary: string;
  optimalSystem: {
    panelSizeKW: number;
    batterySizeKWH: number;
    reasoning: string;
  };
  installerRecommendations: {
    name: string;
    specialty: string;
    reason: string;
  }[];
  savingsInsights: {
    title: string;
    tip: string;
  }[];
}
