from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.db.models import Q
from .models import DietitianClientRelation, DietitianMessage, Appointment
from accounts.models import CustomUser
from accounts.serializers import CustomUserSerializer
from .serializers import (
    DietitianClientRelationSerializer,
    DietitianMessageSerializer,
    AppointmentSerializer
)

class DietitianListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # List all registered dietitians so a user can choose one
        dietitians = CustomUser.objects.filter(role='dietitian')
        serializer = CustomUserSerializer(dietitians, many=True)
        return Response(serializer.data)


class LinkDietitianView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        dietitian_id = request.data.get('dietitian_id')
        if not dietitian_id:
            return Response({'error': 'dietitian_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            dietitian = CustomUser.objects.get(id=dietitian_id, role='dietitian')
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid dietitian selected.'}, status=status.HTTP_400_BAD_REQUEST)
            
        relation, created = DietitianClientRelation.objects.get_or_create(
            dietitian=dietitian,
            client=request.user
        )
        serializer = DietitianClientRelationSerializer(relation)
        return Response(serializer.data)


class ClientRelationViewSet(viewsets.ModelViewSet):
    serializer_class = DietitianClientRelationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Dietitians see their clients, users see their dietitian link
        user = self.request.user
        if user.role == 'dietitian':
            return DietitianClientRelation.objects.filter(dietitian=user)
        return DietitianClientRelation.objects.filter(client=user)


class DietitianMessageViewSet(viewsets.ModelViewSet):
    serializer_class = DietitianMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get chat history between current user and specified recipient
        user = self.request.user
        chat_partner = self.request.query_params.get('chat_partner')
        
        if not chat_partner:
            # Return all messages relating to current user
            return DietitianMessage.objects.filter(Q(sender=user) | Q(receiver=user))
            
        return DietitianMessage.objects.filter(
            (Q(sender=user) & Q(receiver=chat_partner)) |
            (Q(sender=chat_partner) & Q(receiver=user))
        )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'dietitian':
            return Appointment.objects.filter(dietitian=user)
        return Appointment.objects.filter(client=user)

    def perform_create(self, serializer):
        # Users book appointments by specifying dietitian, dietitians book for users
        user = self.request.user
        if user.role == 'dietitian':
            client_id = self.request.data.get('client')
            client = CustomUser.objects.get(id=client_id)
            serializer.save(dietitian=user, client=client)
        else:
            dietitian_id = self.request.data.get('dietitian')
            dietitian = CustomUser.objects.get(id=dietitian_id)
            serializer.save(client=user, dietitian=dietitian)
            
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = [s[0] for s in Appointment.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status choice.'}, status=status.HTTP_400_BAD_REQUEST)
            
        appointment.status = new_status
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)
