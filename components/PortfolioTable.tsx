'use client';

import { useState } from 'react';
import { Pencil, Trash2, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import type { Asset } from '@/types';
import { convertToJPY } from '@/types';

interface PortfolioTableProps {
    assets: Asset[];
    onEdit: (asset: Asset) => void;
    onDelete: (assetId: string) => void;
    onRefresh?: () => void;
    isLoading?: boolean;
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

// ティッカーに基づく色生成
function getTickerColor(ticker: string): string {
    const colors = [
        '#8b5cf6',
        '#3b82f6',
        '#ec4899',
        '#06b6d4',
        '#22c55e',
        '#f59e0b',
        '#ef4444',
        '#6366f1',
    ];
    const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

export default function PortfolioTable({
    assets,
    onEdit,
    onDelete,
    onRefresh,
    isLoading = false,
}: PortfolioTableProps) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const calculateGain = (asset: Asset) => {
        const totalValue = convertToJPY(asset.quantity * asset.currentPrice, asset.currency);
        const totalCost = convertToJPY(asset.quantity * asset.averageCost, asset.currency);
        const gain = totalValue - totalCost;
        const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
        return { gain, gainPercent, totalValue, totalCost };
    };

    const handleDelete = (assetId: string) => {
        if (deleteConfirm === assetId) {
            onDelete(assetId);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(assetId);
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    // 銘柄行コンポーネント
    const AssetRow = ({ asset, index }: { asset: Asset; index: number }) => {
        const { gain, gainPercent, totalValue } = calculateGain(asset);
        const isPositive = gain >= 0;

        return (
            <div
                key={asset.id}
                className="table-row p-4 animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <div className="grid grid-cols-12 gap-4 items-center">
                    {/* 銘柄情報 */}
                    <div className="col-span-12 md:col-span-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                                style={{
                                    background: `linear-gradient(135deg, ${getTickerColor(asset.ticker)} 0%, ${getTickerColor(asset.ticker)}88 100%)`,
                                }}
                            >
                                {asset.quantity.toLocaleString()}株
                            </div>
                            <div>
                                <div className="font-medium text-white">{asset.name}</div>
                                <div className="text-white/50 text-sm flex items-center gap-2">
                                    <span>{asset.ticker}</span>
                                    <span className="text-white/20">•</span>
                                    <span>{SECTOR_LABELS[asset.sector] || asset.sector}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 保有数 */}
                    <div className="col-span-4 md:col-span-2 text-right">
                        <div className="md:hidden text-white/40 text-xs mb-1">保有数</div>
                        <div className="text-white">{asset.quantity.toLocaleString()}</div>
                    </div>

                    {/* 取得単価 */}
                    <div className="col-span-4 md:col-span-2 text-right">
                        <div className="md:hidden text-white/40 text-xs mb-1">取得単価</div>
                        <div className="text-white/70">
                            {asset.currency === 'USD' ? '$' : '¥'}{Math.round(asset.averageCost).toLocaleString()}
                        </div>
                        {asset.currency === 'USD' && (
                            <div className="text-white/30 text-xs">≈¥{Math.round(asset.averageCost * 155).toLocaleString()}</div>
                        )}
                    </div>

                    {/* 現在値 */}
                    <div className="col-span-4 md:col-span-2 text-right">
                        <div className="md:hidden text-white/40 text-xs mb-1">現在値</div>
                        <div className="text-white">
                            {asset.currency === 'USD' ? '$' : '¥'}{Math.round(asset.currentPrice).toLocaleString()}
                        </div>
                        <div className="text-white/40 text-xs">
                            評価額: ¥{Math.round(totalValue).toLocaleString()}
                        </div>
                    </div>

                    {/* 損益（円換算済み） */}
                    <div className="col-span-8 md:col-span-2 text-right">
                        <div className="md:hidden text-white/40 text-xs mb-1">損益</div>
                        <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : gain < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                            ) : (
                                <Minus className="w-4 h-4" />
                            )}
                            <span className="font-medium">
                                {isPositive ? '+' : ''}¥{Math.round(gain).toLocaleString()}
                            </span>
                        </div>
                        <div className={`text-sm ${isPositive ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            {isPositive ? '+' : ''}{gainPercent.toFixed(1)}%
                        </div>
                    </div>

                    {/* アクション */}
                    <div className="col-span-4 md:col-span-1 flex items-center justify-end gap-2">
                        <button
                            onClick={() => onEdit(asset)}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            title="編集"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(asset.id)}
                            className={`p-2 rounded-lg transition-colors ${deleteConfirm === asset.id
                                ? 'bg-red-500/20 text-red-400'
                                : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                                }`}
                            title={deleteConfirm === asset.id ? 'もう一度クリックで削除' : '削除'}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="glass rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <div className="h-6 w-48 shimmer rounded" />
                </div>
                <div className="divide-y divide-white/5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 shimmer rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 shimmer rounded" />
                                <div className="h-3 w-20 shimmer rounded" />
                            </div>
                            <div className="h-6 w-24 shimmer rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="glass rounded-xl p-8 text-center">
                <div className="text-white/30 mb-2">銘柄がありません</div>
                <p className="text-white/50 text-sm">
                    「銘柄追加」ボタンから最初の銘柄を追加してください
                </p>
            </div>
        );
    }

    const jpyAssets = assets.filter(a => a.currency === 'JPY');
    const usdAssets = assets.filter(a => a.currency === 'USD');

    return (
        <div className="glass rounded-xl overflow-hidden">
            {/* ヘッダー */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-white/50 text-sm font-medium">
                <div className="col-span-3">銘柄</div>
                <div className="col-span-2 text-right">保有数</div>
                <div className="col-span-2 text-right">取得単価</div>
                <div className="col-span-2 text-right">現在値</div>
                <div className="col-span-2 text-right">損益</div>
                <div className="col-span-1 flex justify-end">
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            title="更新"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* モバイル用更新ボタン */}
            {onRefresh && (
                <div className="md:hidden p-3 border-b border-white/10 flex justify-end">
                    <button
                        onClick={onRefresh}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/60 bg-white/5 hover:bg-white/10 transition-colors text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        更新
                    </button>
                </div>
            )}

            {/* 日本株セクション */}
            {jpyAssets.length > 0 && (
                <>
                    <div className="px-4 py-2 bg-blue-500/10 border-b border-white/10">
                        <span className="text-blue-400 text-sm font-medium">🇯🇵 日本株・ETF ({jpyAssets.length}銘柄)</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {jpyAssets.map((asset, index) => (
                            <AssetRow key={asset.id} asset={asset} index={index} />
                        ))}
                    </div>
                </>
            )}

            {/* 米国株セクション */}
            {usdAssets.length > 0 && (
                <>
                    <div className="px-4 py-2 bg-green-500/10 border-b border-white/10">
                        <span className="text-green-400 text-sm font-medium">🇺🇸 米国株 ({usdAssets.length}銘柄)</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {usdAssets.map((asset, index) => (
                            <AssetRow key={asset.id} asset={asset} index={index} />
                        ))}
                    </div>
                </>
            )}

            {/* フッターサマリー（円換算） */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                <div className="flex justify-between items-center">
                    <div className="text-white/50 text-sm">
                        合計: {assets.length}銘柄
                    </div>
                    <div className="text-right">
                        {(() => {
                            const totalValue = assets.reduce(
                                (sum, a) => sum + convertToJPY(a.quantity * a.currentPrice, a.currency),
                                0
                            );
                            const totalCost = assets.reduce(
                                (sum, a) => sum + convertToJPY(a.quantity * a.averageCost, a.currency),
                                0
                            );
                            const totalGain = totalValue - totalCost;
                            const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
                            const isPositive = totalGain >= 0;

                            return (
                                <>
                                    <div className="text-white font-medium">
                                        ¥{Math.round(totalValue).toLocaleString()}
                                    </div>
                                    <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPositive ? '+' : ''}¥{Math.round(totalGain).toLocaleString()} ({isPositive ? '+' : ''}{gainPercent.toFixed(1)}%)
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
