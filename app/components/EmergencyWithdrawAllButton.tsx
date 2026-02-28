'use client';

import { useRef } from 'react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Spinner,
    Text,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react';
import { useEmergencyWithdrawAll } from '../hooks/useEmergencyWithdrawAll';

interface Props {
    contractAddress: string;
}

const EmergencyWithdrawAllButton = ({ contractAddress }: Props) => {
    const { trigger, status, error, reset } = useEmergencyWithdrawAll(contractAddress);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const shortAddress = `${contractAddress.slice(0, 6)}…${contractAddress.slice(-4)}`;

    const handleConfirm = () => {
        onClose();
        if (status === 'error') reset();
        trigger();
    };

    if (status === 'success') {
        return (
            <Box as="span" fontSize="xs" fontWeight="bold" color="brand.green">
                Done
            </Box>
        );
    }

    return (
        <>
            <Tooltip
                label={error ?? 'Call emergencyWithdrawAll() on this table contract'}
                hasArrow
                placement="left"
            >
                <Box
                    as="button"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    cursor={status === 'pending' ? 'not-allowed' : 'pointer'}
                    bg="brand.pink"
                    color="white"
                    opacity={status === 'pending' ? 0.6 : 1}
                    transition="opacity 0.15s"
                    _hover={{ opacity: status === 'pending' ? 0.6 : 0.85 }}
                    onClick={() => {
                        if (status === 'pending') return;
                        onOpen();
                    }}
                    display="inline-flex"
                    alignItems="center"
                    gap={1.5}
                >
                    {status === 'pending' && <Spinner size="xs" />}
                    {status === 'error' ? 'Retry' : 'Emergency Withdraw All'}
                </Box>
            </Tooltip>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay />
                <AlertDialogContent bg="card.dark" borderColor="border.lightGray" borderWidth={1}>
                    <AlertDialogHeader fontSize="md" fontWeight="bold" color="text.primary">
                        Emergency Withdraw All
                    </AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        <Text fontSize="sm" color="text.secondary" mb={2}>
                            This will call <Text as="span" fontWeight="bold" color="text.primary">emergencyWithdrawAll()</Text> on:
                        </Text>
                        <Text fontSize="xs" fontFamily="mono" color="brand.pink" mb={3}>
                            {shortAddress}
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                            All players will be force-withdrawn from the contract immediately. This action is <Text as="span" fontWeight="bold" color="brand.pink">irreversible</Text>.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter gap={2}>
                        <Button ref={cancelRef} onClick={onClose} size="sm" variant="ghost">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            size="sm"
                            bg="brand.pink"
                            color="white"
                            _hover={{ opacity: 0.85 }}
                        >
                            Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default EmergencyWithdrawAllButton;
