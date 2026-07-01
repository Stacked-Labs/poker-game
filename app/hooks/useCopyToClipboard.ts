'use client';

import { useCallback, useRef, useState } from 'react';
import useToastHelper from '@/app/hooks/useToastHelper';
import { useCopy } from '@/app/hooks/useExplorerUrl';
import { COPY_RESET_MS } from '@/app/utils/toastDefaults';

// One clipboard path for the whole app. Success is confirmed INLINE by the
// caller via the returned `copied` flag (an icon flip / tooltip) — a toast is
// too heavy for an immediate local action. A copy *failure* always toasts, so
// it is never silently dropped.
export function useCopyToClipboard() {
    const write = useCopy();
    const { error } = useToastHelper();
    const [copied, setCopied] = useState(false);
    const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copy = useCallback(
        async (value: string) => {
            const ok = await write(value);
            if (ok) {
                setCopied(true);
                if (resetRef.current) clearTimeout(resetRef.current);
                resetRef.current = setTimeout(() => setCopied(false), COPY_RESET_MS);
            } else {
                error('Could not copy');
            }
            return ok;
        },
        [write, error]
    );

    return { copy, copied };
}

export default useCopyToClipboard;
