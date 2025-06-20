#!/usr/bin/env python3
"""
SMTP Test Script
This script tests the email configuration to verify SMTP settings are working correctly.
"""

import os
import sys
import django

# Add the project root to Python path
sys.path.append('/Users/abhinav/ProjectKarthik/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import Django modules after setup
from django.conf import settings
from django.core.mail import send_mail
from django.core.mail import EmailMessage

def test_smtp_connection():
    """Test SMTP connection and email sending"""
    print("=== SMTP Configuration Test ===")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'Not set'}")
    print("\n=== Testing Email Send ===")
    
    try:
        # Test email sending
        subject = 'Password Reset Test - ProjectKarthik'
        message = '''Hello,

This is a test email from ProjectKarthik to verify that password reset emails are working correctly.

If you receive this email, it means:
✅ SMTP configuration is working
✅ Email delivery is successful
✅ Password reset functionality should work

Best regards,
ProjectKarthik Team'''
        from_email = settings.EMAIL_HOST_USER
        recipient_list = ['eluriabhinav@gmail.com']  # Test recipient
        
        print(f"Sending test email to: {recipient_list[0]}")
        print(f"From: {from_email}")
        
        # Send the email
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False
        )
        
        if result == 1:
            print("✅ SUCCESS: Email sent successfully!")
            print("Check your inbox (and spam folder) for the test email.")
        else:
            print("❌ FAILED: Email was not sent.")
            
    except Exception as e:
        print(f"❌ ERROR: Failed to send email - {str(e)}")
        print("\nPossible issues:")
        print("1. Check your Gmail App Password")
        print("2. Verify EMAIL_HOST_USER is correct")
        print("3. Ensure 2-Factor Authentication is enabled on Gmail")
        print("4. Check if 'Less secure app access' is disabled (should be)")
        print("5. Verify network connectivity")
        
        return False
    
    return True

def test_email_backend():
    """Test Django email backend configuration"""
    print("\n=== Email Backend Test ===")
    
    try:
        from django.core.mail import get_connection
        connection = get_connection()
        connection.open()
        print("✅ SUCCESS: Email backend connection established")
        connection.close()
        return True
    except Exception as e:
        print(f"❌ ERROR: Email backend connection failed - {str(e)}")
        return False

if __name__ == '__main__':
    print("Starting SMTP Configuration Test...\n")
    
    # Test email backend
    backend_test = test_email_backend()
    
    # Test SMTP connection and email sending
    smtp_test = test_smtp_connection()
    
    print("\n=== Test Summary ===")
    print(f"Email Backend: {'✅ PASS' if backend_test else '❌ FAIL'}")
    print(f"SMTP Email Send: {'✅ PASS' if smtp_test else '❌ FAIL'}")
    
    if backend_test and smtp_test:
        print("\n🎉 All tests passed! Your SMTP configuration is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the error messages above.")