import {
    AbsoluteCenter,
    Box,
    Divider,
    Flex,
    IconButton,
    Link,
    Stack,
    Text,
    Tooltip,
    useClipboard,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { JSXElementConstructor, ReactElement, useContext } from 'react';
import { FaCopy, FaDiscord } from 'react-icons/fa';
import { AppContext } from '../contexts/AppStoreProvider';
import { RiTwitterXLine } from 'react-icons/ri';
import { SiFarcaster } from 'react-icons/si';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 0.3; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const BannerDivider = () => {
    return (
        <Box position="relative" px="10" py={3}>
            <Divider color={'whitesmoke'} />
            <AbsoluteCenter bg={'white'} color={'green.500'} px="4">
                OR
            </AbsoluteCenter>
        </Box>
    );
};

const CopyLinkButton = ({ link }: { link: string | null }) => {
    if (!link) {
        return;
    }

    const { hasCopied, onCopy } = useClipboard(link);

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
            >
                <FaCopy color="white" />
            </Flex>
        </Tooltip>
    );
};

const LinkBox = ({ link }: { link: string | null }) => {
    link = 'https://example.com/' + link;

    return (
        <Flex width={'70%'} borderRadius={'xl'} overflow="hidden">
            <Box width={'85%'} bg={'whitesmoke'} p={3} alignContent={'center'}>
                <Text isTruncated fontSize={'smaller'}>
                    {link}
                </Text>
            </Box>
            <Box width={'15%'}>
                <CopyLinkButton link={link} />
            </Box>
        </Flex>
    );
};

const SocialButton = ({
    icon,
}: {
    icon: ReactElement<any, string | JSXElementConstructor<any>>;
}) => {
    return (
        <IconButton
            aria-label="Discord"
            variant="social"
            icon={icon}
            color={'green.500'}
            size="2xl"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.1)' }}
            height={5}
        />
    );
};

const LobbyBanner = () => {
    const { appState } = useContext(AppContext);

    return (
        <Box
            flex={1}
            height="100%"
            bg="white"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="xl"
            display="flex"
            flexDirection="column"
        >
            <Flex
                justifyContent="space-between"
                alignItems="center"
                p={3}
                color="white"
                bg="green.500"
            >
                <Text fontWeight={'extrabold'}>Game Lobby</Text>
                <Flex gap={2} alignItems={'center'}>
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
            </Flex>
            <Stack py={4} gap={5} overflow="auto" flex={1} minHeight={0}>
                <Stack justifyContent={'center'} alignItems={'center'} gap={5}>
                    <Text fontWeight={'medium'}>
                        Share this link with friends!
                    </Text>
                    <LinkBox link={appState.table} />
                </Stack>
                <BannerDivider />
                <Stack justifyContent={'center'} alignItems={'center'} gap={5}>
                    <Text fontWeight={'medium'}>
                        Play with Stacked community
                    </Text>
                    <Flex gap={5} alignItems="center" justifyContent={'center'}>
                        <Link href="https://x.com/stacked_poker" isExternal>
                            <SocialButton icon={<RiTwitterXLine />} />
                        </Link>
                        <Link href="https://discord.gg/896EhkVYbd" isExternal>
                            <SocialButton icon={<FaDiscord />} />
                        </Link>
                        <Link
                            href="https://warpcast.com/stackedpoker"
                            isExternal
                        >
                            <SocialButton icon={<SiFarcaster />} />
                        </Link>
                    </Flex>
                </Stack>
            </Stack>
        </Box>
    );
};

export default LobbyBanner;
