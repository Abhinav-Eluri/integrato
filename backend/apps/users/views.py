from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserProfileSerializer

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user profiles
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only access their own profile
        return User.objects.filter(id=self.request.user.id)

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update', 'profile']:
            return UserProfileSerializer
        return UserSerializer

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """
        Get or update the current user's profile
        """
        user = request.user
        
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(
                user, 
                data=request.data, 
                partial=partial
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """
        Change user password
        """
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Both old_password and new_password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(old_password):
            return Response(
                {'error': 'Invalid old password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'message': 'Password changed successfully'}, 
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'])
    def delete_avatar(self, request):
        """
        Delete user avatar
        """
        user = request.user
        if user.avatar:
            user.avatar.delete()
            user.save()
            return Response(
                {'message': 'Avatar deleted successfully'}, 
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'No avatar to delete'}, 
            status=status.HTTP_400_BAD_REQUEST
        )