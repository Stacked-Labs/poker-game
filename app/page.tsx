'use client';

import { Box, Flex } from '@chakra-ui/react';
import HomeCard from '@/app/components/HomePage/HomeCard';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/app/contexts/WebSocketProvider';
import { useContext } from 'react';
import Landing from './components/HomePage/Landing';

const randomImageNumber = Math.floor(Math.random() * 5) + 1;
const bgImage = `./tiles/tile${randomImageNumber}.png`;

const HomePage: React.FC = () => {
    const router = useRouter();
    const socket = useSocket();
    const { appState } = useContext(AppContext);

    if (appState.table !== null && socket) {
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
