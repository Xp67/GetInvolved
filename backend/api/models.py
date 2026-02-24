from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class PermissionCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class AppPermission(models.Model):
    name = models.CharField(max_length=100)
    codename = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(PermissionCategory, on_delete=models.CASCADE, related_name='permissions')

    def __str__(self):
        return f"{self.category.name} - {self.name}"

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(AppPermission, related_name='roles', blank=True)
    is_deletable = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    roles = models.ManyToManyField(Role, related_name='users', blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)

    @property
    def is_super_admin(self):
        return self.is_superuser or self.roles.filter(name='Super Admin').exists()

    def get_all_permissions(self):
        if self.is_super_admin:
            return list(AppPermission.objects.values_list('codename', flat=True))

        return list(AppPermission.objects.filter(roles__users=self).values_list('codename', flat=True).distinct())

    def has_app_permission(self, codename):
        if self.is_super_admin:
            return True
        return self.roles.filter(permissions__codename=codename).exists()

@receiver(post_save, sender=User)
def assign_base_role(sender, instance, created, **kwargs):
    if created:
        base_role = Role.objects.filter(name='Base').first()
        if base_role:
            instance.roles.add(base_role)

class Event(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')

    def __str__(self):
        return self.title
