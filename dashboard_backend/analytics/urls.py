from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'dashboards', views.DashboardViewSet, basename='dashboard')
router.register(r'widgets', views.WidgetViewSet, basename='widget')
router.register(r'data-sources', views.DataIngestionViewSet, basename='datasource')
router.register(r'ingestion-events', views.IngestionEventViewSet, basename='ingestion-event')
router.register(r'export-jobs', views.ExportJobViewSet, basename='export-job')
router.register(r'alerts', views.AlertViewSet, basename='alert')
router.register(r'user-roles', views.UserRoleViewSet, basename='user-role')
router.register(r'audit-logs', views.AuditLogViewSet, basename='audit-log')

urlpatterns = [
    # Original mock endpoints
    path('test/', views.test_api, name='test_api'),
    path('analytics/revenue/', views.revenue_data, name='revenue_data'),
    path('analytics/channels/', views.channel_performance, name='channel_performance'),
    path('analytics/audience/', views.audience_segments, name='audience_segments'),
    path('analytics/metrics/', views.metrics_data, name='metrics_data'),
    
    # New feature endpoints
    path('ingest/', views.ingest_data, name='ingest_data'),
    path('metrics/realtime/', views.realtime_metrics, name='realtime_metrics'),
    path('metrics/post/', views.post_metric, name='post_metric'),
    
    # Router URLs (REST API)
    path('', include(router.urls)),
]   