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
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { ReactElement, useContext } from 'react';
import { FaCopy, FaDiscord } from 'react-icons/fa';
import { AppContext } from '../contexts/AppStoreProvider';
import { RiTwitterXLine } from 'react-icons/ri';
import { SiFarcaster } from 'react-icons/si';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 0.3; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const CopyLinkButton = ({ link }: { link: string | null }) => {
    const { hasCopied, onCopy } = useClipboard(link || '');

    if (!link) {
        return null;
    }

    return (
        <Tooltip
            label={hasCopied ? 'Copied!' : 'Copy to clipboard'}
            closeOnClick={false}
            height={'100%'}
        >
            <Flex
                bg="green.500"
                onClick={onCopy}
                height={'100%'}
                cursor={'pointer'}
                justifyContent={'center'}
                alignItems={'center'}
                _hover={{
                    bg: 'green.400',
                }}
                transition="all 0.2s"
            >
                <FaCopy color="white" />
            </Flex>
        </Tooltip>
    );
};

const LinkBox = ({ link }: { link: string | null }) => {
    const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';

    return (
        <Flex width={'80%'} borderRadius={'xl'} overflow="hidden">
            <Box width={'85%'} bg={'whitesmoke'} alignContent={'center'}>
                <Input
                    value={currentUrl}
                    isReadOnly
                    border="none"
                    bg="transparent"
                    color="gray.600"
                    fontSize="smaller"
                    p={3}
                    _focus={{
                        outline: 'none',
                        boxShadow: 'none',
                    }}
                    cursor="text"
                />
            </Box>
            <Box width={'15%'}>
                <CopyLinkButton link={currentUrl} />
            </Box>
        </Flex>
    );
};

const SocialButton = ({ icon }: { icon: ReactElement }) => {
    return (
        <IconButton
            aria-label="Discord"
            variant="social"
            icon={icon}
            color={'white'}
            size="2xl"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.1)' }}
            height={5}
        />
    );
};

const LobbyBanner = ({ onClose }: { onClose: () => void }) => {
    const { appState } = useContext(AppContext);

    return (
        <ModalContent
            bg="rgba(38, 38, 38, 0.9)"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="none"
            display="flex"
            flexDirection="column"
        >
            <Flex
                justifyContent="space-between"
                alignItems="center"
                py={2}
                px={4}
                color="white"
            >
                <Stack gap={0}>
                    <Text fontWeight={'extrabold'} p={0}>
                        Lobby
                    </Text>
                    <Flex gap={1} alignItems={'center'}>
                        <Box
                            height={1.5}
                            width={1.5}
                            bg={'white'}
                            borderRadius={'full'}
                            animation={`${pulse} 2s ease-in-out infinite`}
                        />
                        <Text fontSize={'sm'} color={'whiteAlpha.700'}>
                            Waiting for players
                        </Text>
                    </Flex>
                </Stack>
                <CloseButton onClick={onClose} fontWeight={'bolder'} />
            </Flex>
            <Stack
                py={2}
                gap={5}
                overflow="auto"
                flex={1}
                minHeight={0}
                alignItems={'center'}
            >
                <LinkBox link={appState.table} />
                <Flex gap={5} alignItems="center">
                    <Link href="https://x.com/stacked_poker" isExternal>
                        <SocialButton icon={<RiTwitterXLine />} />
                    </Link>
                    <Link href="https://discord.gg/896EhkVYbd" isExternal>
                        <SocialButton icon={<FaDiscord />} />
                    </Link>
                    <Link href="https://warpcast.com/stackedpoker" isExternal>
                        <SocialButton icon={<SiFarcaster />} />
                    </Link>
                </Flex>
            </Stack>
        </ModalContent>
    );
};

export default LobbyBanner;
