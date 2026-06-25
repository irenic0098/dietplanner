from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodViewSet, MealPlanViewSet, MealViewSet, MealItemViewSet

router = DefaultRouter()
router.register('foods', FoodViewSet, basename='food')
router.register('meal-plans', MealPlanViewSet, basename='mealplan')
router.register('meals', MealViewSet, basename='meal')
router.register('meal-items', MealItemViewSet, basename='mealitem')

urlpatterns = [
    path('', include(router.urls)),
]
