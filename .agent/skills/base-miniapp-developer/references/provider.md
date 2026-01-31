# Providers & Frame Readiness

Preferred provider setup:

```tsx
'use client';
import { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';
import '@coinbase/onchainkit/styles.css';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      miniKit={{ enabled: true }}
    >
      {children}
    </OnchainKitProvider>
  );
}
```

Frame readiness (call once after mount):

```tsx
'use client';
import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export function FrameReady() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);
  return null;
}
```

Mini App layout helper:

```tsx
import { SafeArea } from '@coinbase/onchainkit/minikit';

export function PageShell({ children }: { children: ReactNode }) {
  return <SafeArea>{children}</SafeArea>;
}
```
