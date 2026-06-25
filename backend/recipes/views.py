from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Recipe
from .serializers import RecipeSerializer

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().order_by('-created_at')
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Recipe.objects.all().order_by('-created_at')
        search_query = self.request.query_params.get('search')
        favorites_only = self.request.query_params.get('favorites')
        
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(ingredients__icontains=search_query) |
                Q(description__icontains=search_query)
            )
            
        if favorites_only == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(favorited_by=self.request.user)
            
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        recipe = self.get_object()
        user = request.user
        
        if recipe.favorited_by.filter(id=user.id).exists():
            recipe.favorited_by.remove(user)
            return Response({'status': 'unfavorited', 'is_favorite': False})
        else:
            recipe.favorited_by.add(user)
            return Response({'status': 'favorited', 'is_favorite': True})
