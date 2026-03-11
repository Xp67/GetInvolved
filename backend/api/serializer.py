from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from .models import Event, Role, AppPermission, PermissionCategory, Ticket, TicketCategory, OrganizerProfile

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

class OrganizerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerProfile
        fields = [
            'is_company', 'company_name', 'company_address', 'vat_number',
            'first_name_org', 'last_name_org', 'fiscal_code',
            'employee_count', 'event_types', 'admin_onboarding_completed',
        ]


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
    organizer_profile = OrganizerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'bio', 'avatar', 'password',
            'roles_details', 'role_ids', 'all_permissions', 'is_super_admin',
            'affiliate_code', 'affiliated_to_username', 'affiliated_to_code', 'affiliation_date',
            'onboarding_completed', 'location', 'music_preferences',
            'organizer_profile',
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
    affiliated_to_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'affiliated_to_code']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        affiliated_to_code = validated_data.pop('affiliated_to_code', None)
        # Auto-generate username from email local part
        email = validated_data['email']
        base_username = email.split('@')[0].lower()
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        validated_data['username'] = username
        user = User.objects.create_user(**validated_data)

        if affiliated_to_code:
            try:
                target_user = User.objects.get(affiliate_code__iexact=affiliated_to_code)
                if target_user != user:
                    user.affiliated_to = target_user
                    user.affiliation_date = timezone.now()
                    user.save()
            except User.DoesNotExist:
                pass
                
        return user


class OnboardingSerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['nickname', 'first_name', 'last_name', 'location', 'music_preferences', 'onboarding_completed']
        read_only_fields = ['onboarding_completed']

    def update(self, instance, validated_data):
        nickname = validated_data.pop('nickname', None)
        if nickname:
            instance.username = nickname
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.location = validated_data.get('location', instance.location)
        instance.music_preferences = validated_data.get('music_preferences', instance.music_preferences)
        instance.onboarding_completed = True
        instance.save()
        return instance


class AdminOnboardingSerializer(serializers.Serializer):
    nickname = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    is_company = serializers.BooleanField(required=False, default=True)

    # Company fields
    company_name = serializers.CharField(required=False, allow_blank=True)
    company_address = serializers.CharField(required=False, allow_blank=True)
    vat_number = serializers.CharField(required=False, allow_blank=True)

    # Individual fields
    first_name_org = serializers.CharField(required=False, allow_blank=True)
    last_name_org = serializers.CharField(required=False, allow_blank=True)
    fiscal_code = serializers.CharField(required=False, allow_blank=True)

    # Common
    employee_count = serializers.CharField(required=False, allow_blank=True)
    event_types = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def update(self, instance, validated_data):
        # Update user fields
        nickname = validated_data.pop('nickname', None)
        if nickname:
            instance.username = nickname
        first_name = validated_data.pop('first_name', None)
        if first_name is not None:
            instance.first_name = first_name
        last_name = validated_data.pop('last_name', None)
        if last_name is not None:
            instance.last_name = last_name
        instance.save()

        # Update organizer profile
        profile, _ = OrganizerProfile.objects.get_or_create(user=instance)
        profile.is_company = validated_data.get('is_company', profile.is_company)
        profile.company_name = validated_data.get('company_name', profile.company_name)
        profile.company_address = validated_data.get('company_address', profile.company_address)
        profile.vat_number = validated_data.get('vat_number', profile.vat_number)
        profile.first_name_org = validated_data.get('first_name_org', profile.first_name_org)
        profile.last_name_org = validated_data.get('last_name_org', profile.last_name_org)
        profile.fiscal_code = validated_data.get('fiscal_code', profile.fiscal_code)
        profile.employee_count = validated_data.get('employee_count', profile.employee_count)
        profile.event_types = validated_data.get('event_types', profile.event_types)
        profile.admin_onboarding_completed = True
        profile.save()

        return instance

class AffiliateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'affiliation_date']
    
