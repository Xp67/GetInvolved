from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import generics
from .models import Event
from .serializers import EventSerializer

class EventView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

def main(request):
    return HttpResponse("Hello World!")