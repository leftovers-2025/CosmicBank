'use client';

import React, { useState, useEffect } from 'react';
import { useVirtue } from '../providers';
import Navigation from '../components/Navigation';
import SimpleLineChart from '../components/SimpleLineChart';

// --- ダミーデータ (グラフ用) ---
const testVirtueData = {
    // 期間: 日 (day) - 3時間ごとの過去24時間
    day: [
        { label: '00:00', value: 50 },
        { label: '03:00', value: 55 },
        { label: '06:00', value: 80 },
        { label: '09:00', value: 120 },
        { label: '12:00', value: 150 },
        { label: '15:00', value: 130 },
        { label: '18:00', value: 250 },
        { label: '21:00', value: 300 },
    ],
    // 期間: 週 (week) - 7日間の推移
    week: [
        { label: '月', value: 1500 },
        { label: '火', value: 1800 },
        { label: '水', value: 1750 },
        { label: '木', value: 2200 },
        { label: '金', value: 2500 },
        { label: '土', value: 3500 },
        { label: '日', value: 3800 },
    ],
    // 期間: 月 (month) - 12ヶ月の推移
    month: [
        { label: '1月', value: 6000 },
        { label: '2月', value: 5500 },
        { label: '3月', value: 7000 },
        { label: '4月', value: 6800 },
        { label: '5月', value: 8200 },
        { label: '6月', value: 8500 },
        { label: '7月', value: 9000 },
        { label: '8月', value: 10500 },
        { label: '9月', value: 9500 },
        { label: '10月', value: 11000 },
        { label: '11月', value: 12500 },
        { label: '12月', value: 13000 },
    ],
    // 期間: 年 (year) - 5年間の推移
    year: [
        { label: '2021年', value: 10000 },
        { label: '2022年', value: 18000 },
        { label: '2023年', value: 32000 },
        { label: '2024年', value: 50000 },
        { label: '2025年', value: 75000 },
    ]
};

// --- 3. 徳の推移グラフ画面コンポーネント ---
const VirtueGraphScreen: React.FC<{ currentVirtueBalance: number }> = ({ currentVirtueBalance }) => {
    const chartRef = React.useRef<HTMLDivElement>(null);
    const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
    // 初期表示を 'week' に設定
    const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'year'>('week');

    const currentChartData = testVirtueData[timeFrame as keyof typeof testVirtueData];

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
    const { virtueBalance } = useVirtue();

    return (
        <div className="min-h-screen bg-gray-950">
            <VirtueGraphScreen currentVirtueBalance={virtueBalance} />
            <Navigation />
        </div>
    );
}