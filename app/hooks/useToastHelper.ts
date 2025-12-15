// hooks/useToastHelper.ts
import { useToast } from '@chakra-ui/react';
import {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showCustomToast,
} from '../utils/toastConfig';
import ConnectionLostToast from '../components/Toasts/ConnectionLostToast';

const useToastHelper = () => {
    const toast = useToast();

    const success = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        if (id && toast.isActive(id)) return;
        showSuccessToast(toast, title, description, duration, id);
    };

    const error = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        if (id && toast.isActive(id)) return;
        showErrorToast(toast, title, description, duration, id);
    };

    const warning = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        if (id && toast.isActive(id)) return;
        showWarningToast(toast, title, description, duration, id);
    };

    const info = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        if (id && toast.isActive(id)) return;
        showInfoToast(toast, title, description, duration, id);
    };

    const connectionLost = (duration?: number | null, id?: string) => {
        if (id && toast.isActive(id)) return;
        showCustomToast(toast, {
            id,
            duration: duration ?? null, // null = persist until closed
            containerStyle: {
                marginTop: '0px',
                marginBottom: '0px',
                maxWidth: '340px',
                minWidth: '340px',
                width: '340px',
                marginInline: 'auto',
            },
            render: ({ onClose }) => ConnectionLostToast({ onClose }),
        });
    };

    // Close a specific toast by ID
    const close = (id: string) => {
        if (toast.isActive(id)) {
            toast.close(id);
        }
    };

    // Close all toasts
    const closeAll = () => {
        toast.closeAll();
    };

    return { success, error, warning, info, connectionLost, close, closeAll };
};

export default useToastHelper;
