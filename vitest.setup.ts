// Registers jest-dom matchers (toBeInTheDocument, etc.) for component tests. Harmless for the
// node-environment pure-logic tests — it only augments `expect`; matchers touch the DOM lazily.
import '@testing-library/jest-dom/vitest';
