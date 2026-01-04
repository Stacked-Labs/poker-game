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
import {
    CONNECTION_LOST_CONTAINER_STYLE,
    CONNECTION_LOST_TOAST_POSITION,
    TOAST_BANNER_ID,
} from '../utils/toastDefaults';

const useToastHelper = () => {
    const toast = useToast();

    const success = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        const effectiveId = id ?? TOAST_BANNER_ID;
        if (!id && toast.isActive(effectiveId)) {
            toast.close(effectiveId);
        }
        if (id && toast.isActive(effectiveId)) return;
        showSuccessToast(toast, title, description, duration, effectiveId);
    };

    const error = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        const effectiveId = id ?? TOAST_BANNER_ID;
        if (!id && toast.isActive(effectiveId)) {
            toast.close(effectiveId);
        }
        if (id && toast.isActive(effectiveId)) return;
        showErrorToast(toast, title, description, duration, effectiveId);
    };

    const warning = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        const effectiveId = id ?? TOAST_BANNER_ID;
        if (!id && toast.isActive(effectiveId)) {
            toast.close(effectiveId);
        }
        if (id && toast.isActive(effectiveId)) return;
        showWarningToast(toast, title, description, duration, effectiveId);
    };

    const info = (
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        const effectiveId = id ?? TOAST_BANNER_ID;
        if (!id && toast.isActive(effectiveId)) {
            toast.close(effectiveId);
        }
        if (id && toast.isActive(effectiveId)) return;
        showInfoToast(toast, title, description, duration, effectiveId);
    };

    const connectionLost = (duration?: number | null, id?: string) => {
        if (id && toast.isActive(id)) return;
        showCustomToast(toast, {
            id,
            duration: duration ?? null, // null = persist until closed
            position: CONNECTION_LOST_TOAST_POSITION,
            containerStyle: CONNECTION_LOST_CONTAINER_STYLE,
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
