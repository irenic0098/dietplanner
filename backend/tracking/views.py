from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from datetime import date, timedelta
from django.db.models import Sum, Avg
from .models import WeightLog, WaterLog, DailyMealCompletion, ActivityLog, WellnessLog, WeightNote, BodyMeasurement
from .serializers import (
    WeightLogSerializer,
    WaterLogSerializer,
    DailyMealCompletionSerializer,
    ActivityLogSerializer,
    WellnessLogSerializer,
    WeightNoteSerializer,
    BodyMeasurementSerializer,
)

class WeightLogViewSet(viewsets.ModelViewSet):
    serializer_class = WeightLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user).order_by('logged_at')

    def create(self, request, *args, **kwargs):
        today = date.today()
        existing = WeightLog.objects.filter(user=request.user, logged_at=today).first()
        if existing:
            existing.weight = request.data.get('weight', existing.weight)
            existing.save()
            serializer = self.get_serializer(existing)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WaterLogViewSet(viewsets.ModelViewSet):
    serializer_class = WaterLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WaterLog.objects.filter(user=self.request.user).order_by('date')

    def create(self, request, *args, **kwargs):
        today = date.today()
        existing = WaterLog.objects.filter(user=request.user, date=today).first()
        if existing:
            action_type = request.data.get('action', 'add')
            amount = int(request.data.get('amount', 0))
            if action_type == 'add':
                existing.amount += amount
            else:
                existing.amount = amount
            existing.save()
            serializer = self.get_serializer(existing)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DailyMealCompletionViewSet(viewsets.ModelViewSet):
    serializer_class = DailyMealCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DailyMealCompletion.objects.filter(user=self.request.user).order_by('-date')

    def create(self, request, *args, **kwargs):
        today = date.today()
        meal_type = request.data.get('meal_type')
        existing = DailyMealCompletion.objects.filter(
            user=request.user,
            date=today,
            meal_type=meal_type
        ).first()

        if existing:
            existing.completed = request.data.get('completed', existing.completed)
            existing.calories = float(request.data.get('calories', existing.calories or 0.0))
            existing.protein = float(request.data.get('protein', existing.protein or 0.0))
            existing.carbs = float(request.data.get('carbs', existing.carbs or 0.0))
            existing.fats = float(request.data.get('fats', existing.fats or 0.0))
            existing.fiber = float(request.data.get('fiber', existing.fiber or 0.0))
            existing.sugar = float(request.data.get('sugar', existing.sugar or 0.0))
            existing.save()
            serializer = self.get_serializer(existing)
            return Response(serializer.data)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user).order_by('-logged_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WellnessLogViewSet(viewsets.ModelViewSet):
    serializer_class = WellnessLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WellnessLog.objects.filter(user=self.request.user).order_by('-logged_at')

    def create(self, request, *args, **kwargs):
        today = date.today()
        existing = WellnessLog.objects.filter(user=request.user, logged_at=today).first()
        if existing:
            existing.sleep_hours = float(request.data.get('sleep_hours', existing.sleep_hours))
            existing.mood = request.data.get('mood', existing.mood)
            existing.energy_level = int(request.data.get('energy_level', existing.energy_level))
            existing.stress_level = int(request.data.get('stress_level', existing.stress_level))
            existing.save()
            serializer = self.get_serializer(existing)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TodaySummaryView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        today = date.today()
        user = request.user
        
        # Calories / Macros consumed today
        completions = DailyMealCompletion.objects.filter(user=user, date=today, completed=True)
        totals = completions.aggregate(
            total_calories=Sum('calories'),
            total_protein=Sum('protein'),
            total_carbs=Sum('carbs'),
            total_fats=Sum('fats'),
            total_fiber=Sum('fiber'),
            total_sugar=Sum('sugar'),
        )
        
        # Water logged today
        water = WaterLog.objects.filter(user=user, date=today).first()
        water_amount = water.amount if water else 0
        
        # Today's weight
        weight_log = WeightLog.objects.filter(user=user, logged_at=today).first()
        weight = weight_log.weight if weight_log else (user.profile.weight if hasattr(user, 'profile') else None)

        # Today's activities
        activities = ActivityLog.objects.filter(user=user, logged_at=today)
        activity_totals = activities.aggregate(
            total_calories_burned=Sum('calories_burned'),
            total_steps=Sum('steps')
        )
        calories_burned = round(activity_totals.get('total_calories_burned') or 0.0, 1)
        steps = activity_totals.get('total_steps') or 0

        # Today's wellness logs
        wellness = WellnessLog.objects.filter(user=user, logged_at=today).first()
        wellness_data = {
            'sleep_hours': wellness.sleep_hours if wellness else 0.0,
            'mood': wellness.mood if wellness else 'neutral',
            'energy_level': wellness.energy_level if wellness else 5,
            'stress_level': wellness.stress_level if wellness else 5
        }

        # Profile targets
        profile = getattr(user, 'profile', None)
        target_calories = profile.daily_calorie_requirement if profile else 2000
        streak = profile.streak if profile else 0
        points = profile.points if profile else 0
        
        # Calculate daily score (0 to 100)
        target_water = 3000
        target_steps = 10000
        target_sleep = 8.0

        calorie_score = 0
        calories_consumed = totals.get('total_calories') or 0.0
        if target_calories > 0:
            diff = abs(calories_consumed - target_calories)
            if diff <= 150:
                calorie_score = 30
            else:
                calorie_score = max(0, 30 - int((diff - 150) / 25))

        water_score = min(25.0, ((water_amount / target_water) * 25) if target_water else 0)
        steps_score = min(25.0, ((steps / target_steps) * 25) if target_steps else 0)
        sleep_score = min(20.0, ((wellness_data['sleep_hours'] / target_sleep) * 20) if target_sleep else 0)

        daily_score = round(calorie_score + water_score + steps_score + sleep_score)
        daily_score = min(100, max(0, daily_score))

        return Response({
            'date': today,
            'consumed': {
                'calories': round(calories_consumed, 2),
                'protein': round(totals.get('total_protein') or 0.0, 2),
                'carbs': round(totals.get('total_carbs') or 0.0, 2),
                'fats': round(totals.get('total_fats') or 0.0, 2),
                'fiber': round(totals.get('total_fiber') or 0.0, 2),
                'sugar': round(totals.get('total_sugar') or 0.0, 2),
            },
            'target': {
                'calories': target_calories,
                'water': target_water,
                'steps': target_steps,
                'sleep': target_sleep,
            },
            'water_ml': water_amount,
            'weight_kg': weight,
            'activities': {
                'calories_burned': calories_burned,
                'steps': steps,
                'logs': ActivityLogSerializer(activities, many=True).data
            },
            'wellness': wellness_data,
            'streak': streak,
            'points': points,
            'daily_score': daily_score,
            'meals_logged': DailyMealCompletionSerializer(
                DailyMealCompletion.objects.filter(user=user, date=today), many=True
            ).data
        })


# ─────────────────────────────────────────────────────────────
# Weight Notes & Body Measurements
# ─────────────────────────────────────────────────────────────

class WeightNoteViewSet(viewsets.ModelViewSet):
    serializer_class = WeightNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WeightNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BodyMeasurementViewSet(viewsets.ModelViewSet):
    serializer_class = BodyMeasurementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BodyMeasurement.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        date_val = request.data.get('date', str(date.today()))
        existing = BodyMeasurement.objects.filter(user=request.user, date=date_val).first()
        if existing:
            for field in ['waist_cm', 'chest_cm', 'hips_cm', 'arms_cm', 'thighs_cm']:
                val = request.data.get(field)
                if val is not None:
                    setattr(existing, field, float(val))
            existing.save()
            return Response(self.get_serializer(existing).data)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ─────────────────────────────────────────────────────────────
# Weight Statistics + Trend + Prediction
# ─────────────────────────────────────────────────────────────

class WeightStatsView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        logs = list(WeightLog.objects.filter(user=user).order_by('logged_at'))

        if not logs:
            return Response({
                'has_data': False,
                'logs': [],
                'stats': {},
                'milestones': [],
                'badges': [],
                'prediction': {},
                'notes': [],
                'measurements': [],
            })

        weights = [l.weight for l in logs]
        dates_str = [str(l.logged_at) for l in logs]

        current_weight = weights[-1]
        starting_weight = weights[0]
        goal_weight = profile.goal_weight if profile else None
        height_m = (profile.height / 100.0) if (profile and profile.height) else None
        bmi = round(current_weight / (height_m ** 2), 1) if height_m else None

        weight_change = round(current_weight - starting_weight, 2)

        # Average weekly change (last 4 weeks)
        avg_weekly = None
        if len(logs) >= 2:
            recent = [l for l in logs if l.logged_at >= (date.today() - timedelta(days=28))]
            if len(recent) >= 2:
                span_days = (recent[-1].logged_at - recent[0].logged_at).days or 1
                change = recent[-1].weight - recent[0].weight
                avg_weekly = round((change / span_days) * 7, 2)

        # Progress percentage (towards goal)
        progress_pct = None
        if goal_weight and starting_weight != goal_weight:
            total_needed = starting_weight - goal_weight
            achieved = starting_weight - current_weight
            progress_pct = round(max(0, min(100, (achieved / total_needed) * 100)), 1)

        # ── Milestone Timeline ──
        milestones = [{'label': '🏁 Started Diet', 'date': dates_str[0], 'achieved': True}]
        total_lost = starting_weight - current_weight  # negative = gained

        for kg in [2, 5, 10, 15, 20]:
            if total_lost >= kg:
                # find date when it was first crossed
                for l in logs:
                    if (starting_weight - l.weight) >= kg:
                        milestones.append({
                            'label': f'⚖️ Lost {kg} kg',
                            'date': str(l.logged_at),
                            'achieved': True
                        })
                        break
            else:
                milestones.append({
                    'label': f'⚖️ Lose {kg} kg',
                    'date': None,
                    'achieved': False
                })

        if bmi and bmi < 25:
            milestones.append({'label': '💚 Reached Healthy BMI', 'date': dates_str[-1], 'achieved': True})
        else:
            milestones.append({'label': '💚 Reach Healthy BMI', 'date': None, 'achieved': False})

        if goal_weight and current_weight <= goal_weight:
            milestones.append({'label': '🏆 Goal Weight Reached!', 'date': dates_str[-1], 'achieved': True})
        elif goal_weight:
            milestones.append({'label': f'🏆 Reach Goal ({goal_weight} kg)', 'date': None, 'achieved': False})

        # ── Badge System ──
        badges = []
        badges.append({'id': 'first_entry', 'name': '🏅 First Weight Entry', 'desc': 'Logged your very first weight', 'earned': True})
        if total_lost >= 2:
            badges.append({'id': 'lost_2', 'name': '🥈 Lost 2 kg', 'desc': 'Lost your first 2 kilograms', 'earned': True})
        if total_lost >= 5:
            badges.append({'id': 'lost_5', 'name': '🥇 Lost 5 kg', 'desc': 'Lost 5 kilograms total', 'earned': True})
        if total_lost >= 10:
            badges.append({'id': 'lost_10', 'name': '💎 Lost 10 kg', 'desc': 'Lost an incredible 10 kilograms!', 'earned': True})
        if goal_weight and current_weight <= goal_weight:
            badges.append({'id': 'goal', 'name': '🏆 Goal Achieved', 'desc': 'Reached your target weight!', 'earned': True})
        if len(logs) >= 7:
            badges.append({'id': 'consistent', 'name': '📅 Weekly Tracker', 'desc': 'Logged weight for 7+ days', 'earned': True})
        if len(logs) >= 30:
            badges.append({'id': 'streak_30', 'name': '🔥 30-Day Streak', 'desc': '30+ weight entries logged', 'earned': True})
        if bmi and bmi < 25:
            badges.append({'id': 'healthy_bmi', 'name': '💚 Healthy BMI', 'desc': 'BMI is within the healthy range', 'earned': True})

        # ── Linear Regression Prediction ──
        prediction = {}
        if len(logs) >= 3:
            n = len(logs)
            x = list(range(n))
            y = weights
            x_mean = sum(x) / n
            y_mean = sum(y) / n
            num = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
            den = sum((x[i] - x_mean) ** 2 for i in range(n))
            slope = num / den if den != 0 else 0  # kg per log entry

            # Average gap between entries in days
            if n >= 2:
                total_days = (logs[-1].logged_at - logs[0].logged_at).days
                avg_days_per_entry = total_days / (n - 1) if n > 1 else 1
            else:
                avg_days_per_entry = 1

            entries_per_month = 30 / avg_days_per_entry if avg_days_per_entry else 30
            pred_1m = round(current_weight + slope * entries_per_month, 1)
            pred_3m = round(current_weight + slope * entries_per_month * 3, 1)

            prediction = {
                'slope_per_entry': round(slope, 3),
                'kg_per_week': round(slope * (7 / avg_days_per_entry) if avg_days_per_entry else 0, 2),
                'in_1_month': pred_1m,
                'in_3_months': pred_3m,
                'trend': 'losing' if slope < -0.01 else ('gaining' if slope > 0.01 else 'stable'),
            }

        # ── Table with change column ──
        table = []
        for i, log in enumerate(reversed(logs)):
            prev_log = logs[-(i + 2)] if i + 2 <= len(logs) else None
            change = round(log.weight - prev_log.weight, 2) if prev_log else None
            table.append({
                'id': log.id,
                'date': str(log.logged_at),
                'weight': log.weight,
                'change': change,
            })

        # ── Notes ──
        notes = WeightNoteSerializer(WeightNote.objects.filter(user=user), many=True).data

        # ── Measurements ──
        measurements = BodyMeasurementSerializer(BodyMeasurement.objects.filter(user=user), many=True).data

        return Response({
            'has_data': True,
            'logs': [{'date': str(l.logged_at), 'weight': l.weight} for l in logs],
            'table': table,
            'stats': {
                'current_weight': current_weight,
                'starting_weight': starting_weight,
                'goal_weight': goal_weight,
                'weight_change': weight_change,
                'bmi': bmi,
                'avg_weekly_change': avg_weekly,
                'progress_pct': progress_pct,
                'total_entries': len(logs),
            },
            'milestones': milestones,
            'badges': badges,
            'prediction': prediction,
            'notes': notes,
            'measurements': measurements,
        })


# ─────────────────────────────────────────────────────────────
# Admin Weight Insights Dashboard
# ─────────────────────────────────────────────────────────────

class AdminWeightInsightsView(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        insights = []
        cutoff = date.today() - timedelta(days=30)
        for user in User.objects.all():
            logs = list(WeightLog.objects.filter(user=user, logged_at__gte=cutoff).order_by('logged_at'))
            if len(logs) >= 2:
                change = round(logs[-1].weight - logs[0].weight, 2)
                insights.append({
                    'username': user.username,
                    'entries_30d': len(logs),
                    'current_weight': logs[-1].weight,
                    'change_30d': change,
                    'trend': 'losing' if change < -0.5 else ('gaining' if change > 0.5 else 'stable'),
                })

        insights.sort(key=lambda x: x['entries_30d'], reverse=True)

        total_users_tracked = len(insights)
        losing = [i for i in insights if i['trend'] == 'losing']
        gaining = [i for i in insights if i['trend'] == 'gaining']
        avg_change = round(sum(i['change_30d'] for i in insights) / len(insights), 2) if insights else 0

        return Response({
            'total_users_tracked': total_users_tracked,
            'users_losing': len(losing),
            'users_gaining': len(gaining),
            'users_stable': total_users_tracked - len(losing) - len(gaining),
            'avg_weight_change_30d': avg_change,
            'most_active_users': insights[:10],
        })

