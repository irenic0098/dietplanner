import os
import json
import base64
from PIL import Image
import io

# Optional import of Google GenerativeAI
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

# Load Environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if HAS_GEMINI and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
class AIService:
    
    @staticmethod
    def get_model(model_name="gemini-1.5-flash"):
        if HAS_GEMINI and GEMINI_API_KEY:
            return genai.GenerativeModel(model_name)
        return None

    @classmethod
    def generate_diet_plan(cls, age, weight, height, gender, goal, calories):
        prompt = f"""
        Act as a professional dietitian. Generate a complete 1-day personalized meal plan for a {age} year old {gender},
        weighing {weight} kg, height {height} cm, with a goal of {goal.replace('_', ' ')}.
        The daily calorie target is {calories} kcal.
        Provide a JSON response with the following format:
        {{
            "plan_name": "AI Personalized Plan",
            "target_calories": {calories},
            "meals": {{
                "breakfast": {{
                    "name": "Meal name",
                    "items": [
                        {{"food": "Oatmeal with berries", "servings": 1.0, "calories": 350, "protein": 12, "carbs": 55, "fats": 6, "fiber": 8}}
                    ]
                }},
                "lunch": {{
                    "name": "Meal name",
                    "items": [
                        {{"food": "Grilled Chicken Salad", "servings": 1.0, "calories": 500, "protein": 40, "carbs": 15, "fats": 12, "fiber": 5}}
                    ]
                }},
                "dinner": {{
                    "name": "Meal name",
                    "items": [
                        {{"food": "Baked Salmon with Quinoa", "servings": 1.0, "calories": 600, "protein": 35, "carbs": 45, "fats": 18, "fiber": 6}}
                    ]
                }},
                "snack": {{
                    "name": "Meal name",
                    "items": [
                        {{"food": "Mixed Almonds and Greek Yogurt", "servings": 1.0, "calories": 250, "protein": 18, "carbs": 10, "fats": 12, "fiber": 2}}
                    ]
                }}
            }}
        }}
        Only return the JSON object, do not include markdown blocks or additional text.
        """
        
        model = cls.get_model()
        if model:
            try:
                response = model.generate_content(prompt)
                clean_txt = response.text.strip()
                if clean_txt.startswith("```json"):
                    clean_txt = clean_txt[7:-3]
                elif clean_txt.startswith("```"):
                    clean_txt = clean_txt[3:-3]
                return json.loads(clean_txt.strip())
            except Exception as e:
                # Fallback to local rule-based if API fails
                pass
                
        # Rule-based fallback generator
        return cls._get_mock_diet_plan(goal, calories)

    @classmethod
    def analyze_food_image(cls, image_bytes):
        # image_bytes is a binary string
        prompt = """
        Analyze this food image. Detect the food items visible in this image.
        Estimate the total serving weight and calculate the nutritional breakdown:
        - Calories (kcal)
        - Protein (g)
        - Carbs (g)
        - Fats (g)
        - Fiber (g)
        
        Provide a JSON response with the following format:
        {{
            "food_detected": "Salmon Avocado Salad",
            "confidence_score": 0.92,
            "estimated_weight": "350g",
            "nutrition": {{
                "calories": 420,
                "protein": 28,
                "carbs": 12,
                "fats": 25,
                "fiber": 6
            }},
            "description": "A healthy bowl containing grilled salmon fillet chunks, diced fresh avocado, cherry tomatoes, and mixed greens dressed in olive oil."
        }}
        Only return the JSON object, do not include markdown blocks.
        """
        
        if HAS_GEMINI and GEMINI_API_KEY:
            try:
                # Use multimodal model
                model = cls.get_model("gemini-1.5-flash")
                # Convert bytes to PIL Image
                image = Image.open(io.BytesIO(image_bytes))
                response = model.generate_content([prompt, image])
                clean_txt = response.text.strip()
                if clean_txt.startswith("```json"):
                    clean_txt = clean_txt[7:-3]
                elif clean_txt.startswith("```"):
                    clean_txt = clean_txt[3:-3]
                return json.loads(clean_txt.strip())
            except Exception as e:
                pass
                
        # Mock Response if Gemini fails/disabled
        return {
            "food_detected": "Healthy Grilled Chicken & Rice Plate",
            "confidence_score": 0.88,
            "estimated_weight": "400g",
            "nutrition": {
                "calories": 520,
                "protein": 42,
                "carbs": 50,
                "fats": 10,
                "fiber": 4
            },
            "description": "Recognized a nutritious meal featuring skinless chicken breast, brown rice, broccoli florets, and sweet corn. (Mocked Detection)"
        }

    @classmethod
    def get_chatbot_response(cls, message, chat_history=[]):
        system_instruction = "You are a helpful, professional, and knowledgeable AI Dietitian & Nutritionist. Provide clear, evidence-based nutrition tips, diet rules, and recipe guides. Keep answers concise."
        
        if HAS_GEMINI and GEMINI_API_KEY:
            try:
                model = cls.get_model()
                # Simple prompt combining instruction, history, and current message
                history_prompt = ""
                for chat in chat_history[-6:]: # last 6 chats
                    role = "User" if chat.get("sender") == "user" else "AI"
                    history_prompt += f"{role}: {chat.get('text')}\n"
                
                full_prompt = f"{system_instruction}\n\n{history_prompt}User: {message}\nAI:"
                response = model.generate_content(full_prompt)
                return response.text.strip()
            except Exception as e:
                pass
                
        # Rule-based offline chatbot responses
        msg_lower = message.lower()
        if "hello" in msg_lower or "hi" in msg_lower:
            return "Hello! I am your AI Nutritionist. How can I help you reach your health goals today?"
        elif "recipe" in msg_lower or "cook" in msg_lower:
            return "I can suggest a quick Mediterranean Salad: Mix chopped cucumber, tomatoes, olives, feta cheese, and olive oil. High in healthy fats and fiber!"
        elif "calorie" in msg_lower or "deficit" in msg_lower:
            return "To lose weight, aim for a moderate calorie deficit of 300 to 500 calories below your daily energy requirements. Keep protein high to retain muscle mass."
        elif "muscle" in msg_lower or "protein" in msg_lower:
            return "For muscle growth, aim for 1.6 to 2.2 grams of protein per kilogram of body weight daily, combined with strength training."
        else:
            return "Interesting question! A balanced diet consists of roughly 40-50% complex carbohydrates, 25-30% lean proteins, and 20-30% healthy fats. Let me know if you need specific meal schedules."

    @classmethod
    def suggest_alternatives(cls, food_name):
        prompt = f"""
        Provide a list of 3 healthier alternatives for {food_name}.
        Format the response as a JSON array of objects:
        [
            {{"food": "Alternative 1", "reason": "Why it is better", "calories_saved": 150}},
            ...
        ]
        Only return the JSON array, no formatting.
        """
        if HAS_GEMINI and GEMINI_API_KEY:
            try:
                model = cls.get_model()
                response = model.generate_content(prompt)
                clean_txt = response.text.strip()
                if clean_txt.startswith("```json"):
                    clean_txt = clean_txt[7:-3]
                elif clean_txt.startswith("```"):
                    clean_txt = clean_txt[3:-3]
                return json.loads(clean_txt.strip())
            except Exception as e:
                pass
                
        # Standard alternatives lookup table
        alt_table = {
            "white rice": [
                {"food": "Brown Rice", "reason": "Contains more fiber and retains vitamins", "calories_saved": 20},
                {"food": "Quinoa", "reason": "Complete protein with a lower glycemic index", "calories_saved": 15},
                {"food": "Cauliflower Rice", "reason": "Very low carb and calorie alternative", "calories_saved": 150}
            ],
            "burger": [
                {"food": "Turkey Lettuce Wrap Burger", "reason": "Lower saturated fats and zero refined grains", "calories_saved": 250},
                {"food": "Grilled Chicken Sandwich", "reason": "Leaner protein option", "calories_saved": 180},
                {"food": "Portobello Mushroom Burger", "reason": "Fiber-rich plant based meal", "calories_saved": 300}
            ],
            "soda": [
                {"food": "Sparkling Water with Lemon", "reason": "Zero added sugars and fully hydrating", "calories_saved": 140},
                {"food": "Kombucha", "reason": "Probiotics support gut health with low sugar", "calories_saved": 100},
                {"food": "Green Iced Tea (Unsweetened)", "reason": "Rich in metabolism-boosting antioxidants", "calories_saved": 140}
            ]
        }
        
        key = food_name.lower().strip()
        for k in alt_table:
            if k in key:
                return alt_table[k]
                
        return [
            {"food": f"Grilled Chicken {food_name}", "reason": "Less fats and oil usage", "calories_saved": 80},
            {"food": f"Baked version of {food_name}", "reason": "Eliminates deep frying trans fats", "calories_saved": 120},
            {"food": "Seasonal fruit salad mix", "reason": "Provides clean fiber and natural vitamins instead of processed ingredients", "calories_saved": 150}
        ]

    @classmethod
    def _get_mock_diet_plan(cls, goal, calories):
        # Provides high-quality mock data matching the goal
        is_gain = goal == 'gain'
        is_loss = goal == 'loss'
        
        breakfast_calories = int(calories * 0.25)
        lunch_calories = int(calories * 0.35)
        dinner_calories = int(calories * 0.30)
        snack_calories = int(calories * 0.10)
        
        return {
            "plan_name": f"AI Personalized {goal.capitalize()} Plan",
            "target_calories": calories,
            "meals": {
                "breakfast": {
                    "name": "High Fiber Energizer Breakfast",
                    "items": [
                        {"food": "Oatmeal with Almond Milk & Banana", "servings": 1.2, "calories": breakfast_calories - 60, "protein": 14.0, "carbs": 60.0, "fats": 7.0, "fiber": 8.0},
                        {"food": "Boiled Egg whites", "servings": 2.0, "calories": 60, "protein": 12.0, "carbs": 1.0, "fats": 0.0, "fiber": 0.0}
                    ]
                },
                "lunch": {
                    "name": "Lean Protein Macro Lunch",
                    "items": [
                        {"food": "Grilled Chicken Breast with Brown Rice", "servings": 1.0, "calories": lunch_calories - 50, "protein": 45.0, "carbs": 55.0, "fats": 8.0, "fiber": 6.0},
                        {"food": "Steamed broccoli", "servings": 1.5, "calories": 50, "protein": 4.0, "carbs": 9.0, "fats": 0.5, "fiber": 4.0}
                    ]
                },
                "dinner": {
                    "name": "Omega-3 Rich Restorative Dinner",
                    "items": [
                        {"food": "Pan Seared Salmon fillet", "servings": 1.0, "calories": dinner_calories - 100, "protein": 34.0, "carbs": 0.0, "fats": 20.0, "fiber": 0.0},
                        {"food": "Sweet Potato mash & asparagus", "servings": 1.0, "calories": 100, "protein": 3.0, "carbs": 25.0, "fats": 1.0, "fiber": 5.0}
                    ]
                },
                "snack": {
                    "name": "Post-Workout Recovery Fuel",
                    "items": [
                        {"food": "Whey Protein Shake & walnuts", "servings": 1.0, "calories": snack_calories, "protein": 26.0, "carbs": 12.0, "fats": 9.0, "fiber": 2.0}
                    ]
                }
            }
        }
