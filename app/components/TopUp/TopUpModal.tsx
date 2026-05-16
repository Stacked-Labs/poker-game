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
    /**
     * What the user is buying. `'usdc'` (default) prefills the BridgeWidget
     * for USDC on Base — the buy-in flow. `'gas'` prefills it for native ETH
     * on Base — the gas top-up flow used by the state-aware CTA in
     * TakeSeatModal when an external EOA has USDC but no ETH.
     */
    mode?: 'usdc' | 'gas';
    /** Pre-fill amount for the Buy tab when mode === 'usdc' (e.g. "12.50"). */
    amountUsdc?: string;
    /** Pre-fill amount for the Buy tab when mode === 'gas' (ETH decimal string). Default ~$0.50 worth. */
    amountEth?: string;
    /** Fires after a successful purchase or swap. */
    onSuccess?: () => void;
}

// Default ETH prefill ≈ $0.25 at ~$4000/ETH. Fiat onramps will bump up to
// their per-tx minimum; the Swap tab can route smaller amounts as-is.
const DEFAULT_GAS_ETH_AMOUNT = '0.0000625';

// BridgeWidget gives users a tabbed surface: "Swap" lets them route any
// token on any chain into the target token; "Buy" runs the fiat onramp
// (card / Apple Pay / Google Pay). One entry, both options.
//
// Both tabs are pinned to Base mainnet — thirdweb Bridge only routes
// through mainnets (testnet token lists come back empty and crash the
// widget), so this surface is hard-pinned regardless of which chain the
// rest of the app is on.
const TopUpModal: React.FC<TopUpModalProps> = ({
    isOpen,
    onClose,
    mode = 'usdc',
    amountUsdc,
    amountEth,
    onSuccess,
}) => {
    const { colorMode } = useColorMode();
    const theme = colorMode === 'light' ? lightTheme() : darkTheme();

    // BridgeWidget treats `tokenAddress: undefined` as the native token.
    // For USDC we pin the contract address; for gas we leave it undefined.
    const isGas = mode === 'gas';
    const tokenAddress = isGas ? undefined : MAINNET_USDC_ADDRESS;
    const amount = isGas
        ? (amountEth ?? DEFAULT_GAS_ETH_AMOUNT)
        : (amountUsdc ?? '10');
    const buttonLabel = isGas ? 'Buy ETH for gas' : 'Buy USDC';

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
                            tokenAddress,
                            amount,
                            buttonLabel,
                            onSuccess: () => onSuccess?.(),
                        }}
                        swap={{
                            prefill: {
                                buyToken: {
                                    chainId: MAINNET_CHAIN.id,
                                    tokenAddress,
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
