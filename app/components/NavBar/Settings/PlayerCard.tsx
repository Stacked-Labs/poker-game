import { PendingPlayer } from '@/app/interfaces';
import { Box, Flex, Button, Icon, Image, Link, Text, Tooltip, VStack, Badge, useColorModeValue } from '@chakra-ui/react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { GiBootKick } from 'react-icons/gi';
import { FiExternalLink } from 'react-icons/fi';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import { useContext } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { getColorForUsername } from '@/app/utils/chatColors';

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

    const displayName = player.username || player.uuid.substring(0, 8);
    const avatarColor = getColorForUsername(displayName);
    const avatarInitials =
        displayName
            .replace(/^@/, '')
            .split(/[\s._-]+/)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? '')
            .join('') ||
        displayName.replace(/^@/, '').slice(0, 2).toUpperCase();

    const truncatedAddress = player.address
        ? `${player.address.substring(0, 6)}...${player.address.substring(player.address.length - 4)}`
        : null;
    const baseScanUrl = player.address
        ? `https://sepolia.basescan.org/address/${player.address}`
        : null;
    const xProfileUrl = isXVerified
        ? `https://x.com/${player.username?.replace(/^@/, '')}`
        : null;

    // Dark-mode-adaptive values
    const cardBg = useColorModeValue('white', '#212121');
    const selfBg = useColorModeValue('#EEF8F3', '#1E2A25');
    const selfBorder = useColorModeValue('rgba(54, 163, 123, 0.35)', 'rgba(54, 163, 123, 0.45)');
    const borderColor = useColorModeValue('#ECEEF5', 'rgba(255, 255, 255, 0.1)');
    const shadowRest = useColorModeValue(
        '0 1px 4px rgba(0, 0, 0, 0.04)',
        '0 1px 4px rgba(0, 0, 0, 0.2)'
    );
    const shadowHover = useColorModeValue(
        '0 4px 12px rgba(0, 0, 0, 0.08)',
        '0 4px 12px rgba(0, 0, 0, 0.35)'
    );
    const avatarBgOpacity = useColorModeValue('18', '30');
    const badgeBg = useColorModeValue('#ECEEF5', '#191414');
    const badgeColor = useColorModeValue('#334479', '#ECEEF5');
    const metaColor = useColorModeValue('rgba(11, 20, 48, 0.5)', 'rgba(255, 255, 255, 0.45)');

    return (
        <Flex
            key={index}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            bg={isCurrentUser ? selfBg : cardBg}
            borderRadius={{ base: '12px', md: '16px' }}
            border="1px solid"
            borderColor={isCurrentUser ? selfBorder : borderColor}
            paddingX={{ base: 3, sm: 4, md: 5 }}
            paddingY={{ base: 2.5, sm: 3, md: 4 }}
            boxShadow={shadowRest}
            _hover={{
                boxShadow: shadowHover,
                transform: 'translateY(-1px)',
            }}
            transition="all 0.2s ease"
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
                {player.profileImageUrl ? (
                    <Image
                        src={player.profileImageUrl}
                        alt=""
                        w="100%"
                        h="100%"
                        borderRadius="full"
                        objectFit="cover"
                    />
                ) : (
                    <Flex
                        w="100%"
                        h="100%"
                        borderRadius="full"
                        bg={`${avatarColor}${avatarBgOpacity}`}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Text
                            fontSize={{ base: 'xs', md: 'sm' }}
                            fontWeight="bold"
                            color={avatarColor}
                            lineHeight="1"
                            userSelect="none"
                        >
                            {avatarInitials}
                        </Text>
                    </Flex>
                )}
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
                            _hover={{ textDecoration: 'none' }}
                        >
                            <Text
                                color="text.secondary"
                                fontWeight="bold"
                                fontSize={{ base: 'sm', md: 'md' }}
                                _hover={{ color: 'brand.green' }}
                                transition="color 0.15s ease"
                            >
                                {displayName}
                            </Text>
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
                            color="white"
                            bg="brand.pink"
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
                        <Link
                            href={baseScanUrl}
                            isExternal
                            _hover={{ textDecoration: 'none' }}
                        >
                            <Badge
                                bg={badgeBg}
                                color={badgeColor}
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                                fontSize="2xs"
                                fontWeight="medium"
                                cursor="pointer"
                                display="flex"
                                alignItems="center"
                                gap={1}
                                _hover={{ color: 'brand.green' }}
                                transition="color 0.15s ease"
                            >
                                {truncatedAddress}
                                <Icon as={FiExternalLink} boxSize="9px" />
                            </Badge>
                        </Link>
                    ) : (
                        <Badge
                            bg={badgeBg}
                            color={badgeColor}
                            px={2}
                            py={0.5}
                            borderRadius="6px"
                            fontSize="2xs"
                            fontWeight="medium"
                        >
                            {player.uuid.substring(0, 8)}
                        </Badge>
                    )}

                    <Text
                        color={metaColor}
                        fontSize="2xs"
                        fontWeight="medium"
                    >
                        Buy-in{' '}
                        <Text as="span" fontWeight="bold" color="brand.green">
                            {formattedBuyIn}
                        </Text>
                    </Text>

                    {!isCrypto && (
                        <Text
                            color={metaColor}
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
                                _hover={{
                                    bg: 'brand.green',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(54, 163, 123, 0.3)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                onClick={() => handleAcceptPlayer(player.uuid)}
                                minW={{ base: '34px', md: '38px' }}
                                h={{ base: '34px', md: '38px' }}
                                borderRadius="10px"
                                border="none"
                                transition="all 0.2s ease"
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
                                _hover={{
                                    bg: 'brand.pink',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(235, 11, 92, 0.3)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                onClick={() => handleDenyPlayer(player.uuid)}
                                minW={{ base: '34px', md: '38px' }}
                                h={{ base: '34px', md: '38px' }}
                                borderRadius="10px"
                                border="none"
                                transition="all 0.2s ease"
                            >
                                <FaCircleXmark size={15} />
                            </Button>
                        </Tooltip>
                    </Flex>
                )}

            {isOwner &&
                !isCurrentUser &&
                type === 'accepted' &&
                isKicking !== null &&
                confirmKick && (
                    <Tooltip
                        label="Kick"
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
                            _hover={{
                                bg: 'brand.pink',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(235, 11, 92, 0.3)',
                            }}
                            _active={{ transform: 'translateY(0)' }}
                            onClick={() => confirmKick(player)}
                            isLoading={isKicking}
                            loadingText="Kicking..."
                            minW={{ base: '34px', md: '38px' }}
                            h={{ base: '34px', md: '38px' }}
                            borderRadius="10px"
                            border="none"
                            transition="all 0.2s ease"
                        >
                            <GiBootKick size={15} />
                        </Button>
                    </Tooltip>
                )}
        </Flex>
    );
};

export default PlayerCard;
