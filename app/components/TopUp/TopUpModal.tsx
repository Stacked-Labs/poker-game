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
import { client, MAINNET_CHAIN, MAINNET_USDC_ADDRESS } from '@/app/thirdwebclient';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-fill amount in USDC, e.g. "12.50". User can edit. */
    amountUsdc?: string;
    /** Fires after a successful purchase. */
    onSuccess?: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, amountUsdc, onSuccess }) => {
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
                        chain={MAINNET_CHAIN}
                        tokenAddress={MAINNET_USDC_ADDRESS as `0x${string}`}
                        amount={amountUsdc ?? '10'}
                        theme={theme}
                        onSuccess={onSuccess}
                    />
                </Box>
            </ModalContent>
        </Modal>
    );
};

export default TopUpModal;
