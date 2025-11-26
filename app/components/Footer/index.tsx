import { AppContext } from '@/app/contexts/AppStoreProvider';
import { useContext } from 'react';
import FooterWithActionButtons from './FooterWithActionButtons';
import EmptyFooter from './EmptyFooter';
import BlindObligationControls from './BlindObligationControls';
import { Flex } from '@chakra-ui/react';

const Footer = () => {
    const { appState } = useContext(AppContext);

    // Check if the current user is a spectator (not in the game)
    const isSpectator = () => {
        if (!appState.game || !appState.clientID) return true;

        // Debug logging for clientID vs player UUID mismatch
        console.log('🔍 Footer Debug - Spectator Check:', {
            clientID: appState.clientID,
            players: appState.game.players.map((p) => ({
                uuid: p.uuid,
                address: p.address,
                seatID: p.seatID,
                username: p.username,
            })),
            gameRunning: appState.game.running,
            gameBetting: appState.game.betting,
            gameAction: appState.game.action,
        });

        // Check if the user exists in the players array with a valid seat
        const userInGame = appState.game.players.some(
            (player) => player.uuid === appState.clientID && player.seatID > 0
        );

        console.log('🔍 Footer Debug - Spectator Result:', {
            userInGame,
            isSpectator: !userInGame,
            clientIDMatches: appState.game.players.some(
                (p) => p.uuid === appState.clientID
            ),
            clientIDAddressMatches: appState.game.players.some(
                (p) => p.address === appState.clientID
            ),
        });

        return !userInGame;
    };

    const localPlayer = appState.game?.players?.find(
        (p) => p.uuid === appState.clientID
    );
    const seatIndex = localPlayer ? localPlayer.seatID - 1 : -1;
    const owesSB =
        seatIndex >= 0 ? Boolean(appState.game?.owesSB?.[seatIndex]) : false;
    const owesBB =
        seatIndex >= 0 ? Boolean(appState.game?.owesBB?.[seatIndex]) : false;
    const waitingForBB =
        seatIndex >= 0
            ? Boolean(appState.game?.waitingForBB?.[seatIndex])
            : false;
    const hasBlindObligation =
        !!localPlayer &&
        (owesSB || owesBB || waitingForBB || appState.blindObligation);

    const showActionButtons =
        appState.game &&
        appState.game.running &&
        !appState.game.betting == false &&
        !isSpectator() &&
        !hasBlindObligation;

    const content = showActionButtons ? (
        <FooterWithActionButtons
            isCurrentTurn={
                appState.clientID ===
                appState.game!.players[appState.game!.action].uuid
            }
        />
    ) : hasBlindObligation ? null : (
        <EmptyFooter />
    );

    return (
        <Flex
            direction="column"
            gap={{ base: 2, md: 3 }}
            px={{ base: 2, md: 4 }}
            py={{ base: 2, md: 3 }}
            width="100%"
        >
            <BlindObligationControls />
            {content}
        </Flex>
    );
};

export default Footer;
