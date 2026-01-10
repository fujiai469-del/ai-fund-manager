'use client';

import { Home, Building2 } from 'lucide-react';

export type TabType = 'portfolio' | 'institutional';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs = [
        {
            id: 'portfolio' as TabType,
            label: 'ポートフォリオ',
            icon: Home,
        },
        {
            id: 'institutional' as TabType,
            label: '機関投資家',
            icon: Building2,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-[1800px] mx-auto">
                <div className="flex justify-around items-center h-16">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-white/40 hover:text-white/70'
                                    }
                                `}
                            >
                                <div className={`
                                    p-2 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'gradient-purple-pink glow-gradient'
                                        : 'bg-transparent'
                                    }
                                `}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            {/* Safe area for iOS */}
            <div className="h-safe-area-inset-bottom bg-black" />
        </nav>
    );
}
