import React from 'react';
import Link from 'next/link';

// --- 共通ナビゲーションコンポーネント ---
const Navigation: React.FC = () => {
    const navItems = [
        { href: '/balance', label: '残高' },
        { href: '/graph', label: 'グラフ' },
        { href: '/accumulate', label: '徳を積む' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gray-900 border-t border-green-700/50 shadow-2xl">
            <nav className="flex justify-around max-w-lg mx-auto">
                {navItems.map(({ href, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex flex-col items-center p-2 rounded-xl transition duration-200 text-gray-400 hover:text-green-300"
                    >
                        <span className="text-xl">{label === '残高' ? '💰' : label === 'グラフ' ? '📈' : '🙏'}</span>
                        <span className="text-xs mt-1 font-semibold">{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Navigation;