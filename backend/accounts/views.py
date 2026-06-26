from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import CustomUser, UserProfile
from .serializers import (
    RegisterSerializer,
    CustomUserSerializer,
    UserProfileSerializer,
    MyTokenObtainPairSerializer
)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = MyTokenObtainPairSerializer.get_token(user)

        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)


# ===========================================================================
# Diet Plan Generator
# ===========================================================================

def _calculate_targets(weight, height, age, gender, activity_level, goal, diet_preference='anything'):
    """Compute personalised calorie and macro targets using Harris-Benedict, adjusted for diet preference."""
    if gender == 'female':
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    else:
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)

    multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9,
    }
    tdee = bmr * multipliers.get(activity_level, 1.2)

    if goal == 'loss':
        calories = round(tdee - 500)
    elif goal == 'gain':
        calories = round(tdee + 500)
    else:
        calories = round(tdee)

    # Safety minimums
    calories = max(calories, 1200 if gender == 'female' else 1500)

    # Macro splits adjusted for diet preference
    if diet_preference == 'keto':
        # Ketogenic: high fat, moderate protein, very low carbs
        protein_pct, carb_pct, fat_pct = 0.25, 0.05, 0.70
    elif goal == 'loss':
        protein_pct, carb_pct, fat_pct = 0.38, 0.37, 0.25
    elif goal == 'gain':
        protein_pct, carb_pct, fat_pct = 0.30, 0.47, 0.23
    elif goal == 'maintenance':
        protein_pct, carb_pct, fat_pct = 0.28, 0.47, 0.25
    else:
        protein_pct, carb_pct, fat_pct = 0.25, 0.50, 0.25

    protein_g = round((calories * protein_pct) / 4)
    carbs_g   = round((calories * carb_pct)   / 4)
    fats_g    = round((calories * fat_pct)    / 9)

    return {
        'calories': calories,
        'protein_g': protein_g,
        'carbs_g': carbs_g,
        'fats_g': fats_g,
        'bmr': round(bmr),
        'tdee': round(tdee),
    }


