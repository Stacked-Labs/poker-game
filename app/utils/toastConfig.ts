// utils/toastConfig.ts
import { UseToastOptions } from '@chakra-ui/react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastParams {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
}

// Define the type for the toast function
type ToastFunction = (options: UseToastOptions) => void;

export const showToast = (
    toast: ToastFunction,
    { title, description, type = 'info', duration = 5000 }: ToastParams
) => {
    const statusMap: Record<ToastType, UseToastOptions['status']> = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info',
    };

    toast({
        title,
        description,
        status: statusMap[type],
        duration,
        isClosable: true,
        position: 'bottom-right',
    });
};

// Predefined Toast Functions
export const showSuccessToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number
) => {
    showToast(toast, { title, description, type: 'success', duration });
};

export const showErrorToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number
) => {
    showToast(toast, { title, description, type: 'error', duration });
};

export const showWarningToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number
) => {
    showToast(toast, { title, description, type: 'warning', duration });
};

export const showInfoToast = (
    toast: ToastFunction,
    title: string,
    description?: string,
    duration?: number
) => {
    showToast(toast, { title, description, type: 'info', duration });
};
