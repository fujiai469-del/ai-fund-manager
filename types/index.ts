// 通貨型
export type Currency = 'JPY' | 'USD';

// 為替レート（USD -> JPY）
// 実際のアプリではAPIから取得することを推奨
export const EXCHANGE_RATES: Record<Currency, number> = {
  JPY: 1,
  USD: 155, // 1USD = 155JPY（固定レート）
};

// Portfolio Asset Type
export interface Asset {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  currency: Currency;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  createdAt: Date;
  updatedAt: Date;
  // 投資判断メモ（トレードジャーナル）
  note?: {
    title: string;
    content: string;
    updatedAt: Date;
  };
}

// Asset form data for creating/updating
export interface AssetFormData {
  name: string;
  ticker: string;
  sector: string;
  currency: Currency;
  quantity: number;
  averageCost: number;
  currentPrice: number;
}

// 円換算ユーティリティ
export function convertToJPY(amount: number, currency: Currency): number {
  return amount * EXCHANGE_RATES[currency];
}

// News Article Type
export interface NewsItem {
  title: string;
  description: string | null;
  url: string;
  source: {
    id: string | null;
    name: string;
  };
  publishedAt: string;
  urlToImage: string | null;
  author: string | null;
}

// News API Response
export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsItem[];
}

// AI Analysis Result Type
export interface AIAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -100 to 100
  marketOverview: string;
  vulnerabilities: VulnerabilityItem[];
  recommendations: RecommendationItem[];
  sectorAnalysis: SectorAnalysisItem[];
  fullAnalysis: string;
  generatedAt: Date;
}

// Vulnerability Item
export interface VulnerabilityItem {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedAssets: string[];
}

// Recommendation Item
export interface RecommendationItem {
  action: 'buy' | 'sell' | 'hold' | 'watch';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
}

// Sector Analysis Item
export interface SectorAnalysisItem {
  sector: string;
  outlook: 'positive' | 'negative' | 'neutral';
  weight: number; // Current weight in portfolio
  recommendedWeight: number; // Suggested weight
  commentary: string;
}

// Portfolio Summary
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  assetCount: number;
  topPerformer: Asset | null;
  worstPerformer: Asset | null;
  sectorBreakdown: SectorBreakdown[];
}

// Sector Breakdown for Charts
export interface SectorBreakdown {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Sector Options
export const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Materials',
  'Industrials',
  'Utilities',
  'Real Estate',
  'Communication Services',
  'Cryptocurrency',
  'ETF',
  'Other',
] as const;

export type SectorType = typeof SECTORS[number];

// Chart Colors for Sectors (Antigravity Theme)
export const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#8b5cf6',
  'Healthcare': '#06b6d4',
  'Finance': '#3b82f6',
  'Consumer Discretionary': '#ec4899',
  'Consumer Staples': '#22c55e',
  'Energy': '#f59e0b',
  'Materials': '#f97316',
  'Industrials': '#64748b',
  'Utilities': '#14b8a6',
  'Real Estate': '#a855f7',
  'Communication Services': '#6366f1',
  'Cryptocurrency': '#eab308',
  'ETF': '#0ea5e9',
  'Other': '#71717a',
};
