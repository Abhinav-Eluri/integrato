from django.contrib import admin
from .models import Integration, CalendarEvent, EmailMessage, SyncLog


@admin.register(Integration)
class IntegrationAdmin(admin.ModelAdmin):
    list_display = ['user', 'provider', 'status', 'last_sync', 'sync_enabled', 'created_at']
    list_filter = ['provider', 'status', 'sync_enabled', 'created_at']
    search_fields = ['user__email', 'provider_email']
    readonly_fields = ['access_token', 'refresh_token', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'provider', 'status', 'sync_enabled')
        }),
        ('Provider Data', {
            'fields': ('provider_user_id', 'provider_email')
        }),
        ('Token Info', {
            'fields': ('token_expires_at', 'last_sync'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'integration', 'start_time', 'end_time', 'event_status', 'synced_at']
    list_filter = ['integration__provider', 'event_status', 'is_all_day', 'synced_at']
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['provider_event_id', 'synced_at', 'created_at', 'updated_at']
    date_hierarchy = 'start_time'
    
    fieldsets = (
        ('Event Info', {
            'fields': ('integration', 'title', 'description', 'location')
        }),
        ('Time & Date', {
            'fields': ('start_time', 'end_time', 'is_all_day', 'timezone')
        }),
        ('Metadata', {
            'fields': ('event_status', 'created_by', 'attendees'),
            'classes': ('collapse',)
        }),
        ('Sync Info', {
            'fields': ('provider_event_id', 'last_modified', 'synced_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(EmailMessage)
class EmailMessageAdmin(admin.ModelAdmin):
    list_display = ['subject', 'sender', 'integration', 'received_at', 'is_read', 'synced_at']
    list_filter = ['integration__provider', 'is_read', 'is_important', 'has_attachments', 'synced_at']
    search_fields = ['subject', 'sender', 'body_text']
    readonly_fields = ['provider_message_id', 'synced_at', 'created_at', 'updated_at']
    date_hierarchy = 'received_at'
    
    fieldsets = (
        ('Message Info', {
            'fields': ('integration', 'subject', 'sender', 'recipients')
        }),
        ('Content', {
            'fields': ('body_text', 'body_html'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('received_at', 'is_read', 'is_important', 'labels')
        }),
        ('Attachments', {
            'fields': ('has_attachments', 'attachment_count'),
            'classes': ('collapse',)
        }),
        ('Sync Info', {
            'fields': ('provider_message_id', 'thread_id', 'synced_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ['integration', 'sync_type', 'status', 'items_processed', 'started_at', 'completed_at']
    list_filter = ['sync_type', 'status', 'started_at']
    search_fields = ['integration__user__email', 'error_message']
    readonly_fields = ['started_at', 'completed_at']
    date_hierarchy = 'started_at'
    
    fieldsets = (
        ('Sync Info', {
            'fields': ('integration', 'sync_type', 'status')
        }),
        ('Statistics', {
            'fields': ('items_processed', 'items_created', 'items_updated', 'items_deleted')
        }),
        ('Error Info', {
            'fields': ('error_message', 'error_details'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at')
        })
    )