import { useContext } from 'react';
import { AppContext } from '@/app/contexts/AppStoreProvider';

// Keep this selector hook so consumers do not have to re-import the AppContext
// everywhere. It also gives us a single place to evolve ownership logic later
// (e.g. track loading/error state, add optimistic updates, memoize selectors).
const useIsTableOwner = () => {
    const { appState } = useContext(AppContext);
    return Boolean(appState.isTableOwner);
};

export default useIsTableOwner;
