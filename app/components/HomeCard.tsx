// HomeCard.js
'use client';
import React, { useContext } from 'react';
import { Flex, Button, IconButton } from '@chakra-ui/react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord, FaInstagram } from 'react-icons/fa';
import Web3Button from './Web3Button';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { joinTable, newPlayer } from '@/app/hooks/server_actions';
import { useSocket } from '@/app/contexts/WebSocketProvider';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

const HomeCard = () => {
    const { address } = useAccount();
    const router = useRouter();
    const socket = useSocket();
    const { dispatch } = useContext(AppContext);

    const handleSubmit = () => {
        if (!address) {
            alert('Please connect your wallet first');
            return;
        }
        const tableName = address;
        const username = '';
        dispatch({ type: 'setUsername', payload: username });
        dispatch({ type: 'setTablename', payload: tableName });
        if (socket) {
            console.log(tableName);
            joinTable(socket, tableName);
            newPlayer(socket, tableName);
            router.push(`/game//${tableName}`);
        }
    };

    return (
        <Flex
            position="absolute"
            top="30%"
            left="17%"
            direction="column"
            justify="center"
            align="center"
            height="40%"
            borderRadius={32}
            width="66%"
            bgColor="gray.100"
        >
            <Button size="lg" mb={4} w={200} h={20} onClick={handleSubmit}>
                Play Now
            </Button>
            <Web3Button />
            <Flex
                direction="row"
                justify="center"
                align="center"
                gap={12}
                position={'absolute'}
                bottom={8}
                left={0}
                right={0}
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
    );
};

export default HomeCard;
