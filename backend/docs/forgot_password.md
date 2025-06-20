# Forgot Password Functionality

This document explains how to use the forgot password functionality implemented in the authentication system.

## Overview

The forgot password feature allows users to reset their passwords securely through email verification. The implementation includes:

- Password reset request endpoint
- Password reset confirmation endpoint
- Email templates (HTML and plain text)
- Security measures to prevent email enumeration
- Password strength validation

## API Endpoints

### 1. Request Password Reset

**Endpoint:** `POST /api/auth/password-reset/`

**Description:** Initiates a password reset request by sending a reset link to the user's email.

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "message": "If an account with this email exists, a password reset link has been sent."
}
```

**Security Features:**
- Returns the same message regardless of whether the email exists (prevents email enumeration)
- Generates secure tokens with 24-hour expiration
- Logs all password reset attempts for security monitoring

### 2. Confirm Password Reset

**Endpoint:** `POST /api/auth/password-reset-confirm/<uidb64>/<token>/`

**Description:** Confirms the password reset using the token from the email link.

**URL Parameters:**
- `uidb64`: Base64 encoded user ID
- `token`: Password reset token

**Request Body:**
```json
{
    "new_password": "newSecurePassword123!",
    "confirm_password": "newSecurePassword123!"
}
```

**Response:**
```json
{
    "message": "Password reset successful. You can now login with your new password."
}
```

**Validation:**
- Validates token authenticity and expiration
- Ensures passwords match
- Enforces Django's password validation rules
- Logs successful password resets

## Email Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in `EMAIL_HOST_PASSWORD`

### Email Templates

The system uses two email templates:
- `templates/emails/password_reset.html` - HTML version
- `templates/emails/password_reset.txt` - Plain text version

Both templates support the following context variables:
- `user_name`: User's first name or email
- `reset_link`: The password reset URL

## Frontend Integration

### Password Reset Request Form

```javascript
const requestPasswordReset = async (email) => {
    try {
        const response = await fetch('/api/auth/password-reset/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            alert(data.message);
        } else {
            // Handle errors
            console.error('Error:', data);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};
```

### Password Reset Confirmation Form

```javascript
const confirmPasswordReset = async (uidb64, token, newPassword, confirmPassword) => {
    try {
        const response = await fetch(`/api/auth/password-reset-confirm/${uidb64}/${token}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Redirect to login page
            window.location.href = '/login';
        } else {
            // Handle errors
            console.error('Error:', data);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};
```

**Important Note**: Both `new_password` and `confirm_password` fields are required. A recent fix resolved an issue where the frontend was only sending the `new_password` field, causing "Password confirmation is required" errors.

### Frontend Routes

You'll need to create these routes in your frontend application:

1. **Forgot Password Page** (`/forgot-password`)
   - Form to enter email address
   - Calls the password reset request API

2. **Reset Password Page** (`/reset-password/:uidb64/:token`)
   - Form to enter new password and confirmation
   - Extracts uidb64 and token from URL parameters
   - Calls the password reset confirmation API

## Security Considerations

1. **Email Enumeration Prevention**: The API returns the same message regardless of whether the email exists

2. **Token Security**: Uses Django's built-in token generator with 24-hour expiration

3. **Password Validation**: Enforces Django's password validation rules

4. **Logging**: All password reset attempts are logged for security monitoring

5. **Rate Limiting**: Consider implementing rate limiting on the password reset endpoint

## Testing

### Development Mode

In development mode (`DEBUG=True`), password reset links are printed to the console instead of being sent via email.

### SMTP Testing

A test script `test_smtp.py` is provided in the backend directory to verify email configuration:

```bash
cd backend
python test_smtp.py
```

This script will:
- Test the email backend connection
- Send a test email to verify SMTP settings
- Provide detailed error messages if configuration issues exist

## Troubleshooting

### Common Issues

1. **"Password confirmation is required" Error**
   - **Fixed**: This was caused by the frontend only sending `new_password` field
   - **Solution**: Frontend now correctly sends both `new_password` and `confirm_password`
   - Ensure both password fields are filled in the reset form

2. **Email Not Received**
   - Check spam/junk folders
   - Verify SMTP configuration in `.env` file
   - Use `test_smtp.py` to verify email settings
   - For Gmail: Ensure app-specific password is used

3. **"Bad Request" Errors**
   - Ensure both password fields match
   - Check that the reset token hasn't expired (24-hour limit)
   - Verify the URL format is correct

4. **SMTP Authentication Errors**
   - For Gmail: Enable 2-factor authentication and use app password
   - Verify `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are correct
   - Check `EMAIL_USE_TLS` is set to `True` for Gmail

### Recent Fixes

- **Frontend Integration**: Fixed password confirmation field not being sent to backend
- **Error Handling**: Improved error messages for better debugging
- **SMTP Testing**: Added test script for email configuration verification

### Manual Testing

1. Request password reset:
   ```bash
   curl -X POST http://localhost:8000/api/auth/password-reset/ \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com"}'
   ```

2. Check console output for the reset link

3. Extract uidb64 and token from the link

4. Confirm password reset:
   ```bash
   curl -X POST http://localhost:8000/api/auth/password-reset-confirm/<uidb64>/<token>/ \
        -H "Content-Type: application/json" \
        -d '{"new_password": "newPassword123!", "confirm_password": "newPassword123!"}'
   ```

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check email configuration in settings
   - Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
   - Check spam folder

2. **Invalid token errors**:
   - Tokens expire after 24 hours
   - Tokens are single-use only
   - Check URL encoding of uidb64 and token

3. **Password validation errors**:
   - Ensure password meets Django's validation requirements
   - Check that passwords match

### Logs

Check Django logs for detailed error messages:
```bash
tail -f logs/django.log
```

## Customization

### Email Templates

To customize email templates, edit:
- `templates/emails/password_reset.html`
- `templates/emails/password_reset.txt`

### Token Expiration

To change token expiration time, you can create a custom token generator:

```python
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import timezone
from datetime import timedelta

class CustomPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # Custom token expiration logic
        return super()._make_hash_value(user, timestamp)
```

### Additional Validation

To add custom password validation, create a custom validator:

```python
from django.core.exceptions import ValidationError

def custom_password_validator(password):
    if 'password' in password.lower():
        raise ValidationError('Password cannot contain the word "password"')
```

Add it to `AUTH_PASSWORD_VALIDATORS` in settings.py.