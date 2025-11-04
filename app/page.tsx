'use client';

import React, { useState, useEffect, useCallback } from 'react';

// --- 型定義 ---
type AppView = 'special' | 'balance' | 'graph' | 'accumulate' | 'lionsgate';
interface VirtueAction {
    id: string;
    description: string;
    virtue: number;
    date: number; // タイムスタンプ
}

// ★日付と曜日をフォーマットするヘルパー関数 (2025/11/3(月) 形式)
const formatVirtueDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

    // 目的の形式: 2025/11/3(月)
    return `${year}/${month}/${day}(${dayOfWeek})`;
};


// 5件のテスト用データ (過去2週間に分散)
const initialVirtues: VirtueAction[] = [
    {
        id: 'test-5',
        description: '会議で発言が少ない同僚に、意見を求め、発言しやすい雰囲気を作った。',
        virtue: 150,
        date: Date.now() - 3600000 * 2, // 2時間前 (本日)
    },
    {
        id: 'test-4',
        description: 'バスの中で席を譲り、相手の感謝の気持ちを受け取った。',
        virtue: 100,
        date: Date.now() - 3600000 * 24 * 4, // 4日前
    },
    {
        id: 'test-3',
        description: '公共の場で落ちていたゴミを拾い、適切な場所に捨てた。',
        virtue: 55,
        date: Date.now() - 3600000 * 24 * 7, // 7日前 (1週間前)
    },
    {
        id: 'test-2',
        description: 'チームメンバーのミスをカバーし、冷静に解決策を提示した。',
        virtue: 85,
        date: Date.now() - 3600000 * 24 * 10, // 10日前
    },
    {
        id: 'test-1',
        description: '近所の高齢者に代わって重い荷物を自宅まで運んだ。',
        virtue: 120,
        date: Date.now() - 3600000 * 24 * 13, // 13日前 (約2週間前)
    },
];

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

// 【テスト用】創立記念日判定ロジック
const isGrasshopperGateDay = (): boolean => {
    return true; 
};

// 【テスト用】ライオンズゲート判定ロジック
const isLionsGateDay = (): boolean => {
    return true; 
};

