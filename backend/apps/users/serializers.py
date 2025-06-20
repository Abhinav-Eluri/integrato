from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'bio',
            'location',
            'birth_date',
            'is_email_verified',
            'date_joined',
            'last_login',
        )
        read_only_fields = ('id', 'date_joined', 'last_login', 'is_email_verified')


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'bio',
            'location',
            'birth_date',
        )
        read_only_fields = ('id', 'email')

    def update(self, instance, validated_data):
        # Handle avatar upload
        avatar = validated_data.get('avatar')
        if avatar:
            # Delete old avatar if exists
            if instance.avatar:
                instance.avatar.delete(save=False)
        
        return super().update(instance, validated_data)