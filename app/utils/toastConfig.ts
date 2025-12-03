// utils/toastConfig.ts
import { UseToastOptions } from '@chakra-ui/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastParams {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
    id?: string;
}

// Define the type for the toast function
type ToastFunction = (options: UseToastOptions) => void;

const DEFAULT_DURATION = 3500;
const DEFAULT_POSITION: UseToastOptions['position'] = 'top-right';
const DEFAULT_CONTAINER_STYLE: UseToastOptions['containerStyle'] = {
    marginTop: '0px',
    marginBottom: '0px',
    maxWidth: '260px',
    minWidth: '260px',
    width: '260px',
    marginInline: 'auto',
};

const statusMap: Record<ToastType, UseToastOptions['status']> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
};

export const showToast = (
    toast: ToastFunction,
    { title, description, type = 'info', duration, id }: ToastParams
) => {
    toast({
        id,
        title,
        description,
        status: statusMap[type],
        duration: duration ?? DEFAULT_DURATION,
        isClosable: true,
        position: DEFAULT_POSITION,
        containerStyle: DEFAULT_CONTAINER_STYLE,
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
