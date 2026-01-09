'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    AlertTriangle,
    Zap,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react';
import type { AIAnalysis, Asset } from '@/types';

interface AIAdvisorDisplayProps {
    assets: Asset[];
}

export default function AIAdvisorDisplay({ assets }: AIAdvisorDisplayProps) {
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMock, setIsMock] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const runAnalysis = async () => {
        if (assets.length === 0) {
            setError('分析を実行するには、先にポートフォリオに銘柄を追加してください。');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assets, news: [] }),
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.data);
                setIsMock(data.isMock);
            } else {
                setError(data.error || '分析に失敗しました。再度お試しください。');
            }
        } catch (err) {
            setError('ネットワークエラー。接続を確認して再度お試しください。');
            console.error('分析エラー:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getSentimentConfig = (sentiment: string) => {
        switch (sentiment) {
            case 'bullish':
                return {
                    icon: TrendingUp,
                    label: '強気',
                    color: 'text-green-400',
                    bg: 'bg-green-400/10',
                    border: 'border-green-400/30',
                    glow: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
                };
            case 'bearish':
                return {
                    icon: TrendingDown,
                    label: '弱気',
                    color: 'text-red-400',
                    bg: 'bg-red-400/10',
                    border: 'border-red-400/30',
                    glow: 'shadow-[0_0_20px_rgba(248,113,113,0.3)]',
                };
            default:
                return {
                    icon: Minus,
                    label: '中立',
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-400/10',
                    border: 'border-yellow-400/30',
                    glow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]',
                };
        }
    };

    // 初期状態 - まだ分析していない
    if (!analysis && !isLoading && !error) {
        return (
            <div className="glass rounded-xl p-8 text-center">
                <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl gradient-purple-pink flex items-center justify-center glow-gradient">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple flex items-center justify-center animate-pulse">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">AI ファンドマネージャー</h3>
                <p className="text-white/50 mb-6 max-w-md mx-auto">
                    AIがポートフォリオを分析し、市場センチメント、リスク評価、
                    パーソナライズされた投資アドバイスを提供します。
                </p>

                <button
                    onClick={runAnalysis}
                    disabled={assets.length === 0}
                    className={`
            relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white
            transition-all duration-300 btn-glow
            ${assets.length === 0
                            ? 'bg-white/10 cursor-not-allowed opacity-50'
                            : 'gradient-purple-pink hover:scale-105'
                        }
          `}
                >
                    <Zap className="w-5 h-5" />
                    ポートフォリオを分析
                </button>

                {assets.length === 0 && (
                    <p className="text-white/30 text-sm mt-4">
                        銘柄を追加すると分析が有効になります
                    </p>
                )}
            </div>
        );
    }

    // ローディング状態
    if (isLoading) {
        return (
            <div className="glass rounded-xl p-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-2xl gradient-purple-pink flex items-center justify-center animate-pulse-glow">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">ポートフォリオを分析中...</h3>
                    <p className="text-white/50 text-center max-w-md">
                        AIがポートフォリオデータと市場ニュースを処理し、インサイトを生成しています。
                    </p>
                    <div className="flex gap-1 mt-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full bg-purple animate-bounce"
                                style={{ animationDelay: `${i * 150}ms` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // エラー状態
    if (error) {
        return (
            <div className="glass rounded-xl p-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-red-500/10">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">分析に失敗しました</h3>
                        <p className="text-white/50 mb-4">{error}</p>
                        <button
                            onClick={runAnalysis}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                        >
                            再試行
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 分析結果表示
    if (analysis) {
        const sentimentConfig = getSentimentConfig(analysis.sentiment);
        const SentimentIcon = sentimentConfig.icon;

        return (
            <div className="glass rounded-xl overflow-hidden">
                {/* ヘッダー */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-purple-pink flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">AI分析レポート</h3>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                    <span>
                                        {new Date(analysis.generatedAt).toLocaleString('ja-JP', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {isMock && <span className="badge-warning">デモ</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* センチメントバッジ */}
                            <div
                                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full border
                  ${sentimentConfig.bg} ${sentimentConfig.border} ${sentimentConfig.glow}
                `}
                            >
                                <SentimentIcon className={`w-4 h-4 ${sentimentConfig.color}`} />
                                <span className={`text-sm font-medium ${sentimentConfig.color}`}>
                                    {sentimentConfig.label}
                                </span>
                            </div>

                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* コンテンツ */}
                {isExpanded && (
                    <div className="p-6 animate-fadeIn">
                        {/* 市場概況 */}
                        {analysis.marketOverview && (
                            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <p className="text-white/70 leading-relaxed">{analysis.marketOverview}</p>
                            </div>
                        )}

                        {/* フル分析（Markdown） */}
                        <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {analysis.fullAnalysis}
                            </ReactMarkdown>
                        </div>

                        {/* 再分析ボタン */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={runAnalysis}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-purple-pink text-white font-medium hover:scale-105 transition-transform btn-glow"
                            >
                                <Zap className="w-4 h-4" />
                                再分析する
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}
