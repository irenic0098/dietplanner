from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.db.models import Q
from .models import Food, MealPlan, Meal, MealItem
from .serializers import FoodSerializer, MealPlanSerializer, MealSerializer, MealItemSerializer

class FoodViewSet(viewsets.ModelViewSet):
    queryset = Food.objects.all().order_name = ['name']
    serializer_class = FoodSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']

    def get_queryset(self):
        queryset = Food.objects.all().order_by('name')
        search_query = self.request.query_params.get('search', None)
        category_query = self.request.query_params.get('category', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(category__icontains=search_query)
            )
        if category_query:
            queryset = queryset.filter(category__iexact=category_query)
            
        return queryset


class MealPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MealPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users see their own meal plans + all global templates
        return MealPlan.objects.filter(
            Q(user=self.request.user) | Q(is_template=True)
        )

    def perform_create(self, serializer):
        # Admins or Dietitians can create templates, normal users create user plans
        role = self.request.user.role
        is_template = self.request.data.get('is_template', False)
        
        if is_template and role not in ['admin', 'dietitian']:
            is_template = False # Enforce no user templates unless admin/dietitian
            
        serializer.save(user=self.request.user, is_template=is_template)

    @action(detail=False, methods=['get'])
    def templates(self, request):
        templates = MealPlan.objects.filter(is_template=True)
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)


class MealViewSet(viewsets.ModelViewSet):
    serializer_class = MealSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Meal.objects.filter(
            Q(meal_plan__user=self.request.user) | Q(meal_plan__is_template=True)
        )


class MealItemViewSet(viewsets.ModelViewSet):
    serializer_class = MealItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MealItem.objects.filter(
            Q(meal__meal_plan__user=self.request.user) | Q(meal__meal_plan__is_template=True)
        )
