from rest_framework import serializers
from .models import C0User


class RegisterSerializer(serializers.ModelSerializer):
    """Handles user registration."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = C0User
        fields = ['id', 'username', 'email', 'password', 'role', 'phone']
        extra_kwargs = {
            'email': {'required': True},
        }

    def create(self, validated_data):
        user = C0User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'farmer'),
            phone=validated_data.get('phone', ''),
        )
        return user


class UserInfoSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for current user info.
    Matches frontend's UserInfo interface.
    """

    class Meta:
        model = C0User
        fields = ['id', 'username', 'email', 'role', 'phone', 'date_joined']
        read_only_fields = fields
