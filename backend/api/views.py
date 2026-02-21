from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics
from .serializer import UserSerializer, EventSerializer

User = get_user_model()
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Event


# Create your views here.
class EventListCreate(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(organizer=self.request.user)
        else:
            print(serializer.errors)
        serializer.save(organizer=self.request.user)
    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user)
    
class EventDelete(generics.DestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user)
    



class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user