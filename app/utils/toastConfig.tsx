// utils/toastConfig.tsx
import { ToastId, UseToastOptions } from '@chakra-ui/react';
import { ReactNode } from 'react';
import ToastBanner, {
    ToastBannerVariant,
} from '../components/Toasts/ToastBanner';
import {
    TOAST_BANNER_CONTAINER_STYLE,
    TOAST_BANNER_DURATION_MS,
    TOAST_BANNER_POSITION,
    TOAST_BANNER_ANIMATION_MS,
} from './toastDefaults';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastParams {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
    id?: string;
}

// Define the type for the toast function
type ToastFunction = (options: UseToastOptions) => ToastId;

const variantMap: Record<ToastType, ToastBannerVariant> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
};

export const showToast = (
    toast: ToastFunction,
    { title, description, type = 'info', duration, id }: ToastParams
) => {
    const autoCloseMs =
        typeof duration === 'number' ? duration : TOAST_BANNER_DURATION_MS;

    toast({
        id,
        duration: null,
        position: TOAST_BANNER_POSITION,
        containerStyle: TOAST_BANNER_CONTAINER_STYLE,
        render: ({ onClose }) => (
            <ToastBanner
                variant={variantMap[type]}
                title={title}
                description={description}
                onClose={onClose}
                autoCloseMs={autoCloseMs}
                animationMs={TOAST_BANNER_ANIMATION_MS}
            />
        ),
        // Keep these for callers that might still rely on Chakra semantics.
        title,
        description,
        status: type,
        isClosable: false,
    });
};

// Predefined Toast Functions
export const showSuccessToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number,
    id?: string
) => showToast(toast, { title, description, type: 'success', duration, id });

export const showErrorToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number,
    id?: string
) => showToast(toast, { title, description, type: 'error', duration, id });

export const showWarningToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number,
    id?: string
) => showToast(toast, { title, description, type: 'warning', duration, id });

export const showInfoToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number,
    id?: string
) => showToast(toast, { title, description, type: 'info', duration, id });

// Custom toast with render function support
export const showCustomToast = (
    toast: ToastFunction,
    {
        render,
        duration,
        id,
        position = TOAST_BANNER_POSITION,
        containerStyle = TOAST_BANNER_CONTAINER_STYLE,
    }: {
        render: (props: { id?: ToastId; onClose: () => void }) => ReactNode;
        duration?: number | null; // null = persist until closed
        id?: string;
        position?: UseToastOptions['position'];
        containerStyle?: UseToastOptions['containerStyle'];
    }
) => {
    toast({
        id,
        duration:
            duration === null
                ? null
                : (duration ?? TOAST_BANNER_DURATION_MS),
        position,
        containerStyle,
        render,
    });
};
