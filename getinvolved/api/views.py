from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import generics
from .models import Event
from .serializers import EventSerializer, CreateEventSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class EventView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class CreateEventView(APIView):
    serializer_class = CreateEventSerializer

    def post(self, request, format=None):
        pass

