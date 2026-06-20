'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { TopUpModalProps } from './TopUpModal';

// TopUpModal renders thirdweb's BridgeWidget — a large swap/fiat-onramp surface.
// Load that chunk lazily, and only once the modal has actually been opened, so
// it never weighs on the seat / top-up render path until a user wants to fund.
const TopUpModal = dynamic(() => import('./TopUpModal'), { ssr: false });

/**
 * Drop-in replacement for TopUpModal that defers loading the heavy BridgeWidget
 * chunk until the first time it's opened. Stays mounted afterward so the modal's
 * close animation still plays.
 */
const LazyTopUpModal = (props: TopUpModalProps) => {
    const hasOpened = useRef(false);
    hasOpened.current ||= props.isOpen;

    if (!hasOpened.current) return null;
    return <TopUpModal {...props} />;
};

export default LazyTopUpModal;
