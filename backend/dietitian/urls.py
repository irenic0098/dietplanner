from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DietitianListView,
    LinkDietitianView,
    ClientRelationViewSet,
    DietitianMessageViewSet,
    AppointmentViewSet
)

router = DefaultRouter()
router.register('relations', ClientRelationViewSet, basename='relation')
router.register('messages', DietitianMessageViewSet, basename='message')
router.register('appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('list/', DietitianListView.as_view(), name='dietitian_list'),
    path('link/', LinkDietitianView.as_view(), name='dietitian_link'),
]
