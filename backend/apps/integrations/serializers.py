from rest_framework import serializers
from .models import Integration, CalendarEvent, EmailMessage, SyncLog


class IntegrationSerializer(serializers.ModelSerializer):
    """Serializer for Integration model"""
    
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_token_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Integration
        fields = [
            'id', 'provider', 'provider_display', 'status', 'status_display',
            'provider_user_id', 'provider_email', 'last_sync', 'sync_enabled',
            'is_token_expired', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'provider_user_id', 'provider_email', 'last_sync',
            'is_token_expired', 'created_at', 'updated_at'
        ]


class CalendarEventSerializer(serializers.ModelSerializer):
    """Serializer for CalendarEvent model"""
    
    integration_provider = serializers.CharField(source='integration.get_provider_display', read_only=True)
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'integration', 'integration_provider', 'provider_event_id',
            'title', 'description', 'location', 'start_time', 'end_time',
            'is_all_day', 'timezone', 'attendees', 'created_by', 'event_status',
            'last_modified', 'synced_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'integration', 'provider_event_id', 'last_modified',
            'synced_at', 'created_at', 'updated_at'
        ]


class CalendarEventListSerializer(serializers.ModelSerializer):
    """Simplified serializer for calendar event lists"""
    
    integration_provider = serializers.CharField(source='integration.get_provider_display', read_only=True)
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'integration_provider', 'title', 'start_time', 'end_time',
            'is_all_day', 'location', 'event_status'
        ]


class EmailMessageSerializer(serializers.ModelSerializer):
    """Serializer for EmailMessage model"""
    
    integration_provider = serializers.CharField(source='integration.get_provider_display', read_only=True)
    
    class Meta:
        model = EmailMessage
        fields = [
            'id', 'integration', 'integration_provider', 'provider_message_id',
            'thread_id', 'subject', 'sender', 'recipients', 'body_text', 'body_html',
            'received_at', 'is_read', 'is_important', 'labels', 'has_attachments',
            'attachment_count', 'synced_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'integration', 'provider_message_id', 'thread_id',
            'synced_at', 'created_at', 'updated_at'
        ]


class EmailMessageListSerializer(serializers.ModelSerializer):
    """Simplified serializer for email message lists"""
    
    integration_provider = serializers.CharField(source='integration.get_provider_display', read_only=True)
    
    class Meta:
        model = EmailMessage
        fields = [
            'id', 'integration_provider', 'subject', 'sender', 'received_at',
            'is_read', 'is_important', 'has_attachments', 'labels'
        ]


class SyncLogSerializer(serializers.ModelSerializer):
    """Serializer for SyncLog model"""
    
    integration_provider = serializers.CharField(source='integration.get_provider_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = SyncLog
        fields = [
            'id', 'integration', 'integration_provider', 'sync_type', 'status',
            'status_display', 'items_processed', 'items_created', 'items_updated',
            'items_deleted', 'error_message', 'started_at', 'completed_at', 'duration'
        ]
        read_only_fields = ['id', 'duration']
    
    def get_duration(self, obj):
        """Calculate sync duration in seconds"""
        if obj.completed_at and obj.started_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None


class IntegrationStatsSerializer(serializers.Serializer):
    """Serializer for integration statistics"""
    
    total_integrations = serializers.IntegerField()
    connected_integrations = serializers.IntegerField()
    total_events = serializers.IntegerField()
    total_emails = serializers.IntegerField()
    last_sync = serializers.DateTimeField(allow_null=True)
    providers = serializers.DictField()


class OAuthCallbackSerializer(serializers.Serializer):
    """Serializer for OAuth callback data"""
    
    code = serializers.CharField()
    state = serializers.CharField(required=False)
    provider = serializers.ChoiceField(choices=Integration.PROVIDER_CHOICES)


class ManualSyncSerializer(serializers.Serializer):
    """Serializer for manual sync requests"""
    
    sync_type = serializers.ChoiceField(
        choices=[('calendar', 'Calendar'), ('email', 'Email'), ('full', 'Full')],
        default='full'
    )
    force_refresh = serializers.BooleanField(default=False)