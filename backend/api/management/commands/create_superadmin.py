from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Role
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates a super admin user from environment variables SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD'

    def handle(self, *args, **options):
        email = os.getenv('SUPER_ADMIN_EMAIL')
        password = os.getenv('SUPER_ADMIN_PASSWORD')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env'
            ))
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(
                f'User with email {email} already exists. Skipping.'
            ))
            return

        username = email.split('@')[0].lower()
        counter = 1
        base_username = username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        user.is_staff = True
        user.save()

        # Assign Super Admin role if it exists
        super_admin_role = Role.objects.filter(name='Super Admin').first()
        if super_admin_role:
            user.roles.add(super_admin_role)

        self.stdout.write(self.style.SUCCESS(
            f'Super admin created: {email} (username: {username})'
        ))
