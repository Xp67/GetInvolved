from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from .models import Event, Role, AppPermission, PermissionCategory, Ticket, TicketCategory

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
    affiliated_to_username = serializers.SerializerMethodField()
    affiliated_to_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'bio', 'avatar', 'password',
            'roles_details', 'role_ids', 'all_permissions', 'is_super_admin',
            'affiliate_code', 'affiliated_to_username', 'affiliated_to_code', 'affiliation_date'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'affiliate_code': {'required': False}
        }

    def get_all_permissions(self, obj):
        return obj.get_all_permissions()

    def get_affiliated_to_username(self, obj):
        if obj.affiliated_to:
            return obj.affiliated_to.username
        return None

    def create(self, validated_data):
        role_ids = validated_data.pop('roles', [])

        # Security check for Super Admin role
        super_admin = Role.objects.filter(name='Super Admin').first()
        request = self.context.get('request')
        request_user = request.user if request else None

        if super_admin and super_admin in role_ids:
            if not request_user or not getattr(request_user, 'is_super_admin', False):
                role_ids = [r for r in role_ids if r != super_admin]

        user = User.objects.create_user(**validated_data)
        if role_ids:
            user.roles.set(role_ids)
        return user

    def update(self, instance, validated_data):
        affiliated_to_code = validated_data.pop('affiliated_to_code', None)
        if affiliated_to_code is not None:
            if affiliated_to_code == "":
                instance.affiliated_to = None
                instance.affiliation_date = None
            else:
                try:
                    target_user = User.objects.get(affiliate_code__iexact=affiliated_to_code)
                    if target_user == instance:
                        raise serializers.ValidationError({"affiliated_to_code": "Non puoi affiliarti a te stesso."})
                    instance.affiliated_to = target_user
                    instance.affiliation_date = timezone.now()
                except User.DoesNotExist:
                    raise serializers.ValidationError({"affiliated_to_code": "Codice affiliato non valido."})

        affiliate_code = validated_data.get('affiliate_code')
        if affiliate_code:
            affiliate_code = affiliate_code.upper()
            if User.objects.filter(affiliate_code__iexact=affiliate_code).exclude(id=instance.id).exists():
                raise serializers.ValidationError({"affiliate_code": "Questo codice è già in uso."})
            validated_data['affiliate_code'] = affiliate_code

        role_ids = validated_data.pop('roles', None)
        if role_ids is not None:
            # Prevent assigning or removing Super Admin if the requester is not a Super Admin
            super_admin = Role.objects.filter(name='Super Admin').first()
            request = self.context.get('request')
            request_user = request.user if request else None

            if super_admin and (not request_user or not getattr(request_user, 'is_super_admin', False)):
                is_currently_super_admin = instance.roles.filter(id=super_admin.id).exists()
                will_be_super_admin = super_admin in role_ids

                if will_be_super_admin and not is_currently_super_admin:
                    # Cannot assign Super Admin if not Super Admin
                    role_ids = [r for r in role_ids if r != super_admin]
                elif is_currently_super_admin and not will_be_super_admin:
                    # Cannot remove Super Admin if not Super Admin
                    role_ids.append(super_admin)

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

class AffiliateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'affiliation_date']
    
class TicketCategorySerializer(serializers.ModelSerializer):
    remaining_quantity = serializers.ReadOnlyField()
    sold_count = serializers.ReadOnlyField()

    class Meta:
        model = TicketCategory
        fields = ['id', 'name', 'price', 'total_quantity', 'remaining_quantity', 'sold_count']

class TicketSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    event_id = serializers.IntegerField(source='category.event.id', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'category', 'category_name', 'event_id', 'owner', 'owner_email', 'owner_name', 'ticket_code', 'is_checked_in', 'checked_in_at', 'purchase_date']
        read_only_fields = ['owner', 'ticket_code', 'is_checked_in', 'checked_in_at', 'purchase_date']

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip() or obj.owner.username

class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    ticket_categories = TicketCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'location', 'event_date', 'organizer', 'organizer_name', 'created_at', 'ticket_categories']
        read_only_fields = ['organizer', 'created_at']

    def get_organizer_name(self, obj):
        return f"{obj.organizer.first_name} {obj.organizer.last_name}".strip() or obj.organizer.username

    def create(self, validated_data):
        event = Event.objects.create(**validated_data)
        return event