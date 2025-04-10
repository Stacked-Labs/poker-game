import { useEffect, useState, useContext } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { isTableOwner } from '@/app/hooks/server_actions';

const useIsTableOwner = () => {
    const { appState } = useContext(AppContext);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const checkTableOwner = async () => {
            if (appState.table) {
                try {
                    const result = await isTableOwner(appState.table);
                    setIsOwner(result.isTableOwner);
                } catch (error) {
                    console.error('Error checking table ownership:', error);
                    setIsOwner(false);
                }
            }
        };

        checkTableOwner();
    }, [appState.table, appState.clientID]);

    return isOwner;
};

export default useIsTableOwner;