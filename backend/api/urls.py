from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'incidents', views.IncidentViewSet, basename='incident')
router.register(r'reports', views.ReportViewSet, basename='report')
router.register(r'equipement', views.EquipmentViewSet, basename='equipment')

urlpatterns = [
    path('health/', views.health_check, name='health'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/profile/', views.profile, name='profile'),
    path('incidents/stats/', views.IncidentViewSet.as_view({'get': 'stats'}), name='incident-stats'),
    path('incidents/recent/', views.IncidentViewSet.as_view({'get': 'recent'}), name='incident-recent'),
    path('incidents/hardware/<int:pk>/', views.IncidentViewSet.as_view({'put': 'update_hardware'}), name='incident-hardware-update'),
    path('incidents/software/<int:pk>/', views.IncidentViewSet.as_view({'put': 'update_software'}), name='incident-software-update'),
    path('equipement/<int:pk>/history/', views.EquipmentViewSet.as_view({'get': 'history'}), name='equipment-history'),
    path('', include(router.urls)),
]

