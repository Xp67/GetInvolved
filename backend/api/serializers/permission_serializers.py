from rest_framework import serializers
from ..models import AppPermission, PermissionCategory, Role


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
        write_only=True,
    )

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions_details', 'permission_ids', 'is_deletable']
        read_only_fields = ['is_deletable']
