'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useVirtue } from '../providers';

// --- 5. ライオンズゲート特別画面コンポーネント ---
const LionsGateSpecialScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
    return (
        // アニメーションクラスを削除
        <div className="absolute inset-0 flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 opacity-80">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-indigo-900 to-black mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute top-1/5 left-1/5 w-6 h-6 rounded-full bg-yellow-300 shadow-[0_0_25px_#facc15,0_0_50px_#eab308] animate-sparkle delay-100"></div>
                <div className="absolute bottom-1/4 right-1/4 w-4 h-4 rounded-full bg-pink-300 shadow-[0_0_20px_#f9a8d4] animate-sparkle delay-1500"></div>
                <div className="absolute top-1/2 right-1/10 w-8 h-8 rounded-full bg-blue-300 shadow-[0_0_30px_#60a5fa] animate-sparkle delay-700"></div>
            </div>

            <div className="z-10 text-center p-8 mx-4 bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl shadow-indigo-500/50 border border-indigo-700/50 max-w-xl w-full">

                <div className="mb-4 text-8xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)] animate-hologram">
                    <span className="inline-block animate-[spin_3s_linear_infinite]">⭐</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-300 mb-6 tracking-wider leading-tight">
                    ライオンズゲートが<br/>開きました！
                </h1>

                <p className="text-xl text-gray-200 mb-4 max-w-md mx-auto italic">
                    宇宙のエネルギーが最大に降り注ぐ日
                </p>

                {/* 特別メッセージ＆ボーナス */}
                <div className="mt-8 p-4 bg-indigo-900/50 rounded-xl border border-yellow-600/50">
                    <p className="font-semibold text-2xl text-yellow-200 mb-2">💎 宇宙銀行からのメッセージ 💎</p>
                    <p className="text-2xl font-bold text-yellow-100">
                        今日積まれた徳は<span className="text-yellow-300 text-4xl mx-2 font-extrabold drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]">3倍</span>として計上されます。
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        （基礎徳ポイント x 300%）
                    </p>
                </div>

                {/* ライオンのアイコン */}
                <div className="mt-8 text-6xl text-orange-400 animate-[pulse_2s_infinite]">
                    🦁
                </div>

                {/* メイン画面へ進むボタン */}
                <button
                    onClick={onContinue}
                    className="mt-10 px-8 py-3 text-lg font-bold text-gray-900 bg-yellow-400 rounded-full shadow-xl shadow-yellow-500/50 hover:bg-yellow-300 transition duration-300 transform hover:scale-105"
                >
                    エネルギーを受け取る
                </button>
            </div>
        </div>
    );
};

export default function LionsgatePage() {
    const router = useRouter();
    const { setShowLionsGateScreen } = useVirtue();

    const handleContinue = () => {
        setShowLionsGateScreen(false);
        router.push('/balance');
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <LionsGateSpecialScreen onContinue={handleContinue} />
        </div>
    );
}