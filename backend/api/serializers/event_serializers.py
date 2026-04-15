from rest_framework import serializers
from ..models import Event
from .ticket_serializers import TicketCategorySerializer


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()
    ticket_categories = TicketCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location',
            'latitude', 'longitude', 'country_code',
            'date', 'start_time', 'end_time',
            'poster_image', 'hero_image', 'organizer_logo',
            'background_color', 'google_wallet_class_id', 'ticket_clauses',
            'status', 'organizer', 'organizer_name', 'created_at', 'ticket_categories',
        ]
        read_only_fields = ['organizer', 'created_at', 'google_wallet_class_id']

    def get_organizer_name(self, obj):
        return f"{obj.organizer.first_name} {obj.organizer.last_name}".strip() or obj.organizer.username

    def validate(self, data):
        instance = self.instance
        new_status = data.get('status')
        is_admin_override = self.context.get('admin_override', False)

        if instance and instance.status in ('CONCLUDED', 'ARCHIVED') and not is_admin_override:
            raise serializers.ValidationError("Non è possibile modificare un evento concluso o archiviato.")

        if new_status == 'PUBLISHED':
            title = data.get('title', getattr(instance, 'title', ''))
            description = data.get('description', getattr(instance, 'description', ''))
            location = data.get('location', getattr(instance, 'location', ''))
            event_date = data.get('date', getattr(instance, 'date', None))

            errors = {}
            if not title or not title.strip():
                errors['title'] = "Il titolo è obbligatorio per pubblicare."
            if not description or not description.strip():
                errors['description'] = "La descrizione è obbligatoria per pubblicare."
            if not location or not location.strip():
                errors['location'] = "La location è obbligatoria per pubblicare."
            if not event_date:
                errors['date'] = "La data evento è obbligatoria per pubblicare."
            if instance and not instance.ticket_categories.exists():
                errors['ticket_categories'] = "Deve esistere almeno una categoria di biglietti per pubblicare."

            if errors and not is_admin_override:
                raise serializers.ValidationError(errors)

        if new_status == 'ARCHIVED' and instance and instance.status != 'CONCLUDED' and not is_admin_override:
            raise serializers.ValidationError("Un evento può essere archiviato solo se è concluso.")

        return data

    def create(self, validated_data):
        return Event.objects.create(**validated_data)
