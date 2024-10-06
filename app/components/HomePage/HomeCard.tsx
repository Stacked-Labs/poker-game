'use client';

import React, { useContext, useState } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
    weight: ['700'],
    subsets: ['latin'],
    display: 'swap',
});

import {
    Flex,
    Button,
    IconButton,
    CircularProgress,
    Text,
    Stack,
    Link,
} from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord } from 'react-icons/fa';
import { SiFarcaster } from 'react-icons/si'; // Imported SiFarcaster from react-icons/si
import Web3Button from '@/app/components/Web3Button';
import { joinTable, sendLog } from '@/app/hooks/server_actions';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const HomeCard = () => {
    const { address } = useAccount();
    const router = useRouter();
    const socket = useContext(SocketContext);
    const { dispatch } = useContext(AppContext);

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = () => {
        if (!address) {
            alert('Please connect your wallet first');
            return;
        }
        if (!socket) {
            return;
        }
        const tableName = address;
        setIsLoading(true);
        dispatch({ type: 'setTablename', payload: tableName });
        if (socket) {
            joinTable(socket, tableName);
            sendLog(socket, `Joined table ${tableName}`);
            router.push(`/game//${tableName}`);
        }
        setIsLoading(false);
    };

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            width="100%"
            p={4}
        >
            <Flex
                flexDirection="column"
                justifyContent="space-between"
                gap={[6, 6, 8]}
                borderRadius={['40px']}
                width={['100%', '90%', '80%', '70%']}
                maxWidth="600px"
                minWidth="250px"
                minHeight="300px"
                height="fit-content"
                bgColor="gray.100"
                padding={[8, 12, 16]}
                boxShadow="xl"
            >
                <Stack gap={12} flex={1} justifyContent="flex-start">
                    <Text
                        className={poppins.className}
                        fontSize={['4xl', '5xl', '6xl']}
                        textAlign="center"
                        fontWeight={700}
                        color="white"
                        whiteSpace="nowrap"
                    >
                        Stacked
                    </Text>

                    {!isLoading ? (
                        <Button
                            variant="homeSectionButton"
                            bg="green.500"
                            onClick={handleSubmit}
                            _hover={{ bg: 'green.600' }}
                            size={['xl']}
                            py={8}
                            fontSize={['xl']}
                        >
                            Play Now
                        </Button>
                    ) : (
                        <CircularProgress
                            isIndeterminate
                            color="green.500"
                            size="60px"
                            thickness="8px"
                        />
                    )}
                    <Web3Button size={['xl']} />
                </Stack>

                <Flex
                    direction="row"
                    justify="space-evenly" // Evenly distribute the icons
                    align="center"
                    width="100%"
                >
                    <Link href="https://x.com/stacked_poker" isExternal>
                        <IconButton
                            aria-label="X"
                            variant="social"
                            icon={<RiTwitterXLine size={36} />}
                            size="lg"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.1)' }}
                        />
                    </Link>
                    <Link href="https://discord.gg/R42388MfDd" isExternal>
                        <IconButton
                            aria-label="Discord"
                            variant="social"
                            icon={<FaDiscord size={36} />}
                            size="lg"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.1)' }}
                        />
                    </Link>
                    <Link href="https://warpcast.com/stackedpoker" isExternal>
                        <IconButton
                            aria-label="Warpcast"
                            variant="social"
                            icon={<SiFarcaster size={36} />} // Using SiFarcaster icon
                            size="lg"
                            transition="transform 0.2s"
                            _hover={{ transform: 'scale(1.1)' }}
                        />
                    </Link>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default HomeCard;
