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
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdWarning } from 'react-icons/md';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const POLL_INTERVAL_MS = 60_000;

export default function ServiceStatusBanner() {
    const [isDegraded, setIsDegraded] = useState(false);
    const [dismissed, setDismissed] = useState(false);

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
            <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
            <ModalContent
                bg="gray.900"
                border="1px solid"
                borderColor="orange.500"
                boxShadow="0 0 32px rgba(255, 140, 0, 0.3)"
                borderRadius="xl"
                mx={4}
            >
                <ModalCloseButton color="whiteAlpha.600" />
                <ModalHeader>
                    <VStack spacing={2} pt={2}>
                        <Icon
                            as={MdWarning}
                            boxSize={10}
                            color="orange.400"
                        />
                        <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="orange.300"
                            textAlign="center"
                        >
                            Service Disruption
                        </Text>
                    </VStack>
                </ModalHeader>
                <ModalBody pb={2}>
                    <Text
                        fontSize="sm"
                        color="whiteAlpha.800"
                        textAlign="center"
                        lineHeight={1.6}
                    >
                        Our wallet provider is experiencing issues. Wallet
                        connections and crypto transactions may be temporarily
                        affected.
                    </Text>
                    <Text
                        fontSize="xs"
                        color="whiteAlpha.500"
                        textAlign="center"
                        mt={3}
                    >
                        <Link
                            href="https://status.thirdweb.com"
                            isExternal
                            color="orange.300"
                            textDecoration="underline"
                        >
                            Check status
                        </Link>
                    </Text>
                </ModalBody>
                <ModalFooter justifyContent="center" pb={5}>
                    <Button
                        colorScheme="orange"
                        variant="outline"
                        size="sm"
                        onClick={() => setDismissed(true)}
                        borderRadius="full"
                    >
                        Got it
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
