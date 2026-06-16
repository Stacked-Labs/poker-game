'use client';

import { useContext, useEffect, useRef } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { setSuperProps } from '@/app/utils/analytics';

export function TableSuperProps() {
    const { appState } = useContext(AppContext);
    const cryptoFlag = appState.game?.config?.crypto;
    const lastMode = useRef<'free' | 'real' | null>(null);

    useEffect(() => {
        if (cryptoFlag === undefined) return;
        const mode = cryptoFlag ? 'real' : 'free';
        if (lastMode.current === mode) return;
        setSuperProps({ mode });
        lastMode.current = mode;
    }, [cryptoFlag]);

    return null;
}
