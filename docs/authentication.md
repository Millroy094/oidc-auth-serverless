# Authentication, MFA & passkey flows

## Password login + MFA challenge
1. `POST /api/user/login` — verifies email/password. If the account has no MFA method verified, login succeeds immediately (access/refresh JWTs set as `httpOnly` cookies). If MFA is enabled, the response indicates a challenge is required instead of setting cookies.
2. Frontend prompts for a 6-digit OTP (or passkey, if available) via `pages/Login/VerifyOtpInput`.
3. `POST /api/user/mfa-verify` (or the passkey verify endpoint) completes the challenge and sets the session cookies.
4. `GET /api/user/is-authenticated` — used on every page load (`AuthProvider.refreshUser`) to re-hydrate the user from the access-token cookie; a 401 here triggers `logout()` client-side and redirects to `/login`.

## MFA methods
Users can enable any combination of:
- **Authenticator app (TOTP)** — `services/mfa/setup.ts#setupAppMFA` generates a random secret and returns a `TOTP` URI (rendered as a QR code in `Account/Security/MFA`), verified via `services/mfa/verify.ts#verifyAppMFA` (using `otpauth`).
- **SMS OTP** — `setupSMSMFA` sends a one-time code via SNS to the given mobile number; verified the same way.
- **Email OTP** — `setupEmailMFA` sends a one-time code via SES.

Each method stores a `subscriber` (the phone/email/TOTP secret) and a `verified` flag on the `User` model (`mfa.app` / `mfa.sms` / `mfa.email`). A method only becomes usable for login once `verified: true` — this is what the amber "not verified" tooltip in the MFA UI communicates (setup was started but the confirmation OTP was never completed).

**Setup vs. login OTPs use distinct copy.** `services/mfa/send.ts` takes an explicit `purpose: 'login' | 'setup'` so the email/SMS subject and body correctly say "confirm your new MFA method" during setup vs. "your login code" during an actual sign-in challenge — they're sent through the same underlying `sendEmailOtp`/`sendSMSOtp` functions but read from a `purposeMessage` map.

**One active OTP per user/channel.** `services/otp.ts` only stores a single OTP per `(userId, channel)` pair — requesting a new code (e.g. via "resend") invalidates any previously issued one for that channel. This is why the admin "create user" flow (see [admin-console.md](./admin-console.md)) sends a plain instructional email rather than a pre-generated OTP: any OTP sent at account-creation time would be silently invalidated the moment the user requests their own via "Forgot Password".

**Recovery codes.** `MFAService.generateRecoveryCodes` issues 10 single-use codes (bcrypt-hashed at rest); `validateRecoveryCode` consumes one and optionally resets all MFA methods (used for account recovery when a user loses access to every configured method).

## Passkeys (WebAuthn)
Implemented via `@simplewebauthn/server` (backend) and `@simplewebauthn/browser` (frontend), with `services/passkey.ts` + the `Challenge` DynamoDB table (TTL 300s) tracking in-flight WebAuthn ceremonies:
- **Registration**: `POST /api/user/register-passkey` issues a challenge (stored in `Challenge`), the browser's WebAuthn API signs it, `POST /api/user/verify-passkey-registration` verifies the attestation and stores the resulting credential under `user.mfa.passkey.credentials`.
- **Login (MFA step)**: after password verification succeeds and the account's MFA preference is `passkey`, `POST /api/user/login-with-passkey` issues a challenge (unauthenticated — no session cookie exists yet at this point in the flow); `POST /api/user/verify-passkey-login` verifies the assertion against stored credentials and completes login. Passkeys are used solely as an MFA factor here, never as a password replacement — the same challenge/verify pair as registration, gated behind `authenticate` for setup and unauthenticated for the login-time verification.

## Sessions
`GET /api/user/sessions` / `DELETE /api/user/sessions` / `DELETE /api/user/sessions/:sessionId` let a user list and revoke other active sessions (backed by the OIDC provider's session/grant records in the `OIDCStore` table). Admins can force-revoke a specific user's sessions via `DELETE /api/admin/users/:id/sessions`.
