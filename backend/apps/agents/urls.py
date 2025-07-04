from django.urls import path
from . import views

app_name = 'agents'

urlpatterns = [
    path('chat/', views.agent_chat, name='agent-chat'),
]