'use client';

import React, { useContext, useState } from 'react';
import {
    Flex,
    Button,
    IconButton,
    CircularProgress,
    Text,
    Stack,
} from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord, FaInstagram } from 'react-icons/fa';
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
        <Flex justifyContent={'center'} alignItems={'center'}>
            <Flex
                flexDirection={'column'}
                gap={4}
                borderRadius={40}
                width={'50%'}
                height={'75%'}
                bgColor="gray.100"
                paddingY={8}
                paddingX={16}
            >
                <Stack gap={8}>
                    <Text
                        fontFamily={'Knewave'}
                        fontSize={'6xl'}
                        textAlign={'center'}
                        fontWeight={'bold'}
                        mb={10}
                    >
                        Stacked
                    </Text>
                    {!isLoading ? (
                        <Button
                            variant={'homeSectionButton'}
                            bg={'green'}
                            onClick={handleSubmit}
                            _hover={{ bg: 'green.900' }}
                        >
                            Play Now
                        </Button>
                    ) : (
                        <CircularProgress
                            isIndeterminate={false}
                            color="grey"
                            size="100px"
                        />
                    )}
                    <Web3Button />
                </Stack>

                <Flex
                    direction="row"
                    justify="center"
                    align="center"
                    marginTop={12}
                    gap={10}
                >
                    <IconButton
                        aria-label="X"
                        variant="social"
                        icon={<RiTwitterXLine color="white" size={36} />}
                        w={12}
                        h={12}
                        size="lg"
                    />
                    <IconButton
                        aria-label="Discord"
                        variant="social"
                        icon={<FaDiscord color="white" size={36} />}
                        size="lg"
                    />
                    <IconButton
                        aria-label="Instagram"
                        variant="social"
                        icon={<FaInstagram color="white" size={36} />}
                        size="lg"
                    />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default HomeCard;
