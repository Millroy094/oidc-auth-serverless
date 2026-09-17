# Frontend (`packages/frontend`)

Vite + React 19 + TypeScript SPA, Tailwind CSS v4, shadcn/Radix-style UI components.

- **`pages/`** — one folder per screen: `Login` (password + MFA challenge), `Register`, `ForgotPassword`, `Confirm` (OIDC consent), `Account` (profile, security/MFA, sessions, and an admin-only `Users`/`Clients`/`Resources` management UI).
- **`context/AuthProvider.tsx`** — holds the authenticated user in React state, exposes `login`/`logout`/`refreshUser`.
- **`api/`** — typed `axios` wrappers per backend endpoint.
- **`components/ui/`** — shared design-system primitives (dialog, popover, tooltip, select, tabs, etc.), thin wrappers around Radix.
- Routing is driven by `pages/index.tsx`, which also kicks off the initial `refreshUser()`/OIDC-interaction-status check on mount.
