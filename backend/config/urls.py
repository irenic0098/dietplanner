"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/nutrition/', include('nutrition.urls')),
    path('api/tracking/', include('tracking.urls')),
    path('api/ai/', include('ai_engine.urls')),
    path('api/recipes/', include('recipes.urls')),
    path('api/gamification/', include('gamification.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/dietitians/', include('dietitian.urls')),
    path('api/yoga/', include('yoga.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

