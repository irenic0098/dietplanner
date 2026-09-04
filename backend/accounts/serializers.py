from django.db import models
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
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
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate_username(self, value):
        username = value.strip()
        if len(username) < 3:
            raise serializers.ValidationError('Username must be at least 3 characters.')
        return username

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='user',
        )
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


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.CharField(required=False, allow_blank=True)
    identity = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        query = attrs.get('email') or attrs.get('identity') or ''
        query = query.strip()
        if not query:
            raise serializers.ValidationError({'email': 'Please provide your registered email or username.'})

        user = CustomUser.objects.filter(
            models.Q(email__iexact=query) | models.Q(username__iexact=query)
        ).first()
        if not user:
            raise serializers.ValidationError({'email': 'No account found with that email or username.'})

        attrs['user'] = user
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Passwords do not match.'})

        try:
            user_id = force_str(urlsafe_base64_decode(attrs['uid']))
            user = CustomUser.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            raise serializers.ValidationError({'token': 'Invalid or expired reset link.'})

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Reset link is invalid or has expired.'})

        validate_password(attrs['new_password'], user=user)
        attrs['user'] = user
        return attrs

