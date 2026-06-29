'use client';

/**
 * Buy / Bridge widgets for the account menu, isolated in their own module so
 * the (heavy) thirdweb Bridge UI is code-split and only fetched when a player
 * actually opens Add funds or Bridge. Rendered inside a transparent Chakra
 * modal; each widget brings its own card surface and theme.
 */

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    useColorMode,
} from '@chakra-ui/react';
import { BuyWidget, BridgeWidget } from 'thirdweb/react';
import { client, defaultChain, defaultUsdcAddress } from '@/app/thirdwebclient';

export type FundsMode = 'buy' | 'bridge';

export function FundsModal({
    isOpen,
    onClose,
    mode,
}: {
    isOpen: boolean;
    onClose: () => void;
    mode: FundsMode;
}) {
    const { colorMode } = useColorMode();
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay backdropFilter="blur(6px)" />
            <ModalContent bg="transparent" boxShadow="none" maxW="fit-content" m="auto">
                <ModalCloseButton
                    color="white"
                    bg="blackAlpha.600"
                    borderRadius="full"
                    top="-44px"
                    right="0"
                    _hover={{ bg: 'blackAlpha.700' }}
                    zIndex={2}
                />
                {mode === 'buy' ? (
                    <BuyWidget
                        client={client}
                        theme={colorMode}
                        chain={defaultChain}
                        tokenAddress={defaultUsdcAddress as `0x${string}`}
                        onSuccess={onClose}
                    />
                ) : (
                    <BridgeWidget client={client} theme={colorMode} />
                )}
            </ModalContent>
        </Modal>
    );
}
