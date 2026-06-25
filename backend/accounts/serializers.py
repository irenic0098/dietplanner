from rest_framework import serializers
from .models import CustomUser, UserProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserProfileSerializer(serializers.ModelSerializer):
    bmi = serializers.ReadOnlyField()
    bmr = serializers.ReadOnlyField()
    daily_calorie_requirement = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'age', 'weight', 'goal_weight', 'height', 'gender', 'goal',
            'activity_level', 'diet_preference', 'streak', 'points', 'avatar',
            'bmi', 'bmr', 'daily_calorie_requirement'
        ]


class CustomUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.get('role', 'user')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role
        )
        # Create user profile
        UserProfile.objects.create(user=user)
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra response data
        data['username'] = self.user.username
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['id'] = self.user.id
        return data
