import { PendingPlayer } from '@/app/interfaces';
import { Box, Flex, Button, Icon, Link, Text, Tooltip, VStack, Badge } from '@chakra-ui/react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { GiBootKick } from 'react-icons/gi';
import { FiExternalLink } from 'react-icons/fi';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import { useContext } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { shortenAddress } from '@/app/utils/address';
import ExternalLink from '@/app/components/ExternalLink';
import PlayerAvatar from '@/app/components/PlayerAvatar';

const PlayerCard = ({
    index,
    player,
    isOwner,
    isCurrentUser = false,
    type,
    isKicking,
    settlementStuck,
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
    settlementStuck?: boolean;
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

    const displayName = player.username || player.uuid.substring(0, 8);

    const truncatedAddress = player.address
        ? shortenAddress(player.address)
        : null;
    const baseScanUrl = player.address
        ? `https://sepolia.basescan.org/address/${player.address}`
        : null;
    const xProfileUrl = isXVerified
        ? `https://x.com/${player.username?.replace(/^@/, '')}`
        : null;

    return (
        <Flex
            key={index}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            bg="card.white"
            borderRadius={{ base: '12px', md: '16px' }}
            border="1px solid"
            borderColor={
                isCurrentUser ? 'border.greenStrong' : 'border.lightGray'
            }
            paddingX={{ base: 3, sm: 4, md: 5 }}
            paddingY={{ base: 2.5, sm: 3, md: 4 }}
            boxShadow={{
                base: isCurrentUser
                    ? 'inset 0 0 0 9999px rgba(54, 163, 123, 0.07), 0 1px 4px rgba(0, 0, 0, 0.04)'
                    : '0 1px 4px rgba(0, 0, 0, 0.04)',
                _dark: isCurrentUser
                    ? 'inset 0 0 0 9999px rgba(54, 163, 123, 0.10), 0 1px 4px rgba(0, 0, 0, 0.2)'
                    : '0 1px 4px rgba(0, 0, 0, 0.2)',
            }}
            flexDirection="row"
            gap={{ base: 3, md: 3 }}
        >
            {/* Avatar */}
            <Box
                position="relative"
                flexShrink={0}
                w={{ base: '36px', md: '42px' }}
                h={{ base: '36px', md: '42px' }}
            >
                <PlayerAvatar
                    profileImageUrl={player.profileImageUrl}
                    address={player.address}
                    username={displayName}
                    initialsFontSize={{ base: '13px', md: '15px' }}
                />
            </Box>

            {/* Info */}
            <VStack
                flex={1}
                alignItems="start"
                gap={{ base: 0.5, md: 1 }}
                minW={0}
            >
                {/* Name row */}
                <Flex alignItems="center" gap={2} flexWrap="wrap">
                    {isXVerified && xProfileUrl ? (
                        <Link
                            href={xProfileUrl}
                            isExternal
                            display="inline-flex"
                            alignItems="center"
                            gap="3px"
                            color="text.secondary"
                            transition="color 80ms ease"
                            _hover={{
                                textDecoration: 'underline',
                                textDecorationThickness: '1.5px',
                                textUnderlineOffset: '3px',
                                '& .x-handle-icon': { opacity: 0.7 },
                            }}
                            sx={{
                                '& .x-handle-icon': {
                                    opacity: 0.4,
                                    transition: 'opacity 80ms ease',
                                },
                            }}
                        >
                            <Text
                                color="text.secondary"
                                fontWeight="bold"
                                fontSize={{ base: 'sm', md: 'md' }}
                            >
                                {displayName}
                            </Text>
                            <Icon
                                as={FiExternalLink}
                                className="x-handle-icon"
                                boxSize="10px"
                                color="text.muted"
                                aria-hidden
                            />
                        </Link>
                    ) : (
                        <Text
                            color="text.secondary"
                            fontWeight="bold"
                            fontSize={{ base: 'sm', md: 'md' }}
                        >
                            {displayName}
                        </Text>
                    )}
                    {isCurrentUser && (
                        <Badge
                            bg="rgba(54, 163, 123, 0.1)"
                            color="brand.green"
                            fontSize="2xs"
                            fontWeight="semibold"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            textTransform="none"
                        >
                            You
                        </Badge>
                    )}
                    {type === 'pending' && (
                        <Badge
                            bg="rgba(235, 11, 92, 0.10)"
                            color="brand.pink"
                            fontWeight="semibold"
                            fontSize="2xs"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            textTransform="none"
                        >
                            Pending
                        </Badge>
                    )}
                </Flex>

                {/* Meta row */}
                <Flex
                    gap={{ base: 1.5, md: 2 }}
                    direction="row"
                    flexWrap="wrap"
                    alignItems="center"
                >
                    {/* ID / address */}
                    {isCrypto && truncatedAddress && baseScanUrl ? (
                        <ExternalLink
                            href={baseScanUrl}
                            iconSize="9px"
                            bg="card.lightGray"
                            px={2}
                            py={0.5}
                            borderRadius="6px"
                            fontSize="2xs"
                            fontWeight="medium"
                        >
                            {truncatedAddress}
                        </ExternalLink>
                    ) : (
                        <Badge
                            bg="card.lightGray"
                            color="text.secondary"
                            px={2}
                            py={0.5}
                            borderRadius="6px"
                            fontSize="2xs"
                            fontWeight="medium"
                        >
                            {player.uuid.substring(0, 8)}
                        </Badge>
                    )}

                    <Text color="text.muted" fontSize="2xs" fontWeight="medium">
                        Buy-in{' '}
                        <Text as="span" fontWeight="bold" color="brand.green">
                            {formattedBuyIn}
                        </Text>
                    </Text>

                    {!isCrypto && (
                        <Text
                            color="text.muted"
                            fontSize="2xs"
                            fontWeight="medium"
                        >
                            Seat{' '}
                            <Text as="span" fontWeight="bold" color="brand.green">
                                #{player.seatId}
                            </Text>
                        </Text>
                    )}
                </Flex>
            </VStack>

            {/* Action buttons */}
            {isOwner &&
                type === 'pending' &&
                handleAcceptPlayer &&
                handleDenyPlayer && (
                    <Flex gap={1.5} flexShrink={0}>
                        <Tooltip
                            label="Accept"
                            placement="top"
                            bg="brand.navy"
                            color="white"
                            borderRadius="md"
                            fontSize="xs"
                        >
                            <Button
                                size="sm"
                                bg="brand.green"
                                color="white"
                                boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #22674E"
                                _hover={{
                                    bg: 'brand.green',
                                }}
                                _active={{
                                    bg: 'brand.greenDark',
                                    transform: 'translateY(1.5px)',
                                    boxShadow:
                                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #22674E',
                                }}
                                onClick={() => handleAcceptPlayer(player.uuid)}
                                minW={{ base: '34px', md: '38px' }}
                                h={{ base: '34px', md: '38px' }}
                                borderRadius="10px"
                                border="none"
                                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            >
                                <FaCircleCheck size={15} />
                            </Button>
                        </Tooltip>
                        <Tooltip
                            label="Deny"
                            placement="top"
                            bg="brand.navy"
                            color="white"
                            borderRadius="md"
                            fontSize="xs"
                        >
                            <Button
                                size="sm"
                                bg="brand.pink"
                                color="white"
                                boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #950839"
                                _hover={{
                                    bg: 'brand.pink',
                                }}
                                _active={{
                                    bg: 'brand.pinkDark',
                                    transform: 'translateY(1.5px)',
                                    boxShadow:
                                        'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                                }}
                                onClick={() => handleDenyPlayer(player.uuid)}
                                minW={{ base: '34px', md: '38px' }}
                                h={{ base: '34px', md: '38px' }}
                                borderRadius="10px"
                                border="none"
                                transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            >
                                <FaCircleXmark size={15} />
                            </Button>
                        </Tooltip>
                    </Flex>
                )}

            {isOwner &&
                !isCurrentUser &&
                type === 'accepted' &&
                confirmKick && (
                    <Tooltip
                        label={settlementStuck ? 'Settlement in progress — kick unavailable' : 'Kick'}
                        placement="top"
                        bg="brand.navy"
                        color="white"
                        borderRadius="md"
                        fontSize="xs"
                    >
                        <Button
                            data-testid={`kick-player-${player.uuid}`}
                            size="sm"
                            bg="brand.pink"
                            color="white"
                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #950839"
                            _hover={{
                                bg: 'brand.pink',
                            }}
                            _active={{
                                bg: 'brand.pinkDark',
                                transform: 'translateY(1.5px)',
                                boxShadow:
                                    'inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 #950839',
                            }}
                            onClick={() => confirmKick(player)}
                            isDisabled={Boolean(settlementStuck)}
                            isLoading={Boolean(isKicking)}
                            loadingText="Kicking..."
                            minW={{ base: '34px', md: '38px' }}
                            h={{ base: '34px', md: '38px' }}
                            borderRadius="10px"
                            border="none"
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                        >
                            <GiBootKick size={15} />
                        </Button>
                    </Tooltip>
                )}
        </Flex>
    );
};

export default PlayerCard;
