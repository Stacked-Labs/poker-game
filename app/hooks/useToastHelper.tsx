// hooks/useToastHelper.tsx
import { useToast } from '@chakra-ui/react';
import {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showCustomToast,
    buildBannerRender,
} from '../utils/toastConfig';
import ReconnectingToast from '../components/Toasts/ReconnectingToast';
import DepositSuccessToast from '../components/Toasts/DepositSuccessToast';
import {
    TOAST_BANNER_CONTAINER_STYLE,
    TOAST_BANNER_ID,
    TOAST_BANNER_POSITION,
} from '../utils/toastDefaults';
import { useFormatAmount } from './useFormatAmount';

const useToastHelper = () => {
    const toast = useToast();
    const { format } = useFormatAmount();

    const showBanner = (
        type: 'success' | 'error' | 'warning' | 'info',
        title: string,
        description?: string,
        duration?: number,
        id?: string
    ) => {
        const effectiveId = id ?? TOAST_BANNER_ID;
        if (toast.isActive(effectiveId)) {
            if (id) return; // deduplicate explicit IDs
            // Update in-place — avoids duplicate AnimatePresence keys
            toast.update(effectiveId, {
                render: buildBannerRender({ title, description, type, duration }),
            });
            return;
        }
        switch (type) {
            case 'success': return showSuccessToast(toast, title, description, duration, effectiveId);
            case 'error':   return showErrorToast(toast, title, description, duration, effectiveId);
            case 'warning': return showWarningToast(toast, title, description, duration, effectiveId);
            case 'info':    return showInfoToast(toast, title, description, duration, effectiveId);
        }
    };

    const success = (title: string, description?: string, duration?: number, id?: string) =>
        showBanner('success', title, description, duration, id);

    const error = (title: string, description?: string, duration?: number, id?: string) =>
        showBanner('error', title, description, duration, id);

    const warning = (title: string, description?: string, duration?: number, id?: string) =>
        showBanner('warning', title, description, duration, id);

    const info = (title: string, description?: string, duration?: number, id?: string) =>
        showBanner('info', title, description, duration, id);

    const connectionLost = (
        opts: {
            duration?: number | null;
            id?: string;
            onReconnectNow?: () => void;
        } = {}
    ) => {
        const { duration = null, id, onReconnectNow } = opts;
        if (id && toast.isActive(id)) return;
        showCustomToast(toast, {
            id,
            duration, // null = persist until closed
            position: TOAST_BANNER_POSITION,
            containerStyle: TOAST_BANNER_CONTAINER_STYLE,
            render: ({ onClose }) => (
                <ReconnectingToast
                    onClose={onClose}
                    onReconnectNow={onReconnectNow}
                />
            ),
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

    const deposit = (amount: number, isCrypto?: boolean) => {
        const id = 'deposit-success';
        if (toast.isActive(id)) toast.close(id);
        showCustomToast(toast, {
            id,
            duration: null,
            position: TOAST_BANNER_POSITION,
            containerStyle: TOAST_BANNER_CONTAINER_STYLE,
            render: ({ onClose }) => (
                <DepositSuccessToast amount={amount} onClose={onClose} formatAmount={format} isCrypto={isCrypto} />
            ),
        });
    };

    return { success, error, warning, info, connectionLost, close, closeAll, deposit };
};

export default useToastHelper;
