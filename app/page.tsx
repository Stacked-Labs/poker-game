'use client';

import { Box, Flex } from '@chakra-ui/react';
import HomeCard from './components/HomePage/HomeCard';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import Landing from './components/HomePage/Landing';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { SocketContext } from '@/app/contexts/WebSocketProvider';

const randomImageNumber = Math.floor(Math.random() * 5) + 1;
const bgImage = `./tiles/tile${randomImageNumber}.png`;

const HomePage: React.FC = () => {
    const router = useRouter();
    const socket = useContext(SocketContext);
    const { appState } = useContext(AppContext);

    if (appState.table && socket) {
        router.push(`/game/${appState.table}`);
    }

    return (
        <Flex w="100vw" bgColor={'gray.200'}>
            <Box
                width="33%"
                height="100vh"
                overflow="hidden"
                backgroundImage={`url('${bgImage}')`}
                backgroundRepeat="repeat"
                backgroundSize="300px"
                position="fixed"
            >
                <HomeCard />
            </Box>

            <Box
                marginLeft={'33%'}
                width="67%"
                height="100%"
                overflowY="auto"
                bgColor={'gray.200'}
            >
                <Landing />
            </Box>
        </Flex>
    );
};

export default function Home() {
    return (
        <main>
            <HomePage />
        </main>
    );
}
