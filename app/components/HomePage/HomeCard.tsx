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
    keyframes,
} from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord, FaInstagram } from 'react-icons/fa';
import Web3Button from '@/app/components/Web3Button';
import { joinTable, sendLog } from '@/app/hooks/server_actions';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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
        <Flex justifyContent="center" alignItems="center" minHeight="100vh" width="100%" p={4}>
            <Flex
                flexDirection="column"
                justifyContent="space-between"
                gap={[6, 6, 8]}
                borderRadius={["40px"]}
                width={["100%", "90%", "80%", "70%"]}
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
                        fontSize={["4xl", "5xl", "6xl"]}
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
                            size={["xl"]}
                            py={8}
                            fontSize={["xl"]}
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
                    <Web3Button size={["xl"]}/>
                </Stack>

                <Flex
                    direction="row"
                    justify="center"
                    align="center"
                    gap={[4, 6]}
                >
                    <IconButton
                        aria-label="X"
                        variant="social"
                        icon={<RiTwitterXLine size={48} />}
                        size={["lg"]}
                        transition="transform 0.2s"
                        _hover={{ transform: 'scale(1.1)' }}
                    />
                    <IconButton
                        aria-label="Discord"
                        variant="social"
                        icon={<FaDiscord size={48} />}
                        size={["md", "lg"]}
                        transition="transform 0.2s"
                        _hover={{ transform: 'scale(1.1)' }}
                    />
                    <IconButton
                        aria-label="Instagram"
                        variant="social"
                        icon={<FaInstagram size={48} />}
                        size={["md", "lg"]}
                        transition="transform 0.2s"
                        _hover={{ transform: 'scale(1.1)' }}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default HomeCard;
