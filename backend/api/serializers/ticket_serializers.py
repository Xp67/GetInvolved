from rest_framework import serializers
from ..models import TicketCategory, Ticket


class TicketCategorySerializer(serializers.ModelSerializer):
    remaining_quantity = serializers.ReadOnlyField()
    sold_count = serializers.ReadOnlyField()

    class Meta:
        model = TicketCategory
        fields = [
            'id', 'name', 'description', 'price', 'total_quantity',
            'remaining_quantity', 'sold_count',
            'sale_start_date', 'sale_start_time', 'sale_end_date', 'sale_end_time',
            'logo', 'card_bg_type', 'card_bg_color', 'card_bg_color2',
        ]


class TicketSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_description = serializers.CharField(source='category.description', read_only=True)
    category_logo = serializers.ImageField(source='category.logo', read_only=True)
    category_card_bg_type = serializers.CharField(source='category.card_bg_type', read_only=True)
    category_card_bg_color = serializers.CharField(source='category.card_bg_color', read_only=True)
    category_card_bg_color2 = serializers.CharField(source='category.card_bg_color2', read_only=True)

    event_id = serializers.IntegerField(source='category.event.id', read_only=True)
    event_title = serializers.CharField(source='category.event.title', read_only=True)
    event_date = serializers.DateField(source='category.event.date', read_only=True)
    event_start_time = serializers.TimeField(source='category.event.start_time', read_only=True)
    event_location = serializers.CharField(source='category.event.location', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'category', 'category_name', 'category_description', 'category_logo',
            'category_card_bg_type', 'category_card_bg_color', 'category_card_bg_color2',
            'event_id', 'event_title', 'event_date', 'event_start_time', 'event_location',
            'owner', 'owner_email', 'owner_name', 'ticket_code',
            'is_checked_in', 'checked_in_at', 'purchase_date',
        ]
        read_only_fields = ['category', 'owner', 'ticket_code', 'is_checked_in', 'checked_in_at', 'purchase_date']

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip() or obj.owner.username
