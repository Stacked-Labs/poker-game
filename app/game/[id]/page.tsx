'use client';
import { useState } from 'react';
import { joinTable, newPlayer, sendLog } from '@/app/hooks/server_actions';
import Table from '@/app/components/Table';
import { useContext } from 'react';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Player } from '@/app/interfaces';

const MainGamePage = ({ params }: { params: { id: string } }) => {
    const socket = useContext(SocketContext);
    const { appState, dispatch } = useContext(AppContext);

    const initialPlayers: (Player | null)[] = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
    ];
    const [players, setPlayers] = useState(initialPlayers);

    const tableId = params.id;

    if (socket && !appState.table && tableId) {
        joinTable(socket, tableId);
        dispatch({ type: 'setTablename', payload: tableId });
        sendLog(
            socket,
            `Joined table ${tableId} with ${appState.game?.players}`
        );
    }

    return <Table players={players} setPlayers={setPlayers} />;
};

export default MainGamePage;
