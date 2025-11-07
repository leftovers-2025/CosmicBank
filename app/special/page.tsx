'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useVirtue } from '../providers';

// --- 1. グラスホッパーゲート特別画面コンポーネント ---
const GrasshopperGateSpecialScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
    return (
        // アニメーションクラスを削除
        <div className="absolute inset-0 flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 opacity-70">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-green-900 to-black mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-green-300 shadow-[0_0_20px_#4ade80,0_0_40px_#10b981] animate-sparkle delay-500"></div>
                <div className="absolute bottom-1/3 right-1/5 w-3 h-3 rounded-full bg-purple-300 shadow-[0_0_15px_#a78bfa,0_0_30px_#8b5cf6] animate-sparkle delay-1000"></div>
                <div className="absolute top-1/5 right-1/12 w-5 h-5 rounded-full bg-yellow-200 shadow-[0_0_25px_#facc15,0_0_50px_#eab308] animate-sparkle delay-200"></div>
            </div>

            <div className="z-10 text-center p-8 mx-4 bg-black/40 backdrop-blur-sm rounded-3xl shadow-2xl shadow-green-500/50 border border-green-700/50 max-w-xl w-full">

                <div className="mb-4 text-7xl font-extrabold tracking-widest text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] leading-none">
                    KIC
                </div>
                <a
                    href="https://www.kobedenshi.ac.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm italic text-gray-400 hover:text-green-300 transition block mb-8 underline underline-offset-2"
                >
                    - 学校公式サイトへ -
                </a>

                <h1 className="text-4xl md:text-5xl font-extrabold text-green-300 mb-4 tracking-wider">
                    創立記念！<br/>グラスホッパーゲートが<br className="sm:hidden"/>開かれました！
                </h1>
                <p className="text-lg text-gray-300 mb-6 max-w-md mx-auto">
                    宇宙のエネルギーと学校の理念が共鳴する特別な日です。この日限定の徳積みチャンスがあなたを待っています。
                </p>

                {/* 徳積みボーナスエリア */}
                <div className="mt-6 p-4 bg-green-900/40 rounded-xl border border-green-600/50">
                    <p className="font-semibold text-xl text-green-200">✨ 特別徳積みボーナス: 200% アップ ✨</p>
                </div>

                {/* バッタのイメージを込めたアイコン (SVGを代用) */}
                <div className="mt-8 text-5xl text-green-500 animate-bounce-slow">
                    🦗
                </div>

                {/* メイン画面へ進むボタン */}
                <button
                    onClick={onContinue}
                    className="mt-10 px-8 py-3 text-lg font-bold text-gray-900 bg-green-400 rounded-full shadow-lg hover:bg-green-300 transition duration-300 transform hover:scale-105"
                >
                    メイン画面へ進む
                </button>
            </div>
        </div>
    );
};

export default function SpecialPage() {
    const router = useRouter();
    const { setShowGrasshopperScreen } = useVirtue();

    const handleContinue = () => {
        setShowGrasshopperScreen(false);
        router.push('/balance');
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <GrasshopperGateSpecialScreen onContinue={handleContinue} />
        </div>
    );
}