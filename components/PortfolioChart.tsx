'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Asset } from '@/types';
import { SECTOR_COLORS, convertToJPY } from '@/types';

interface PortfolioChartProps {
    assets: Asset[];
    isLoading?: boolean;
}

interface ChartDataItem {
    name: string;
    value: number;
    percentage: number;
    color: string;
    [key: string]: string | number;
}

// セクター名の日本語マッピング
const SECTOR_LABELS: Record<string, string> = {
    'Technology': 'テクノロジー',
    'Healthcare': 'ヘルスケア',
    'Finance': '金融',
    'Consumer Discretionary': '一般消費財',
    'Consumer Staples': '生活必需品',
    'Energy': 'エネルギー',
    'Materials': '素材',
    'Industrials': '資本財',
    'Utilities': '公益事業',
    'Real Estate': '不動産',
    'Communication Services': '通信サービス',
    'Cryptocurrency': '暗号資産',
    'ETF': 'ETF',
    'Other': 'その他',
};

// 銘柄用カラーパレット
const STOCK_COLORS = [
    '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#22c55e',
    '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#f97316',
    '#a855f7', '#0ea5e9', '#d946ef', '#10b981', '#fbbf24',
];

export default function PortfolioChart({ assets, isLoading = false }: PortfolioChartProps) {
    if (isLoading) {
        return (
            <div className="glass rounded-xl p-6">
                <div className="h-6 w-40 shimmer rounded mb-4" />
                <div className="h-64 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full shimmer" />
                </div>
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">セクター構成比</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                        </div>
                        <p className="text-white/40 text-sm">銘柄を追加するとグラフが表示されます</p>
                    </div>
                </div>
            </div>
        );
    }

    // セクター別集計（円換算）
    const sectorValues: Record<string, number> = {};
    assets.forEach((asset) => {
        const value = convertToJPY(asset.quantity * asset.currentPrice, asset.currency);
        sectorValues[asset.sector] = (sectorValues[asset.sector] || 0) + value;
    });

    const totalValue = Object.values(sectorValues).reduce((sum, val) => sum + val, 0);

    const sectorChartData: ChartDataItem[] = Object.entries(sectorValues)
        .map(([sector, value]) => ({
            name: SECTOR_LABELS[sector] || sector,
            value,
            percentage: (value / totalValue) * 100,
            color: SECTOR_COLORS[sector] || '#71717a',
        }))
        .sort((a, b) => b.value - a.value);

    // 銘柄別集計（円換算）
    const stockChartData: ChartDataItem[] = assets
        .map((asset, index) => {
            const value = convertToJPY(asset.quantity * asset.currentPrice, asset.currency);
            return {
                name: asset.name,
                ticker: asset.ticker,
                value,
                percentage: (value / totalValue) * 100,
                color: STOCK_COLORS[index % STOCK_COLORS.length],
            };
        })
        .sort((a, b) => b.value - a.value);

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass rounded-lg p-3 border border-white/10 shadow-xl">
                    <p className="text-white font-medium mb-1">{data.name}</p>
                    <p className="text-white/70 text-sm">¥{Math.round(data.value).toLocaleString()}</p>
                    <p className="text-white/50 text-xs">ポートフォリオの{data.percentage.toFixed(1)}%</p>
                </div>
            );
        }
        return null;
    };

    const SectorLegend = () => (
        <div className="mt-4 grid grid-cols-2 gap-2">
            {sectorChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white/60 truncate">{item.name}</span>
                    <span className="text-white/40 ml-auto">{item.percentage.toFixed(0)}%</span>
                </div>
            ))}
        </div>
    );

    const StockLegend = () => (
        <div className="mt-4 grid grid-cols-1 gap-1.5">
            {stockChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white/60 truncate flex-1">{item.name}</span>
                    <span className="text-white/40">{item.percentage.toFixed(0)}%</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* セクター構成比 */}
            <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">セクター構成比</h3>

                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {sectorChartData.map((item, index) => (
                                    <linearGradient
                                        key={`gradient-sector-${index}`}
                                        id={`gradient-sector-${item.name.replace(/\s+/g, '-')}`}
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="1"
                                    >
                                        <stop offset="0%" stopColor={item.color} stopOpacity={1} />
                                        <stop offset="100%" stopColor={item.color} stopOpacity={0.6} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={sectorChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {sectorChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-sector-${index}`}
                                        fill={`url(#gradient-sector-${entry.name.replace(/\s+/g, '-')})`}
                                        stroke={entry.color}
                                        strokeWidth={1}
                                        style={{
                                            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))',
                                        }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* 中央ラベル */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-2xl font-bold gradient-text">
                                ¥{Math.round(totalValue / 10000)}万
                            </div>
                            <div className="text-white/40 text-xs">評価額合計</div>
                        </div>
                    </div>
                </div>

                <SectorLegend />
            </div>

            {/* 銘柄構成比 */}
            <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">銘柄構成比</h3>

                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {stockChartData.map((item, index) => (
                                    <linearGradient
                                        key={`gradient-stock-${index}`}
                                        id={`gradient-stock-${index}`}
                                        x1="0"
                                        y1="0"
                                        x2="1"
                                        y2="1"
                                    >
                                        <stop offset="0%" stopColor={item.color} stopOpacity={1} />
                                        <stop offset="100%" stopColor={item.color} stopOpacity={0.6} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={stockChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {stockChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-stock-${index}`}
                                        fill={`url(#gradient-stock-${index})`}
                                        stroke={entry.color}
                                        strokeWidth={1}
                                        style={{
                                            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))',
                                        }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* 中央ラベル */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                                {assets.length}銘柄
                            </div>
                            <div className="text-white/40 text-xs">保有数</div>
                        </div>
                    </div>
                </div>

                <StockLegend />
            </div>
        </div>
    );
}
