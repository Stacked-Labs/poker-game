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

export const showToast = (
    toast: ToastFunction,
    { title, description, type = 'info', duration, id }: ToastParams
) => {
    const statusMap = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info',
    } as const;

    toast({
        id,
        title,
        description,
        status: statusMap[type],
        duration,
        isClosable: true,
        position: 'top-right',
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
