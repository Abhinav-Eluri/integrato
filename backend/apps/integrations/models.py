from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import os

User = get_user_model()


class Integration(models.Model):
    """Model to store user's third-party integrations"""
    
    PROVIDER_CHOICES = [
        ('google_calendar', 'Google Calendar'),
        ('google_gmail', 'Gmail'),
        ('microsoft_calendar', 'Microsoft Calendar'),
        ('microsoft_outlook', 'Microsoft Outlook'),
        ('github', 'GitHub'),
        ('slack', 'Slack'),
        ('calendly', 'Calendly'),
    ]
    
    STATUS_CHOICES = [
        ('connected', 'Connected'),
        ('disconnected', 'Disconnected'),
        ('error', 'Error'),
        ('expired', 'Expired'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='integrations')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disconnected')
    
    # Encrypted token storage
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)
    token_expires_at = models.DateTimeField(blank=True, null=True)
    
    # Provider-specific data
    provider_user_id = models.CharField(max_length=255, blank=True, null=True)
    provider_email = models.EmailField(blank=True, null=True)
    
    # Sync settings
    last_sync = models.DateTimeField(blank=True, null=True)
    sync_enabled = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'provider']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_provider_display()}"
    
    @property
    def is_token_expired(self):
        """Check if the access token is expired"""
        if not self.token_expires_at:
            return False
        return timezone.now() >= self.token_expires_at
    
    def encrypt_token(self, token):
        """Encrypt token before storing"""
        if not token:
            return None
        
        # Generate or get encryption key
        key = getattr(settings, 'ENCRYPTION_KEY', None)
        if not key:
            key = Fernet.generate_key()
        
        f = Fernet(key)
        encrypted_token = f.encrypt(token.encode())
        return base64.b64encode(encrypted_token).decode()
    
    def decrypt_token(self, encrypted_token):
        """Decrypt stored token"""
        if not encrypted_token:
            return None
        
        try:
            key = getattr(settings, 'ENCRYPTION_KEY', None)
            if not key:
                return None
            
            f = Fernet(key)
            decoded_token = base64.b64decode(encrypted_token.encode())
            decrypted_token = f.decrypt(decoded_token)
            return decrypted_token.decode()
        except Exception:
            return None
    
    def set_access_token(self, token):
        """Set encrypted access token"""
        self.access_token = self.encrypt_token(token)
    
    def get_access_token(self):
        """Get decrypted access token"""
        return self.decrypt_token(self.access_token)
    
    def set_refresh_token(self, token):
        """Set encrypted refresh token"""
        self.refresh_token = self.encrypt_token(token)
    
    def get_refresh_token(self):
        """Get decrypted refresh token"""
        return self.decrypt_token(self.refresh_token)


class CalendarEvent(models.Model):
    """Model to store synced calendar events"""
    
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='calendar_events')
    
    # Event data
    provider_event_id = models.CharField(max_length=255)
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=500, blank=True, null=True)
    
    # Time data
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_all_day = models.BooleanField(default=False)
    timezone = models.CharField(max_length=100, blank=True, null=True)
    
    # Attendees (stored as JSON)
    attendees = models.JSONField(default=list, blank=True)
    
    # Event metadata
    created_by = models.CharField(max_length=255, blank=True, null=True)
    event_status = models.CharField(max_length=50, default='confirmed')
    
    # Sync metadata
    last_modified = models.DateTimeField()
    synced_at = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['integration', 'provider_event_id']
        ordering = ['start_time']
    
    def __str__(self):
        return f"{self.title} - {self.start_time}"


class EmailMessage(models.Model):
    """Model to store synced email messages"""
    
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='email_messages')
    
    # Message data
    provider_message_id = models.CharField(max_length=255)
    thread_id = models.CharField(max_length=255, blank=True, null=True)
    subject = models.CharField(max_length=1000)
    sender = models.CharField(max_length=255)
    recipients = models.JSONField(default=list)
    
    # Content
    body_text = models.TextField(blank=True, null=True)
    body_html = models.TextField(blank=True, null=True)
    
    # Metadata
    received_at = models.DateTimeField()
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    labels = models.JSONField(default=list, blank=True)
    
    # Attachments info
    has_attachments = models.BooleanField(default=False)
    attachment_count = models.IntegerField(default=0)
    
    # Sync metadata
    synced_at = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['integration', 'provider_message_id']
        ordering = ['-received_at']
    
    def __str__(self):
        return f"{self.subject} - {self.sender}"


class SyncLog(models.Model):
    """Model to track sync operations"""
    
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('partial', 'Partial'),
    ]
    
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='sync_logs')
    sync_type = models.CharField(max_length=50)  # 'calendar', 'email', 'full'
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Sync statistics
    items_processed = models.IntegerField(default=0)
    items_created = models.IntegerField(default=0)
    items_updated = models.IntegerField(default=0)
    items_deleted = models.IntegerField(default=0)
    
    # Error tracking
    error_message = models.TextField(blank=True, null=True)
    error_details = models.JSONField(default=dict, blank=True)
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.integration} - {self.sync_type} - {self.status}"