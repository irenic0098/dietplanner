from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from accounts.models import UserProfile
from .ai_service import AIService
from nutrition.models import MealPlan, Meal, MealItem, Food

class AIDietPlanGeneratorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Response({'error': 'Please complete your profile before generating a diet plan.'}, status=status.HTTP_400_BAD_REQUEST)
            
        calories = profile.daily_calorie_requirement
        if calories == 0.0:
            return Response({'error': 'Please update your height, weight and age in profile.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate Diet Plan
        ai_plan = AIService.generate_diet_plan(
            age=profile.age,
            weight=profile.weight,
            height=profile.height,
            gender=profile.gender,
            goal=profile.goal,
            calories=calories
        )
        
        # Save generated plan to database so user can access it in their list
        save_db = request.data.get('save', True)
        if save_db:
            try:
                db_plan = MealPlan.objects.create(
                    user=user,
                    name=ai_plan.get('plan_name', 'AI Generated Plan'),
                    goal=profile.goal,
                    description=f"AI Generated customized plan for daily target of {calories} kcal."
                )
                
                # Create meals
                for type_key, meal_data in ai_plan.get('meals', {}).items():
                    # Generate a dummy day (let's say Monday) or populate all days.
                    # By default we seed a single monday schedule
                    for day_choice in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
                        db_meal = Meal.objects.create(
                            meal_plan=db_plan,
                            day_of_week=day_choice,
                            meal_type=type_key
                        )
                        for item in meal_data.get('items', []):
                            # Get or create the food item in the local database
                            db_food, _ = Food.objects.get_or_create(
                                name=item.get('food'),
                                defaults={
                                    'calories': item.get('calories'),
                                    'protein': item.get('protein'),
                                    'carbs': item.get('carbs'),
                                    'fats': item.get('fats'),
                                    'fiber': item.get('fiber'),
                                    'serving_size': '1 serving',
                                    'category': 'AI Food'
                                }
                            )
                            MealItem.objects.create(
                                meal=db_meal,
                                food=db_food,
                                servings=item.get('servings', 1.0)
                            )
            except Exception as e:
                # Catch any issues saving to DB, return plan anyway
                pass
                
        return Response(ai_plan)


class AIFoodRecognitionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file') or request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'Image file is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            image_bytes = file_obj.read()
            result = AIService.analyze_food_image(image_bytes)
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        history = request.data.get('history', [])
        
        if not message:
            return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        reply = AIService.get_chatbot_response(message, history)
        return Response({'reply': reply})


class AIAlternativesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        food_name = request.query_params.get('food')
        if not food_name:
            return Response({'error': 'Food name query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        alternatives = AIService.suggest_alternatives(food_name)
        return Response({'alternatives': alternatives})
