# Passkey Configuration Guide

## Configuration Method

Passkey settings are configured **exclusively through the admin dashboard**:
- **Endpoint**: `PUT /api/admin/settings/passkey`
- **Required**: Admin authentication and authorization
- **Settings apply**: Immediately, without service restart
- **Fallback defaults**: If not configured, sensible defaults are used (see below)

## Default Values

If passkey settings not configured in admin panel:
- **Attestation Type**: `'none'` (trust client, no authenticator validation)
- **Authenticator Attachment**: `'platform'` (built-in authenticators only)
- **Challenge Timeout**: `300` seconds (5 minutes)
- **Max Per User**: `0` (unlimited)
- **Cross-Device Session Timeout**: `600` seconds (10 minutes)

## Configurable Settings

### Attestation Type
**Field**: `attestationType`
**Options**: `'none'` | `'direct'`
**Default**: `'none'`

- `'none'`: No attestation required (faster, more compatible)
- `'direct'`: Verify authenticator certificate (more secure, recommended for high-security apps)

### Authenticator Attachment
**Field**: `authenticatorAttachment`
**Options**: `'platform'` | `'cross-platform'` | `'all'`
**Default**: `'platform'`

- `'platform'`: Built-in authenticators only (Face ID, Touch ID, Windows Hello)
- `'cross-platform'`: External authenticators only (YubiKey, security keys)
- `'all'`: Both types allowed

### Challenge Timeout
**Field**: `challengeTimeout`
**Type**: Number (seconds)
**Default**: `300` (5 minutes)

Time before a challenge expires. Shorter = more secure but less forgiving.

### Maximum Passkeys Per User
**Field**: `maxPerUser`
**Type**: Number
**Default**: `0` (unlimited)

Maximum number of passkeys a user can register.

### Cross-Device Session Timeout
**Field**: `crossDeviceSessionTimeout`
**Type**: Number (seconds)
**Default**: `600` (10 minutes)

How long cross-device registration QR codes remain valid.

---

## Admin API

### Get Passkey Settings
```
GET /api/admin/settings/passkey
Authorization: Bearer <admin-token>

Response:
{
  "message": "Passkey settings retrieved successfully",
  "settings": {
    "attestationType": "none",
    "authenticatorAttachment": "platform",
    "challengeTimeout": 300,
    "maxPerUser": 0,
    "crossDeviceSessionTimeout": 600
  }
}
```

### Update Passkey Settings
```
PUT /api/admin/settings/passkey
Authorization: Bearer <admin-token>

Body:
{
  "attestationType": "direct",
  "authenticatorAttachment": "all",
  "challengeTimeout": 300,
  "maxPerUser": 5,
  "crossDeviceSessionTimeout": 600
}

Response:
{
  "message": "Passkey settings updated successfully",
  "settings": { ... }
}
```

---

## Configuration Scenarios

Use the admin API to set passkey settings for different deployment scenarios.

### 1. Consumer Application (High Convenience)
Focus on ease of use and broad device support.

```json
{
  "attestationType": "none",
  "authenticatorAttachment": "all",
  "challengeTimeout": 600,
  "maxPerUser": 10
}
```

**Why**:
- `'none'` attestation = works on more devices
- `'all'` authenticators = users can use Face ID, Touch ID, or security keys
- Longer TTL = more forgiving
- Higher limit = more flexibility

### 2. Enterprise Security
Focus on high security and audit compliance.

```json
{
  "attestationType": "direct",
  "authenticatorAttachment": "platform",
  "challengeTimeout": 120,
  "maxPerUser": 3
}
```

**Why**:
- `'direct'` attestation = verify real authenticators
- `'platform'` only = controlled, managed devices
- Shorter TTL = stricter security
- Lower limit = easier to audit

### 3. Financial Services
Balance between security and UX.

```json
{
  "attestationType": "direct",
  "authenticatorAttachment": "all",
  "challengeTimeout": 300,
  "maxPerUser": 5
}
```

**Why**:
- `'direct'` attestation = prove device authenticity
- `'all'` authenticators = support users' preferred devices
- Standard TTL = reasonable timeout
- Moderate limit = balance flexibility and auditability

### 4. Development/Testing
Focus on simplicity and speed.

```json
{
  "attestationType": "none",
  "authenticatorAttachment": "all",
  "challengeTimeout": 3600,
  "maxPerUser": 0
}
```

**Why**:
- `'none'` attestation = simpler testing
- `'all'` authenticators = test any device
- Long TTL = debugging time
- Unlimited = no restrictions

---

## Security Features Enabled

### 1. Challenge-Response Verification
- ✅ Prevents replay attacks
- ✅ Configurable timeout via admin settings

### 2. Counter Verification
- ✅ Detects authenticator cloning attacks
- ✅ Real-time logging of suspected cloning
- ✅ Authentication blocked if counter doesn't increase

