// hooks/useToastHelper.ts
import { useToast } from '@chakra-ui/react';
import {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
} from '../utils/toastConfig';

const useToastHelper = () => {
    const toast = useToast();

    const success = (title: string, description?: string, duration?: number, id?: string) => {
        if (id && toast.isActive(id)) return;
        showSuccessToast(toast, title, description, duration, id);
    };

    const error = (title: string, description?: string, duration?: number, id?: string) => {
        if (id && toast.isActive(id)) return;
        showErrorToast(toast, title, description, duration, id);
    };

    const warning = (title: string, description?: string, duration?: number, id?: string) => {
        if (id && toast.isActive(id)) return;
        showWarningToast(toast, title, description, duration, id);
    };

    const info = (title: string, description?: string, duration?: number, id?: string) => {
        if (id && toast.isActive(id)) return;
        showInfoToast(toast, title, description, duration, id);
    };

    return { success, error, warning, info };
};

export default useToastHelper;
