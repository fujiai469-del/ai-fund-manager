'use client';

import { useState } from 'react';
import { Search, Building2, TrendingUp, TrendingDown, Loader2, AlertTriangle } from 'lucide-react';

interface InstitutionalHolder {
    holder: string;
    shares: number;
    dateReported: string;
    change: number;
    changePercentage: number;
    value: number;
}

interface InstitutionalHoldingsProps {
    // 将来的にポートフォリオの銘柄から検索できるようにする場合に使用
    portfolioTickers?: string[];
}

// モックデータ（API未設定時用）
const MOCK_HOLDERS: Record<string, InstitutionalHolder[]> = {
    'AAPL': [
        { holder: 'Vanguard Group Inc', shares: 1279431000, dateReported: '2024-12-31', change: 12500000, changePercentage: 0.99, value: 236700000000 },
        { holder: 'BlackRock Inc', shares: 1012890000, dateReported: '2024-12-31', change: -5200000, changePercentage: -0.51, value: 187400000000 },
        { holder: 'Berkshire Hathaway Inc', shares: 915560382, dateReported: '2024-12-31', change: 0, changePercentage: 0, value: 169400000000 },
        { holder: 'State Street Corporation', shares: 591230000, dateReported: '2024-12-31', change: 8900000, changePercentage: 1.53, value: 109400000000 },
        { holder: 'FMR LLC (Fidelity)', shares: 350120000, dateReported: '2024-12-31', change: 15600000, changePercentage: 4.66, value: 64800000000 },
    ],
    'MSFT': [
        { holder: 'Vanguard Group Inc', shares: 890120000, dateReported: '2024-12-31', change: 8900000, changePercentage: 1.01, value: 373850000000 },
        { holder: 'BlackRock Inc', shares: 720450000, dateReported: '2024-12-31', change: -2100000, changePercentage: -0.29, value: 302590000000 },
        { holder: 'State Street Corporation', shares: 401230000, dateReported: '2024-12-31', change: 5600000, changePercentage: 1.41, value: 168520000000 },
        { holder: 'FMR LLC (Fidelity)', shares: 289560000, dateReported: '2024-12-31', change: 12300000, changePercentage: 4.44, value: 121615000000 },
        { holder: 'Capital Research Global', shares: 245780000, dateReported: '2024-12-31', change: -8900000, changePercentage: -3.49, value: 103228000000 },
    ],
    '7203': [
        { holder: 'トヨタ自動車株式会社', shares: 500000000, dateReported: '2024-12-31', change: 0, changePercentage: 0, value: 1425000000000 },
        { holder: '日本マスタートラスト信託銀行', shares: 180000000, dateReported: '2024-12-31', change: 5000000, changePercentage: 2.86, value: 513000000000 },
        { holder: '日本カストディ銀行', shares: 120000000, dateReported: '2024-12-31', change: 2000000, changePercentage: 1.69, value: 342000000000 },
        { holder: 'ステートストリート', shares: 45000000, dateReported: '2024-12-31', change: 1500000, changePercentage: 3.45, value: 128250000000 },
        { holder: 'ブラックロック', shares: 38000000, dateReported: '2024-12-31', change: -500000, changePercentage: -1.30, value: 108300000000 },
    ],
};

