import os
from django.core.management.base import BaseCommand
from nutrition.models import Food, MealPlan, Meal, MealItem
from gamification.models import Badge, Challenge
from recipes.models import Recipe

class Command(BaseCommand):
    help = 'Seeds default foods, badges, challenges, recipes, and diet templates.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding default data...")

        # 1. Seed Badges
        badges_data = [
            {"name": "Streak Starter", "description": "Log your meals for 3 consecutive days.", "icon_name": "Flame", "points_reward": 50},
            {"name": "Hydration Hero", "description": "Drink 3000ml of water in a single day.", "icon_name": "Droplet", "points_reward": 50},
            {"name": "Iron Will", "description": "Complete all meals logged in a day.", "icon_name": "ShieldAlert", "points_reward": 75},
            {"name": "Weight Master", "description": "Log weight for 4 consecutive weeks.", "icon_name": "TrendingDown", "points_reward": 100},
            {"name": "Fit Elite", "description": "Earn 500 XP total points.", "icon_name": "Award", "points_reward": 150},
        ]
        
        for b in badges_data:
            Badge.objects.get_or_create(name=b["name"], defaults=b)
        self.stdout.write("- Badges seeded.")

        # 2. Seed Challenges
        challenges_data = [
            {
                "title": "7 Day Hydration Blast",
                "description": "Log at least 2500ml of water every day for a week to build healthy hydration habits.",
                "duration_days": 7,
                "points_reward": 120
            },
            {
                "title": "14 Days Sugar Free",
                "description": "Keep processed snacks out of your food logs for 14 days straight.",
                "duration_days": 14,
                "points_reward": 250
            },
            {
                "title": "30 Days Lean Muscle Gain",
                "description": "Complete and log high protein meals for 30 days to build strength.",
                "duration_days": 30,
                "points_reward": 500
            }
        ]
        for c in challenges_data:
            # Link badge reward if it exists
            badge = Badge.objects.filter(name="Fit Elite").first()
            Challenge.objects.get_or_create(title=c["title"], defaults={**c, "badge_reward": badge})
        self.stdout.write("- Challenges seeded.")

        # 3. Seed Foods (General list of high quality foods)
        foods_data = [
            # Proteins
            {"name": "Grilled Chicken Breast", "category": "Protein", "serving_size": "100g", "calories": 165.0, "protein": 31.0, "carbs": 0.0, "fats": 3.6, "fiber": 0.0},
            {"name": "Atlantic Salmon Fillet", "category": "Protein", "serving_size": "100g", "calories": 208.0, "protein": 20.0, "carbs": 0.0, "fats": 13.0, "fiber": 0.0},
            {"name": "Hard Boiled Egg", "category": "Protein", "serving_size": "1 large", "calories": 78.0, "protein": 6.3, "carbs": 0.6, "fats": 5.3, "fiber": 0.0},
            {"name": "Firm Tofu", "category": "Protein", "serving_size": "100g", "calories": 144.0, "protein": 17.0, "carbs": 3.0, "fats": 9.0, "fiber": 2.0},
            {"name": "Whey Protein Powder", "category": "Protein", "serving_size": "1 scoop (30g)", "calories": 120.0, "protein": 24.0, "carbs": 3.0, "fats": 1.5, "fiber": 0.0},
            
            # Grains / Carbs
            {"name": "Brown Rice (Cooked)", "category": "Grains", "serving_size": "100g", "calories": 111.0, "protein": 2.6, "carbs": 23.0, "fats": 0.9, "fiber": 1.8},
            {"name": "Quinoa (Cooked)", "category": "Grains", "serving_size": "100g", "calories": 120.0, "protein": 4.4, "carbs": 21.3, "fats": 1.9, "fiber": 2.8},
            {"name": "Oatmeal (Rolled Oats cooked)", "category": "Grains", "serving_size": "100g", "calories": 68.0, "protein": 2.5, "carbs": 12.0, "fats": 1.4, "fiber": 1.7},
            {"name": "Sweet Potato (Baked)", "category": "Grains", "serving_size": "100g", "calories": 90.0, "protein": 2.0, "carbs": 21.0, "fats": 0.2, "fiber": 3.3},
            {"name": "Whole Wheat Bread", "category": "Grains", "serving_size": "1 slice (28g)", "calories": 69.0, "protein": 3.6, "carbs": 12.0, "fats": 0.9, "fiber": 1.9},
            
            # Fruits / Veggies
            {"name": "Apple (Medium)", "category": "Fruits", "serving_size": "1 medium", "calories": 95.0, "protein": 0.5, "carbs": 25.0, "fats": 0.3, "fiber": 4.4},
            {"name": "Banana (Medium)", "category": "Fruits", "serving_size": "1 medium", "calories": 105.0, "protein": 1.3, "carbs": 27.0, "fats": 0.4, "fiber": 3.1},
            {"name": "Avocado", "category": "Fruits", "serving_size": "1 medium", "calories": 240.0, "protein": 3.0, "carbs": 12.0, "fats": 22.0, "fiber": 10.0},
            {"name": "Steamed Broccoli", "category": "Vegetables", "serving_size": "100g", "calories": 35.0, "protein": 2.8, "carbs": 7.0, "fats": 0.4, "fiber": 2.6},
            {"name": "Fresh Spinach", "category": "Vegetables", "serving_size": "100g", "calories": 23.0, "protein": 2.9, "carbs": 3.6, "fats": 0.4, "fiber": 2.2},
            {"name": "Cherry Tomatoes", "category": "Vegetables", "serving_size": "100g", "calories": 18.0, "protein": 0.9, "carbs": 3.9, "fats": 0.2, "fiber": 1.2},
            
            # Nuts / Fats
            {"name": "Almonds", "category": "Nuts", "serving_size": "1 oz (28g)", "calories": 164.0, "protein": 6.0, "carbs": 6.0, "fats": 14.0, "fiber": 3.5},
            {"name": "Peanut Butter", "category": "Nuts", "serving_size": "1 tbsp (16g)", "calories": 94.0, "protein": 4.0, "carbs": 3.0, "fats": 8.0, "fiber": 1.0},
            {"name": "Olive Oil", "category": "Fats", "serving_size": "1 tbsp (14g)", "calories": 119.0, "protein": 0.0, "carbs": 0.0, "fats": 13.5, "fiber": 0.0},
            
            # Dairy
            {"name": "Greek Yogurt (Non-Fat)", "category": "Dairy", "serving_size": "100g", "calories": 59.0, "protein": 10.0, "carbs": 3.6, "fats": 0.4, "fiber": 0.0},
            {"name": "Skim Milk", "category": "Dairy", "serving_size": "1 cup (244g)", "calories": 83.0, "protein": 8.3, "carbs": 12.0, "fats": 0.2, "fiber": 0.0},
        ]
        
        for f in foods_data:
            Food.objects.get_or_create(name=f["name"], defaults=f)
        self.stdout.write("- Food items seeded.")

        # 4. Seed Diet Templates (Meal Plans)
        self.seed_diet_templates()
        self.stdout.write("- Diet Templates seeded.")
        
        # 5. Seed Recipes
        self.seed_recipes()
        self.stdout.write("- Recipes seeded.")
        
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))

    def seed_diet_templates(self):
        templates = [
            ("Lean Bulk Plan", "gain", "Designed with a caloric surplus focusing on heavy carbohydrate intake and clean protein meals to build muscular strength."),
            ("Keto Shred Plan", "loss", "A low-carb, high-fat template to trigger fat burning ketosis and maintain dry muscle density."),
            ("Mediterranean Active Lifestyle", "lifestyle", "A balanced plan rich in heart-healthy unsaturated fats, whole grains, and lean proteins.")
        ]
        
        # Create standard meal plan models
        for name, goal, desc in templates:
            plan, created = MealPlan.objects.get_or_create(
                name=name,
                defaults={"is_template": True, "goal": goal, "description": desc}
            )
            
            if created:
                # Seed breakfasts, lunches, dinners for Monday to Sunday
                for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
                    # Breakfast
                    b_meal = Meal.objects.create(meal_plan=plan, day_of_week=day, meal_type='breakfast')
                    oats = Food.objects.get(name="Oatmeal (Rolled Oats cooked)")
                    MealItem.objects.create(meal=b_meal, food=oats, servings=2.0)
                    
                    # Lunch
                    l_meal = Meal.objects.create(meal_plan=plan, day_of_week=day, meal_type='lunch')
                    chicken = Food.objects.get(name="Grilled Chicken Breast")
                    rice = Food.objects.get(name="Brown Rice (Cooked)")
                    MealItem.objects.create(meal=l_meal, food=chicken, servings=1.5)
                    MealItem.objects.create(meal=l_meal, food=rice, servings=1.5)
                    
                    # Dinner
                    d_meal = Meal.objects.create(meal_plan=plan, day_of_week=day, meal_type='dinner')
                    salmon = Food.objects.get(name="Atlantic Salmon Fillet")
                    spinach = Food.objects.get(name="Fresh Spinach")
                    MealItem.objects.create(meal=d_meal, food=salmon, servings=1.0)
                    MealItem.objects.create(meal=d_meal, food=spinach, servings=2.0)

                    # Snack
                    s_meal = Meal.objects.create(meal_plan=plan, day_of_week=day, meal_type='snack')
                    yogurt = Food.objects.get(name="Greek Yogurt (Non-Fat)")
                    MealItem.objects.create(meal=s_meal, food=yogurt, servings=1.5)

    def seed_recipes(self):
        recipes_list = [
            {
                "title": "Creamy Avocado & Tofu Salad",
                "description": "A light and refreshing salad rich in plant-based protein and healthy monounsaturated fats. Ideal for dinners.",
                "ingredients": "100g Firm Tofu (cubed)\n1 Medium Avocado (diced)\n50g Cherry Tomatoes (halved)\n50g Fresh Spinach\n1 tbsp Olive Oil\nSalt and black pepper to taste",
                "instructions": "1. In a medium bowl, prepare a bed of fresh spinach.\n2. Gently toss cubed firm tofu and diced avocado together.\n3. Add halved cherry tomatoes to the mix.\n4. Drizzle with olive oil, add salt and pepper, and toss lightly before serving.",
                "prep_time": 10,
                "cook_time": 0,
                "calories": 380,
                "protein": 18,
                "carbs": 15,
                "fats": 31,
                "fiber": 12,
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
                "title": "Quick Lemon Grilled Chicken",
                "description": "High-protein meal with low fats, perfect for fat loss goals. Juicy chicken breast cooked with citrus seasonings.",
                "ingredients": "150g Chicken Breast\n1 tbsp Lemon Juice\n1 clove Garlic (minced)\n1/2 tsp Oregano\n1 tsp Olive Oil",
                "instructions": "1. Marinate chicken breast with lemon juice, minced garlic, oregano, and salt for 10 minutes.\n2. Heat olive oil in a non-stick pan over medium-high heat.\n3. Cook the chicken for 6-8 minutes on each side until fully cooked and golden brown.\n4. Slice and serve hot with side vegetables.",
                "prep_time": 10,
                "cook_time": 15,
                "calories": 250,
                "protein": 42,
                "carbs": 2,
                "fats": 7,
                "fiber": 0,
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
            }
        ]
        
        for r in recipes_list:
            Recipe.objects.get_or_create(title=r["title"], defaults=r)
