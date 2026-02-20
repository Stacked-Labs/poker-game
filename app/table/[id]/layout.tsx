import { SocketProvider } from '@/app/contexts/WebSocketProvider';
import Navbar from '@/app/components/NavBar';
import { Flex, Box } from '@chakra-ui/react';
import Footer from '@/app/components/Footer';
import GameConfigWatermark from '@/app/components/Footer/GameConfigWatermark';
import ChatOverlay from '@/app/components/NavBar/Chat/ChatOverlay';
import GameViewport from '@/app/components/GameViewport';
import LobbyBanner from '@/app/components/LobbyBanner';
import SeatRequestPopup from '@/app/components/SeatRequestPopup';

const TableLayout: React.FC<{ params: { id: string } }> = ({
    children,
    params,
}: React.PropsWithChildren<{ params: { id: string } }>) => {
    return (
        <GameViewport>
            {/* Content Layer - fills the fixed-ratio container */}
            <Flex
                className="game-content"
                position="relative"
                zIndex={1}
                width="100%"
                height="100%"
                direction="column"
                bg="transparent"
            >
                <SocketProvider tableId={params.id}>
                    {/* Navbar - absolutely positioned, overlays at top */}
                    <Navbar />

                    {/* Main Content Area */}
                    <Flex
                        className="main-content-area"
                        flex={1}
                        direction="column"
                        transition="filter 0.3s ease-in-out"
                        minHeight={0}
                        overflow="hidden"
                    >
                        {children}
                        <Box
                            className="footer-wrapper"
                            position="relative"
                            width="100%"
                            height="10%"
                            gap={{ base: 2, md: 3 }}
                            px={{ base: 1, md: 4 }}
                            py={{ base: 0, md: 1 }}
                            maxHeight={{ base: '70px', md: '100px' }}
                            minHeight={{ base: '50px', md: '70px' }}
                        >
                            <GameConfigWatermark />
                            <ChatOverlay />
                            <Footer />
                        </Box>
                    </Flex>

                    <LobbyBanner />
                    <SeatRequestPopup />
                </SocketProvider>
            </Flex>
        </GameViewport>
    );
};

export default TableLayout;
