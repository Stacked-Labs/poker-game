'use client';

import { useContext, useState } from 'react';
import {
    IconButton,
    Icon,
    Tooltip,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    VStack,
    HStack,
    Text,
    NumberInput,
    NumberInputField,
    Button,
} from '@chakra-ui/react';
import { FiEdit3 } from 'react-icons/fi';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { sendUpdateBlinds } from '@/app/hooks/server_actions';

const EditBlindsButton = () => {
    const { appState } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const config = appState.game?.config;
    const pendingBlinds = appState.game?.pendingBlinds;

    const [sb, setSb] = useState<number>(config?.sb ?? 5);
    const [bb, setBb] = useState<number>(config?.bb ?? 10);
    const [isOpen, setIsOpen] = useState(false);

    const hasPending = !!pendingBlinds;

    const handleOpen = () => {
        setSb(config?.sb ?? 5);
        setBb(config?.bb ?? 10);
        setIsOpen(true);
    };

    const handleSubmit = () => {
        if (!socket || sb <= 0 || bb < sb * 2) return;
        sendUpdateBlinds(socket, sb, bb);
        setIsOpen(false);
    };

    const handleCancel = () => {
        // Send current blinds to clear the pending update
        if (!socket || !config) return;
        sendUpdateBlinds(socket, config.sb, config.bb);
        setIsOpen(false);
    };

    const isValid = sb > 0 && bb >= sb * 2;
    const isChanged = config && (sb !== config.sb || bb !== config.bb);

    return (
        <Popover
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            placement="bottom"
        >
            <PopoverTrigger>
                <Tooltip
                    label={hasPending ? `Pending: ${pendingBlinds.sb}/${pendingBlinds.bb}` : 'Edit Blinds'}
                    aria-label="Edit blinds tooltip"
                >
                    <IconButton
                        icon={<Icon as={FiEdit3} boxSize={{ base: 4, md: 5 }} />}
                        aria-label="Edit Blinds"
                        size={{ base: 'md', md: 'md' }}
                        px={2}
                        py={2}
                        width={{ base: '40px', sm: '40px', md: '48px' }}
                        height={{ base: '40px', sm: '40px', md: '48px' }}
                        onClick={handleOpen}
                        bg={hasPending ? 'orange.400' : 'brand.navy'}
                        color="white"
                        border="none"
                        borderRadius="12px"
                        _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: hasPending
                                ? '0 4px 12px rgba(237, 137, 54, 0.4)'
                                : '0 4px 12px rgba(51, 68, 121, 0.3)',
                        }}
                        transition="all 0.2s ease"
                    />
                </Tooltip>
            </PopoverTrigger>
            <PopoverContent
                bg="brand.darkNavy"
                borderColor="brand.navy"
                borderRadius="12px"
                w="220px"
            >
                <PopoverArrow bg="brand.darkNavy" />
                <PopoverBody p={4}>
                    <VStack spacing={3} align="stretch">
                        <Text color="white" fontSize="sm" fontWeight="bold">
                            Update Blinds
                        </Text>
                        <HStack spacing={2}>
                            <VStack spacing={1} flex={1}>
                                <Text color="text.secondary" fontSize="xs">
                                    SB
                                </Text>
                                <NumberInput
                                    value={sb}
                                    onChange={(_, val) => setSb(val || 0)}
                                    min={1}
                                    size="sm"
                                >
                                    <NumberInputField
                                        bg="brand.navy"
                                        color="white"
                                        border="none"
                                        borderRadius="8px"
                                        textAlign="center"
                                    />
                                </NumberInput>
                            </VStack>
                            <Text color="text.secondary" pt={5}>/</Text>
                            <VStack spacing={1} flex={1}>
                                <Text color="text.secondary" fontSize="xs">
                                    BB
                                </Text>
                                <NumberInput
                                    value={bb}
                                    onChange={(_, val) => setBb(val || 0)}
                                    min={sb * 2}
                                    size="sm"
                                >
                                    <NumberInputField
                                        bg="brand.navy"
                                        color="white"
                                        border="none"
                                        borderRadius="8px"
                                        textAlign="center"
                                    />
                                </NumberInput>
                            </VStack>
                        </HStack>
                        {!isValid && (
                            <Text color="red.300" fontSize="xs">
                                BB must be at least 2x SB
                            </Text>
                        )}
                        <HStack spacing={2}>
                            <Button
                                size="sm"
                                flex={1}
                                bg="brand.green"
                                color="white"
                                _hover={{ opacity: 0.9 }}
                                onClick={handleSubmit}
                                isDisabled={!isValid || !isChanged}
                            >
                                Queue
                            </Button>
                            {hasPending && (
                                <Button
                                    size="sm"
                                    flex={1}
                                    bg="red.500"
                                    color="white"
                                    _hover={{ opacity: 0.9 }}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            )}
                        </HStack>
                        <Text color="text.secondary" fontSize="xs" textAlign="center">
                            Takes effect next hand
                        </Text>
                    </VStack>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default EditBlindsButton;
