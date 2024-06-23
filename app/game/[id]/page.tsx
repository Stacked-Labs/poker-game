'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { joinTable, sendLog, newPlayer } from '@/app/hooks/server_actions';
import Table from '@/app/components/Table';
import { useContext } from 'react';
import { SocketContext } from '@/app/contexts/WebSocketProvider';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Player } from '@/app/interfaces';

const MainGamePage = () => {
    const searchParams = useSearchParams();
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

    useEffect(() => {
        // Convert searchParams to a standard URLSearchParams object to use the get method
        const params = new URLSearchParams(searchParams.toString());
        const tableId = params.get('id');

        if (socket && !appState.table && tableId) {
            joinTable(socket, tableId);
            dispatch({ type: 'setTablename', payload: tableId });
            sendLog(socket, `Joined table ${tableId}`);
        }
    }, [socket, appState.table, searchParams, dispatch]); // Updated dependencies

    return <Table players={players} setPlayers={setPlayers} />;
};

export default MainGamePage;