def _meal_pools(goal, calories, age, gender, bmi, diet_preference):
    """
    Build goal-specific, portion-aware food libraries tailored to diet preferences.
    Portions are scaled to three calorie tiers:
      low  < 1700 kcal
      mid  1700-2600 kcal
      high > 2600 kcal
    """
    tier = 'low' if calories < 1700 else ('high' if calories > 2600 else 'mid')

    # Per-slot calorie budgets
    b  = round(calories * 0.25)   # Breakfast  25%
    l  = round(calories * 0.33)   # Lunch      33%
    sn = round(calories * 0.12)   # Snack      12%
    d  = round(calories * 0.30)   # Dinner     30%
    pw = round(calories * 0.15)   # Post-workout (gain only)

    senior = age >= 50

    # Common portion scalings
    p_oats  = 80 if tier == 'high' else (40 if tier == 'low' else 60)
    p_rice  = 120 if tier == 'high' else (50 if tier == 'low' else 80)
    p_potato = 200 if tier == 'high' else (100 if tier == 'low' else 150)
    p_bread  = '2 thick slices' if tier == 'high' else ('1 thin slice' if tier == 'low' else '2 slices')

    breakfasts, lunches, snacks, dinners, post_workouts = [], [], [], [], []

    # -----------------------------------------------------------------------
    # KETO DIET PREFERENCE (High Fat, Moderate Protein, Extremely Low Carb)
    # -----------------------------------------------------------------------
    if diet_preference == 'keto':
        p_egg  = 5 if tier == 'high' else (3 if tier == 'low' else 4)
        p_meat = 220 if tier == 'high' else (130 if tier == 'low' else 180)
        p_nuts = 45 if tier == 'high' else (20 if tier == 'low' else 30)

        breakfasts = [
            {'foods': f'Scrambled eggs ({p_egg}) in 20g butter with spinach (100 g) & half avocado', 'emoji': '🥑'},
            {'foods': f'3-egg omelette cooked in coconut oil with cheddar cheese (40 g) & bacon/turkey bacon (2 rashers)', 'emoji': '🍳'},
            {'foods': f'Keto protein shake: 1.5 scoops whey protein, unsweetened almond milk (300 ml), 2 tbsp peanut butter & 1 tbsp MCT oil', 'emoji': '🥤'},
            {'foods': f'Fried eggs ({p_egg-1}) in olive oil with smoked salmon (100 g) & sliced cucumber', 'emoji': '🐟'},
            {'foods': f'Full-fat Greek yogurt (150 g) with walnuts ({p_nuts} g) & pumpkin seeds (1 tbsp) — no honey/carbs', 'emoji': '🥣'},
            {'foods': f'Egg & avocado mash: {p_egg-1} hard-boiled eggs mashed with 1 whole avocado & lemon juice', 'emoji': '🥚'},
            {'foods': f'Cream cheese (60 g) wrapped in smoked turkey slices (120 g) with a handful of olives (10)', 'emoji': '🧀'},
        ]
        lunches = [
            {'foods': f'Grilled chicken thigh ({p_meat} g) salad with mixed greens (100 g), feta cheese (50 g) & 2 tbsp extra virgin olive oil', 'emoji': '🥗'},
            {'foods': f'Tuna salad: canned tuna (150 g) mixed with full-fat mayonnaise (2 tbsp), celery & avocado (half)', 'emoji': '🥗'},
            {'foods': f'Ribeye steak stir-fry ({p_meat} g) in butter with broccoli (150 g), mushrooms & pak choi — no noodles/rice', 'emoji': '🥦'},
            {'foods': f'Salmon fillet ({p_meat} g) cooked in butter, served with steamed asparagus (150 g) topped with parmesan', 'emoji': '🍣'},
            {'foods': f'Bun-less bacon double cheeseburger: 2 beef patties (160 g total), cheddar (2 slices), lettuce wraps & mayo', 'emoji': '🍔'},
            {'foods': f'Spicy shrimp ({p_meat} g) sautéed in garlic butter & avocado oil, served over zucchini noodles (200 g)', 'emoji': '🦐'},
            {'foods': f'Chicken Caesar salad: grilled chicken ({p_meat} g), cos lettuce, parmesan (30 g), Caesar dressing (2 tbsp), no croutons', 'emoji': '🥗'},
        ]
        snacks = [
            {'foods': f'Macadamia nuts ({p_nuts} g) — excellent high-fat keto snack', 'emoji': '🥜'},
            {'foods': '2 hard-boiled eggs with a pinch of sea salt & paprika', 'emoji': '🥚'},
            {'foods': f'Pecan nuts ({p_nuts} g) + 2 squares dark chocolate (90%+ cocoa)', 'emoji': '🍫'},
            {'foods': 'Celery sticks (4) stuffed with cream cheese (40 g)', 'emoji': '🥕'},
            {'foods': 'Avocado (1 whole) cut in half with olive oil, salt & pepper', 'emoji': '🥑'},
            {'foods': 'Pork rinds (30 g) or cheddar cheese cubes (40 g)', 'emoji': '🧀'},
            {'foods': 'Cottage cheese (120 g, full-fat) with 1 tbsp sunflower seeds', 'emoji': '🥛'},
        ]
        dinners = [
            {'foods': f'Baked salmon ({p_meat} g) with herb butter, served with cauliflower mash ({p_potato} g) made with heavy cream', 'emoji': '🍣'},
            {'foods': f'Ribeye steak ({p_meat} g) with garlic herb butter, served with creamed spinach (150 g)', 'emoji': '🥩'},
            {'foods': f'Pork chops ({p_meat} g) cooked in lard, served with roasted Brussels sprouts (120 g) & bacon bits', 'emoji': '🥩'},
            {'foods': f'Chicken breast ({p_meat} g) stuffed with cream cheese & spinach, wrapped in bacon (2 strips)', 'emoji': '🍗'},
            {'foods': f'Beef mince stir-fry ({p_meat} g, 20% fat) with cabbage, soy sauce, sesame oil & ginger', 'emoji': '🥘'},
            {'foods': f'Baked cod fish ({p_meat} g) with pesto butter & roasted zucchini slices (150 g)', 'emoji': '🐟'},
            {'foods': f'Lamb chops ({p_meat} g) grilled with rosemary & garlic butter, served with green bean casserole', 'emoji': '🍖'},
        ]
        post_workouts = [
            {'foods': 'Whey protein (1.5 scoops) shaken in unsweetened almond milk + 2 tbsp heavy cream', 'emoji': '💪'},
            {'foods': '2 boiled eggs + 30 g almonds', 'emoji': '🥚'},
            {'foods': 'Canned tuna (100 g) with 1 tbsp mayonnaise & celery', 'emoji': '🐟'},
            {'foods': 'Keto collagen shake: collagen peptides (20 g), almond milk (250 ml), 1 tbsp MCT oil powder', 'emoji': '🥤'},
            {'foods': 'Smoked salmon roll-ups: 80 g smoked salmon rolled with 30 g cream cheese', 'emoji': '🍣'},
            {'foods': 'A handful of macadamia nuts (25 g) + 1 piece string cheese', 'emoji': '🧀'},
            {'foods': 'Beef jerky (40 g, sugar-free) + half avocado', 'emoji': '🥑'},
        ]

    # -----------------------------------------------------------------------
    # VEGAN DIET PREFERENCE (Strictly Plant-Based, No Animal Products)
    # -----------------------------------------------------------------------
    elif diet_preference == 'vegan':
        p_tofu = 220 if tier == 'high' else (130 if tier == 'low' else 170)
        p_lent = 200 if tier == 'high' else (100 if tier == 'low' else 150)

        breakfasts = [
            {'foods': f'Overnight oats ({p_oats} g) in soy milk (250 ml) with mixed berries (100 g) & 1 tbsp chia seeds', 'emoji': '🥣'},
            {'foods': f'Tofu scramble: firm tofu ({p_tofu} g) scrambled with turmeric, nutritional yeast, spinach (80 g) & mushrooms', 'emoji': '🌱'},
            {'foods': f'Vegan protein smoothie: pea/rice protein (30 g), oat milk (300 ml), half banana & 1 tbsp peanut butter', 'emoji': '🥤'},
            {'foods': f'Avocado mash (half avocado) on {p_bread} of sourdough toast, topped with cherry tomatoes & pumpkin seeds', 'emoji': '🥑'},
            {'foods': f'Coconut yogurt (180 g) with vegan granola (50 g) & mixed berries (80 g)', 'emoji': '🥥'},
            {'foods': f'Vegan pancakes made with oats, banana, soy milk & plant protein, served with maple syrup (1 tbsp)', 'emoji': '🥞'},
            {'foods': f'Chia seed pudding: chia seeds (4 tbsp) in almond milk (250 ml) with sliced mango & shredded coconut', 'emoji': '🥭'},
        ]
        lunches = [
            {'foods': f'Buddha bowl: cooked chickpeas ({p_lent} g), roasted sweet potato ({p_potato} g), half avocado, kale & tahini dressing', 'emoji': '🥗'},
            {'foods': f'Lentil dhal ({p_lent} g lentil curry) with brown basmati rice ({p_rice} g) & cucumber-mint soy raita', 'emoji': '🍛'},
            {'foods': f'Tempeh wrap: grilled tempeh (120 g), grated carrots, spinach & vegan garlic mayo in a large whole-wheat tortilla', 'emoji': '🌯'},
            {'foods': f'Baked tofu ({p_tofu} g) rice bowl with jasmine rice ({p_rice} g), edamame (60 g), broccoli & teriyaki sauce', 'emoji': '🍱'},
            {'foods': f'Quinoa salad: cooked quinoa ({p_rice} g) tossed with black beans (100 g), sweetcorn, red onion & avocado dressing', 'emoji': '🫘'},
            {'foods': f'Minestrone soup (350 ml) loaded with white beans, pasta, carrots & celery, served with 1 slice sourdough', 'emoji': '🍲'},
            {'foods': f'Hummus wrap: wholemeal tortilla filled with hummus (3 tbsp), falafel (3 pieces), cucumber, tomatoes & rocket', 'emoji': '🌯'},
        ]
        snacks = [
            {'foods': 'Apple slices (1 medium) with peanut butter (1.5 tbsp)', 'emoji': '🍎'},
            {'foods': 'Carrot & cucumber sticks with hummus (60 g)', 'emoji': '🥕'},
            {'foods': 'Vegan protein bar (200 kcal) + almond milk (200 ml)', 'emoji': '🍫'},
            {'foods': 'Mixed nuts (30 g) + dark chocolate (70%+, 2 squares)', 'emoji': '🍫'},
            {'foods': 'Rice cakes (2) topped with avocado mash & chia seeds', 'emoji': '🌾'},
            {'foods': 'Mixed berries (150 g) with pumpkin seeds (1 tbsp)', 'emoji': '🫐'},
            {'foods': 'Edamame pods (150 g, steamed) with sea salt', 'emoji': '🫛'},
        ]
        dinners = [
            {'foods': f'Chickpea & spinach curry (300 ml) cooked in light coconut milk, served with brown rice ({p_rice} g)', 'emoji': '🍛'},
            {'foods': f'Teriyaki tempeh stir-fry (150 g tempeh) with pak choi, snap peas, bell peppers & soba noodles ({p_rice} g)', 'emoji': '🥢'},
            {'foods': f'Black bean stuffed bell peppers (2): stuffed with black beans (120 g), quinoa (80 g), sweetcorn & salsa', 'emoji': '🫑'},
            {'foods': f'Vegan bolognese: red lentils & soy mince in tomato sauce over whole-wheat spaghetti ({p_rice} g)', 'emoji': '🍝'},
            {'foods': f'Baked tofu ({p_tofu} g) with roasted sweet potato slices ({p_potato} g) & steamed green beans', 'emoji': '🍠'},
            {'foods': f'Vegetable & bean tagine (chickpeas, butter beans, zucchini) served over steamed couscous ({p_rice} g)', 'emoji': '🍲'},
            {'foods': f'Lentil & walnut cottage pie: seasoned brown lentils & walnuts topped with sweet potato mash ({p_potato} g)', 'emoji': '🥧'},
        ]
        post_workouts = [
            {'foods': 'Vegan pea protein (30 g) in oat milk (300 ml) + 1 large banana', 'emoji': '💪'},
            {'foods': 'Soy milk (300 ml) + 2 oatcakes with peanut butter (1 tbsp)', 'emoji': '🥛'},
            {'foods': 'Vegan yogurt (150 g) with mixed nuts (20 g) & 1 tsp maple syrup', 'emoji': '🥥'},
            {'foods': 'Mass vegan smoothie: oat milk (300 ml), vegan protein (30 g), oats (30 g), 1 tbsp almond butter', 'emoji': '🥤'},
            {'foods': 'Hummus (2 tbsp) on 2 rice cakes + banana slices', 'emoji': '🌾'},
            {'foods': 'Pumpkin & sunflower seed mix (40 g) + 1 pear', 'emoji': '🍐'},
            {'foods': 'Vegan protein shake (water based) + trail mix (35 g)', 'emoji': '🏃'},
        ]

    # -----------------------------------------------------------------------
    # VEGETARIAN DIET PREFERENCE (No Meat/Fish, but Dairy and Eggs Allowed)
    # -----------------------------------------------------------------------
    elif diet_preference == 'vegetarian':
        p_egg  = 4 if tier == 'high' else (2 if tier == 'low' else 3)
        p_paneer = 180 if tier == 'high' else (100 if tier == 'low' else 140)
        p_lent = 200 if tier == 'high' else (100 if tier == 'low' else 150)

        breakfasts = [
            {'foods': f'Scrambled eggs ({p_egg}) with spinach (80 g), mushrooms & {p_bread} of wholemeal toast', 'emoji': '🍳'},
            {'foods': f'Oats ({p_oats} g) cooked in semi-skimmed milk (250 ml) with honey (1 tsp), cinnamon & berries', 'emoji': '🥣'},
            {'foods': f'Greek yogurt (200 g) with granola (40 g) & mixed berries (80 g)', 'emoji': '🍓'},
            {'foods': f'Veggie omelette ({p_egg} eggs, bell peppers, onions, tomatoes) topped with feta cheese (20 g)', 'emoji': '🍳'},
            {'foods': f'Protein smoothie: whey protein (25 g), milk (250 ml), spinach (60 g), half banana & chia seeds (1 tbsp)', 'emoji': '🥤'},
            {'foods': f'Cottage cheese ({p_paneer} g) with sliced cucumber, tomatoes & 1 slice rye bread', 'emoji': '🧀'},
            {'foods': f'French toast ({p_egg-1} eggs, semi-skimmed milk, 2 slices bread) served with fresh strawberries', 'emoji': '🥞'},
        ]
        lunches = [
            {'foods': f'Chickpea & quinoa salad: chickpeas ({p_lent} g), quinoa ({p_rice} g), cucumber, tomatoes & feta (30 g)', 'emoji': '🥗'},
            {'foods': f'Lentil soup (300 ml) with rocket salad & {p_bread} whole-grain sourdough', 'emoji': '🍲'},
            {'foods': f'Vegetarian stir-fry: paneer cubes ({p_paneer} g) or tofu with broccoli, carrots & brown rice ({p_rice} g)', 'emoji': '🍛'},
            {'foods': f'Roasted vegetable & hummus wrap: grilled zucchini, peppers & hummus (2 tbsp) in wholemeal tortilla', 'emoji': '🌯'},
            {'foods': f'Paneer tikka wrap: grilled paneer ({p_paneer-30} g) with mint chutney & sliced onions in wheat wrap', 'emoji': '🌯'},
            {'foods': f'Bean & cheese burrito: black beans (100 g), cheddar cheese (30 g), salsa & sour cream in large wrap', 'emoji': '🌯'},
            {'foods': f'Greek salad: lettuce, cucumber, cherry tomatoes, olives (8), feta (50 g) & 1 tbsp olive oil dressing', 'emoji': '🥗'},
        ]
        snacks = [
            {'foods': 'Apple + 12 almonds (15 g)', 'emoji': '🍎'},
            {'foods': 'Celery & carrot sticks with hummus (60 g)', 'emoji': '🥕'},
            {'foods': 'Greek yogurt (125 g) with 1 tsp honey', 'emoji': '🍯'},
            {'foods': '1 boiled egg + 5 cherry tomatoes', 'emoji': '🥚'},
            {'foods': '2 rice cakes + 1 tbsp peanut butter', 'emoji': '🌾'},
            {'foods': 'Cottage cheese (100 g) + sliced pineapple (60 g)', 'emoji': '🍍'},
            {'foods': 'Trail mix: almonds, cashews & dried cranberries (30 g)', 'emoji': '🥜'},
        ]
        dinners = [
            {'foods': f'Lentil dhal ({p_lent} g) served with basmati rice ({p_rice} g) & steamed green beans', 'emoji': '🍛'},
            {'foods': f'Teriyaki tofu ({p_paneer} g tofu) with brown rice ({p_rice} g) & steamed broccoli (150 g)', 'emoji': '🥢'},
            {'foods': f'Vegetarian lasagna: sheets layered with spinach, ricotta cheese, tomato marinara & mozzarella', 'emoji': '🍝'},
            {'foods': f'Stuffed bell peppers (2): brown rice (80 g), black beans (80 g), sweetcorn & feta cheese (30 g)', 'emoji': '🫑'},
            {'foods': f'Chickpea & spinach curry (250 ml) with brown rice ({p_rice} g) & 1 whole-grain chapati', 'emoji': '🍛'},
            {'foods': f'Paneer butter masala (light, {p_paneer} g paneer) with 1 whole-wheat tandoori roti & salad', 'emoji': '🫕'},
            {'foods': f'Vegetable stir-fry with tofu ({p_paneer} g) & buckwheat soba noodles ({p_rice} g), sesame oil', 'emoji': '🥦'},
        ]
        post_workouts = [
            {'foods': 'Whey protein (30 g) in semi-skimmed milk (250 ml) + 1 banana', 'emoji': '💪'},
            {'foods': 'Greek yogurt (150 g) + granola (30 g) + 1 tsp honey', 'emoji': '🥛'},
            {'foods': '3 rice cakes + 2 tbsp peanut butter + half glass milk', 'emoji': '🌾'},
            {'foods': 'Egg white omelette (4 whites) + 1 slice whole-wheat toast', 'emoji': '🍳'},
            {'foods': 'Chocolate milk (300 ml) + 1 boiled egg', 'emoji': '🥛'},
            {'foods': 'Protein bar (20g protein) + 1 small orange', 'emoji': '🍫'},
            {'foods': 'Cottage cheese (150 g) + banana slices + honey', 'emoji': '🍌'},
        ]

    # -----------------------------------------------------------------------
    # PESCATARIAN DIET PREFERENCE (Seafood + Vegetarian, No Poultry/Red Meat)
    # -----------------------------------------------------------------------
    elif diet_preference == 'pescatarian':
        p_egg  = 4 if tier == 'high' else (2 if tier == 'low' else 3)
        p_fish = 200 if tier == 'high' else (120 if tier == 'low' else 160)
        p_rice = 120 if tier == 'high' else (50 if tier == 'low' else 80)

        breakfasts = [
            {'foods': f'Scrambled eggs ({p_egg}) with smoked salmon (80 g), spinach & {p_bread} of sourdough toast', 'emoji': '🍳'},
            {'foods': f'Oats ({p_oats} g) cooked in almond milk (250 ml) with berries & 1 scoop whey protein', 'emoji': '🥣'},
            {'foods': f'Greek yogurt (200 g) with granola (40 g) & mixed berries (80 g)', 'emoji': '🍓'},
            {'foods': f'Veggie omelette ({p_egg} eggs, tomatoes, spinach) with 1 slice wholemeal bread', 'emoji': '🍳'},
            {'foods': f'Protein smoothie: whey protein (25 g), almond milk (250 ml), banana, almond butter (1 tbsp)', 'emoji': '🥤'},
            {'foods': f'Cottage cheese (150 g) with sliced cucumber, dill & smoked salmon (50 g)', 'emoji': '🧀'},
            {'foods': f'Poached eggs (2) on avocado mash toast (1 slice sourdough) with cherry tomatoes', 'emoji': '🥑'},
        ]
        lunches = [
            {'foods': f'Tuna salad wrap: canned tuna (120 g, water-packed), light mayo, lettuce & tomato in wholemeal wrap', 'emoji': '🌯'},
            {'foods': f'Shrimp ({p_fish-20} g) salad with mixed baby greens, avocado (half), cucumber & lemon-herb dressing', 'emoji': '🥗'},
            {'foods': f'Salmon rice bowl: baked salmon ({p_fish} g), brown rice ({p_rice} g), edamame (50 g) & soy-ginger glaze', 'emoji': '🍱'},
            {'foods': f'Quinoa salad: cooked quinoa ({p_rice} g) with chickpeas (80 g), feta (30 g), cucumber & lemon juice', 'emoji': '🥗'},
            {'foods': f'Tuna pasta salad: whole-wheat penne ({p_rice} g), canned tuna (100 g), sweetcorn, light mayo (1 tbsp)', 'emoji': '🍝'},
            {'foods': f'Baked cod fish ({p_fish} g) with steamed green beans & roasted cherry tomatoes', 'emoji': '🐟'},
            {'foods': f'Chickpea salad bowl: chickpeas ({p_fish-40} g), cucumber, red onion, feta (30 g) & olive oil', 'emoji': '🫘'},
        ]
        snacks = [
            {'foods': 'Apple slices + 12 almonds', 'emoji': '🍎'},
            {'foods': 'Greek yogurt (125 g) with 1 tsp honey', 'emoji': '🍯'},
            {'foods': '1 boiled egg + 5 cherry tomatoes', 'emoji': '🥚'},
            {'foods': 'Celery sticks with hummus (60 g)', 'emoji': '🥕'},
            {'foods': '2 rice cakes with smoked salmon (40 g) & cucumber', 'emoji': '🐟'},
            {'foods': 'Trail mix: walnuts, pumpkin seeds & raisins (30 g)', 'emoji': '🥜'},
            {'foods': 'Steamed edamame in pods (150 g) with sea salt', 'emoji': '🫛'},
        ]
        dinners = [
            {'foods': f'Baked salmon ({p_fish} g) with roasted sweet potato ({p_potato} g) & steamed broccoli (150 g)', 'emoji': '🍣'},
            {'foods': f'Grilled sea bass ({p_fish} g) with roasted potatoes (120 g) & steamed asparagus', 'emoji': '🐠'},
            {'foods': f'Prawn stir-fry ({p_fish} g prawns) with mixed stir-fry vegetables, sesame oil & soba noodles ({p_rice} g)', 'emoji': '🍜'},
            {'foods': f'Tuna steak ({p_fish} g) grilled, served with quinoa ({p_rice} g) & Mediterranean salad', 'emoji': '🐟'},
            {'foods': f'Fish curry (light coconut milk, {p_fish} g white fish) served with basmati rice ({p_rice} g)', 'emoji': '🍛'},
            {'foods': f'Lentil dhal ({p_rice+30} g) served with steamed rice ({p_rice-10} g) & avocado salad', 'emoji': '🍛'},
            {'foods': f'Baked cod ({p_fish} g) topped with pesto and served with roasted root vegetables', 'emoji': '🐟'},
        ]
        post_workouts = [
            {'foods': 'Whey protein (30 g) in semi-skimmed milk (250 ml) + 1 banana', 'emoji': '💪'},
            {'foods': 'Greek yogurt (150 g) with granola (30 g) & honey', 'emoji': '🥛'},
            {'foods': 'Canned tuna (100 g) with 3 rice cakes & sliced cucumber', 'emoji': '🐟'},
            {'foods': 'Protein smoothie: whey, almond milk, banana & peanut butter', 'emoji': '🥤'},
            {'foods': 'Smoked salmon (50 g) on 1 slice toast + 1 glass milk', 'emoji': '🍳'},
            {'foods': '1 protein bar + 1 apple', 'emoji': '🍫'},
            {'foods': 'Cottage cheese (150 g) with pineapple chunks', 'emoji': '🍍'},
        ]

    # -----------------------------------------------------------------------
    # ANYTHING PREFERENCE (Standard Non-Vegetarian)
    # -----------------------------------------------------------------------
    else:
        p_egg   = 4 if tier == 'high' else 3
        p_oats  = 60 if tier == 'high' else 40
        p_chk   = 180 if tier == 'high' else 130
        p_tuna  = 120 if tier == 'high' else 90
        p_sal   = 160 if tier == 'high' else 130
        p_rice  = 80 if tier == 'high' else 55
        p_cott  = 150 if tier == 'high' else 100

        breakfasts = [
            {'foods': f'Greek yogurt (200 g) with mixed berries (100 g) & 1 tbsp chia seeds', 'emoji': '🍓'},
            {'foods': f'Scrambled egg whites ({p_egg}) with spinach (80 g), mushrooms & 1 slice whole-grain toast', 'emoji': '🍳'},
            {'foods': f'Oats ({p_oats} g) with almond milk (200 ml), cinnamon & half a banana', 'emoji': '🥣'},
            {'foods': f'Veggie omelette ({p_egg-1} whole eggs + 2 whites, bell peppers, tomatoes) — non-stick pan, no oil', 'emoji': '🥚'},
            {'foods': f'Protein smoothie: spinach (60 g), half banana, whey protein (25 g), almond milk (250 ml)', 'emoji': '🥤'},
            {'foods': f'Cottage cheese ({p_cott} g) with sliced cucumber & 1 slice rye bread', 'emoji': '🍞'},
            {'foods': f'Bran flakes (35 g) with skimmed milk (200 ml) & 1 kiwi', 'emoji': '🥛'},
        ]
        lunches = [
            {'foods': f'Grilled chicken breast ({p_chk} g) on mixed greens (100 g), cherry tomatoes & 1 tbsp olive oil', 'emoji': '🥗'},
            {'foods': f'Tuna ({p_tuna} g, water-packed) in wholemeal wrap with lettuce, tomato & mustard — no mayo', 'emoji': '🌯'},
            {'foods': f'Lentil soup (300 ml) with rocket salad & 1 thin slice whole-grain bread', 'emoji': '🍲'},
            {'foods': f'Turkey mince ({int(p_chk*0.8)} g) stir-fry with courgette, broccoli & cauliflower rice ({p_rice} g)', 'emoji': '🥦'},
            {'foods': f'Shrimp ({int(p_chk*0.9)} g) & half avocado salad with lime juice & 1 tbsp olive oil', 'emoji': '🦐'},
            {'foods': f'Baked cod ({p_sal} g) with steamed green beans (150 g) & roasted cherry tomatoes', 'emoji': '🐟'},
            {'foods': f'Chickpea salad: chickpeas ({p_rice} g), cucumber, red onion, feta (30 g) & lemon dressing', 'emoji': '🫘'},
        ]
        snacks = [
            {'foods': 'Apple (medium) + 10 almonds (15 g)', 'emoji': '🍎'},
            {'foods': 'Celery sticks (3) with hummus (60 g)', 'emoji': '🥕'},
            {'foods': 'Greek yogurt (100 g, 0% fat) with 1 tsp honey', 'emoji': '🍯'},
            {'foods': '1 boiled egg + 1 small orange', 'emoji': '🥚'},
            {'foods': '2 rice cakes + 1 tbsp almond butter', 'emoji': '🌾'},
            {'foods': 'Mixed berries (150 g)', 'emoji': '🫐'},
            {'foods': 'Cottage cheese (100 g) + 5 cherry tomatoes', 'emoji': '🍅'},
        ]
        dinners = [
            {'foods': f'Baked salmon ({p_sal} g) with steamed broccoli (200 g) & brown rice ({p_rice} g)', 'emoji': '🍣'},
            {'foods': f'Grilled chicken thigh (skinless, {p_chk} g) with roasted asparagus & 1 medium sweet potato (150 g)', 'emoji': '🍗'},
            {'foods': f'Turkey & vegetable soup: turkey ({int(p_chk*0.8)} g), carrots, celery, onion in 400 ml low-sodium broth', 'emoji': '🥘'},
            {'foods': f'Lean beef mince ({int(p_chk*0.8)} g) lettuce-wrap tacos with salsa, jalapeño & lime — no tortilla', 'emoji': '🌮'},
            {'foods': f'Prawn stir-fry ({p_chk} g) with pak choi, snap peas & soba noodles ({p_rice} g), 1 tsp sesame oil', 'emoji': '🍜'},
            {'foods': f'Chicken breast ({p_chk} g) stuffed with spinach & feta (25 g), served with steamed courgette', 'emoji': '🫕'},
            {'foods': f'Grilled sea bass ({int(p_sal*0.9)} g) with roasted tomatoes, olives & new potatoes (100 g)', 'emoji': '🐠'},
        ]
        if senior:
            breakfasts[0] = {'foods': 'Greek yogurt (200 g) with ground flaxseed (1 tbsp), sliced banana & oats (20 g) — calcium & omega-3 rich', 'emoji': '🥛'}
            dinners[0]    = {'foods': f'Baked salmon ({p_sal} g) with steamed broccoli (200 g) & quinoa ({p_rice} g) — bone & joint support', 'emoji': '🍣'}
        
        post_workouts = [
            {'foods': 'Whey protein (30 g) in water or skimmed milk (250 ml) + 1 banana', 'emoji': '💪'},
            {'foods': 'Chocolate milk (300 ml) + 1 boiled egg', 'emoji': '🥛'},
            {'foods': '3 rice cakes with peanut butter (1.5 tbsp)', 'emoji': '🌾'},
            {'foods': 'Tuna (100 g) in wholemeal wrap', 'emoji': '🌯'},
            {'foods': 'Egg white omelette (3 eggs) + 1 slice toast', 'emoji': '🍳'},
            {'foods': 'Protein bar (20g protein)', 'emoji': '🍫'},
            {'foods': 'Cottage cheese (150 g) with sliced pineapple', 'emoji': '🍍'},
        ]

    # Override for senior citizens if not already overridden (for non-senior defaults)
    if senior and diet_preference not in ['anything', 'keto']:
        # calcium / bone supplements tip
        pass

    return {
        'breakfasts': breakfasts,
        'lunches': lunches,
        'snacks': snacks,
        'dinners': dinners,
        'post_workouts': post_workouts,
        'budgets': {'b': b, 'l': l, 'sn': sn, 'd': d, 'pw': pw},
    }


