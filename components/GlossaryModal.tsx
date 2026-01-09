'use client';

import { useState } from 'react';
import { X, BookOpen, TrendingUp, Shield, BarChart3, Target, AlertTriangle } from 'lucide-react';

interface GlossaryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const glossaryItems = [
    {
        category: 'リスク指標',
        icon: Shield,
        color: 'text-red-400',
        terms: [
            {
                term: 'VaR (Value at Risk)',
                description: '最大想定損失額。「95%の確率で、損失はこの金額を超えない」という意味。例：VaR95% = ¥50,000なら、95%の確率で損失は5万円以内。',
                example: 'ポートフォリオ100万円でVaR95%が5%なら、最大想定損失は約5万円。',
            },
            {
                term: 'HHI (ハーフィンダール指数)',
                description: '集中度を測る指標。各銘柄のウェイトを2乗して合計。0〜10,000の値を取り、高いほど集中している。',
                example: '1銘柄100%なら10,000（最大集中）。10銘柄均等なら1,000（分散）。',
            },
            {
                term: '相関係数',
                description: '2つの銘柄の値動きの連動性。-1〜+1の値。+1なら完全に同じ動き、-1なら逆の動き、0なら無関係。',
                example: 'ソニーとトヨタが0.6なら「やや同じ方向に動きやすい」。',
            },
        ],
    },
    {
        category: 'パフォーマンス指標',
        icon: TrendingUp,
        color: 'text-green-400',
        terms: [
            {
                term: 'シャープレシオ',
                description: 'リスク調整後リターン。「リスク1単位あたりのリターン」を測定。高いほど効率的な運用。',
                example: 'シャープレシオ1.5以上なら優秀、0.5以下は改善の余地あり。',
            },
            {
                term: '損益率',
                description: '投資に対するリターンの割合。(現在価格 - 平均取得単価) ÷ 平均取得単価 × 100',
                example: '1,000円で買った株が1,200円なら、損益率は+20%。',
            },
            {
                term: 'モメンタム',
                description: '株価の勢い・トレンドの強さ。上昇トレンドか下降トレンドかを判断する指標。',
                example: '過去3ヶ月で+15%上昇なら「強いモメンタム」と判断。',
            },
        ],
    },
    {
        category: '投資判断',
        icon: Target,
        color: 'text-blue-400',
        terms: [
            {
                term: 'Strong Buy / Buy',
                description: '積極的な買い推奨。Strong Buyは特に強い買い推奨で、大きな上昇余地があると判断。',
                example: '目標株価が現在値+20%以上ならStrong Buy。',
            },
            {
                term: 'Hold',
                description: '保有継続推奨。現状維持で、積極的に買い増しも売却もしない。',
                example: '目標株価が現在値±10%程度の場合。',
            },
            {
                term: 'Sell / Strong Sell',
                description: '売却推奨。Strong Sellは特に強い売り推奨で、大きな下落リスクがあると判断。',
                example: '目標株価が現在値-15%以下ならSell。',
            },
        ],
    },
    {
        category: 'バリュエーション',
        icon: BarChart3,
        color: 'text-purple-400',
        terms: [
            {
                term: 'PER (株価収益率)',
                description: '株価 ÷ 1株あたり利益。何年分の利益で株価を回収できるかを示す。低いほど割安。',
                example: 'PER 15倍なら「15年分の利益で投資回収」。業界平均との比較が重要。',
            },
            {
                term: 'PBR (株価純資産倍率)',
                description: '株価 ÷ 1株あたり純資産。1倍未満なら理論上「会社を解散した方が得」な状態。',
                example: 'PBR 0.8倍なら割安、2倍以上なら成長期待込みの株価。',
            },
            {
                term: '目標株価',
                description: 'アナリストが算出した適正株価の予想。現在株価との差が投資機会を示す。',
                example: '現在株価1,000円、目標株価1,300円なら「30%の上昇余地あり」。',
            },
        ],
    },
    {
        category: 'シナリオ分析',
        icon: AlertTriangle,
        color: 'text-yellow-400',
        terms: [
            {
                term: '強気シナリオ',
                description: '市場環境が良好で、ポートフォリオが期待以上のパフォーマンスを発揮するケース。',
                example: '確率25%で+20%のリターン。',
            },
            {
                term: '基本シナリオ',
                description: '最も可能性の高い、平均的な市場環境でのパフォーマンス予測。',
                example: '確率50%で+8%のリターン。',
            },
            {
                term: '弱気シナリオ',
                description: '市場環境が悪化し、ポートフォリオが損失を被るケース。リスク管理の参考に。',
                example: '確率25%で-15%のリターン。',
            },
        ],
    },
];

export default function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
    const [activeCategory, setActiveCategory] = useState<string>(glossaryItems[0].category);

    if (!isOpen) return null;

    const activeItem = glossaryItems.find(item => item.category === activeCategory);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダル */}
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">指標・用語解説</h2>
                            <p className="text-sm text-white/50">AI分析レポートで使用される専門用語</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* カテゴリタブ */}
                <div className="flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
                    {glossaryItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.category}
                                onClick={() => setActiveCategory(item.category)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeCategory === item.category
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${item.color}`} />
                                <span className="text-sm font-medium">{item.category}</span>
                            </button>
                        );
                    })}
                </div>

                {/* コンテンツ */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                    {activeItem && (
                        <div className="space-y-6">
                            {activeItem.terms.map((term, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${activeItem.color.replace('text-', 'bg-')}`} />
                                        {term.term}
                                    </h3>
                                    <p className="text-white/70 mb-3 leading-relaxed">
                                        {term.description}
                                    </p>
                                    <div className="p-3 rounded-lg bg-white/[0.03] border-l-2 border-purple-500/50">
                                        <span className="text-xs text-purple-400 font-medium">例：</span>
                                        <p className="text-white/60 text-sm mt-1">{term.example}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
