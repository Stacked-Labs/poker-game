'use client';

import React, { useState } from 'react';
import { Button, type ButtonProps, useDisclosure } from '@chakra-ui/react';
import TopUpModal from './LazyTopUpModal';
import { useIsMiniApp } from '@/app/hooks/useIsMiniApp';
import { isTestnetOnly } from '@/app/thirdwebclient';

interface TopUpButtonProps extends Omit<ButtonProps, 'onClick'> {
    /** Optional pre-fill (USDC decimal string). Caller can omit to let user pick. */
    amountUsdc?: string;
    /** Label override (default "Top up"). */
    label?: string;
    onSuccess?: () => void;
}

const TopUpButton: React.FC<TopUpButtonProps> = ({
    amountUsdc,
    label = 'Top up',
    onSuccess,
    ...rest
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMiniApp = useIsMiniApp();
    const [refreshKey, setRefreshKey] = useState(0);

    // thirdweb Bridge only works on mainnet — hide on testnet-only deployments.
    if (isTestnetOnly) return null;

    // Inside a Mini App host (Coinbase Wallet, Farcaster), the host has its
    // own onramp. We hide ours so we don't nest a webview onramp inside one.
    if (isMiniApp) return null;

    return (
        <>
            <Button
                variant="solid"
                colorScheme="green"
                onClick={onOpen}
                {...rest}
            >
                {label}
            </Button>
            <TopUpModal
                key={refreshKey}
                isOpen={isOpen}
                onClose={onClose}
                amountUsdc={amountUsdc}
                onSuccess={() => {
                    onSuccess?.();
                    setRefreshKey((k) => k + 1);
                    onClose();
                }}
            />
        </>
    );
};

export default TopUpButton;
