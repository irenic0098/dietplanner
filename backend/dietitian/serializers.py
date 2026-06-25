from rest_framework import serializers
from .models import DietitianClientRelation, DietitianMessage, Appointment
from accounts.serializers import CustomUserSerializer

class DietitianClientRelationSerializer(serializers.ModelSerializer):
    client_details = CustomUserSerializer(source='client', read_only=True)
    dietitian_details = CustomUserSerializer(source='dietitian', read_only=True)

    class Meta:
        model = DietitianClientRelation
        fields = ['id', 'dietitian', 'client', 'client_details', 'dietitian_details', 'assigned_at']
        read_only_fields = ['client']


class DietitianMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = DietitianMessage
        fields = ['id', 'sender', 'receiver', 'sender_username', 'receiver_username', 'message', 'sent_at', 'is_read']
        read_only_fields = ['sender']


class AppointmentSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(source='client.username', read_only=True)
    dietitian_username = serializers.CharField(source='dietitian.username', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'dietitian', 'client', 'client_username', 
            'dietitian_username', 'scheduled_at', 'notes', 'status'
        ]
        read_only_fields = ['client']
