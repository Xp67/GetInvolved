from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'name', 'description', 'date', 'time', 'location', 'organizer', 'contact_email', 'is_published', 'created_at', 'updated_at', 'code')
        read_only_fields = ('created_at', 'updated_at', 'code')
        
class CreateEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('name', 'description', 'date', 'time', 'location', 'organizer', 'contact_email', 'is_published')
        read_only_fields = ('created_at', 'updated_at', 'code')