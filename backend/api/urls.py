from django.urls import path
from . import views


urlpatterns = [
    path("event/", views.EventListCreate.as_view(), name="event-list"),
    path("event/delete/<int:pk>/", views.EventDelete.as_view(), name="event-delete"),
    path("event/update/<int:pk>/", views.EventUpdate.as_view(), name="event-update"),
    path("user/profile/", views.UserProfileView.as_view(), name="user-profile"),
]

