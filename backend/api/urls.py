from django.urls import path
from . import views


urlpatterns = [
    path("event/", views.EventListCreate.as_view(), name="event-list"),
    path("event/public/", views.PublicEventListView.as_view(), name="event-public"),
    path("event/public/<int:pk>/", views.PublicEventDetailView.as_view(), name="event-public-detail"),
    path("event/<int:pk>/", views.EventDetail.as_view(), name="event-detail"),
    path("event/delete/<int:pk>/", views.EventDelete.as_view(), name="event-delete"),
    path("event/update/<int:pk>/", views.EventUpdate.as_view(), name="event-update"),
    path("user/profile/", views.UserProfileView.as_view(), name="user-profile"),
    path("user/onboarding/", views.OnboardingView.as_view(), name="user-onboarding"),
    path("roles/", views.RoleListCreate.as_view(), name="role-list"),
    path("roles/<int:pk>/", views.RoleDetail.as_view(), name="role-detail"),
    path("permissions/categories/", views.PermissionCategoryList.as_view(), name="permission-category-list"),
    path("users/", views.UserList.as_view(), name="user-list"),
    path("users/<int:pk>/", views.UserUpdate.as_view(), name="user-update"),
    path("user/affiliates/", views.AffiliateList.as_view(), name="affiliate-list"),
    path("tickets/categories/", views.TicketCategoryCreateView.as_view(), name="ticket-category-create"),
    path("tickets/categories/<int:pk>/", views.TicketCategoryUpdateView.as_view(), name="ticket-category-update"),
    path("tickets/categories/delete/<int:pk>/", views.TicketCategoryDeleteView.as_view(), name="ticket-category-delete"),
    path("tickets/purchase/", views.TicketPurchaseView.as_view(), name="ticket-purchase"),
    path("tickets/my/", views.UserTicketsListView.as_view(), name="user-tickets"),
    path("tickets/event/<int:event_id>/", views.EventTicketsListView.as_view(), name="event-tickets"),
    path("tickets/validate/", views.TicketValidationView.as_view(), name="ticket-validate"),
    path("user/admin-onboarding/", views.AdminOnboardingView.as_view(), name="admin-onboarding"),
]

