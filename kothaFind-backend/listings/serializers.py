# listings/serializers.py
from rest_framework import serializers
from .models import RenterProfile, Property, Room, RoomMedia, Inquiry


class RenterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RenterProfile
        fields = [
            "id","latitude","longitude","address","ward","tole","district",
            "phone","alt_phone","whatsapp","email","terms_agreed","created_at",
        ]
        read_only_fields = ["id","created_at"]


class RoomMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model  = RoomMedia
        fields = ["id","url","media_type","uploaded_at"]

    def get_url(self, obj):
        req = self.context.get("request")
        return req.build_absolute_uri(obj.file.url) if req else obj.file.url


class RoomSerializer(serializers.ModelSerializer):
    media             = RoomMediaSerializer(many=True, read_only=True)
    room_type_display = serializers.ReadOnlyField()
    inquiry_count     = serializers.ReadOnlyField()

    class Meta:
        model  = Room
        fields = [
            "id","property","title","room_type","room_type_display",
            "floor","size_sqft","price_per_month","description",
            "features","status","view_count","inquiry_count","media","created_at",
        ]
        read_only_fields = ["id","view_count","created_at"]


class PropertySerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model  = Property
        fields = ["id","name","type","floors","year_built","description","amenities","rooms","created_at"]
        read_only_fields = ["id","created_at"]


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Inquiry
        fields = ["id","room","name","phone","message","created_at"]
        read_only_fields = ["id","created_at"]
