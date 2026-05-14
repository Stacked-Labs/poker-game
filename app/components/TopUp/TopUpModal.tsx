'use client';

import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    Box,
    useColorMode,
} from '@chakra-ui/react';
import { BuyWidget, darkTheme, lightTheme } from 'thirdweb/react';
import type { Chain } from 'thirdweb';
import { client, defaultChain, defaultUsdcAddress } from '@/app/thirdwebclient';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-fill amount in USDC, e.g. "12.50". User can edit. */
    amountUsdc?: string;
    /** Override chain (defaults to defaultChain from thirdwebclient). */
    chain?: Chain;
    /** Override token (defaults to USDC on the chain). */
    tokenAddress?: string;
    /** Fires after a successful purchase. Caller typically refreshes balance. */
    onSuccess?: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({
    isOpen,
    onClose,
    amountUsdc,
    chain,
    tokenAddress,
    onSuccess,
}) => {
    const { colorMode } = useColorMode();
    const theme = colorMode === 'light' ? lightTheme() : darkTheme();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent bg="transparent" boxShadow="none" maxW="fit-content">
                <ModalCloseButton zIndex={2} />
                <Box display="flex" justifyContent="center">
                    <BuyWidget
                        client={client}
                        chain={chain ?? defaultChain}
                        tokenAddress={
                            (tokenAddress ?? defaultUsdcAddress) as `0x${string}`
                        }
                        amount={amountUsdc}
                        paymentMethods={['crypto', 'card']}
                        currency="USD"
                        theme={theme}
                        showThirdwebBranding={false}
                        onSuccess={() => {
                            onSuccess?.();
                        }}
                    />
                </Box>
            </ModalContent>
        </Modal>
    );
};

export default TopUpModal;
