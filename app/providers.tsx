'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadVirtueDataFromCookie, saveVirtueDataToCookie } from './utils/cookieStorage';

// --- 型定義 ---
type AppView = 'special' | 'balance' | 'graph' | 'accumulate' | 'lionsgate';
export interface VirtueAction {
    id: string;
    description: string;
    virtue: number;
    date: number; // タイムスタンプ
}

// ★日付と曜日をフォーマットするヘルパー関数 (2025/11/3(月) 形式)
export const formatVirtueDate = (timestamp: number): string => {
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

// 【テスト用】創立記念日判定ロジック
const isGrasshopperGateDay = (): boolean => {
    return true;
};

// 【テスト用】ライオンズゲート判定ロジック
const isLionsGateDay = (): boolean => {
    return true;
};

// Context for shared state
interface VirtueContextType {
    virtueBalance: number;
    accumulatedVirtues: VirtueAction[];
    showLionsGateScreen: boolean;
    showGrasshopperScreen: boolean;
    handleAddVirtue: (newAction: VirtueAction) => void;
    setShowLionsGateScreen: (show: boolean) => void;
    setShowGrasshopperScreen: (show: boolean) => void;
    formatVirtueDate: (timestamp: number) => string;
}

const VirtueContext = createContext<VirtueContextType | undefined>(undefined);

export const useVirtue = () => {
    const context = useContext(VirtueContext);
    if (!context) {
        throw new Error('useVirtue must be used within VirtueProvider');
    }
    return context;
};

export const VirtueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 常に true に設定
    const [showLionsGateScreen, setShowLionsGateScreen] = useState(isLionsGateDay());
    const [showGrasshopperScreen, setShowGrasshopperScreen] = useState(isGrasshopperGateDay());

    // 💰 徳残高と履歴を管理 - Cookieから読み込み、なければ初期値0
    const [virtueBalance, setVirtueBalance] = useState(0);
    const [accumulatedVirtues, setAccumulatedVirtues] = useState<VirtueAction[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 初回マウント時にCookieからデータを読み込む
    useEffect(() => {
        const savedData = loadVirtueDataFromCookie();
        if (savedData) {
            setVirtueBalance(savedData.balance);
            setAccumulatedVirtues(savedData.actions);
        }
        setIsInitialized(true);
    }, []);

    // データが変更されたらCookieに保存
    useEffect(() => {
        if (isInitialized) {
            saveVirtueDataToCookie({
                balance: virtueBalance,
                actions: accumulatedVirtues,
            });
        }
    }, [virtueBalance, accumulatedVirtues, isInitialized]);

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

    const value: VirtueContextType = {
        virtueBalance,
        accumulatedVirtues,
        showLionsGateScreen,
        showGrasshopperScreen,
        handleAddVirtue,
        setShowLionsGateScreen,
        setShowGrasshopperScreen,
        formatVirtueDate,
    };

    return (
        <VirtueContext.Provider value={value}>
            {children}
        </VirtueContext.Provider>
    );
};