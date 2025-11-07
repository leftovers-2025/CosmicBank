'use client';

import { useRouter } from 'next/navigation';
import { useVirtue } from './providers';
import { useEffect } from 'react';

export default function Page() {
    const router = useRouter();
    const { showLionsGateScreen, showGrasshopperScreen } = useVirtue();

    useEffect(() => {
        if (showLionsGateScreen) {
            router.push('/lionsgate');
        } else if (showGrasshopperScreen) {
            router.push('/special');
        } else {
            router.push('/balance');
        }
    }, [showLionsGateScreen, showGrasshopperScreen, router]);

    return null;
}