'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Clock, AlertCircle, RefreshCw, Newspaper } from 'lucide-react';
import type { NewsItem } from '@/types';

interface NewsFeedProps {
    onNewsLoaded?: (news: NewsItem[]) => void;
}

export default function NewsFeed({ onNewsLoaded }: NewsFeedProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMock, setIsMock] = useState(false);

    const fetchNews = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/news');
            const data = await response.json();

            if (data.success) {
                setNews(data.data);
                setIsMock(data.isMock);
                onNewsLoaded?.(data.data);
            } else {
                setError(data.error || 'ニュースの取得に失敗しました');
            }
        } catch (err) {
            setError('ネットワークエラー。再度お試しください。');
            console.error('ニュース取得エラー:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        return `${diffDays}日前`;
    };

    if (isLoading) {
        return (
            <div className="glass rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="h-6 w-48 shimmer rounded" />
                </div>
                <div className="divide-y divide-white/5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4">
                            <div className="space-y-2">
                                <div className="h-4 w-full shimmer rounded" />
                                <div className="h-4 w-3/4 shimmer rounded" />
                                <div className="h-3 w-24 shimmer rounded mt-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 text-red-400 mb-4">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
                <button
                    onClick={fetchNews}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    再試行
                </button>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl overflow-hidden">
            {/* ヘッダー */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-purple" />
                        <h3 className="text-lg font-semibold text-white">市場ニュース</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {isMock && (
                            <span className="badge-warning text-xs">デモデータ</span>
                        )}
                        <button
                            onClick={fetchNews}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            title="更新"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ニュースリスト */}
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {news.map((item, index) => (
                    <a
                        key={index}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 hover:bg-white/[0.02] transition-colors group animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex gap-4">
                            {/* サムネイル */}
                            {item.urlToImage && (
                                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white/5">
                                    <img
                                        src={item.urlToImage}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* コンテンツ */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium leading-snug mb-2 group-hover:text-purple transition-colors line-clamp-2">
                                    {item.title}
                                </h4>
                                {item.description && (
                                    <p className="text-white/50 text-sm line-clamp-2 mb-2">
                                        {item.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-white/40">
                                    <span className="text-purple/80">{item.source.name}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTimeAgo(item.publishedAt)}
                                    </span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* フッター */}
            <div className="p-3 border-t border-white/10 bg-white/[0.01]">
                <div className="text-center text-white/30 text-xs">
                    {news.length}件の記事 • たった今更新
                </div>
            </div>
        </div>
    );
}
