# Frontend (`packages/frontend`)

Vite + React 19 + TypeScript SPA, Tailwind CSS v4, shadcn/Radix-style UI components.

- **`pages/`** — one folder per screen:
  - `Login` — password login + MFA challenge (SMS, email, app, passkey)
  - `Register` — user registration
  - `ForgotPassword` — password reset
  - `Confirm` — OIDC consent screen
  - `Account` — user profile, security/MFA settings, sessions, admin UI
  - `PasskeyRegister` — reusable component for passkey registration (cross-device via the `/passkey-register/:sessionId` route)
- **`context/AuthProvider.tsx`** — holds authenticated user in React state, exposes `login`/`logout`/`refreshUser`.
- **`api/`** — typed `axios` wrappers per backend endpoint, with shared type definitions in `api/shared/auth-types.ts` for authentication responses used across multiple endpoints.
- **`components/ui/`** — shared design-system primitives (dialog, popover, tooltip, select, tabs, etc.), thin wrappers around Radix.
- Routing is driven by `pages/index.tsx`, which handles:
  - Initial `refreshUser()`/OIDC-interaction-status check on mount
  - `/passkey-register/:sessionId` — dedicated route rendering `PasskeyRegisterComponent` for cross-device registration
  - `/interaction/:interactionId` — entry route rendering `InteractionEntry`, which looks up the OIDC interaction status and redirects to the matching `/oauth/:stage/:interactionId` route

## Cross-Device Passkey Registration Flow

1. User initiates from Account → Security → Passkeys → "Register on Another Device"
2. Modal with QR code opens, linking to `/passkey-register/SESSION_ID`
3. On second device, `PasskeyRegisterComponent` renders via the `/passkey-register/:sessionId` route
4. Component calls backend to complete WebAuthn registration
5. After success, redirects to Account page
