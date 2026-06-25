from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import date, timedelta
from .models import Subscription
from .serializers import SubscriptionSerializer

class SubscriptionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub, _ = Subscription.objects.get_or_create(user=request.user)
        serializer = SubscriptionSerializer(sub)
        return Response(serializer.data)

    def post(self, request):
        sub, _ = Subscription.objects.get_or_create(user=request.user)
        new_plan = request.data.get('plan_type')
        
        valid_plans = [p[0] for p in Subscription.PLAN_CHOICES]
        if new_plan not in valid_plans:
            return Response({'error': 'Invalid plan selected.'}, status=status.HTTP_400_BAD_REQUEST)
            
        sub.plan_type = new_plan
        # Set subscription ending in 1 month for demo
        sub.end_date = date.today() + timedelta(days=30)
        sub.active = True
        sub.save()
        
        # If user chooses dietitian consultation, we update their role or logic accordingly
        # But generally they remain user, just gaining access to the Dietitian Consultation views
        
        serializer = SubscriptionSerializer(sub)
        return Response(serializer.data)
