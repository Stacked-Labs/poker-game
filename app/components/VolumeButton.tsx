'use client';

import React, { useContext, useCallback } from 'react';
import { Icon, IconButton, Tooltip } from '@chakra-ui/react';
import {
    IoVolumeHigh,
    IoVolumeLow,
    IoVolumeMedium,
    IoVolumeMute,
} from 'react-icons/io5';
import { AppContext } from '../contexts/AppStoreProvider';

const VolumeButtonComponent = () => {
    const { appState, dispatch } = useContext(AppContext);

    const handleClick = useCallback(() => {
        const levels = [0, 0.25, 0.5, 1];
        const currentIndex = levels.indexOf(appState.volume);
        const newIndex = (currentIndex + 1) % levels.length;
        const newLevel = levels[newIndex];
        dispatch({ type: 'setVolume', payload: newLevel });
    }, [appState.volume, dispatch]);

    const getVolumeIcon = useCallback(() => {
        if (appState.volume === 0) return IoVolumeMute;
        if (appState.volume === 0.25) return IoVolumeLow;
        if (appState.volume === 0.5) return IoVolumeMedium;
        return IoVolumeHigh;
    }, [appState.volume]);

    const VolumeIcon = getVolumeIcon();

    return (
        <Tooltip label={`Volume: ${appState.volume * 100}%`} placement="top">
            <IconButton
                aria-label={`Volume: ${appState.volume * 100}%`}
                icon={<Icon as={VolumeIcon} boxSize={{ base: 4, md: 5 }} />}
                onClick={handleClick}
                zIndex={3}
                role="button"
                tabIndex={0}
                variant={'gameSettingsButton'}
                size={{ base: 'md', md: 'md' }}
                px={2}
                py={2}
                width={{ base: '40px', sm: '40px', md: '48px' }}
                height={{ base: '40px', sm: '40px', md: '48px' }}
            />
        </Tooltip>
    );
};

export default React.memo(VolumeButtonComponent);
