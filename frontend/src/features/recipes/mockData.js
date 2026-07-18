// ─── Mock Recipe Database ────────────────────────────────────────────────────
export const MOCK_RECIPES = [
  {
    id: 1,
    title: 'Grilled Chicken Buddha Bowl',
    description: 'A protein-packed powerhouse bowl with grilled chicken, fluffy quinoa, rainbow roasted veggies, and creamy tahini dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    prep_time: 15, cook_time: 25,
    calories: 485, protein: 42, carbs: 38, fats: 14, fiber: 8, sugar: 6, sodium: 420,
    vitamins: { A: '45%', C: '62%', D: '8%', B12: '30%' },
    minerals: { Iron: '22%', Calcium: '15%', Potassium: '28%' },
    is_favorite: false, favorites_count: 234,
    difficulty: 'Easy', servings: 2, yield_unit: 'bowls',
    cuisine: 'Mediterranean', meal_type: 'Lunch',
    diet_tags: ['High Protein', 'Gluten-Free', 'Low Fat'],
    goal_tags: ['Weight Loss', 'Muscle Gain'],
    health_score: 92, glycemic_index: 'Low (38)',
    estimated_cost: '₹180', shelf_life: '2 days',
    storage: 'Refrigerate in airtight container. Keep dressing separate.',
    rating: 4.8, reviews_count: 156,
    video_url: 'https://www.youtube.com/embed/8Bf-rCvIjhY',
    chef: 'Chef Priya Sharma',
    ingredients: '200g chicken breast\n1 cup quinoa\n2 cups mixed greens\n1 cucumber, sliced\n1 cup cherry tomatoes, halved\n½ red onion, thinly sliced\n2 tbsp tahini\n1 lemon, juiced\n2 tbsp olive oil\nSalt & pepper to taste\n1 tsp paprika\n1 tsp garlic powder',
    instructions: 'Marinate chicken with paprika, garlic powder, salt, pepper and 1 tbsp olive oil for 10 mins\nHeat grill pan over medium-high heat\nGrill chicken 6-7 mins per side until internal temp reaches 75°C\nMeanwhile, cook quinoa in 2 cups salted water — bring to boil, reduce and simmer 15 mins\nSlice cherry tomatoes, cucumber and red onion\nWhisk tahini, lemon juice, remaining olive oil and 2 tbsp water\nRest chicken 5 mins, then slice\nAssemble: quinoa base → greens → veggies → chicken → tahini drizzle',
    substitutions: [
      { original: 'Chicken', substitute: 'Tofu', reason: 'Vegan alternative, marinate 30 min extra' },
      { original: 'Quinoa', substitute: 'Brown Rice', reason: 'Budget-friendly, cook 40 mins' },
      { original: 'Tahini', substitute: 'Peanut Butter', reason: 'Easier to source, similar texture' },
    ],
    ai_tips: [
      'Add Greek yogurt on the side to boost protein by 15g',
      'Ideal post-workout meal — consume within 45 min of training',
      'Replace tahini with hummus to cut fat by 8g',
    ],
    seasonal: false,
  },
  {
    id: 2,
    title: 'Masala Oats Upma',
    description: 'Fiber-rich Indian breakfast with rolled oats, aromatic spices, and colourful vegetables. Ready in under 15 minutes.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
    prep_time: 5, cook_time: 10,
    calories: 290, protein: 12, carbs: 44, fats: 7, fiber: 6, sugar: 3, sodium: 380,
    vitamins: { A: '18%', C: '25%', D: '2%', B12: '0%' },
    minerals: { Iron: '15%', Calcium: '8%', Potassium: '20%' },
    is_favorite: true, favorites_count: 512,
    difficulty: 'Beginner', servings: 2, yield_unit: 'servings',
    cuisine: 'Indian', meal_type: 'Breakfast',
    diet_tags: ['Vegetarian', 'High Fiber', 'Budget Friendly', 'Beginner Friendly'],
    goal_tags: ['Weight Loss', 'Diabetes', 'PCOS'],
    health_score: 88, glycemic_index: 'Medium (55)',
    estimated_cost: '₹40', shelf_life: '1 day',
    storage: 'Best served fresh. Refrigerate with a sprinkle of water on top.',
    rating: 4.6, reviews_count: 89,
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    chef: 'Chef Ananya Mehta',
    ingredients: '1 cup rolled oats\n1 medium onion, finely chopped\n1 tomato, chopped\n½ cup green peas\n1 green chilli, slit\n1 tsp mustard seeds\n1 tsp cumin seeds\n8-10 curry leaves\n1 tbsp oil\nSalt to taste\n½ tsp turmeric\n2 cups water\nFresh coriander for garnish',
    instructions: 'Dry roast oats in a pan for 3 mins until light golden, set aside\nHeat oil, add mustard and cumin seeds until they splutter\nAdd curry leaves and green chilli, sauté 30 seconds\nAdd onions and cook until translucent (3 mins)\nAdd tomatoes and turmeric, cook 2 mins\nPour in water, bring to boil\nAdd green peas and salt\nStir in roasted oats, mix well\nCover and cook on low 3-4 mins\nGarnish with fresh coriander and serve',
    substitutions: [
      { original: 'Rolled Oats', substitute: 'Quinoa Flakes', reason: 'Higher protein, same texture' },
      { original: 'Oil', substitute: 'Ghee', reason: 'Richer flavour, use half the quantity' },
      { original: 'Green Peas', substitute: 'Edamame', reason: 'More protein, stays firmer' },
    ],
    ai_tips: [
      'Great for PCOS — oats regulate blood sugar spikes',
      'Add a handful of spinach for extra iron',
      'Skip salt and use lemon juice to reduce sodium by 60%',
    ],
    seasonal: false,
  },
  {
    id: 3,
    title: 'Avocado Egg Toast with Microgreens',
    description: 'Creamy smashed avocado on sourdough toast topped with poached eggs and fresh microgreens. A nutrient-dense brunch favourite.',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&q=80',
    prep_time: 10, cook_time: 8,
    calories: 380, protein: 18, carbs: 28, fats: 22, fiber: 7, sugar: 2, sodium: 310,
    vitamins: { A: '20%', C: '15%', D: '12%', B12: '18%' },
    minerals: { Iron: '18%', Calcium: '10%', Potassium: '35%' },
    is_favorite: false, favorites_count: 341,
    difficulty: 'Easy', servings: 2, yield_unit: 'slices',
    cuisine: 'Continental', meal_type: 'Breakfast',
    diet_tags: ['Vegetarian', 'High Protein', 'Keto', 'Mediterranean'],
    goal_tags: ['Weight Loss', 'Heart Health', 'Pregnancy'],
    health_score: 95, glycemic_index: 'Low (40)',
    estimated_cost: '₹120', shelf_life: 'Serve immediately',
    storage: 'Prepare avocado fresh. Store toasted bread separately.',
    rating: 4.9, reviews_count: 203,
    video_url: null,
    chef: 'Chef Rohan Kapoor',
    ingredients: '2 slices sourdough bread\n1 ripe avocado\n2 eggs\n1 tbsp white vinegar\n1 tsp lemon juice\nRed chilli flakes\nSalt & pepper\nFresh microgreens or sprouts\nEVOO for drizzle',
    instructions: 'Toast sourdough slices until golden and crisp\nHalve avocado, remove seed, scoop flesh into bowl\nMash with lemon juice, salt and pepper until creamy but chunky\nBoil water in a saucepan, add white vinegar\nCreate a gentle vortex, slide each egg in gently\nPoach 3 mins for runny yolk, 4 mins for set\nSpread avocado generously on toast\nTop with poached egg using slotted spoon\nScatter microgreens, chilli flakes, drizzle EVOO\nServe immediately',
    substitutions: [
      { original: 'Sourdough', substitute: 'Multigrain Bread', reason: 'More fibre, gluten-free option' },
      { original: 'Eggs', substitute: 'Silken Tofu Scramble', reason: 'Vegan, same texture' },
      { original: 'Avocado', substitute: 'Hummus', reason: 'Lower fat, similar creaminess' },
    ],
    ai_tips: [
      'Avocado provides healthy monounsaturated fats great for heart health',
      'Excellent pregnancy meal — folate from avocado supports fetal development',
      'Add smoked salmon for an omega-3 boost',
    ],
    seasonal: false,
  },
  {
    id: 4,
    title: 'Palak Paneer Soup',
    description: 'Velvety spinach and cottage cheese soup blended with aromatic Indian spices. Low calorie, high iron, utterly comforting.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    prep_time: 10, cook_time: 20,
    calories: 210, protein: 14, carbs: 18, fats: 9, fiber: 5, sugar: 4, sodium: 460,
    vitamins: { A: '85%', C: '40%', D: '5%', B12: '15%' },
    minerals: { Iron: '35%', Calcium: '25%', Potassium: '22%' },
    is_favorite: false, favorites_count: 178,
    difficulty: 'Easy', servings: 3, yield_unit: 'bowls',
    cuisine: 'Indian', meal_type: 'Dinner',
    diet_tags: ['Vegetarian', 'Gluten-Free', 'Low Carb', 'High Fiber'],
    goal_tags: ['Weight Loss', 'Kids', 'Seniors', 'Pregnancy'],
    health_score: 90, glycemic_index: 'Low (32)',
    estimated_cost: '₹90', shelf_life: '3 days',
    storage: 'Refrigerate. Add water when reheating to restore consistency.',
    rating: 4.7, reviews_count: 124,
    video_url: null,
    chef: 'Chef Meena Iyer',
    ingredients: '4 cups fresh spinach\n200g paneer, cubed\n1 large onion, chopped\n2 garlic cloves\n1-inch ginger\n2 green chillies\n1 tsp cumin seeds\n½ tsp garam masala\n1 tbsp ghee\n3 cups water or vegetable stock\nSalt & lemon to taste\n2 tbsp cream (optional)',
    instructions: 'Blanch spinach in boiling water for 2 mins, transfer to ice water, drain\nHeat ghee, add cumin seeds until they pop\nSauté onion until golden (5 mins)\nAdd ginger, garlic and chilli paste, cook 2 mins\nAdd blanched spinach, mix well\nPour in stock, bring to boil\nBlend until silky smooth\nReturn to pan, season with garam masala, salt\nAdd paneer cubes, simmer 5 mins\nFinish with cream and lemon juice',
    substitutions: [
      { original: 'Paneer', substitute: 'Tofu', reason: 'Vegan, press well before adding' },
      { original: 'Ghee', substitute: 'Coconut Oil', reason: 'Dairy-free option' },
      { original: 'Cream', substitute: 'Cashew Cream', reason: 'Vegan, soak 4 hrs then blend' },
    ],
    ai_tips: [
      'Iron absorption improves with lemon juice — do not skip it',
      'Perfect for kids — blend finely so they don\'t notice the spinach',
      'For seniors: reduce spice and blend extra smooth',
    ],
    seasonal: true,
  },
  {
    id: 5,
    title: 'Keto Cauliflower Fried Rice',
    description: 'Low-carb fried rice made with riced cauliflower, eggs, soy sauce and mixed vegetables. Ready in 15 minutes.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
    prep_time: 10, cook_time: 15,
    calories: 220, protein: 11, carbs: 12, fats: 15, fiber: 4, sugar: 3, sodium: 490,
    vitamins: { A: '25%', C: '48%', D: '8%', B12: '20%' },
    minerals: { Iron: '10%', Calcium: '8%', Potassium: '18%' },
    is_favorite: false, favorites_count: 89,
    difficulty: 'Easy', servings: 2, yield_unit: 'servings',
    cuisine: 'Asian', meal_type: 'Lunch',
    diet_tags: ['Keto', 'Low Carb', 'Gluten-Free', 'Dairy-Free'],
    goal_tags: ['Weight Loss', 'Diabetes'],
    health_score: 86, glycemic_index: 'Very Low (15)',
    estimated_cost: '₹100', shelf_life: '2 days',
    storage: 'Refrigerate. Reheat in wok with a splash of water.',
    rating: 4.5, reviews_count: 67,
    video_url: null,
    chef: 'Chef Arjun Nair',
    ingredients: '1 medium cauliflower head\n3 eggs\n1 cup mixed vegetables (peas, carrots, corn)\n4 green onions, sliced\n3 tbsp soy sauce (or tamari for GF)\n1 tbsp sesame oil\n2 garlic cloves, minced\n1-inch ginger, grated\n1 tbsp coconut oil\nWhite pepper & salt',
    instructions: 'Pulse cauliflower in food processor to rice-like texture\nSqueeze cauliflower in towel to remove excess moisture — crucial step\nHeat coconut oil in large wok on high heat\nScramble eggs, push to side\nAdd garlic and ginger, stir-fry 1 min\nAdd vegetables, cook 3 mins on high heat\nAdd cauliflower rice, toss constantly for 5 mins\nPour soy sauce around the wok edges\nFinish with sesame oil and white pepper\nGarnish with green onions',
    substitutions: [
      { original: 'Cauliflower', substitute: 'Broccoli Rice', reason: 'Higher protein, similar texture' },
      { original: 'Soy Sauce', substitute: 'Coconut Aminos', reason: 'Lower sodium, soy-free' },
      { original: 'Eggs', substitute: 'Tofu Scramble', reason: 'Vegan alternative' },
    ],
    ai_tips: [
      'Squeezing moisture from cauliflower is key — otherwise it gets soggy',
      'Great for diabetes management — glycemic index only 15',
      'Add 100g chicken to boost protein to 28g per serving',
    ],
    seasonal: false,
  },
  {
    id: 6,
    title: 'Berry Protein Smoothie Bowl',
    description: 'Thick, vibrant açaí-style smoothie bowl loaded with antioxidants, topped with granola, fresh berries, and chia seeds.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    prep_time: 8, cook_time: 0,
    calories: 340, protein: 22, carbs: 48, fats: 8, fiber: 10, sugar: 24, sodium: 120,
    vitamins: { A: '12%', C: '90%', D: '5%', B12: '25%' },
    minerals: { Iron: '20%', Calcium: '30%', Potassium: '40%' },
    is_favorite: true, favorites_count: 421,
    difficulty: 'Beginner', servings: 1, yield_unit: 'bowl',
    cuisine: 'Continental', meal_type: 'Breakfast',
    diet_tags: ['Vegetarian', 'Gluten-Free', 'High Fiber', 'High Protein'],
    goal_tags: ['Weight Loss', 'PCOS', 'Kids', 'Muscle Gain'],
    health_score: 94, glycemic_index: 'Medium (52)',
    estimated_cost: '₹150', shelf_life: 'Serve immediately',
    storage: 'Blend base ahead and freeze in portions. Top fresh before serving.',
    rating: 4.9, reviews_count: 312,
    video_url: null,
    chef: 'Chef Kavya Reddy',
    ingredients: '1 cup frozen mixed berries\n1 frozen banana\n1 scoop whey protein (vanilla)\n½ cup Greek yogurt\n¼ cup almond milk\nToppings: granola, fresh strawberries, blueberries, chia seeds, honey drizzle, coconut flakes',
    instructions: 'Place frozen berries, banana, protein powder, yogurt in blender\nAdd almond milk — start with less for thicker consistency\nBlend on high until completely smooth\nPour into bowl — it should be thick enough for toppings to sit\nArrange toppings artfully: granola as base, berries in rows\nScatter chia seeds, coconut flakes\nDrizzle honey in a zigzag\nServe immediately with a spoon',
    substitutions: [
      { original: 'Whey Protein', substitute: 'Pea Protein', reason: 'Vegan, similar protein content' },
      { original: 'Greek Yogurt', substitute: 'Coconut Yogurt', reason: 'Dairy-free option' },
      { original: 'Honey', substitute: 'Maple Syrup', reason: 'Vegan sweetener' },
    ],
    ai_tips: [
      'PCOS-friendly: berries have the lowest sugar of all fruits',
      'Prep frozen banana portions ahead for quick weekday breakfast',
      'Skip honey if managing blood sugar levels',
    ],
    seasonal: false,
  },
];

