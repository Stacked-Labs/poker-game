import { UseToastOptions } from '@chakra-ui/react';

export const TOAST_BANNER_DURATION_MS = 5000;
// Short-lived confirmations (e.g. "Address copied") that don't need the full
// banner dwell time.
export const TOAST_BANNER_DURATION_SHORT_MS = 1500;
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

