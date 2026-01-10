'use client';

import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, BarChart3, X, Settings2 } from 'lucide-react';

interface SimulationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    exchangeRate: number;
    marketChange: number;
    onExchangeRateChange: (rate: number) => void;
    onMarketChangeChange: (change: number) => void;
    onReset: () => void;
}

export default function SimulationPanel({
    isOpen,
    onClose,
    exchangeRate,
    marketChange,
    onExchangeRateChange,
    onMarketChangeChange,
    onReset,
}: SimulationPanelProps) {
    const isSimulating = exchangeRate !== 155 || marketChange !== 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* パネル */}
            <div className="relative w-full sm:w-[480px] bg-[#1a1a2e] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slideUp">
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">ストレステスト</h3>
                            <p className="text-white/40 text-sm">市場変動をシミュレーション</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* コンテンツ */}
                <div className="p-6 space-y-6">
                    {/* 為替レートスライダー */}
                    <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-4 h-4 text-blue-400" />
                            <span className="text-white/60 text-sm font-medium">為替レート (USD/JPY)</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/40 text-sm">¥100</span>
                            <div className="text-center">
                                <span className={`text-2xl font-bold ${exchangeRate !== 155 ? 'text-orange-400' : 'text-white'}`}>
                                    ¥{exchangeRate}
                                </span>
                                {exchangeRate !== 155 && (
                                    <span className={`ml-2 text-sm ${exchangeRate > 155 ? 'text-green-400' : 'text-red-400'}`}>
                                        ({exchangeRate > 155 ? '+' : ''}{((exchangeRate - 155) / 155 * 100).toFixed(1)}%)
                                    </span>
                                )}
                            </div>
                            <span className="text-white/40 text-sm">¥200</span>
                        </div>

                        <input
                            type="range"
                            min="100"
                            max="200"
                            value={exchangeRate}
                            onChange={(e) => onExchangeRateChange(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
                        />

                        <div className="flex justify-between mt-2 text-xs text-white/30">
                            <span>円高</span>
                            <span className="text-white/50">基準: ¥155</span>
                            <span>円安</span>
                        </div>
                    </div>

                    {/* 市場変動スライダー */}
                    <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-purple-400" />
                            <span className="text-white/60 text-sm font-medium">市場全体の変動</span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white/40 text-sm">-50%</span>
                            <div className="text-center flex items-center gap-2">
                                {marketChange > 0 ? (
                                    <TrendingUp className={`w-5 h-5 ${marketChange > 0 ? 'text-green-400' : 'text-white/40'}`} />
                                ) : marketChange < 0 ? (
                                    <TrendingDown className={`w-5 h-5 ${marketChange < 0 ? 'text-red-400' : 'text-white/40'}`} />
                                ) : null}
                                <span className={`text-2xl font-bold ${marketChange > 0 ? 'text-green-400' :
                                        marketChange < 0 ? 'text-red-400' : 'text-white'
                                    }`}>
                                    {marketChange > 0 ? '+' : ''}{marketChange}%
                                </span>
                            </div>
                            <span className="text-white/40 text-sm">+50%</span>
                        </div>

                        <input
                            type="range"
                            min="-50"
                            max="50"
                            value={marketChange}
                            onChange={(e) => onMarketChangeChange(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
                        />

                        <div className="flex justify-between mt-2 text-xs text-white/30">
                            <span>暴落</span>
                            <span className="text-white/50">変動なし</span>
                            <span>高騰</span>
                        </div>
                    </div>

                    {/* シナリオプリセット */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => {
                                onExchangeRateChange(120);
                                onMarketChangeChange(-30);
                            }}
                            className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                        >
                            🔻 危機モード
                        </button>
                        <button
                            onClick={onReset}
                            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                            ↺ リセット
                        </button>
                        <button
                            onClick={() => {
                                onExchangeRateChange(180);
                                onMarketChangeChange(20);
                            }}
                            className="px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors"
                        >
                            🚀 好況モード
                        </button>
                    </div>
                </div>

                {/* シミュレーション中バッジ */}
                {isSimulating && (
                    <div className="mx-6 mb-6 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                        <p className="text-orange-400 text-sm">
                            シミュレーション・モード実行中 — 表示される数値は仮定に基づいた計算です
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// スライダー用CSS（globals.cssに追加必要）
// .slider-thumb::-webkit-slider-thumb {
//   -webkit-appearance: none;
//   width: 20px;
//   height: 20px;
//   border-radius: 50%;
//   background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
//   cursor: pointer;
//   box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
// }
