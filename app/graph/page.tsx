'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useVirtue } from '../providers';
import Navigation from '../components/Navigation';
import SimpleLineChart from '../components/SimpleLineChart';
import type { VirtueAction } from '../providers';

// --- 日ごとのデータ集計関数 ---
interface DailyData {
    label: string;
    value: number;
    date: Date;
}

/**
 * VirtueActionの配列から日ごとの累積データを生成
 */
function generateDailyData(actions: VirtueAction[], days: number = 30): DailyData[] {
    // 日付をキーにしてポイントを集計
    const dailyMap = new Map<string, number>();

    // actionsがある場合のみ集計
    actions.forEach(action => {
        const date = new Date(action.date);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const currentValue = dailyMap.get(dateKey) || 0;
        dailyMap.set(dateKey, currentValue + action.virtue);
    });

    // 過去N日分のデータを生成（データがない日は0として表示）
    const today = new Date();
    const dailyData: DailyData[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const value = dailyMap.get(dateKey) || 0;
        const label = `${date.getMonth() + 1}/${date.getDate()}`;

        dailyData.push({
            label,
            value,
            date,
        });
    }

    return dailyData;
}

// --- 3. 徳の推移グラフ画面コンポーネント ---
const VirtueGraphScreen: React.FC<{ currentVirtueBalance: number; actions: VirtueAction[] }> = ({
    currentVirtueBalance,
    actions
}) => {
    const chartRef = React.useRef<HTMLDivElement>(null);
    const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
    // 初期表示を 'week' に設定
    const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'year'>('week');

    // actionsから日ごとのデータを生成（メモ化）
    const dailyDataMap = useMemo(() => ({
        day: generateDailyData(actions, 7),      // 過去7日
        week: generateDailyData(actions, 7),     // 過去7日
        month: generateDailyData(actions, 30),   // 過去30日
        year: generateDailyData(actions, 365),   // 過去365日
    }), [actions]);

    const currentChartData = dailyDataMap[timeFrame];

    // timeFrameLabel の表示は変更なし
    const timeFrameLabel = timeFrame === 'day' ? '日次' :
                            timeFrame === 'week' ? '週次' :
                            timeFrame === 'month' ? '月次' : '年次';

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                const rect = chartRef.current.getBoundingClientRect();
                setChartSize({
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        const observer = new MutationObserver(handleResize);
        if (chartRef.current) {
            handleResize();
            observer.observe(chartRef.current, { attributes: true, childList: true, subtree: true });
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, []);

    const timeFrames = [
        { key: 'day', label: '日' },
        { key: 'week', label: '週' },
        { key: 'month', label: '月' },
        { key: 'year', label: '年' },
    ];

    return (
        <div className="flex flex-col h-full p-4 bg-gray-950 text-white font-sans overflow-y-auto pb-24">
            <h1 className="text-3xl font-bold mb-6 text-green-400 text-center mt-4">徳の推移グラフ</h1>

            {/* 期間フィルター */}
            <div className="flex justify-center mb-6 bg-gray-800 p-1 rounded-xl shadow-lg">
                {timeFrames.map((frame) => (
                    <button
                        key={frame.key}
                        onClick={() => setTimeFrame(frame.key as typeof timeFrame)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-200 ${
                            timeFrame === frame.key
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        {frame.label}
                    </button>
                ))}
            </div>

            {/* 合計残高表示 */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl shadow-green-500/10 mb-8 text-center border-b-4 border-green-600">
                <p className="text-xl text-gray-400 mb-1 tracking-widest">現在の総徳残高</p>
                <p className="text-6xl font-extrabold text-green-400 tracking-tighter animate-pulse-fast">
                    {currentVirtueBalance.toLocaleString()} <span className="text-3xl ml-2">徳</span>
                </p>
            </div>

            {/* グラフコンテナ */}
            <div
                ref={chartRef}
                className="w-full h-80 bg-gray-900 rounded-xl shadow-2xl mb-8 border border-green-700/50"
            >
                {chartSize.width > 0 && chartSize.height > 0 && (
                    <SimpleLineChart
                        data={currentChartData}
                        width={chartSize.width}
                        height={chartSize.height}
                    />
                )}
            </div>

            <p className="text-center text-sm text-gray-500 mt-2">
                📈 {timeFrameLabel}の徳の積立推移を示しています
            </p>
        </div>
    );
};

export default function GraphPage() {
    const { virtueBalance, accumulatedVirtues } = useVirtue();

    return (
        <div className="min-h-screen bg-gray-950">
            <VirtueGraphScreen currentVirtueBalance={virtueBalance} actions={accumulatedVirtues} />
            <Navigation />
        </div>
    );
}