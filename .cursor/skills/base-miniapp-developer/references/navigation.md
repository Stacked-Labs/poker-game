# Navigation & Social Actions

Use MiniKit hooks instead of `window.location` or `window.open`.

External links:

```tsx
import { useOpenUrl } from '@coinbase/onchainkit/minikit';
const openUrl = useOpenUrl();
openUrl('https://base.org');
```

Common hooks:
- `useViewProfile()`
- `useViewCast()`
- `useComposeCast()`
- `useNotification()`