export default function InstitutionalHoldings({ portfolioTickers }: InstitutionalHoldingsProps) {
    const [searchTicker, setSearchTicker] = useState('');
    const [holders, setHolders] = useState<InstitutionalHolder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchedTicker, setSearchedTicker] = useState<string | null>(null);
    const [isMock, setIsMock] = useState(false);

    const handleSearch = async () => {
        if (!searchTicker.trim()) {
            setError('ティッカーシンボルを入力してください');
            return;
        }

        setIsLoading(true);
        setError(null);
        const ticker = searchTicker.trim().toUpperCase();

        try {
            const response = await fetch(`/api/institutional?ticker=${encodeURIComponent(ticker)}`);
            const data = await response.json();

            if (data.success) {
                setHolders(data.data);
                setSearchedTicker(ticker);
                setIsMock(data.source === 'mock');
            } else {
                setError(data.error || '検索に失敗しました');
                setHolders([]);
            }
        } catch (err) {
            console.error('検索エラー:', err);
            setError('ネットワークエラー。接続を確認してください。');
            setHolders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}兆`;
        if (num >= 1e8) return `${(num / 1e8).toFixed(2)}億`;
        if (num >= 1e4) return `${(num / 1e4).toFixed(2)}万`;
        return num.toLocaleString();
    };

    const formatShares = (shares: number): string => {
        if (shares >= 1e9) return `${(shares / 1e9).toFixed(2)}B`;
        if (shares >= 1e6) return `${(shares / 1e6).toFixed(2)}M`;
        if (shares >= 1e3) return `${(shares / 1e3).toFixed(1)}K`;
        return shares.toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* ヘッダー */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-purple-blue mb-4 glow-gradient">
                    <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">機関投資家保有状況</h2>
                <p className="text-white/50 text-sm max-w-md mx-auto">
                    ティッカーシンボルを入力して、その銘柄を保有している機関投資家を検索できます
                </p>
            </div>

            {/* 検索フォーム */}
            <div className="glass rounded-xl p-4">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchTicker}
                            onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            placeholder="ティッカーを入力（例: AAPL, MSFT, 7203）"
                            className="input pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl gradient-purple-blue text-white font-medium hover:scale-105 transition-transform btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            '検索'
                        )}
                    </button>
                </div>

                {/* クイック検索ボタン */}
                {portfolioTickers && portfolioTickers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-white/40 text-xs">ポートフォリオから:</span>
                        {portfolioTickers.slice(0, 5).map((ticker) => (
                            <button
                                key={ticker}
                                onClick={() => {
                                    setSearchTicker(ticker);
                                    setTimeout(() => handleSearch(), 100);
                                }}
                                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
                            >
                                {ticker}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* エラー表示 */}
            {error && (
                <div className="glass rounded-xl p-4 border-l-4 border-red-500">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <p className="text-red-400">{error}</p>
                    </div>
                </div>
            )}

            {/* ローディング */}
            {isLoading && (
                <div className="glass rounded-xl p-12 text-center">
                    <Loader2 className="w-10 h-10 text-purple animate-spin mx-auto mb-4" />
                    <p className="text-white/50">機関投資家データを検索中...</p>
                </div>
            )}

            {/* 検索結果 */}
            {!isLoading && searchedTicker && holders.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple" />
                            {searchedTicker} の機関投資家保有状況
                        </h3>
                        {isMock && (
                            <span className="badge-warning text-xs">デモデータ</span>
                        )}
                    </div>

                    <div className="grid gap-3">
                        {holders.map((holder, index) => (
                            <div
                                key={holder.holder}
                                className="glass rounded-xl p-4 animate-fadeIn hover:bg-white/[0.04] transition-colors"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center text-white font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white truncate">{holder.holder}</h4>
                                                <p className="text-white/40 text-xs">
                                                    報告日: {new Date(holder.dateReported).toLocaleDateString('ja-JP')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`flex items-center justify-end gap-1 ${holder.change > 0 ? 'text-green-400' :
                                            holder.change < 0 ? 'text-red-400' : 'text-white/50'
                                            }`}>
                                            {holder.change > 0 ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : holder.change < 0 ? (
                                                <TrendingDown className="w-4 h-4" />
                                            ) : null}
                                            <span className="text-sm font-medium">
                                                {holder.change > 0 ? '+' : ''}{holder.changePercentage.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/5">
                                    <div>
                                        <div className="text-white/40 text-xs mb-1">保有株数</div>
                                        <div className="text-white font-medium">{formatShares(holder.shares)}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-xs mb-1">評価額</div>
                                        <div className="text-white font-medium">
                                            {holder.value > 1e12 ? `¥${formatNumber(holder.value)}` : `$${formatNumber(holder.value / 155)}`}
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <div className="text-white/40 text-xs mb-1">前期比増減</div>
                                        <div className={`font-medium ${holder.change > 0 ? 'text-green-400' :
                                            holder.change < 0 ? 'text-red-400' : 'text-white/50'
                                            }`}>
                                            {holder.change > 0 ? '+' : ''}{formatShares(holder.change)}株
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 検索結果なし */}
            {!isLoading && searchedTicker && holders.length === 0 && !error && (
                <div className="glass rounded-xl p-8 text-center">
                    <div className="text-white/30 mb-2">データが見つかりません</div>
                    <p className="text-white/50 text-sm">
                        「{searchedTicker}」の機関投資家保有データはありません
                    </p>
                </div>
            )}

            {/* 初期状態 */}
            {!isLoading && !searchedTicker && !error && (
                <div className="glass rounded-xl p-8 text-center">
                    <div className="text-white/30 mb-2">検索してください</div>
                    <p className="text-white/50 text-sm">
                        上の検索ボックスにティッカーシンボルを入力して検索してください
                    </p>
                </div>
            )}
        </div>
    );
}
