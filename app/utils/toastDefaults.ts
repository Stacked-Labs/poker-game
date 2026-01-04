import { UseToastOptions } from '@chakra-ui/react';

export const TOAST_BANNER_DURATION_MS = 5000;
export const TOAST_BANNER_ID = 'stacked-banner';
export const TOAST_BANNER_ANIMATION_MS = 180;

export const TOAST_BANNER_POSITION: UseToastOptions['position'] = 'top';
export const TOAST_BANNER_CONTAINER_STYLE: UseToastOptions['containerStyle'] = {
    width: '100%',
    maxWidth: '100%',
    marginTop: '0px',
    marginBottom: '0px',
    marginInline: '0px',
    paddingInline: '0px',
    left: '0px',
    right: '0px',
};

export const CONNECTION_LOST_TOAST_POSITION: UseToastOptions['position'] =
    'top-right';
export const CONNECTION_LOST_CONTAINER_STYLE: UseToastOptions['containerStyle'] =
    {
        marginTop: '0px',
        marginBottom: '0px',
        maxWidth: '340px',
        minWidth: '340px',
        width: '340px',
        marginInline: 'auto',
    };
