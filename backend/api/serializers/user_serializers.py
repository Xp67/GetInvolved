from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from ..models import Role, OrganizerProfile
from .permission_serializers import RoleSerializer

User = get_user_model()


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
        required=False,
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
            'affiliate_code': {'required': False},
        }

    def get_all_permissions(self, obj):
        return obj.get_all_permissions()

    def get_affiliated_to_username(self, obj):
        return obj.affiliated_to.username if obj.affiliated_to else None

    def create(self, validated_data):
        role_ids = validated_data.pop('roles', [])

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
            super_admin = Role.objects.filter(name='Super Admin').first()
            request = self.context.get('request')
            request_user = request.user if request else None

            if super_admin and (not request_user or not getattr(request_user, 'is_super_admin', False)):
                is_currently_super_admin = instance.roles.filter(id=super_admin.id).exists()
                will_be_super_admin = super_admin in role_ids

                if will_be_super_admin and not is_currently_super_admin:
                    role_ids = [r for r in role_ids if r != super_admin]
                elif is_currently_super_admin and not will_be_super_admin:
                    role_ids.append(super_admin)

            instance.roles.set(role_ids)

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
            'email': {'required': True},
        }

    def create(self, validated_data):
        affiliated_to_code = validated_data.pop('affiliated_to_code', None)
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
    company_name = serializers.CharField(required=False, allow_blank=True)
    company_address = serializers.CharField(required=False, allow_blank=True)
    vat_number = serializers.CharField(required=False, allow_blank=True)
    first_name_org = serializers.CharField(required=False, allow_blank=True)
    last_name_org = serializers.CharField(required=False, allow_blank=True)
    fiscal_code = serializers.CharField(required=False, allow_blank=True)
    employee_count = serializers.CharField(required=False, allow_blank=True)
    event_types = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def update(self, instance, validated_data):
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

        profile, _ = OrganizerProfile.objects.get_or_create(user=instance)
        for field in ('is_company', 'company_name', 'company_address', 'vat_number',
                      'first_name_org', 'last_name_org', 'fiscal_code', 'employee_count', 'event_types'):
            if field in validated_data:
                setattr(profile, field, validated_data[field])
        profile.admin_onboarding_completed = True
        profile.save()

        return instance


class AffiliateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'affiliation_date']
