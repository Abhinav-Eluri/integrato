from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 
        'username', 
        'first_name', 
        'last_name', 
        'is_staff', 
        'is_active',
        'date_joined'
    )
    list_filter = (
        'is_staff', 
        'is_superuser', 
        'is_active', 
        'date_joined',
        'is_email_verified'
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {
            'fields': (
                'first_name', 
                'last_name', 
                'avatar', 
                'bio', 
                'location', 
                'birth_date'
            )
        }),
        ('Permissions', {
            'fields': (
                'is_active', 
                'is_staff', 
                'is_superuser', 
                'is_email_verified',
                'groups', 
                'user_permissions'
            )
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 
                'username', 
                'password1', 
                'password2', 
                'first_name', 
                'last_name'
            ),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')