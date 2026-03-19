'use client';

import {
    Button,
    Icon,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    HStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdWarning } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const POLL_INTERVAL_MS = 60_000;

export default function ServiceStatusBanner() {
    const [isDegraded, setIsDegraded] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const overlayBg = useColorModeValue('blackAlpha.400', 'blackAlpha.700');
    const iconColor = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const headerColor = useColorModeValue('brand.yellowDark', 'brand.yellow');
    const closeBtnHoverBg = useColorModeValue('brand.lightGray', 'charcoal.400');

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${API_URL}/api/status`, {
                    credentials: 'include',
                });
                if (!res.ok) return;
                const data = await res.json();
                const degraded = data.platform !== 'operational';
                setIsDegraded(degraded);
                // If service recovered, allow the popup to reappear next time.
                if (!degraded) setDismissed(false);
            } catch {
                // Fail silently — never show a false degradation popup.
            }
        };

        check();
        const interval = setInterval(check, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, []);

    return (
        <Modal
            isOpen={isDegraded && !dismissed}
            onClose={() => setDismissed(true)}
            isCentered
            size="sm"
        >
            <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
            <ModalContent
                bg="card.white"
                border="2px solid"
                borderColor="border.lightGray"
                boxShadow="0 16px 40px rgba(0, 0, 0, 0.18)"
                borderRadius="20px"
                mx={4}
                maxW="360px"
            >
                <ModalCloseButton
                    color="text.secondary"
                    size="md"
                    top="14px"
                    right="14px"
                    borderRadius="full"
                    _hover={{ bg: closeBtnHoverBg }}
                />
                <ModalHeader pb={0} px={6}>
                    <HStack spacing={3} pt={2}>
                        <Icon
                            as={MdWarning}
                            boxSize={6}
                            color={iconColor}
                        />
                        <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color={headerColor}
                            letterSpacing="-0.02em"
                        >
                            Service Disruption
                        </Text>
                    </HStack>
                </ModalHeader>
                <ModalBody py={2}>
                    <Text
                        fontSize="sm"
                        color="text.primary"
                        lineHeight={1.6}
                    >
                        <Text as="span" color="#A855F6" fontWeight="semibold">
                            Thirdweb
                        </Text>{' '}
                        is experiencing issues. Wallet connections and
                        transactions may be temporarily affected.
                    </Text>
                    <Text
                        fontSize="xs"
                        color="text.muted"
                        mt={3}
                    >
                        Follow updates on the{' '}
                        <Link
                            href="https://status.thirdweb.com"
                            isExternal
                            color="#A855F6"
                            textDecoration="underline"
                            _hover={{ opacity: 0.8 }}
                        >
                            thirdweb status page
                        </Link>
                        .
                    </Text>
                </ModalBody>
                <ModalFooter pt={3} pb={5} justifyContent="center">
                    <Button
                        onClick={() => setDismissed(true)}
                        size="md"
                        height="44px"
                        width="100%"
                        bg="brand.green"
                        color="white"
                        border="none"
                        borderRadius="12px"
                        fontWeight="bold"
                        _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow:
                                '0 10px 18px rgba(54, 163, 123, 0.22)',
                        }}
                        _active={{ transform: 'translateY(0)' }}
                        transition="all 0.2s ease"
                    >
                        Got it
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
