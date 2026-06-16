'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageview } from '@/app/utils/analytics';
import { IdentifyOnAuth } from './IdentifyOnAuth';
import { ConsentBanner } from './ConsentBanner';
import { TableSuperProps } from './TableSuperProps';

function PageviewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;
        const qs = searchParams?.toString();
        const url = qs ? `${pathname}?${qs}` : pathname;
        trackPageview(url);
    }, [pathname, searchParams]);

    return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initAnalytics();
    }, []);

    return (
        <>
            <Suspense fallback={null}>
                <PageviewTracker />
            </Suspense>
            <IdentifyOnAuth />
            <TableSuperProps />
            {children}
            <ConsentBanner />
        </>
    );
}
