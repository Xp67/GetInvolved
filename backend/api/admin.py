from django.contrib import admin
from .models import User, Role, AppPermission, PermissionCategory, OrganizerProfile, Event, Ticket, RefundRequest, EventOrganizer

class EventOrganizerInline(admin.TabularInline):
    model = EventOrganizer
    extra = 1

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'roles')
    search_fields = ('email', 'first_name', 'last_name')
    filter_horizontal = ('roles',)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_deletable')
    list_filter = ('is_deletable',)
    filter_horizontal = ('permissions',)

@admin.register(AppPermission)
class AppPermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'codename', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'codename')

@admin.register(PermissionCategory)
class PermissionCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(OrganizerProfile)
class OrganizerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'is_company', 'admin_onboarding_completed')
    list_filter = ('is_company', 'admin_onboarding_completed')
    search_fields = ('user__email', 'company_name')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'start_time', 'status', 'is_public')
    list_filter = ('status', 'is_public', 'date')
    search_fields = ('title', 'description')
    inlines = [EventOrganizerInline]

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_code', 'event', 'user', 'status', 'price')
    list_filter = ('status', 'event', 'user')
    search_fields = ('ticket_code', 'user__email')

@admin.register(RefundRequest)
class RefundRequestAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'user', 'status', 'requested_at')
    list_filter = ('status', 'requested_at')
    search_fields = ('ticket__ticket_code', 'user__email')
    actions = ['approve_refund', 'reject_refund']

    def approve_refund(self, request, queryset):
        for refund in queryset:
            refund.status = 'APPROVED'
            refund.save()
    approve_refund.short_description = 'Approva rimborsi selezionati'

    def reject_refund(self, request, queryset):
        for refund in queryset:
            refund.status = 'REJECTED'
            refund.save()
    reject_refund.short_description = 'Rifiuta rimborsi selezionati'    