// ─── Recipe Collections ──────────────────────────────────────────────────────
export const RECIPE_COLLECTIONS = [
  { id: 'c1', name: 'High Protein Meals', icon: '💪', count: 48, gradient: 'linear-gradient(135deg, #10b981, #059669)', description: '30g+ protein per serving' },
  { id: 'c2', name: 'Indian Weight Loss', icon: '🇮🇳', count: 62, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', description: 'Desi flavours, guilt-free' },
  { id: 'c3', name: '15-Minute Meals', icon: '⚡', count: 35, gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', description: 'Quick, nutritious, delicious' },
  { id: 'c4', name: 'Meal Prep Ready', icon: '📦', count: 27, gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)', description: 'Batch cook for the week' },
  { id: 'c5', name: 'Healthy Desserts', icon: '🍰', count: 19, gradient: 'linear-gradient(135deg, #ec4899, #be185d)', description: 'Indulge without the guilt' },
  { id: 'c6', name: 'Kids Lunch Box', icon: '🎒', count: 31, gradient: 'linear-gradient(135deg, #84cc16, #65a30d)', description: 'Kid-approved, parent-happy' },
  { id: 'c7', name: 'Diabetic-Friendly', icon: '🩺', count: 44, gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)', description: 'Low GI, sugar-controlled' },
  { id: 'c8', name: 'PCOS Recipes', icon: '💜', count: 38, gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', description: 'Hormone-balancing meals' },
];

// ─── Seasonal Data ───────────────────────────────────────────────────────────
export const SEASONAL_DATA = {
  Winter: {
    icon: '❄️',
    label: 'Winter Season',
    color: '#0ea5e9',
    ingredients: ['Spinach', 'Methi', 'Sarson', 'Gajar', 'Matar', 'Mooli', 'Amla', 'Oranges'],
    tip: 'Winter is the best time for leafy greens — iron and vitamin C are at their peak.',
  },
  Summer: {
    icon: '☀️',
    label: 'Summer Season',
    color: '#f59e0b',
    ingredients: ['Mango', 'Watermelon', 'Cucumber', 'Bottle Gourd', 'Bitter Gourd', 'Kokum', 'Tinda'],
    tip: 'Hydrating summer foods help regulate body temperature and boost electrolytes.',
  },
  Monsoon: {
    icon: '🌧️',
    label: 'Monsoon Season',
    color: '#6366f1',
    ingredients: ['Corn', 'Arbi', 'Yam', 'Drumstick', 'Cluster Beans', 'Ridge Gourd', 'Bitter Gourd'],
    tip: 'Choose cooked over raw during monsoon to avoid waterborne bacteria in vegetables.',
  },
  Autumn: {
    icon: '🍂',
    label: 'Autumn Season',
    color: '#f97316',
    ingredients: ['Pumpkin', 'Sweet Potato', 'Beetroot', 'Turnip', 'Pomegranate', 'Guava', 'Fig'],
    tip: 'Autumn root vegetables are rich in complex carbs for sustained energy.',
  },
};

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'Summer';
  if (month >= 6 && month <= 9) return 'Monsoon';
  if (month >= 10 && month <= 11) return 'Autumn';
  return 'Winter';
}

// ─── Community Recipes ───────────────────────────────────────────────────────
export const COMMUNITY_RECIPES = [
  {
    id: 'cm1',
    title: 'Jowar Roti with Ghee',
    user: 'Sneha P.',
    avatar: '🧑‍🍳',
    rating: 4.7,
    reviews: 23,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
    tags: ['Gluten-Free', 'Indian'],
    calories: 180,
    likes: 89,
    timeAgo: '2 hours ago',
  },
  {
    id: 'cm2',
    title: 'Ragi Banana Pancakes',
    user: 'Arjun M.',
    avatar: '👨‍🍳',
    rating: 4.9,
    reviews: 41,
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&q=80',
    tags: ['Vegetarian', 'Kids'],
    calories: 220,
    likes: 156,
    timeAgo: '5 hours ago',
  },
  {
    id: 'cm3',
    title: 'Moong Dal Chilla',
    user: 'Priya K.',
    avatar: '👩‍🍳',
    rating: 4.8,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&q=80',
    tags: ['Vegan', 'High Protein'],
    calories: 195,
    likes: 203,
    timeAgo: '1 day ago',
  },
];

// ─── Diet Filter Options ─────────────────────────────────────────────────────
export const DIET_FILTERS = [
  { id: 'all', label: 'All Recipes', icon: '🍽️' },
  { id: 'Vegetarian', label: 'Vegetarian', icon: '🥦' },
  { id: 'Vegan', label: 'Vegan', icon: '🌱' },
  { id: 'Jain', label: 'Jain', icon: '🪷' },
  { id: 'Gluten-Free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'Dairy-Free', label: 'Dairy-Free', icon: '🥛' },
  { id: 'Keto', label: 'Keto', icon: '🥑' },
  { id: 'Paleo', label: 'Paleo', icon: '🦴' },
  { id: 'Mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'High Protein', label: 'High Protein', icon: '💪' },
  { id: 'Low Carb', label: 'Low Carb', icon: '🍚' },
  { id: 'Low Fat', label: 'Low Fat', icon: '💧' },
  { id: 'High Fiber', label: 'High Fiber', icon: '🌿' },
  { id: 'Budget Friendly', label: 'Budget Friendly', icon: '💰' },
  { id: 'Beginner Friendly', label: 'Beginner', icon: '⭐' },
];

export const GOAL_FILTERS = [
  { id: 'Weight Loss', label: 'Weight Loss', icon: '⚖️', color: '#10b981' },
  { id: 'Weight Gain', label: 'Weight Gain', icon: '📈', color: '#f59e0b' },
  { id: 'Muscle Gain', label: 'Muscle Gain', icon: '💪', color: '#6366f1' },
  { id: 'Diabetes', label: 'Diabetes', icon: '🩺', color: '#14b8a6' },
  { id: 'PCOS', label: 'PCOS', icon: '💜', color: '#a855f7' },
  { id: 'Heart Health', label: 'Heart Health', icon: '❤️', color: '#ef4444' },
  { id: 'Pregnancy', label: 'Pregnancy', icon: '🤰', color: '#ec4899' },
  { id: 'Kids', label: 'Kids', icon: '🧒', color: '#84cc16' },
  { id: 'Seniors', label: 'Seniors', icon: '🧓', color: '#0ea5e9' },
];

export const CUISINE_OPTIONS = ['All Cuisines', 'Indian', 'Mediterranean', 'Asian', 'Continental', 'Mexican', 'Middle Eastern'];
export const MEAL_TYPE_OPTIONS = ['All Meals', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
export const DIFFICULTY_OPTIONS = ['Any Level', 'Beginner', 'Easy', 'Medium', 'Advanced'];

// ─── Grocery Categories ──────────────────────────────────────────────────────
export const GROCERY_CATEGORIES = ['Proteins', 'Grains & Legumes', 'Dairy', 'Vegetables', 'Fruits', 'Spices & Herbs', 'Oils & Condiments', 'Other'];

export function categorizeIngredient(name) {
  const lower = name.toLowerCase();
  if (['chicken', 'fish', 'paneer', 'tofu', 'egg', 'prawn', 'mutton'].some(p => lower.includes(p))) return 'Proteins';
  if (['rice', 'quinoa', 'oat', 'lentil', 'dal', 'moong', 'wheat', 'flour', 'roti'].some(p => lower.includes(p))) return 'Grains & Legumes';
  if (['milk', 'yogurt', 'curd', 'ghee', 'butter', 'cream', 'cheese'].some(p => lower.includes(p))) return 'Dairy';
  if (['spinach', 'tomato', 'onion', 'garlic', 'ginger', 'carrot', 'pea', 'cucumber', 'cauliflower', 'broccoli', 'greens', 'pepper', 'chilli'].some(p => lower.includes(p))) return 'Vegetables';
  if (['mango', 'banana', 'berry', 'lemon', 'lime', 'orange', 'avocado'].some(p => lower.includes(p))) return 'Fruits';
  if (['cumin', 'turmeric', 'paprika', 'coriander', 'garam masala', 'mustard', 'curry', 'chilli flake', 'herb'].some(p => lower.includes(p))) return 'Spices & Herbs';
  if (['oil', 'tahini', 'soy sauce', 'vinegar', 'sauce', 'honey', 'maple'].some(p => lower.includes(p))) return 'Oils & Condiments';
  return 'Other';
}
