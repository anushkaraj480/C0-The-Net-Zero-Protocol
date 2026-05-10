from rest_framework import serializers
from .models import CarbonProject, CreditListing, Transaction


class CarbonProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarbonProject
        fields = '__all__'
        read_only_fields = ['owner', 'created_at']


class CreditListingSerializer(serializers.ModelSerializer):
    """
    Serializer for credit listings.
    Includes computed properties to match the frontend's Listing interface.
    """

    project_name = serializers.CharField(read_only=True)
    project_type = serializers.CharField(read_only=True)
    location_text = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    standard = serializers.CharField(read_only=True)
    available = serializers.CharField(read_only=True)
    price = serializers.CharField(read_only=True)
    seller_email = serializers.CharField(read_only=True)

    class Meta:
        model = CreditListing
        fields = [
            'id',
            'project_name',
            'project_type',
            'location_text',
            'description',
            'standard',
            'quantity_available',
            'price_per_credit',
            'available',
            'price',
            'status',
            'listed_at',
            'seller_email',
        ]


class BuyCreditsSerializer(serializers.Serializer):
    listing = serializers.IntegerField()
    quantity_purchased = serializers.IntegerField(min_value=1)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['buyer', 'total_price', 'purchased_at']