def _build_meal_plan(calories, goal, age, gender, bmi, diet_preference):
    """Assemble the 7-day plan from personalised, preference-aware food pools."""
    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    pools = _meal_pools(goal, calories, age, gender, bmi, diet_preference)
    budgets = pools['budgets']

    plan = []
    for i, day_name in enumerate(days_of_week):
        breakfast = pools['breakfasts'][i % len(pools['breakfasts'])]
        lunch     = pools['lunches'][i % len(pools['lunches'])]
        snack     = pools['snacks'][i % len(pools['snacks'])]
        dinner    = pools['dinners'][i % len(pools['dinners'])]

        meals = [
            {'name': 'Breakfast', 'foods': breakfast['foods'], 'calories': budgets['b'],  'emoji': breakfast['emoji']},
            {'name': 'Lunch',     'foods': lunch['foods'],     'calories': budgets['l'],  'emoji': lunch['emoji']},
            {'name': 'Snack',     'foods': snack['foods'],     'calories': budgets['sn'], 'emoji': snack['emoji']},
            {'name': 'Dinner',    'foods': dinner['foods'],    'calories': budgets['d'],  'emoji': dinner['emoji']},
        ]

        # For gain, add a post-workout meal
        if goal == 'gain' and pools['post_workouts']:
            pw = pools['post_workouts'][i % len(pools['post_workouts'])]
            meals.append({
                'name': 'Post-Workout',
                'foods': pw['foods'],
                'calories': budgets['pw'],
                'emoji': pw['emoji'],
            })

        plan.append({'day': day_name, 'meals': meals})

    return plan


