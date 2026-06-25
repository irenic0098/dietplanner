from rest_framework import serializers
from .models import Subscription

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_display = serializers.CharField(source='get_plan_type_display', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'plan_type', 'plan_display', 'active', 'start_date', 'end_date']
        read_only_fields = ['user', 'active', 'start_date']
