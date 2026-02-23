from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Event, Role, AppPermission, PermissionCategory

User = get_user_model()

class AppPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppPermission
        fields = ['id', 'name', 'codename']

class PermissionCategorySerializer(serializers.ModelSerializer):
    permissions = AppPermissionSerializer(many=True, read_only=True)

    class Meta:
        model = PermissionCategory
        fields = ['id', 'name', 'permissions']

class RoleSerializer(serializers.ModelSerializer):
    permissions_details = AppPermissionSerializer(source='permissions', many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=AppPermission.objects.all(),
        source='permissions',
        many=True,
        write_only=True
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions_details', 'permission_ids', 'is_deletable']
        read_only_fields = ['is_deletable']

class UserSerializer(serializers.ModelSerializer):
    roles_details = RoleSerializer(source='roles', many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='roles',
        many=True,
        write_only=True,
        required=False
    )
    all_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'roles_details', 'role_ids', 'all_permissions']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def get_all_permissions(self, obj):
        return obj.get_all_permissions()

    def create(self, validated_data):
        role_ids = validated_data.pop('roles', [])
        user = User.objects.create_user(**validated_data)
        if role_ids:
            user.roles.set(role_ids)
        return user

    def update(self, instance, validated_data):
        role_ids = validated_data.pop('roles', None)
        if role_ids is not None:
            # Prevent assigning Super Admin to anyone but Marco
            super_admin = Role.objects.filter(name='Super Admin').first()
            if super_admin in role_ids and not instance.is_marco:
                role_ids = [r for r in role_ids if r != super_admin]
            instance.roles.set(role_ids)

        # Handle password update if provided
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        return super().update(instance, validated_data)

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class EventSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'location', 'organizer', 'created_at']
        read_only_fields = ['organizer', 'created_at']

    def create(self, validated_data):
        event = Event.objects.create(**validated_data)
        return event