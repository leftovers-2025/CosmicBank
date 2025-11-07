'use client';

import React from 'react';
import { useVirtue } from '../providers';
import Navigation from '../components/Navigation';

// --- 2. 徳残高画面コンポーネント ---
const VirtueBalanceScreen: React.FC<{ currentVirtueBalance: number }> = ({ currentVirtueBalance }) => {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-gray-950 text-white relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 opacity-80">
                {/* 星が煌めくアニメーションをシミュレート */}
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-yellow-300 shadow-[0_0_15px_#fcd34d] animate-sparkle delay-700"></div>
                <div className="absolute bottom-1/3 right-1/5 w-4 h-4 rounded-full bg-blue-300 shadow-[0_0_20px_#93c5fd] animate-sparkle delay-1200"></div>
            </div>

            <div className="z-10 text-center">
                <p className="text-3xl text-gray-400 mb-8 tracking-widest">現在の徳残高</p>

                {/* 残高のホログラム表示 */}
                <div className="relative p-8 bg-black/50 backdrop-blur-sm rounded-3xl border border-green-500/50 shadow-2xl shadow-green-500/30">
                    <p className="text-8xl font-black text-green-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-hologram">
                        {currentVirtueBalance.toLocaleString()}
                    </p>
                    <span className="text-4xl text-green-500">徳</span>
                </div>

                <div className="mt-12 p-4 bg-gray-800 rounded-xl shadow-inner border border-gray-700 max-w-sm mx-auto">
                    <h2 className="text-xl font-semibold text-green-300 mb-3">徳を積むヒント</h2>
                    <ul className="text-left space-y-2 text-gray-300 text-sm">
                        <li>🌌 困っている人にそっと手を差し伸べる (+50 徳)</li>
                        <li>🧘 日々の出来事に感謝し、言葉にする (+30 徳)</li>
                        <li>🚀 地域社会の美化活動に参加する (+100 徳)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default function BalancePage() {
    const { virtueBalance } = useVirtue();

    return (
        <div className="min-h-screen bg-gray-950">
            <VirtueBalanceScreen currentVirtueBalance={virtueBalance} />
            <Navigation />
        </div>
    );
}