'use client';

import React, { useState, useCallback } from 'react';
import { useVirtue } from '../providers';
import Navigation from '../components/Navigation';

// 徳ポイントをランダムに決定する関数 (50〜300の範囲)
const calculateVirtuePoints = (): number => {
    return Math.floor(Math.random() * (300 - 50 + 1)) + 50;
};

// --- 4. 徳を積む画面コンポーネント ---
const VirtueAccumulationScreen: React.FC<{
    accumulatedVirtues: any[];
    handleAddVirtue: (newAction: any) => void;
    formatVirtueDate: (timestamp: number) => string;
}> = ({ accumulatedVirtues, handleAddVirtue, formatVirtueDate }) => {
    // ユーザーの入力テキストを保持する状態
    const [newActionText, setNewActionText] = useState('');
    // 処理中と結果の状態管理
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastVirtuePoints, setLastVirtuePoints] = useState<number | null>(null);


    // 現在の日付の0時0分0秒のタイムスタンプを取得
    const getStartOfToday = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now.getTime();
    };

    // 本日積まれた徳の合計を計算
    const totalVirtueToday = accumulatedVirtues
        .filter(action => action.date >= getStartOfToday())
        .reduce((sum, action) => sum + action.virtue, 0);

    // 徳を積むアクションを追加するハンドラ
    const handleSubmitVirtue = useCallback(() => {
        if (!newActionText.trim() || isProcessing) return;

        // 1. 処理を開始し、ポップアップを表示
        setIsProcessing(true);
        setLastVirtuePoints(null); // 結果をリセット

        const actionText = newActionText.trim();
        setNewActionText(''); // 入力フィールドを先にクリア

        // 2. 1.5秒後に判定と結果表示を行う
        setTimeout(() => {
            const virtuePoints = calculateVirtuePoints();

            const newVirtue = {
                id: crypto.randomUUID(),
                description: actionText,
                virtue: virtuePoints,
                date: Date.now(),
            };

            // 3. 親コンポーネントの更新関数を呼び出し、残高と履歴を更新
            handleAddVirtue(newVirtue);

            // 4. 結果をセットし、処理を終了
            setLastVirtuePoints(virtuePoints); // 結果ポップアップ用に保存
            setIsProcessing(false); // 交信完了

            // 5. 結果ポップアップを5秒後に非表示にする
            setTimeout(() => {
                setLastVirtuePoints(null);
            }, 5000); // 5000ms に設定

        }, 1500); // 1.5秒間の交信時間
    }, [newActionText, isProcessing, handleAddVirtue]);

    return (
        <div className="flex flex-col h-full p-4 bg-gray-950 text-white font-sans overflow-y-auto pb-24">
            {/* 1. ポップアップのレンダリング */}

            {/* 宇宙と交信中ポップアップ (isProcessing) */}
            {isProcessing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border-2 border-green-500 max-w-xs w-full">
                        <div className="text-6xl mb-4 text-green-400 animate-rocket">
                            🚀
                        </div>
                        <h3 className="text-2xl font-bold text-green-300">
                            宇宙と交信中...
                        </h3>
                        <p className="text-gray-400 mt-2">徳ポイントを判定しています</p>
                    </div>
                </div>
            )}

            {/* 結果表示ポップアップ (lastVirtuePoints) */}
            {lastVirtuePoints !== null && !isProcessing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none">
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center border-4 border-yellow-400 transform scale-100 max-w-xs w-full">
                        <div className="text-7xl mb-4">
                            ✨
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                            徳が積まれました！
                        </h3>
                        <p className="text-5xl font-extrabold text-yellow-300">
                            +{lastVirtuePoints} 徳
                        </p>
                        <p className="text-sm text-green-200 mt-4">
                            （5秒後に自動で閉じます）
                        </p>
                    </div>
                </div>
            )}

            {/* 2. 通常の画面コンテンツ */}
            <h1 className="text-3xl font-bold mb-6 text-green-400 text-center mt-4">徳を積む（行動の記録）</h1>

            {/* 徳を積む入力エリア */}
            <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-lg border border-green-700/50 max-w-xl w-full mx-auto">
                <h2 className="text-xl font-semibold text-green-300 mb-3">🙏 徳を積む行動を記録</h2>
                <textarea
                    placeholder="今日、誰かを喜ばせた行動を具体的に入力してください。例: お隣さんの重い荷物運びを手伝った。"
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    className="w-full p-3 mb-3 h-20 bg-gray-900 text-white rounded-lg border border-gray-700 focus:ring-green-500 focus:border-green-500 resize-none"
                    disabled={isProcessing}
                />
                <button
                    onClick={handleSubmitVirtue}
                    disabled={!newActionText.trim() || isProcessing}
                    className={`w-full py-3 font-bold rounded-lg transition duration-200 shadow-md ${
                        newActionText.trim() && !isProcessing
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isProcessing ? '交信中...' : '徳を積む！ (自動判定)'}
                </button>
            </div>


            {/* 本日の徳合計 */}
            <div className="bg-green-900/40 p-4 rounded-xl shadow-inner border-l-4 border-green-500 mb-6 max-w-xl w-full mx-auto">
                <p className="text-xl font-semibold text-green-300">本日積まれた徳の合計: {totalVirtueToday.toLocaleString()} 徳</p>
                <p className="text-sm text-green-200 mt-1">日々の努力が宇宙を巡る光となります。</p>
            </div>

            {/* 徳の積立履歴 */}
            <h2 className="text-2xl font-bold mb-4 text-gray-300 max-w-xl w-full mx-auto">最近の徳積み履歴</h2>
            <div className="space-y-3 max-w-xl w-full mx-auto">
                {accumulatedVirtues.length > 0 ? (
                    // 履歴を逆順に表示して最新のものを上にする
                    accumulatedVirtues.map((action) => (
                        <div
                            key={action.id}
                            className="flex items-center justify-between p-4 bg-gray-800 rounded-xl shadow-md border-l-4 border-yellow-500"
                        >
                            <div className="flex flex-col">
                                <p className="font-medium text-gray-100">{action.description}</p>
                                {/* 日付と曜日のみの表示 (例: 2025/11/3(月)) */}
                                <p className="text-xs font-bold text-gray-300 mt-1">
                                    {formatVirtueDate(action.date)}
                                </p>
                            </div>
                            <span className="text-lg font-bold text-yellow-400 flex-shrink-0 ml-4">
                                +{action.virtue} 徳
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-6 text-gray-500 bg-gray-800 rounded-xl">
                        <p>まだ徳が積まれていません。最初の行動を記録しましょう！</p>
                    </div>
                )}
            </div>

            <p className="text-center text-gray-500 text-sm mt-8">
                あなたの善行が記録され、徳ポイントに変換されます。
            </p>
        </div>
    );
};

export default function AccumulatePage() {
    const { accumulatedVirtues, handleAddVirtue, formatVirtueDate } = useVirtue();

    return (
        <div className="min-h-screen bg-gray-950">
            <VirtueAccumulationScreen
                accumulatedVirtues={accumulatedVirtues}
                handleAddVirtue={handleAddVirtue}
                formatVirtueDate={formatVirtueDate}
            />
            <Navigation />
        </div>
    );
}