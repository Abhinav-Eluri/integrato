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
    
    # GitHub Repository Management
    path('github/repositories/', views.github_repositories, name='github-repositories'),
    path('github/repositories/create/', views.github_create_repository, name='github-create-repository'),
    path('github/repositories/<str:owner>/<str:repo>/', views.github_repository_detail, name='github-repository-detail'),
    path('github/repositories/<str:owner>/<str:repo>/update/', views.github_update_repository, name='github-update-repository'),
    path('github/repositories/<str:owner>/<str:repo>/delete/', views.github_delete_repository, name='github-delete-repository'),
    path('github/repositories/<str:owner>/<str:repo>/collaborators/', views.github_repository_collaborators, name='github-repository-collaborators'),
    path('github/repositories/<str:owner>/<str:repo>/collaborators/<str:username>/', views.github_add_collaborator, name='github-add-collaborator'),
    path('github/repositories/<str:owner>/<str:repo>/branches/', views.github_repository_branches, name='github-repository-branches'),
    path('github/repositories/<str:owner>/<str:repo>/commits/', views.github_repository_commits, name='github-repository-commits'),
    path('github/repositories/<str:owner>/<str:repo>/contents/', views.github_repository_contents, name='github-repository-contents'),
]