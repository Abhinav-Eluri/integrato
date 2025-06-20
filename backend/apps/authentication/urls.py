from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Custom authentication endpoints
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('user/', views.user_profile, name='user_profile'),
    
    # JWT token endpoints
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password management
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('password-reset/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', views.password_reset_confirm, name='password_reset_confirm'),
    
    # Social authentication (dj-rest-auth)
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    
    # Social providers
    path('google/', include('allauth.socialaccount.providers.google.urls')),
    
    # Custom Google OAuth endpoint
    path('google/', views.google_oauth, name='google_oauth'),

]