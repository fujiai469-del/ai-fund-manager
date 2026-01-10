'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Asset } from '@/types';

interface EarningsCalendarProps {
    assets: Asset[];
}

// 日付ユーティリティ
const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
};

const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const MONTH_NAMES = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
];

const WEEKDAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export default function EarningsCalendar({ assets }: EarningsCalendarProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());

    // 決算日マップを作成（日付 -> 銘柄のリスト）
    const earningsMap = useMemo(() => {
        const map: Record<string, Asset[]> = {};
        assets.forEach(asset => {
            if (asset.earningsDate) {
                if (!map[asset.earningsDate]) {
                    map[asset.earningsDate] = [];
                }
                map[asset.earningsDate].push(asset);
            }
        });
        return map;
    }, [assets]);

    // 月を移動
    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear(prev => prev - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear(prev => prev + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const goToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    // カレンダーグリッドを生成
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

    // 前月の日数
    const prevMonthDays = currentMonth === 0
        ? getDaysInMonth(currentYear - 1, 11)
        : getDaysInMonth(currentYear, currentMonth - 1);

    // カレンダーのセルを生成
    const cells = [];

    // 前月の日付
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            dateStr: '',
        });
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(currentYear, currentMonth, day);
        cells.push({
            day,
            isCurrentMonth: true,
            dateStr,
            isToday: dateStr === todayStr,
            earnings: earningsMap[dateStr] || [],
        });
    }

    // 次月の日付（6行になるように埋める）
    const remainingCells = 42 - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
        cells.push({
            day,
            isCurrentMonth: false,
            dateStr: '',
        });
    }

    // 決算日のある銘柄がない場合の表示
    const hasAnyEarnings = Object.keys(earningsMap).length > 0;

    return (
        <div className="glass rounded-xl overflow-hidden">
            {/* ヘッダー */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">決算カレンダー</h3>
                            <p className="text-white/40 text-sm">保有銘柄の決算日を確認</p>
                        </div>
                    </div>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
                    >
                        今日
                    </button>
                </div>

                {/* 月ナビゲーション */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={goToPrevMonth}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-white font-semibold">
                        {currentYear}年 {MONTH_NAMES[currentMonth]}
                    </span>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* カレンダー本体 */}
            <div className="p-4">
                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAY_NAMES.map((day, i) => (
                        <div
                            key={day}
                            className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-white/50'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* 日付グリッド */}
                <div className="grid grid-cols-7 gap-1">
                    {cells.map((cell, index) => (
                        <div
                            key={index}
                            className={`
                                min-h-[60px] p-1 rounded-lg transition-colors
                                ${cell.isCurrentMonth ? 'bg-white/[0.02]' : 'bg-transparent'}
                                ${cell.isToday ? 'ring-2 ring-purple-500/50' : ''}
                            `}
                        >
                            <div className={`
                                text-xs mb-1
                                ${!cell.isCurrentMonth ? 'text-white/20' :
                                    cell.isToday ? 'text-purple-400 font-bold' :
                                        index % 7 === 0 ? 'text-red-400/70' :
                                            index % 7 === 6 ? 'text-blue-400/70' : 'text-white/60'}
                            `}>
                                {cell.day}
                            </div>

                            {/* 決算銘柄表示 */}
                            {cell.earnings && cell.earnings.length > 0 && (
                                <div className="space-y-0.5">
                                    {cell.earnings.slice(0, 2).map((asset, i) => (
                                        <div
                                            key={i}
                                            className="text-[10px] px-1 py-0.5 rounded bg-orange-500/20 text-orange-300 truncate"
                                            title={`${asset.name} (${asset.ticker})`}
                                        >
                                            {asset.ticker}
                                        </div>
                                    ))}
                                    {cell.earnings.length > 2 && (
                                        <div className="text-[9px] text-white/40 text-center">
                                            +{cell.earnings.length - 2}件
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 決算日なしの場合のヒント */}
            {!hasAnyEarnings && (
                <div className="px-4 pb-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        <p className="text-white/40 text-sm">
                            決算日が登録された銘柄がありません
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                            銘柄の編集から決算日を追加してください
                        </p>
                    </div>
                </div>
            )}

            {/* 今月の決算一覧 */}
            {hasAnyEarnings && (
                <div className="px-4 pb-4">
                    <h4 className="text-white/60 text-sm font-medium mb-2">
                        {MONTH_NAMES[currentMonth]}の決算予定
                    </h4>
                    <div className="space-y-2">
                        {Object.entries(earningsMap)
                            .filter(([date]) => {
                                const d = new Date(date);
                                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
                            })
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([date, assets]) => (
                                <div key={date} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                                    <div className="text-white/40 text-sm font-medium min-w-[50px]">
                                        {new Date(date).getDate()}日
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {assets.map((asset, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-xs"
                                            >
                                                {asset.ticker}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        {Object.entries(earningsMap).filter(([date]) => {
                            const d = new Date(date);
                            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
                        }).length === 0 && (
                                <div className="text-white/30 text-sm text-center py-2">
                                    今月の決算予定はありません
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}
