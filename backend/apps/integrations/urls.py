from django.urls import path
from . import views

app_name = 'integrations'

urlpatterns = [
    # Integration management
    path('', views.integration_list, name='integration-list'),
    path('stats/', views.integration_stats, name='integration-stats'),
    path('providers/', views.available_providers, name='available-providers'),
    
    # OAuth flow
    path('oauth/initiate/', views.initiate_oauth, name='initiate-oauth'),
    path('oauth/callback/', views.oauth_callback, name='oauth-callback'),
    
    # Integration actions
    path('<int:integration_id>/disconnect/', views.disconnect_integration, name='disconnect-integration'),
    path('<int:integration_id>/delete/', views.delete_integration, name='delete-integration'),
    path('<int:integration_id>/sync/', views.manual_sync, name='manual-sync'),
    
    # Calendar events
    path('events/', views.CalendarEventListView.as_view(), name='calendar-event-list'),
    path('events/<int:pk>/', views.CalendarEventDetailView.as_view(), name='calendar-event-detail'),
    
    # Email messages
    path('emails/', views.EmailMessageListView.as_view(), name='email-message-list'),
    path('emails/<int:pk>/', views.EmailMessageDetailView.as_view(), name='email-message-detail'),
    
    # Sync logs
    path('sync-logs/', views.SyncLogListView.as_view(), name='sync-log-list'),
]