from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('create-event', index),
    path('events', index),
]