class GenerateDietPlanView(APIView):
    """
    POST /api/auth/generate-diet-plan/
    Accepts: { age, weight, height, gender, goal, activity_level, diet_preference }
    Returns: personalised calorie targets + unique 7-day meal plan based on preference.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        data = request.data

        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = None

        age             = data.get('age')             or (profile.age             if profile else None)
        weight          = data.get('weight')          or (profile.weight          if profile else None)
        height          = data.get('height')          or (profile.height          if profile else None)
        gender          = data.get('gender')          or (profile.gender          if profile else 'male')
        goal            = data.get('goal')            or (profile.goal            if profile else 'lifestyle')
        activity_level  = data.get('activity_level')  or (profile.activity_level  if profile else 'sedentary')
        diet_preference = data.get('diet_preference')  or (profile.diet_preference if profile else 'anything')

        missing = [f for f, v in [('age', age), ('weight', weight), ('height', height)] if not v]
        if missing:
            return Response(
                {'error': f"Missing required fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            age    = int(age)
            weight = float(weight)
            height = float(height)
        except (ValueError, TypeError):
            return Response({'error': 'age, weight and height must be numbers'}, status=status.HTTP_400_BAD_REQUEST)

        targets = _calculate_targets(weight, height, age, gender, activity_level, goal, diet_preference)
        cal = targets['calories']

        bmi = round(weight / ((height / 100) ** 2), 1)
        bmi_category = (
            'Underweight' if bmi < 18.5 else
            'Normal weight' if bmi < 25 else
            'Overweight' if bmi < 30 else
            'Obese'
        )

        meal_plan = _build_meal_plan(cal, goal, age, gender, bmi, diet_preference)

        # Personalised tips built dynamically from the person's data
        tips = []
        
        # Base goal tips
        if goal == 'loss':
            tips = [
                f'Your target is {cal} kcal/day (a 500 kcal deficit from your TDEE of {targets["tdee"]} kcal). Log every meal.',
                f'Aim for {targets["protein_g"]} g protein daily — it preserves muscle while you lose fat.',
                'Drink 500 ml of water 20 minutes before each meal to naturally curb hunger.',
                'Replace refined carbs with the high-fibre options shown in your plan.',
                '7-9 hours of sleep per night keeps cortisol low and supports fat loss.',
            ]
        elif goal == 'gain':
            tips = [
                f'You need {cal} kcal/day to grow. If the scale stays flat after 2 weeks, add 150-200 kcal.',
                f'Target {targets["protein_g"]} g protein spread across all meals for maximum muscle protein synthesis.',
                'Hit your post-workout meal within 30 minutes — this is your most anabolic window.',
                'Boost calories with olive oil drizzles, nut butters, whole milk/plant milk and avocado.',
                'Progressive overload in training ensures your surplus converts to muscle, not fat.',
            ]
        elif goal == 'maintenance':
            tips = [
                f'Your TDEE is {targets["tdee"]} kcal. Stay within 100 kcal of {cal} kcal to maintain weight.',
                'Weigh yourself at the same time each morning for a consistent baseline.',
                'Balance cardio and strength training to preserve muscle mass as you age.',
                'Meal prep on weekends to avoid impulsive high-calorie choices mid-week.',
                'Swap ultra-processed snacks for the whole-food options in your plan.',
            ]
        else:
            tips = [
                'Fill half your plate with colourful vegetables at every meal for micronutrient variety.',
                'Choose whole grains over refined carbohydrates — they sustain energy for longer.',
                'Eat mindfully: put your phone down, chew slowly, and stop when 80% full.',
                'Limit added sugars and ultra-processed foods to occasional treats.',
                'Move for at least 30 minutes daily — even a brisk walk significantly improves health.',
            ]

        # Preference specific tips
        if diet_preference == 'keto':
            tips.append('Since you are on a Ketogenic diet, keep net carbs strictly under 5% of daily calories to stay in ketosis.')
            tips.append('Electrolytes (Sodium, Potassium, Magnesium) are flushed out rapidly on keto. Ensure adequate salting of food.')
        elif diet_preference == 'vegan':
            tips.append('Ensure daily vitamin B12 supplementation and focus on combining legume/grain protein sources.')
        elif diet_preference == 'vegetarian':
            tips.append('Include iron-rich spinach, lentils, and pumpkin seeds, and eat them with vitamin C for optimal absorption.')
        elif diet_preference == 'pescatarian':
            tips.append('Great choices! Fish like salmon and mackerel are loaded with heart-healthy omega-3 fatty acids.')

        # Contextual additions based on personal data
        if age >= 50:
            tips.append(f'At {age}, prioritise calcium-rich foods (dairy, fortified plant milks) and omega-3 sources for bone & joint health.')
        if bmi >= 30:
            tips.append(f'With a BMI of {bmi}, even a 5-10% weight reduction dramatically improves blood pressure, blood sugar and cholesterol.')
        if gender == 'female' and diet_preference != 'keto':
            tips.append('Include iron-rich foods (spinach, lentils) paired with vitamin C (citrus, peppers) for better absorption.')
        if cal < 1600:
            tips.append(f'At {cal} kcal, consider a daily multivitamin to cover any micronutrient gaps on a reduced-calorie diet.')
        if height < 160:
            tips.append(f'At {height} cm, your calorie needs are naturally lower — the plan portions are sized precisely for your frame.')
        if height > 185:
            tips.append(f'At {height} cm, you have a larger frame with higher calorie needs — the portions in your plan reflect this.')

        return Response({
            'profile_used': {
                'age': age, 'weight': weight, 'height': height,
                'gender': gender, 'goal': goal, 'activity_level': activity_level,
                'diet_preference': diet_preference,
            },
            'bmi': bmi,
            'bmi_category': bmi_category,
            'targets': targets,
            'meal_plan': meal_plan,
            'tips': tips,
        })
