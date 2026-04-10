import { PendingPlayer } from '@/app/interfaces';
import { Flex, Button, Text, Tooltip, VStack, Badge } from '@chakra-ui/react';
import { FaCircleCheck, FaCircleXmark, FaXTwitter } from 'react-icons/fa6';
import { GiBootKick } from 'react-icons/gi';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import { useContext } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const PlayerCard = ({
    index,
    player,
    isOwner,
    isCurrentUser = false,
    type,
    isKicking,
    handleAcceptPlayer,
    handleDenyPlayer,
    confirmKick,
}: {
    index: number;
    player: PendingPlayer;
    isOwner: boolean;
    isCurrentUser?: boolean;
    type: 'accepted' | 'pending';
    isKicking: boolean | null;
    handleAcceptPlayer?: ((uuid: string) => void) | null;
    handleDenyPlayer?: ((uuid: string) => void) | null;
    confirmKick?: ((player: PendingPlayer) => void) | null;
}) => {
    const { appState } = useContext(AppContext);
    const { format, mode } = useFormatAmount();
    const isCrypto = Boolean(appState.game?.config?.crypto);
    const isXVerified = player.username?.startsWith('@');
    const formattedBuyIn = mode === 'chips'
        ? `${format(player.buyIn)} chips`
        : format(player.buyIn);

    return (
        <Flex
            key={index}
            alignItems={'center'}
            justifyContent={'space-between'}
            width={'100%'}
            bg={'card.white'}
            borderRadius={{ base: '12px', md: '16px' }}
            border="2px solid"
            borderColor="border.lightGray"
            paddingX={{ base: 3, sm: 4, md: 6 }}
            paddingY={{ base: 3, sm: 3.5, md: 5 }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.05)"
            _hover={{
                borderColor: 'brand.green',
                boxShadow: '0 8px 20px rgba(54, 163, 123, 0.15)',
                transform: 'translateY(-2px)',
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            flexDirection="row"
            gap={{ base: 3, sm: 3, md: 0 }}
        >
            <VStack
                flex={1}
                justifyContent={{ base: 'center', lg: 'space-around' }}
                alignItems={'start'}
                textAlign={'left'}
                gap={{ base: 1.5, md: 2 }}
                minW={0}
                w="auto"
            >
                <Flex
                    alignItems="center"
                    gap={2.5}
                    flexWrap="wrap"
                >
                    {isXVerified && (
                        <Flex
                            alignItems="center"
                            justifyContent="center"
                            bg="#000"
                            borderRadius="full"
                            w={{ base: '18px', md: '22px' }}
                            h={{ base: '18px', md: '22px' }}
                            flexShrink={0}
                        >
                            <FaXTwitter color="white" size={10} />
                        </Flex>
                    )}
                    <Text
                        color={'text.secondary'}
                        fontWeight={'bold'}
                        fontSize={{
                            base: 'md',
                            sm: 'lg',
                            md: 'xl',
                            lg: '2xl',
                        }}
                        letterSpacing="-0.02em"
                    >
                        {player.username || player.uuid.substring(0, 8)}
                    </Text>
                    {type === 'pending' && (
                        <Badge
                            color="white"
                            bg="brand.pink"
                            textTransform="uppercase"
                            fontWeight="bold"
                            fontSize={{ base: '2xs', md: 'xs' }}
                            borderRadius="full"
                            px={3}
                            py={0.5}
                            letterSpacing="0.05em"
                            boxShadow="0 6px 14px rgba(235, 11, 92, 0.25)"
                        >
                            Pending
                        </Badge>
                    )}
                </Flex>
                <Flex
                    gap={{ base: 1.5, md: 2 }}
                    flex={2}
                    direction={'row'}
                    flexWrap="wrap"
                    w="100%"
                    alignItems="center"
                >
                    <Badge
                        bg="card.lightGray"
                        color="brand.navy"
                        paddingY={{ base: 0.5, md: 1 }}
                        paddingX={{ base: 2, md: 3 }}
                        borderRadius={{ base: '6px', md: '8px' }}
                        fontSize={{ base: '2xs', md: 'xs' }}
                        fontWeight="semibold"
                    >
                        ID: {player.uuid.substring(0, 8)}
                    </Badge>
                    <Text
                        color={'gray.600'}
                        fontSize={{ base: '2xs', sm: 'xs', md: 'sm' }}
                        fontWeight="medium"
                    >
                        Buy-in:{' '}
                        <Text
                            as={'span'}
                            fontWeight={'bold'}
                            color="brand.green"
                        >
                            {formattedBuyIn}
                        </Text>
                    </Text>
                    {!isCrypto && (
                        <Text
                            color={'gray.600'}
                            fontSize={{ base: '2xs', sm: 'xs', md: 'sm' }}
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
                    )}
                </Flex>
            </VStack>

            {isOwner &&
                type == 'pending' &&
                handleAcceptPlayer &&
                handleDenyPlayer && (
                    <Flex
                        gap={{ base: 1.5, lg: 2 }}
                        flexShrink={0}
                        w="auto"
                        justifyContent="flex-end"
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
                                minW={{ base: '36px', sm: '40px', md: '52px' }}
                                h={{ base: '36px', sm: '40px', md: '52px' }}
                                borderRadius={{ base: '10px', md: '12px' }}
                                border="none"
                                transition="all 0.2s ease"
                            >
                                <FaCircleCheck size={18} />
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
                                minW={{ base: '36px', sm: '40px', md: '52px' }}
                                h={{ base: '36px', sm: '40px', md: '52px' }}
                                borderRadius={{ base: '10px', md: '12px' }}
                                border="none"
                                transition="all 0.2s ease"
                            >
                                <FaCircleXmark size={18} />
                            </Button>
                        </Tooltip>
                    </Flex>
                )}

            {isOwner &&
                !isCurrentUser &&
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
                            data-testid={`kick-player-${player.uuid}`}
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
                            minW={{ base: '36px', sm: '40px', md: '52px' }}
                            h={{ base: '36px', sm: '40px', md: '52px' }}
                            borderRadius={{ base: '10px', md: '12px' }}
                            border="none"
                            transition="all 0.2s ease"
                        >
                            <GiBootKick size={18} />
                        </Button>
                    </Tooltip>
                )}
        </Flex>
    );
};

export default PlayerCard;
