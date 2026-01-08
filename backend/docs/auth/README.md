# Auth Service Documentation

## Overview
The Auth Service handles authentication and authorization for all user types in the Kirata ecosystem: **Admins**, **Shopkeepers**, and **Customers**.

## System Design

### 1. User Types
- **Admins**: Internal users with email/password access. Roles: `SUPER_ADMIN`, `SHOP_MANAGER_ADMIN`, `SUPPORT_ADMIN`.
- **Shopkeepers**: Application users who manage shops. Auth via **Phone + OTP**.
- **Customers**: End-users who place orders. Auth via **Phone + OTP**.

### 2. Authentication Flow
- **Unified Flow (Admin, Shopkeeper, Customer)**:
    1. **Register**: Register with email or phone.
    2. **Request OTP**: User enters phone/email. System checks role and generates OTP.
    3. **Verify OTP**: User enters OTP. System validates and returns JWT token with appropriate role.
- **Admin Specifics**: Admins can still optionally use password-based login (legacy support), but OTP is now supported.

### 3. Security
- **Global Uniqueness**: 
    - **Phone/Email**: Must be unique across Admin, Shopkeeper, and Customer tables.
    - **Unique ID**: The human-readable `uniqueId` (e.g., `ramexxx`) is also globally unique across all user types.
- **Passwords**: Hashed (likely bcrypt/argon2).
- **OTPs**: Time-limited (e.g., 5-10 minutes).
- **Tokens**: JWT used for state-less authentication on protected routes.

---

## API Routes & Examples

### 1. Admin Registration
**Description**: Register a new internal admin.

**Endpoint**: `POST /api/auth/admin/register`

**Input (JSON)**:
```json
{
  "email": "admin@kirata.com", // Optional if phone provided
  "phone": "+919999999999",    // Optional if email provided
  "password": "securepassword123", // Optional
  "name": "Super Admin",
  "role": "SUPER_ADMIN" 
}
// Roles: SUPER_ADMIN, SHOP_MANAGER_ADMIN, SUPPORT_ADMIN
```

**Output (JSON)**:
```json
{
  "adminId": "ADM-1234567890",
  "uniqueId": "johndoe1a2b",
  "message": "Admin registered successfully. OTP sent."
}
```

### 2. Admin Login
**Note**: Admins now use the **Unified Login** endpoint (`POST /api/auth/login`) described below. The dedicated admin login routes are deprecated/removed in favor of the unified flow.

### 3. Shopkeeper Registration
**Description**: Register a new shopkeeper.

**Endpoint**: `POST /api/shopkeeper/register`

**Input (JSON)**:
```json
{
  "phone": "+919999999999",
  "email": "shop@kirata.com", // Optional
  "name": "Ramesh Kumar"     // Optional
}
```

**Output (JSON)**:
```json
{
  "message": "Shopkeeper registered. OTP sent.",
  "uniqueId": "rameshkumar4x9z"
}
```

### 4. Customer Registration
**Description**: Register a new customer.

**Endpoint**: `POST /api/customer/register`

**Input (JSON)**:
```json
{
  "phone": "+918888888888",
  "email": "customer@gmail.com", // Optional
  "name": "Suresh"            // Optional
}
```

**Output (JSON)**:
```json
{
  "message": "Customer registered. OTP sent.",
  "uniqueId": "suresh7b3k"
}
```

### 5. Request OTP
**Description**: Request an OTP for login (Shopkeeper/Customer).

**Endpoint**: `POST /api/auth/otp`

**Input (JSON)**:
```json
{
  "phone": "+919999999999"
}
```

**Output (JSON)**:
```json
{
  "message": "OTP sent successfully",
  "devOtp": "123456" // Only in dev/test environment
}
```

### 6. Unified Login (OTP or Password)
**Description**: Authenticate **ANY** user (Admin, Shopkeeper, Customer) via OTP or Password.

**Endpoint**: `POST /api/auth/login`

**Scenario A: Login with OTP**
**Input (JSON)**:
```json
{
  "email": "user@kirata.com", // OR phone
  "otp": "123456"
}
```

**Scenario B: Login with Password**
**Input (JSON)**:
```json
{
  "email": "user@kirata.com", // OR phone
  "password": "securepassword123"
}
```

