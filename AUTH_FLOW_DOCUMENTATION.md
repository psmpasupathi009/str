# Complete Authentication Flow Documentation

## ✅ OTP Sending Flow - VERIFIED

### **SIGNUP FLOW** (New User Registration)

```
Step 1: User Fills Form
├─ Email Address (required)
├─ Full Name (required)
└─ Phone Number (optional)

Step 2: User Clicks "CONTINUE"
├─ Validates: Email and Name are filled
├─ Calls: sendOTP("SIGNUP")
└─ API: POST /api/auth/signup
    ├─ Validates email and name
    ├─ Checks if user already exists
    ├─ Creates OTP code (6 digits)
    ├─ Saves OTP to database (expires in 10 minutes)
    └─ Sends OTP email to user ✉️
        └─ Email sent via sendOTPEmail()
            └─ Subject: "Verify Your Email - STN Golden Healthy Foods"
            └─ Contains 6-digit OTP code

Step 3: OTP Verification Screen
├─ User enters 6-digit OTP
├─ User clicks "VERIFY"
└─ API: POST /api/auth/verify-otp
    ├─ Validates OTP code
    ├─ Checks if OTP is expired
    └─ If valid → Moves to password step

Step 4: Create Password Screen
├─ User enters password (min 6 characters)
├─ User confirms password (must match)
├─ User clicks "CREATE ACCOUNT"
└─ API: POST /api/auth/create-account
    ├─ Validates password length
    ├─ Checks if user already exists
    ├─ Creates user in database
    ├─ Generates authentication token
    └─ Returns user data + token
        └─ User automatically logged in
        └─ Redirects to home page
```

### **SIGNIN FLOW** (Existing User Login)

```
Step 1: User Fills Form
├─ Email Address (required)
└─ Password (required)

Step 2: User Clicks "SIGN IN"
├─ Validates: Email and Password are filled
├─ Calls: onSubmit(email, password)
└─ API: POST /api/auth/signin
    ├─ Finds user by email
    ├─ Verifies password (bcrypt)
    ├─ Generates authentication token
    └─ Returns user data + token
        └─ User logged in
        └─ Redirects to home page

Note: NO OTP required for signin (password-based authentication)
```

### **FORGOT PASSWORD FLOW** (Password Reset)

```
Step 1: User on Signin Page
└─ Clicks "Forgot Password?" link

Step 2: OTP Sent
├─ Calls: handleForgotPassword()
├─ Calls: sendOTP("FORGOT_PASSWORD")
└─ API: POST /api/auth/send-otp
    ├─ Validates email exists
    ├─ Creates OTP code (6 digits)
    ├─ Saves OTP to database (expires in 10 minutes)
    └─ Sends OTP email to user ✉️
        └─ Email sent via sendOTPEmail()
            └─ Subject: "Reset Your Password - STN Golden Healthy Foods"
            └─ Contains 6-digit OTP code

Step 3: OTP Verification Screen
├─ User enters 6-digit OTP
├─ User clicks "VERIFY"
└─ API: POST /api/auth/verify-otp
    ├─ Validates OTP code
    ├─ Checks if OTP is expired
    └─ If valid → Moves to reset password step

Step 4: Reset Password Screen
├─ User enters new password (min 6 characters)
├─ User clicks "RESET PASSWORD"
└─ API: POST /api/auth/reset-password
    ├─ Validates password length
    ├─ Finds user by email
    ├─ Hashes new password
    ├─ Updates user password in database
    ├─ Generates authentication token
    └─ Returns user data + token
        └─ User automatically logged in
        └─ Redirects to home page
```

## 📧 Email OTP Details

### When OTP is Sent:
1. ✅ **Signup**: After user clicks "CONTINUE" button (email, name entered)
2. ✅ **Forgot Password**: After user clicks "Forgot Password?" link

### OTP Email Content:
- **Subject**: 
  - Signup: "Verify Your Email - STN Golden Healthy Foods"
  - Forgot Password: "Reset Your Password - STN Golden Healthy Foods"
- **OTP Code**: 6-digit code displayed prominently
- **Expiry**: 10 minutes
- **Design**: Black background with gradient OTP display

### OTP Storage:
- Stored in database (`OTP` table)
- One OTP per email per type (old OTPs deleted when new one created)
- Expires after 10 minutes
- Verified before use

## 🔐 Password Requirements

### Signup/Reset Password:
- Minimum 6 characters
- Must be confirmed (passwords must match)
- Real-time validation
- Error messages shown if invalid

### Signin:
- Must match stored password (bcrypt hashed)
- Case-sensitive

## 🔄 Complete Flow Summary

### Signup (New User):
```
Form → Continue → OTP Sent ✉️ → Enter OTP → Verify → 
Create Password → Confirm Password → Account Created → Auto Login
```

### Signin (Existing User):
```
Form → Sign In → Password Verified → Auto Login
(No OTP required)
```

### Forgot Password:
```
Forgot Password? → OTP Sent ✉️ → Enter OTP → Verify → 
Reset Password → Password Updated → Auto Login
```

## ✅ Verification Checklist

- [x] OTP sent when user enters email (signup)
- [x] OTP sent when user clicks forgot password
- [x] OTP email contains 6-digit code
- [x] OTP expires after 10 minutes
- [x] OTP verified before proceeding
- [x] Password confirmation required for signup
- [x] Password validation (min 6 characters)
- [x] Auto-login after account creation
- [x] Auto-login after password reset
- [x] Error handling for all steps
- [x] User-friendly error messages

## 🎯 API Endpoints

1. **POST /api/auth/signup**
   - Sends OTP for new user signup
   - Requires: email, name, phoneNumber (optional)

2. **POST /api/auth/send-otp**
   - Sends OTP for forgot password
   - Requires: email, type

3. **POST /api/auth/verify-otp**
   - Verifies OTP code
   - Requires: email, code, type

4. **POST /api/auth/create-account**
   - Creates user account after OTP verification
   - Requires: email, password, name, phoneNumber

5. **POST /api/auth/signin**
   - Signs in existing user
   - Requires: email, password

6. **POST /api/auth/reset-password**
   - Resets user password after OTP verification
   - Requires: email, password

## 🔍 Error Handling

### Common Errors:
- "Email and name are required" - Missing required fields
- "User with this email already exists" - Email already registered
- "Invalid or expired OTP" - Wrong OTP or expired
- "Password must be at least 6 characters" - Password too short
- "Passwords do not match" - Confirmation doesn't match
- "Invalid email or password" - Wrong credentials
- "User with this email does not exist" - Email not found (forgot password)

## 📝 Notes

- OTP is sent **immediately** after user clicks "CONTINUE" (signup) or "Forgot Password?" (reset)
- Email must be valid format
- OTP expires in 10 minutes
- Only one active OTP per email per type
- Password is hashed using bcrypt before storage
- Authentication token is base64 encoded JSON
- User data stored in localStorage after login
