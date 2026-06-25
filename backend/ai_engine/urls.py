from django.urls import path
from .views import (
    AIDietPlanGeneratorView,
    AIFoodRecognitionView,
    AIChatView,
    AIAlternativesView
)

urlpatterns = [
    path('diet-plan/', AIDietPlanGeneratorView.as_view(), name='ai_diet_plan'),
    path('food-recognition/', AIFoodRecognitionView.as_view(), name='ai_food_recognition'),
    path('chat/', AIChatView.as_view(), name='ai_chat'),
    path('alternatives/', AIAlternativesView.as_view(), name='ai_alternatives'),
]