class TicketCategorySerializer(serializers.ModelSerializer):
    remaining_quantity = serializers.ReadOnlyField()
    sold_count = serializers.ReadOnlyField()

    class Meta:
        model = TicketCategory
        fields = [
            'id', 'name', 'description', 'price', 'total_quantity', 'remaining_quantity', 'sold_count',
            'sale_start_date', 'sale_start_time', 'sale_end_date', 'sale_end_time',
            'logo', 'card_bg_type', 'card_bg_color', 'card_bg_color2'
        ]

class TicketSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_description = serializers.CharField(source='category.description', read_only=True)
    category_logo = serializers.ImageField(source='category.logo', read_only=True)
    category_card_bg_type = serializers.CharField(source='category.card_bg_type', read_only=True)
    category_card_bg_color = serializers.CharField(source='category.card_bg_color', read_only=True)
    category_card_bg_color2 = serializers.CharField(source='category.card_bg_color2', read_only=True)

    event_id = serializers.IntegerField(source='category.event.id', read_only=True)
    event_title = serializers.CharField(source='category.event.title', read_only=True)
    event_date = serializers.DateField(source='category.event.date', read_only=True)
    event_start_time = serializers.TimeField(source='category.event.start_time', read_only=True)
    event_location = serializers.CharField(source='category.event.location', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'category', 'category_name', 'category_description', 'category_logo', 
            'category_card_bg_type', 'category_card_bg_color', 'category_card_bg_color2',
            'event_id', 'event_title', 'event_date', 'event_start_time', 'event_location',
            'owner', 'owner_email', 'owner_name', 'ticket_code', 'is_checked_in', 'checked_in_at', 'purchase_date'
        ]
        read_only_fields = ['owner', 'ticket_code', 'is_checked_in', 'checked_in_at', 'purchase_date']

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip() or obj.owner.username

class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    ticket_categories = TicketCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'latitude', 'longitude', 'country_code',
            'date', 'start_time', 'end_time',
            'poster_image', 'hero_image', 'organizer_logo',
            'background_color', 'google_wallet_class_id', 'ticket_clauses',
            'status', 'organizer', 'organizer_name', 'created_at', 'ticket_categories',
        ]
        read_only_fields = ['organizer', 'created_at', 'google_wallet_class_id']

    def get_organizer_name(self, obj):
        return f"{obj.organizer.first_name} {obj.organizer.last_name}".strip() or obj.organizer.username

    def validate(self, data):
        instance = self.instance
        new_status = data.get('status')

        # Block edits on CONCLUDED / ARCHIVED events (unless admin override via context)
        is_admin_override = self.context.get('admin_override', False)
        if instance and instance.status in ('CONCLUDED', 'ARCHIVED') and not is_admin_override:
            raise serializers.ValidationError("Non è possibile modificare un evento concluso o archiviato.")

        # Validation for publishing
        if new_status == 'PUBLISHED':
            title = data.get('title', getattr(instance, 'title', ''))
            description = data.get('description', getattr(instance, 'description', ''))
            location = data.get('location', getattr(instance, 'location', ''))
            event_date = data.get('date', getattr(instance, 'date', None))

            errors = {}
            if not title or not title.strip():
                errors['title'] = "Il titolo è obbligatorio per pubblicare."
            if not description or not description.strip():
                errors['description'] = "La descrizione è obbligatoria per pubblicare."
            if not location or not location.strip():
                errors['location'] = "La location è obbligatoria per pubblicare."
            if not event_date:
                errors['date'] = "La data evento è obbligatoria per pubblicare."

            # Check at least 1 ticket category exists
            if instance and not instance.ticket_categories.exists():
                errors['ticket_categories'] = "Deve esistere almeno una categoria di biglietti per pubblicare."

            if errors and not is_admin_override:
                raise serializers.ValidationError(errors)

        # ARCHIVED only from CONCLUDED
        if new_status == 'ARCHIVED' and instance and instance.status != 'CONCLUDED' and not is_admin_override:
            raise serializers.ValidationError("Un evento può essere archiviato solo se è concluso.")

        return data

    def create(self, validated_data):
        event = Event.objects.create(**validated_data)
        return event
