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
import { BridgeWidget, darkTheme, lightTheme } from 'thirdweb/react';
import { client, MAINNET_CHAIN, MAINNET_USDC_ADDRESS } from '@/app/thirdwebclient';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-fill amount in USDC for the Buy tab, e.g. "12.50". User can edit. */
    amountUsdc?: string;
    /** Fires after a successful purchase or swap. */
    onSuccess?: () => void;
}

// BridgeWidget gives users a tabbed surface: "Swap" lets them route any
// token on any chain into USDC on Base; "Buy" runs the fiat onramp
// (card / Apple Pay / Google Pay). One entry, both options.
//
// Both tabs target USDC on Base mainnet — thirdweb Bridge only routes
// through mainnets (testnet token lists come back empty and crash the
// widget), so this surface is hard-pinned regardless of which chain the
// rest of the app is on.
const TopUpModal: React.FC<TopUpModalProps> = ({
    isOpen,
    onClose,
    amountUsdc,
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
                    <BridgeWidget
                        client={client}
                        theme={theme}
                        currency="USD"
                        buy={{
                            chainId: MAINNET_CHAIN.id,
                            tokenAddress: MAINNET_USDC_ADDRESS,
                            amount: amountUsdc ?? '10',
                            buttonLabel: 'Buy USDC',
                            onSuccess: () => onSuccess?.(),
                        }}
                        swap={{
                            prefill: {
                                // Lock the buy side to USDC on Base; let the
                                // user pick whatever source token they hold.
                                buyToken: {
                                    chainId: MAINNET_CHAIN.id,
                                    tokenAddress: MAINNET_USDC_ADDRESS,
                                },
                            },
                            onSuccess: () => onSuccess?.(),
                        }}
                    />
                </Box>
            </ModalContent>
        </Modal>
    );
};

export default TopUpModal;
