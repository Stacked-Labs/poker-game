import {
    Box,
    CloseButton,
    Flex,
    IconButton,
    Input,
    Link,
    ModalContent,
    Stack,
    Text,
    Tooltip,
    useClipboard,
    Icon,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { ReactElement } from 'react';
import { FaDiscord, FaCopy, FaCheck } from 'react-icons/fa';
import { RiTwitterXLine } from 'react-icons/ri';
import { SiFarcaster } from 'react-icons/si';

const pulse = keyframes`
  0% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.15); 
    opacity: 0.7; 
  }
  100% { 
    transform: scale(1); 
    opacity: 1; 
  }
`;

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const LinkBox = () => {
    const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';
    const { hasCopied, onCopy } = useClipboard(currentUrl || '');

    return (
        <Flex
            width="85%"
            maxW="380px"
            borderRadius="12px"
            overflow="hidden"
            boxShadow="0 2px 12px rgba(0, 0, 0, 0.08)"
            border="2px solid"
            borderColor="brand.green"
            transition="all 0.3s ease"
            _hover={{
                boxShadow: '0 4px 16px rgba(54, 163, 123, 0.3)',
                transform: 'translateY(-2px)',
            }}
        >
            <Box
                flex={1}
                bg="white"
                display="flex"
                alignItems="center"
                px={2.5}
                py={2}
            >
                <Input
                    value={currentUrl}
                    isReadOnly
                    border="none"
                    bg="transparent"
                    color="brand.navy"
                    fontSize="xs"
                    fontWeight="medium"
                    p={0}
                    height="auto"
                    minH="0"
                    _focus={{
                        outline: 'none',
                        boxShadow: 'none',
                    }}
                    cursor="text"
                />
            </Box>
            <Tooltip
                label={hasCopied ? 'Copied!' : 'Copy Link'}
                closeOnClick={false}
            >
                <Flex
                    onClick={onCopy}
                    minW="44px"
                    py={1.5}
                    bg={hasCopied ? 'brand.green' : 'brand.green'}
                    cursor="pointer"
                    justifyContent="center"
                    alignItems="center"
                    color="white"
                    transition="all 0.2s ease"
                    _hover={{
                        bg: 'brand.green',
                        transform: 'scale(1.05)',
                    }}
                    _active={{
                        transform: 'scale(0.95)',
                    }}
                >
                    <Icon
                        as={hasCopied ? FaCheck : FaCopy}
                        boxSize={3.5}
                        transition="all 0.2s ease"
                    />
                </Flex>
            </Tooltip>
        </Flex>
    );
};

const SocialButton = ({
    icon,
    label,
    color,
    rotation = '5deg',
}: {
    icon: ReactElement;
    label: string;
    color: string;
    rotation?: string;
}) => {
    return (
        <IconButton
            aria-label={label}
            icon={icon}
            size={{ base: 'md', md: 'lg' }}
            bg="brand.lightGray"
            color={color}
            border="none"
            borderRadius={{ base: '10px', md: '12px' }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
                bg: color,
                color: 'white',
                transform: `translateY(-4px) rotate(${rotation})`,
                boxShadow: `0 8px 16px ${color}40`,
            }}
        />
    );
};

const LobbyBanner = ({ onClose }: { onClose: () => void }) => {
    return (
        <ModalContent
            bg="white"
            borderRadius={{ base: '20px', md: '24px' }}
            overflow="hidden"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.25)"
            border="1px solid"
            borderColor="rgba(0, 0, 0, 0.08)"
            display="flex"
            flexDirection="column"
            animation={`${fadeIn} 0.4s ease-out`}
            maxW="420px"
            mx={{ base: 3, md: 0 }}
        >
            {/* Header */}
            <Flex
                justifyContent="space-between"
                alignItems="center"
                py={{ base: 3, md: 4 }}
                px={{ base: 4, md: 5 }}
                bg="brand.lightGray"
                borderBottom="1px solid"
                borderColor="rgba(0, 0, 0, 0.08)"
            >
                <Stack gap={1}>
                    <Text
                        fontWeight="extrabold"
                        fontSize="xl"
                        color="brand.navy"
                        fontFamily="heading"
                    >
                        Lobby
                    </Text>
                    <Flex gap={2} alignItems="center">
                        <Box
                            height={2}
                            width={2}
                            bg="brand.green"
                            borderRadius="full"
                            animation={`${pulse} 2s ease-in-out infinite`}
                            boxShadow="0 0 8px rgba(54, 163, 123, 0.6)"
                        />
                        <Text
                            fontSize="sm"
                            color="brand.navy"
                            fontWeight="medium"
                            opacity={0.7}
                        >
                            Waiting for players
                        </Text>
                    </Flex>
                </Stack>
                <CloseButton
                    onClick={onClose}
                    color="brand.navy"
                    borderRadius="8px"
                    _hover={{
                        bg: 'rgba(51, 68, 121, 0.1)',
                    }}
                />
            </Flex>

            {/* Content */}
            <Stack
                py={{ base: 3, md: 4 }}
                px={{ base: 4, md: 5 }}
                gap={{ base: 3, md: 4 }}
                overflow="auto"
                flex={1}
                minHeight={0}
                alignItems="center"
                bg="white"
            >
                <LinkBox />

                {/* Social Buttons */}
                <Flex
                    gap={{ base: 3, md: 4 }}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Link href="https://x.com/stacked_poker" isExternal>
                        <SocialButton
                            icon={<RiTwitterXLine size={20} />}
                            label="X (Twitter)"
                            color="#000000"
                            rotation="5deg"
                        />
                    </Link>
                    <Link href="https://discord.gg/896EhkVYbd" isExternal>
                        <SocialButton
                            icon={<FaDiscord size={20} />}
                            label="Discord"
                            color="#5865F2"
                            rotation="-5deg"
                        />
                    </Link>
                    <Link href="https://warpcast.com/stackedpoker" isExternal>
                        <SocialButton
                            icon={<SiFarcaster size={20} />}
                            label="Farcaster"
                            color="#855DCD"
                            rotation="5deg"
                        />
                    </Link>
                </Flex>

                {/* Hint Text */}
                <Text
                    fontSize="xs"
                    color="brand.navy"
                    opacity={0.6}
                    textAlign="center"
                    maxW="300px"
                >
                    Share the link above to invite players to your table
                </Text>
            </Stack>
        </ModalContent>
    );
};

export default LobbyBanner;