### 3. Duplicate Detection
- ✅ Prevents same authenticator registered twice via WebAuthn `excludeCredentials`:
  registration options list the user's existing credential IDs, so an
  authenticator/device that already holds one of them refuses to create a
  duplicate (`InvalidStateError`). This applies to same-device registration
  and the cross-platform/QR flow alike.
- ✅ Prevents duplicate device names: the backend auto-suffixes a colliding
  `deviceName` with " (2)", " (3)", etc. so every stored passkey name is
  unique per user, regardless of what the client submits.
- ✅ Enforces maximum passkeys per user via admin settings

### 4. Origin & RP ID Validation
- ✅ Prevents cross-origin attacks
- ✅ Validates authenticator origin
- ✅ Ensures correct relying party

### 5. Input Validation
- ✅ Validates all user inputs
- ✅ Sanitizes device names
- ✅ Comprehensive error messages

### 6. Audit Logging
- ✅ Logs registration attempts
- ✅ Logs authentication attempts
- ✅ Detects and logs cloning attacks
- ✅ Tracks all passkey operations

---

## Deployment Guide

### Step 1: Deploy
```bash
npm run build
# Deploy built artifacts to production
# (No configuration needed - sensible defaults apply)
```

### Step 2: Access Admin Dashboard
- Navigate to admin settings panel
- Go to Security → Passkey Settings

### Step 3: Configure Passkey Settings
Select one of the scenarios above or customize for your needs:

```bash
curl -X PUT https://your-domain/api/admin/settings/passkey \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "attestationType": "direct",
    "authenticatorAttachment": "platform",
    "challengeTimeout": 300,
    "maxPerUser": 5
  }'
```

### Step 4: Verify
Settings apply immediately - no restart needed.

### Step 5: Monitor
- Check logs for cloning attack warnings
- Monitor registration/authentication metrics
- Track duplicate detection events in audit logs

### Step 6: Test (Optional)
```bash
# Run test suite
npm test

# Test in staging environment first
# Verify all passkey operations work
# Test with different device types
```

---

## Troubleshooting

### Attestation Errors
**Error**: "Attestation verification failed"
**Cause**: Using `'direct'` with unsupported authenticators
**Solution**: Switch to `'none'` or use `'direct'` with tested devices

### Challenge Expiration
**Error**: "Unable to find challenge. Challenge may have expired."
**Cause**: Challenge timeout too short
**Solution**: Increase `challengeTimeout` via admin API

### Max Passkeys Exceeded
**Error**: "Maximum of X passkeys already registered"
**Cause**: User hit `PASSKEY_MAX_PER_USER` limit
**Solution**: Increase limit or have user delete old passkey

### Cross-Platform Issues
**Error**: "Authenticator not allowed"
**Cause**: `PASSKEY_AUTHENTICATOR_ATTACHMENT` doesn't match device type
**Solution**: Set to `'all'` or use compatible device type

### Authenticator Already Registered
**Error**: "This device already has a passkey for this account."
**Cause**: The authenticator/device already holds a credential for the user
(blocked via `excludeCredentials`), including when registering through the
cross-device QR flow.
**Solution**: Use a different device/authenticator, or delete the existing
passkey first if you intend to replace it.

### Cross-Device Registration Link Expired
**Error**: "This registration link has expired or already been used. Please
request a new QR code and try again."
**Cause**: The cross-device session (created by `initiatePasskeyRegistration`)
has passed its `crossDeviceSessionTimeout`, or registration already completed
with it.
**Solution**: Generate a new QR code from the originating device and complete
registration within the timeout window. The frontend now surfaces this exact
backend message (and other specific registration errors, such as verification
failures) instead of a generic HTTP status code.

---

## Monitoring & Alerts

### Key Metrics to Track

1. **Successful Registrations**
   ```
   Passkey registration successful for user {userId}
   ```

2. **Failed Registrations**
   - Invalid device names
   - Duplicate credentials
   - Duplicate device names

3. **Successful Authentications**
   ```
   Passkey authentication successful for user {userId}
   ```

4. **CLONING ATTACKS** (Critical!)
   ```
   CLONING ATTACK DETECTED for user {userId}: counter did not increase
   ```

5. **Suspicious Activities**
   - Non-existent users attempting login
   - Users without passkeys attempting login
   - Multiple failed verification attempts

### Recommended Alerts

```
Alert when:
- CLONING ATTACK detected → Page 1 immediately
- Multiple failed verifications in short time → Investigate
- Unusual registration patterns → Review
- Counter anomalies → Alert
```

---

## References

- [WebAuthn Spec](https://w3c.github.io/webauthn/)
- [SimpleWebAuthn Documentation](https://simplewebauthn.dev/)
- [FIDO2 Security Considerations](https://www.fido2project.org/)