**Output (JSON)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "ADM-1234567890",
    "email": "user@kirata.com",
    "name": "John Doe",
    "role": "SUPER_ADMIN"
  }
}
```

### 7. Set / Reset Password
**Description**: Set or change password. Requires OTP verification.

**Step 1: Request OTP for Password Reset**
**Endpoint**: `POST /api/auth/password/reset-request`

**Input (JSON)**:
```json
{
  "email": "user@kirata.ata.com" // OR phone
}
```

**Step 2: Confirm & Set Password**
**Endpoint**: `POST /api/auth/password/reset-confirm`

**Input (JSON)**:
```json
{
  "email": "user@kirata.com", // OR phone
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

### 8. Get Profile
**Description**: Get current user profile and role.

**Endpoint**: `GET /api/me`

**Headers**:
`Authorization: Bearer <token>`

**Output (JSON)**:
```json
{
  "role": "SHOPKEEPER",
  "profile": { ... }
}
```

### 9. Resend OTP
**Description**: Resend a new OTP to the user's phone or email.

**Endpoint**: `POST /api/auth/resend-otp`

**Input (JSON)**:
```json
{
  "email": "user@kirata.com" // OR phone
}
```

### 10. Logout
**Description**: Logout is handled client-side by removing the JWT token. The server is stateless, so no specific endpoint is required.

### 11. Update Profile
**Description**: Update user profile details (Name, Address).
**Roles**: Admin, Shopkeeper, Customer.

**Endpoint**: `PUT /api/me`

**Headers**:
`Authorization: Bearer <token>`

**Input (JSON)**:
```json
{
  "name": "Updated Name",
  "address": "123 New Street, City" // Min 5 chars
}
```

**Output (JSON)**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "ADM-1234567890",
    "name": "Updated Name",
    "email": "user@kirata.com",
    "address": "123 New Street, City",
    "role": "SUPER_ADMIN"
  }
}
```

---

## Account Management

### 1. Deactivate Account (Soft Delete)
**Description**: Deactivate account with 30-day grace period. Password login disabled, OTP login still works for reactivation.

**Endpoint**: `DELETE /api/me`

**Headers**: `Authorization: Bearer <token>`

**Output**:
```json
{
  "message": "Account deactivated. You can reactivate within 30 days by logging in with OTP.",
  "scheduledDeletionAt": "2026-02-03T00:00:00.000Z"
}
```

### 2. Reactivate Account
**Description**: Manually reactivate a deactivated account (also auto-reactivates on OTP login).

**Endpoint**: `POST /api/me/reactivate`

**Headers**: `Authorization: Bearer <token>`

**Output**:
```json
{
  "message": "Account reactivated successfully"
}
```

---

## Session Management

### 1. List Active Sessions
**Description**: View all active sessions (refresh tokens) for the current user.

**Endpoint**: `GET /api/sessions`

**Headers**: `Authorization: Bearer <token>`

**Output**:
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "createdAt": "2026-01-04T00:00:00.000Z",
      "expiresAt": "2026-02-03T00:00:00.000Z"
    }
  ]
}
```

### 2. Revoke Specific Session
**Description**: Logout from a specific device/session.

**Endpoint**: `DELETE /api/sessions/:sessionId`

**Headers**: `Authorization: Bearer <token>`

**Output**:
```json
{
  "message": "Session revoked successfully"
}
```

### 3. Revoke All Sessions
**Description**: Logout from all devices (except current session).

**Endpoint**: `DELETE /api/sessions`

**Headers**: `Authorization: Bearer <token>`

**Output**:
```json
{
  "message": "5 session(s) revoked successfully"
}
```

---

## Change Email/Phone

### 1. Request Email Change
**Description**: Send OTP to new email address.

**Endpoint**: `POST /api/me/change-email/request`

**Headers**: `Authorization: Bearer <token>`

**Input**:
```json
{
  "newEmail": "newemail@example.com"
}
```

**Output**:
```json
{
  "message": "OTP sent to new email. Please verify to complete the change."
}
```

### 2. Confirm Email Change
**Description**: Verify OTP and update email.

**Endpoint**: `POST /api/me/change-email/confirm`

**Headers**: `Authorization: Bearer <token>`

**Input**:
```json
{
  "newEmail": "newemail@example.com",
  "otp": "123456"
}
```

**Output**:
```json
{
  "message": "Email changed successfully"
}
```

### 3. Request Phone Change
**Description**: Send OTP to new phone number.

**Endpoint**: `POST /api/me/change-phone/request`

**Headers**: `Authorization: Bearer <token>`

**Input**:
```json
{
  "newPhone": "+919876543210"
}
```

**Output**:
```json
{
  "message": "OTP sent to new phone. Please verify to complete the change."
}
```

### 4. Confirm Phone Change
**Description**: Verify OTP and update phone.

**Endpoint**: `POST /api/me/change-phone/confirm`

**Headers**: `Authorization: Bearer <token>`

**Input**:
```json
{
  "newPhone": "+919876543210",
  "otp": "123456"
}
```

**Output**:
```json
{
  "message": "Phone changed successfully"
}
```

---

## Email Verification

### 1. Send Email Verification OTP
**Description**: Send verification OTP to user's email.

**Endpoint**: `POST /api/me/verify-email/send`

**Headers**: `Authorization: Bearer <token>`

**Output**:
```json
{
  "message": "Verification OTP sent to email"
}
```

### 2. Confirm Email Verification
**Description**: Verify email with OTP.

**Endpoint**: `POST /api/me/verify-email/confirm`

**Headers**: `Authorization: Bearer <token>`

**Input**:
```json
{
  "otp": "123456"
}
```

**Output**:
```json
{
  "message": "Email verified successfully"
}
```

---

## Admin Functions

### Unlock Account
**Description**: Manually unlock a locked account (SUPER_ADMIN only).

**Endpoint**: `POST /api/admin/unlock-account`

**Headers**: `Authorization: Bearer <token>` (SUPER_ADMIN role required)

**Input**:
```json
{
  "targetUserId": "user-id-or-adminId",
  "targetRole": "SHOPKEEPER" // or CUSTOMER, SUPER_ADMIN, etc.
}
```

**Output**:
```json
{
  "message": "Account unlocked successfully"
}
```

---

## Security Features

### Password Strength Requirements
All passwords must meet the following criteria:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Account Lockout
- After 5 failed password login attempts, account is locked for 1 hour
- Lockout can be bypassed by SUPER_ADMIN using unlock endpoint
- Failed attempts counter resets on successful login

### Soft Delete Behavior
- Deleted accounts remain in database for 30 days
- Password login is disabled for deleted accounts
- OTP login works and automatically reactivates the account
- After 30 days, accounts are permanently deleted by cleanup job

### Audit Logging
All security-critical actions are logged to `audit_logs` table:
- Login attempts (success/failure)
- Account deactivation/reactivation
- Session revocations
- Email/phone changes
- Password changes
- Account unlocks


