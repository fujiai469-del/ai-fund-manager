'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import type { Asset, AssetFormData, Currency } from '@/types';
import { SECTORS, EXCHANGE_RATES } from '@/types';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AssetFormData) => Promise<void>;
    editingAsset?: Asset | null;
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

export default function AddAssetModal({
    isOpen,
    onClose,
    onSave,
    editingAsset,
}: AddAssetModalProps) {
    const [formData, setFormData] = useState<AssetFormData>({
        name: '',
        ticker: '',
        sector: 'Technology',
        currency: 'JPY',
        quantity: 0,
        averageCost: 0,
        currentPrice: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof AssetFormData, string>>>({});

    // モーダル開閉時やeditingAsset変更時にフォームをリセット
    useEffect(() => {
        if (isOpen) {
            if (editingAsset) {
                setFormData({
                    name: editingAsset.name,
                    ticker: editingAsset.ticker,
                    sector: editingAsset.sector,
                    currency: editingAsset.currency || 'JPY',
                    quantity: editingAsset.quantity,
                    averageCost: editingAsset.averageCost,
                    currentPrice: editingAsset.currentPrice,
                });
            } else {
                setFormData({
                    name: '',
                    ticker: '',
                    sector: 'Technology',
                    currency: 'JPY',
                    quantity: 0,
                    averageCost: 0,
                    currentPrice: 0,
                });
            }
            setErrors({});
        }
    }, [isOpen, editingAsset]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof AssetFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = '銘柄名は必須です';
        }
        if (!formData.ticker.trim()) {
            newErrors.ticker = 'ティッカーシンボルは必須です';
        }
        if (formData.quantity <= 0) {
            newErrors.quantity = '保有数は0より大きい値を入力してください';
        }
        if (formData.averageCost <= 0) {
            newErrors.averageCost = '平均取得単価は0より大きい値を入力してください';
        }
        if (formData.currentPrice <= 0) {
            newErrors.currentPrice = '現在値は0より大きい値を入力してください';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await onSave({
                ...formData,
                ticker: formData.ticker.toUpperCase(),
            });
            onClose();
        } catch (error) {
            console.error('銘柄保存エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
        // 入力時にエラーをクリア
        if (errors[name as keyof AssetFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* バックドロップ */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダル */}
            <div className="relative w-full max-w-lg glass rounded-2xl border border-white/10 shadow-2xl animate-fadeIn">
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">
                            {editingAsset ? '銘柄を編集' : '新規銘柄を追加'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* フォーム */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* 銘柄名 */}
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            銘柄名
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="例: トヨタ自動車"
                            className={`input ${errors.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* ティッカー & セクター & 通貨 */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                ティッカー
                            </label>
                            <input
                                type="text"
                                name="ticker"
                                value={formData.ticker}
                                onChange={handleChange}
                                placeholder="例: 7203"
                                className={`input uppercase ${errors.ticker ? 'border-red-500/50 focus:border-red-500' : ''}`}
                            />
                            {errors.ticker && (
                                <p className="text-red-400 text-sm mt-1">{errors.ticker}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                通貨
                            </label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="select"
                            >
                                <option value="JPY" className="bg-black">円 (JPY)</option>
                                <option value="USD" className="bg-black">ドル (USD)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                セクター
                            </label>
                            <select
                                name="sector"
                                value={formData.sector}
                                onChange={handleChange}
                                className="select"
                            >
                                {SECTORS.map((sector) => (
                                    <option key={sector} value={sector} className="bg-black">
                                        {SECTOR_LABELS[sector] || sector}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 保有数 */}
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            保有数（株）
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity || ''}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="1"
                            className={`input ${errors.quantity ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        />
                        {errors.quantity && (
                            <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>
                        )}
                    </div>

                    {/* 単価 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                平均取得単価（{formData.currency === 'JPY' ? '¥' : '$'}）
                            </label>
                            <input
                                type="number"
                                name="averageCost"
                                value={formData.averageCost || ''}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className={`input ${errors.averageCost ? 'border-red-500/50 focus:border-red-500' : ''}`}
                            />
                            {errors.averageCost && (
                                <p className="text-red-400 text-sm mt-1">{errors.averageCost}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                                現在値（{formData.currency === 'JPY' ? '¥' : '$'}）
                            </label>
                            <input
                                type="number"
                                name="currentPrice"
                                value={formData.currentPrice || ''}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className={`input ${errors.currentPrice ? 'border-red-500/50 focus:border-red-500' : ''}`}
                            />
                            {errors.currentPrice && (
                                <p className="text-red-400 text-sm mt-1">{errors.currentPrice}</p>
                            )}
                        </div>
                    </div>

                    {/* プレビュー */}
                    {formData.quantity > 0 && formData.averageCost > 0 && formData.currentPrice > 0 && (
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="text-white/40 text-xs mb-2 text-center">
                                {formData.currency === 'USD' && `¥換算 (1USD = ¥${EXCHANGE_RATES.USD})`}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-white/40 text-xs mb-1">投資額</div>
                                    <div className="text-white font-medium">
                                        ¥{(formData.quantity * formData.averageCost * EXCHANGE_RATES[formData.currency]).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white/40 text-xs mb-1">評価額</div>
                                    <div className="text-white font-medium">
                                        ¥{(formData.quantity * formData.currentPrice * EXCHANGE_RATES[formData.currency]).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white/40 text-xs mb-1">損益率</div>
                                    {(() => {
                                        const gain = formData.quantity * (formData.currentPrice - formData.averageCost);
                                        const gainPercent = ((formData.currentPrice - formData.averageCost) / formData.averageCost) * 100;
                                        const isPositive = gain >= 0;
                                        return (
                                            <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                {isPositive ? '+' : ''}{gainPercent.toFixed(1)}%
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* アクション */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl gradient-purple-blue text-white font-medium hover:scale-[1.02] transition-transform btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {editingAsset ? '更新する' : '追加する'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
