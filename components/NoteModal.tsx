'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Save } from 'lucide-react';

interface NoteData {
    title: string;
    content: string;
    updatedAt: Date;
}

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: NoteData) => void;
    assetName: string;
    assetTicker: string;
    existingNote?: NoteData;
}

export default function NoteModal({
    isOpen,
    onClose,
    onSave,
    assetName,
    assetTicker,
    existingNote,
}: NoteModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (existingNote) {
            setTitle(existingNote.title);
            setContent(existingNote.content);
        } else {
            setTitle('');
            setContent('');
        }
    }, [existingNote, isOpen]);

    const handleSave = () => {
        onSave({
            title: title.trim() || '投資メモ',
            content: content.trim(),
            updatedAt: new Date(),
        });
        onClose();
    };

    const handleClear = () => {
        onSave({
            title: '',
            content: '',
            updatedAt: new Date(),
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダル */}
            <div className="relative w-full max-w-lg bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden animate-fadeIn">
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">投資メモ</h3>
                            <p className="text-white/40 text-sm">{assetName} ({assetTicker})</p>
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
                <div className="p-6 space-y-4">
                    {/* タイトル入力 */}
                    <div>
                        <label className="block text-white/60 text-sm mb-2">タイトル</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例: 2026年Q1決算狙い、長期保有枠など"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                    </div>

                    {/* 本文入力 */}
                    <div>
                        <label className="block text-white/60 text-sm mb-2">メモ内容</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="投資理由、分析、今後の戦略などを自由に記述..."
                            rows={6}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                        />
                    </div>

                    {/* 最終更新日 */}
                    {existingNote && (
                        <p className="text-white/30 text-xs">
                            最終更新: {new Date(existingNote.updatedAt).toLocaleString('ja-JP')}
                        </p>
                    )}
                </div>

                {/* フッター */}
                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/[0.02]">
                    {existingNote?.content ? (
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                        >
                            メモを削除
                        </button>
                    ) : (
                        <div />
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
