from django.urls import path
from . import views


urlpatterns = [
    path("event/", views.EventListCreate.as_view(), name="event-list"),
    path("event/delete/<int:pk>/", views.EventDelete.as_view(), name="event-delete"),
    path("event/update/<int:pk>/", views.EventUpdate.as_view(), name="event-update"),
    path("user/profile/", views.UserProfileView.as_view(), name="user-profile"),
    path("roles/", views.RoleListCreate.as_view(), name="role-list"),
    path("roles/<int:pk>/", views.RoleDetail.as_view(), name="role-detail"),
    path("permissions/categories/", views.PermissionCategoryList.as_view(), name="permission-category-list"),
    path("users/", views.UserList.as_view(), name="user-list"),
    path("users/<int:pk>/", views.UserUpdate.as_view(), name="user-update"),
]

