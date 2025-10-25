import { PendingPlayer } from '@/app/interfaces';
import {
    Flex,
    Box,
    Button,
    Text,
    Tooltip,
    VStack,
    Badge,
} from '@chakra-ui/react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { GiBootKick } from 'react-icons/gi';

const PlayerCard = ({
    index,
    player,
    isOwner,
    type,
    isKicking,
    handleAcceptPlayer,
    handleDenyPlayer,
    confirmKick,
}: {
    index: number;
    player: PendingPlayer;
    isOwner: boolean;
    type: 'accepted' | 'pending';
    isKicking: boolean | null;
    handleAcceptPlayer?: ((uuid: string) => void) | null;
    handleDenyPlayer?: ((uuid: string) => void) | null;
    confirmKick?: ((player: PendingPlayer) => void) | null;
}) => {
    return (
        <Flex
            key={index}
            alignItems={'center'}
            justifyContent={'space-between'}
            width={'100%'}
            bg="white"
            borderRadius="16px"
            border="2px solid"
            borderColor="brand.lightGray"
            paddingX={{ base: 4, sm: 5, md: 6 }}
            paddingY={{ base: 4, md: 5 }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
            _hover={{
                borderColor: 'brand.green',
                boxShadow: '0 8px 20px rgba(54, 163, 123, 0.15)',
                transform: 'translateY(-4px)',
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            flexDirection={{ base: 'column', sm: 'row' }}
            gap={{ base: 3, sm: 0 }}
        >
            <VStack
                flex={1}
                justifyContent={{ base: 'center', lg: 'space-around' }}
                alignItems={'start'}
                textAlign={'left'}
                gap={{ base: 2, md: 3 }}
                w={{ base: '100%', sm: 'auto' }}
            >
                <Text
                    color={'brand.navy'}
                    fontWeight={'bold'}
                    fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
                    letterSpacing="-0.02em"
                >
                    {player.username}
                </Text>
                <Flex
                    gap={{ base: 2, md: 3 }}
                    flex={2}
                    direction={{
                        base: 'column',
                        md: 'row',
                    }}
                    flexWrap="wrap"
                    w="100%"
                    alignItems="center"
                >
                    <Badge
                        bg="brand.lightGray"
                        color="brand.navy"
                        paddingY={1.5}
                        paddingX={3}
                        borderRadius="8px"
                        fontSize="xs"
                        fontWeight="semibold"
                    >
                        ID: {player.uuid.substring(0, 8)}
                    </Badge>
                    <Flex gap={3} flexWrap="wrap">
                        <Text
                            color={'gray.600'}
                            fontSize="sm"
                            fontWeight="medium"
                        >
                            Buy-in:{' '}
                            <Text
                                as={'span'}
                                fontWeight={'bold'}
                                color="brand.green"
                            >
                                ${player.buyIn}
                            </Text>
                        </Text>
                        <Text
                            color={'gray.600'}
                            fontSize="sm"
                            fontWeight="medium"
                        >
                            Seat:{' '}
                            <Text
                                as={'span'}
                                fontWeight={'bold'}
                                color="brand.green"
                            >
                                #{player.seatId}
                            </Text>
                        </Text>
                    </Flex>
                </Flex>
            </VStack>

            {isOwner &&
                type == 'pending' &&
                handleAcceptPlayer &&
                handleDenyPlayer && (
                    <Flex
                        gap={{ base: 2, lg: 3 }}
                        w={{ base: '100%', sm: 'auto' }}
                        justifyContent={{ base: 'flex-end', sm: 'flex-start' }}
                    >
                        <Tooltip
                            label="Accept Player"
                            placement="top"
                            bg="brand.navy"
                            color="white"
                            borderRadius="md"
                        >
                            <Button
                                size={{ base: 'sm', md: 'md' }}
                                bg={'brand.green'}
                                color="white"
                                _hover={{
                                    bg: 'brand.green',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 8px 16px rgba(54, 163, 123, 0.3)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                onClick={() => handleAcceptPlayer(player.uuid)}
                                minW={{ base: '48px', md: '52px' }}
                                h={{ base: '48px', md: '52px' }}
                                borderRadius="12px"
                                border="none"
                                transition="all 0.2s ease"
                            >
                                <FaCircleCheck size={22} />
                            </Button>
                        </Tooltip>
                        <Tooltip
                            label="Deny Player"
                            placement="top"
                            bg="brand.navy"
                            color="white"
                            borderRadius="md"
                        >
                            <Button
                                size={{ base: 'sm', md: 'md' }}
                                bg={'brand.pink'}
                                color="white"
                                _hover={{
                                    bg: 'brand.pink',
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                        '0 8px 16px rgba(235, 11, 92, 0.3)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                onClick={() => handleDenyPlayer(player.uuid)}
                                minW={{ base: '48px', md: '52px' }}
                                h={{ base: '48px', md: '52px' }}
                                borderRadius="12px"
                                border="none"
                                transition="all 0.2s ease"
                            >
                                <FaCircleXmark size={22} />
                            </Button>
                        </Tooltip>
                    </Flex>
                )}

            {isOwner &&
                type == 'accepted' &&
                isKicking !== null &&
                confirmKick && (
                    <Tooltip
                        label="Kick Player"
                        placement="top"
                        bg="brand.navy"
                        color="white"
                        borderRadius="md"
                    >
                        <Button
                            size={{ base: 'sm', md: 'md' }}
                            bg={'brand.pink'}
                            color="white"
                            _hover={{
                                bg: 'brand.pink',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 16px rgba(235, 11, 92, 0.3)',
                            }}
                            _active={{ transform: 'translateY(0)' }}
                            onClick={() => confirmKick(player)}
                            isLoading={isKicking}
                            loadingText="Kicking..."
                            minW={{ base: '48px', md: '52px' }}
                            h={{ base: '48px', md: '52px' }}
                            borderRadius="12px"
                            border="none"
                            transition="all 0.2s ease"
                        >
                            <GiBootKick size={22} />
                        </Button>
                    </Tooltip>
                )}
        </Flex>
    );
};

export default PlayerCard;
