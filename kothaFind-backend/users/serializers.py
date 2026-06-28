from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "display_name", "phone", "role", "district", "is_verified", "created_at"]
        read_only_fields = ["id", "email", "is_verified", "created_at"]