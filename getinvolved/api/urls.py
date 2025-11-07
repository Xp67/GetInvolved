from .views import EventView
from django.urls import path

urlpatterns = [
    path('events', EventView.as_view()),
    
]
