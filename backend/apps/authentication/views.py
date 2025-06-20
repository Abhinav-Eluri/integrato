from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
import requests
import logging
from .serializers import (
    CustomRegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer
)
from apps.users.serializers import UserSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view that returns user data along with tokens
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user data
            email = request.data.get('email')
            try:
                user = User.objects.get(email=email)
                user_serializer = UserSerializer(user)
                response.data['user'] = user_serializer.data
            except User.DoesNotExist:
                pass
                
        return response


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user
    """
    serializer = CustomRegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save(request)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Serialize user data
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'access': str(access_token),
            'refresh': str(refresh),
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user with email and password
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Serialize user data
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'access': str(access_token),
            'refresh': str(refresh),
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by blacklisting the refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class ChangePasswordView(generics.UpdateAPIView):
    """
    Change user password
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Request password reset
    """
    logger = logging.getLogger(__name__)
    serializer = PasswordResetSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create reset link
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"
            
            # Email content
            subject = 'Password Reset Request'
            
            # Prepare template context
            context = {
                'user_name': user.first_name or user.email,
                'reset_link': reset_link,
            }
             
            # Render email templates
            html_message = render_to_string('emails/password_reset.html', context)
            plain_message = render_to_string('emails/password_reset.txt', context)
            
            # Send email
            try:
                if settings.DEBUG:
                    print(f"Password reset link: {reset_link}")
                    logger.info(f"Password reset requested for {email}")
                
                # Always try to send email if email settings are configured
                if hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST:
                    from django.core.mail import EmailMultiAlternatives
                    
                    msg = EmailMultiAlternatives(
                        subject,
                        plain_message,
                        getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
                        [email]
                    )
                    msg.attach_alternative(html_message, "text/html")
                    msg.send()
                    
                    logger.info(f"Password reset email sent to {email}")
                else:
                    # Fallback to simple send_mail if no EMAIL_HOST configured
                    send_mail(
                        subject,
                        plain_message,
                        getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
                        [email],
                        fail_silently=False,
                    )
                    logger.info(f"Password reset email sent to {email} (plain text)")
                
            except Exception as e:
                logger.error(f"Failed to send password reset email to {email}: {str(e)}")
                # Don't reveal email sending failures to prevent enumeration
                pass
            
            # Always return success to prevent email enumeration
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Return success message to prevent email enumeration
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    """
    Confirm password reset
    """
    logger = logging.getLogger(__name__)
    
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        logger.warning(f"Invalid password reset attempt with uidb64: {uidb64}")
        return Response({
            'error': 'Invalid reset link'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not default_token_generator.check_token(user, token):
        logger.warning(f"Invalid or expired token for user {user.email}")
        return Response({
            'error': 'Invalid or expired reset link'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not new_password:
        return Response({
            'error': 'New password is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not confirm_password:
        return Response({
            'error': 'Password confirmation is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({
            'error': 'Passwords do not match'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password strength
    try:
        validate_password(new_password, user)
    except ValidationError as e:
        return Response({
            'error': list(e.messages)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Set new password
    user.set_password(new_password)
    user.save(update_fields=['password'])
    
    logger.info(f"Password reset successful for user {user.email}")
    
    return Response({
        'message': 'Password reset successful. You can now login with your new password.'
    }, status=status.HTTP_200_OK)


from rest_framework import status


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def google_oauth(request):
    """
    Handle Google OAuth authentication
    """
    import logging
    import traceback
    
    logger = logging.getLogger(__name__)
    
    try:
        # Get access token from request
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'Access token is required'}, status=400)
        
        # Verify token with Google
        google_response = requests.get(
            f'https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}'
        )
        
        if google_response.status_code != 200:
            return Response({'error': 'Invalid access token'}, status=400)
        
        user_data = google_response.json()
        logger.debug(f"Google user data: {user_data}")
        
        # Check if email is present
        email = user_data.get('email')
        if not email:
            return Response({'error': 'Email not provided by Google'}, status=400)
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': user_data.get('given_name', ''),
                'last_name': user_data.get('family_name', ''),
                'username': email,  # Use email as username
                'is_email_verified': True,
            }
        )
        
        logger.debug(f"User found/created: {user.email}, created: {created}")
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Serialize user data
        user_serializer = UserSerializer(user)
        
        return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': user_serializer.data
        }, status=200)
        
    except Exception as e:
        logger.error(f"Google OAuth error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({'error': 'An error occurred during authentication'}, status=500)