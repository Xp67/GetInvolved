from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Event

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class EventSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'location', 'organizer', 'created_at']
        read_only_fields = ['organizer', 'created_at']

    def create(self, validated_data):
        event = Event.objects.create(**validated_data)
        return event