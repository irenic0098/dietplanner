from rest_framework import serializers
from .models import YogaVideo, YogaLog, UserYogaStats

class YogaVideoSerializer(serializers.ModelSerializer):
    is_bookmarked = serializers.SerializerMethodField()
    is_completed_today = serializers.SerializerMethodField()

    class Meta:
        model = YogaVideo
        fields = '__all__'

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(id=request.user.id).exists()
        return False

    def get_is_completed_today(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from datetime import date
            return YogaLog.objects.filter(user=request.user, video=obj, completed_at=date.today()).exists()
        return False

class YogaLogSerializer(serializers.ModelSerializer):
    video_details = YogaVideoSerializer(source='video', read_only=True)

    class Meta:
        model = YogaLog
        fields = ['id', 'video', 'video_details', 'completed_at']

class UserYogaStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserYogaStats
        fields = '__all__'