// --- 共通ナビゲーションコンポーネント (変更なし) ---
const Navigation: React.FC<{ currentView: AppView; setView: (view: AppView) => void }> = ({ currentView, setView }) => {
    const navItems = [
        { view: 'balance', label: '残高' },
        { view: 'graph', label: 'グラフ' },
        { view: 'accumulate', label: '徳を積む' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gray-900 border-t border-green-700/50 shadow-2xl">
            <nav className="flex justify-around max-w-lg mx-auto">
                {navItems.map(({ view, label }) => (
                    <button
                        key={view}
                        onClick={() => setView(view as AppView)}
                        className={`flex flex-col items-center p-2 rounded-xl transition duration-200 ${
                            currentView === view
                                ? 'text-green-400 bg-green-900/40 shadow-inner'
                                : 'text-gray-400 hover:text-green-300'
                        }`}
                    >
                        <span className="text-xl">{view === 'balance' ? '💰' : view === 'graph' ? '📈' : '🙏'}</span>
                        <span className="text-xs mt-1 font-semibold">{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

// --- SVGグラフコンポーネント (変更なし) ---
const SimpleLineChart: React.FC<{ data: { label: string, value: number }[], width: number, height: number }> = ({ data, width, height }) => {
    if (!data.length || width <= 0 || height <= 0) return null;

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const values = data.map(d => d.value);
    const minValue = Math.min(...values) * 0.9;
    const maxValue = Math.max(...values) * 1.1;
    const valueRange = maxValue - minValue;
    
    const normalizedData = data.map(d => ({
        ...d,
        normalizedY: (d.value - minValue) / (valueRange || 1),
    }));

    const xStep = chartWidth / (data.length - 1);

    const pathData = normalizedData.map((d, i) => {
        const x = padding + i * xStep;
        const y = padding + chartHeight * (1 - d.normalizedY);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* グラフ背景色 */}
            <rect x="0" y="0" width={width} height={height} fill="#1f2937" rx="10" />

            {/* Y軸目盛り (最大値、最小値) */}
            {[minValue, maxValue].map((value, i) => (
                <text
                    key={i}
                    x={padding / 2}
                    y={i === 0 ? height - padding : padding}
                    textAnchor="end"
                    fontSize="10"
                    fill="#4b5563"
                    dominantBaseline="middle"
                >
                    {Math.round(value).toLocaleString()}
                </text>
            ))}

            {/* 折れ線グラフ */}
            <path
                d={pathData}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* データポイントとX軸ラベル */}
            {normalizedData.map((d, i) => {
                const x = padding + i * xStep;
                const y = padding + chartHeight * (1 - d.normalizedY);
                return (
                    <React.Fragment key={d.label}>
                        <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#059669"
                            stroke="#ffffff"
                            strokeWidth="2"
                        />
                        {/* X軸ラベル: Y位置を調整し、下部に配置 */}
                        <text
                            x={x}
                            y={height - padding / 2} 
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6b7280"
                        >
                            {d.label}
                        </text>
                    </React.Fragment>
                );
            })}
        </svg>
    );
};


// --- 3. 徳の推移グラフ画面コンポーネント (変更なし) ---
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


// --- 2. 徳残高画面コンポーネント (変更なし) ---
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


// --- 4. 徳を積む画面コンポーネント ---
interface VirtueAccumulationProps {
    accumulatedVirtues: VirtueAction[];
    handleAddVirtue: (newAction: VirtueAction) => void;
}

const VirtueAccumulationScreen: React.FC<VirtueAccumulationProps> = ({ accumulatedVirtues, handleAddVirtue }) => {
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

    // 徳ポイントをランダムに決定する関数 (50〜300の範囲)
    const calculateVirtuePoints = (): number => {
        return Math.floor(Math.random() * (300 - 50 + 1)) + 50;
    };

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

            const newVirtue: VirtueAction = {
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
                    <div className="bg-green-800 p-8 rounded-xl shadow-2xl text-center border-4 border-yellow-400 transform scale-100 max-w-xs w-full">
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
                                {/* ★★★ 修正箇所: アスタリスクを削除し、font-boldを適用 ★★★ */}
                                <p className="text-xs font-bold text-gray-300 mt-1">
                                    {/* 日付と曜日のみの表示 (例: 2025/11/3(月)) */}
                                    {formatVirtueDate(action.date)}
                                </p>
                                {/* ★★★ 修正ここまで ★★★ */}
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


// --- 1. グラスホッパーゲート特別画面コンポーネント (変更なし) ---
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

// --- 5. ライオンズゲート特別画面コンポーネント (修正済み) ---
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


/**
 * メインのアプリケーションコンポーネント (Home.tsx)
 */
export default function Home() {
    // 常に true に設定
    const [showLionsGateScreen, setShowLionsGateScreen] = useState(isLionsGateDay());
    const [showGrasshopperScreen, setShowGrasshopperScreen] = useState(isGrasshopperGateDay());
    
    // ナビゲーションの状態管理
    const [currentView, setCurrentView] = useState<AppView>(
        isLionsGateDay() ? 'lionsgate' : (isGrasshopperGateDay() ? 'special' : 'balance')
    );
    
    // 💰 徳残高と履歴をHomeコンポーネントで管理
    // initialVirtues を使って初期残高を計算
    const initialVirtueBalance = 5000 + initialVirtues.reduce((sum, action) => sum + action.virtue, 0); 
    
    const [virtueBalance, setVirtueBalance] = useState(initialVirtueBalance); 
    // accumulatedVirtues の初期値にテストデータを設定
    const [accumulatedVirtues, setAccumulatedVirtues] = useState<VirtueAction[]>(initialVirtues);

    // 徳を積むアクションを追加する関数
    const handleAddVirtue = useCallback((newAction: VirtueAction) => {
        setAccumulatedVirtues(prev => [newAction, ...prev]);
        
        // ボーナス判定ロジック
        let points = newAction.virtue;
        if (isLionsGateDay()) {
            points *= 3; 
        } else if (isGrasshopperGateDay()) {
            points *= 2; 
        }

        setVirtueBalance(prev => prev + points);
    }, []); 

    // 画面遷移の連鎖ロジック
    const handleSpecialScreenContinue = () => {
        if (currentView === 'lionsgate') {
            setShowLionsGateScreen(false);
            if (showGrasshopperScreen) {
                setCurrentView('special'); 
                return;
            }
        }
        
        if (currentView === 'special') {
            setShowGrasshopperScreen(false);
        }

        setCurrentView('balance'); 
    };

    // 画面レンダリングの優先順位
    const renderContent = () => {
        if (showLionsGateScreen) {
            return <LionsGateSpecialScreen onContinue={handleSpecialScreenContinue} />;
        }
        if (showGrasshopperScreen) {
            return <GrasshopperGateSpecialScreen onContinue={handleSpecialScreenContinue} />;
        }
        
        if (currentView === 'balance') {
            return <VirtueBalanceScreen currentVirtueBalance={virtueBalance} />;
        }
        if (currentView === 'graph') {
            return <VirtueGraphScreen currentVirtueBalance={virtueBalance} />;
        }
        if (currentView === 'accumulate') {
            return (
                <VirtueAccumulationScreen 
                    accumulatedVirtues={accumulatedVirtues}
                    handleAddVirtue={handleAddVirtue}
                />
            );
        }
        return <VirtueBalanceScreen currentVirtueBalance={virtueBalance} />; // デフォルト
    };

    return (
        <div className="min-h-screen bg-gray-950">
            {/* メインコンテンツのレンダリング */}
            {renderContent()}

            {/* 特別画面でなければナビゲーションを表示 */}
            {currentView !== 'special' && currentView !== 'lionsgate' && (
                <Navigation currentView={currentView} setView={setCurrentView} />
            )}

            {/* Tailwindでカスタムアニメーションを定義 (Global Style) */}
            <style jsx global>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 0.9; }
                }
                @keyframes sparkle {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 1; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse-fast {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.03); opacity: 0.95; }
                }
                @keyframes hologram {
                    0%, 100% { text-shadow: 0 0 10px rgba(52,211,153,0.6); }
                    50% { text-shadow: 0 0 20px rgba(52,211,153,1), 0 0 30px rgba(52,211,153,0.8); }
                }
                /* ロケットアニメーション */
                @keyframes rocket-float {
                    0% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-10px) rotate(3deg); }
                    50% { transform: translateY(0) rotate(0deg); }
                    75% { transform: translateY(10px) rotate(-3deg); }
                    100% { transform: translateY(0) rotate(0deg); }
                }

                .animate-pulse-slow {
                    animation: pulse-slow 15s ease-in-out infinite;
                }
                .animate-sparkle {
                    animation: sparkle 3s infinite alternate ease-in-out;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
                .animate-pulse-fast {
                    animation: pulse-fast 1.5s infinite ease-in-out;
                }
                .animate-hologram {
                    animation: hologram 4s infinite alternate ease-in-out;
                }
                .animate-spin { 
                    animation: spin 1s linear infinite;
                }
                .animate-rocket {
                    animation: rocket-float 2s infinite ease-in-out;
                }
                
                /* スクロールバーのスタイルを宇宙テーマに合わせる */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #1f2937;
                }
                ::-webkit-scrollbar-thumb {
                    background: #065f46;
                    border-radius: 10px;
                    border: 2px solid #1f2937;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #047857;
                }
            `}</style>
        </div>
    );
}