from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
import random
from datetime import datetime, timedelta
import csv
import io
from .models import (
    Dashboard, Widget, DataIngestion, IngestionEvent,
    MetricSnapshot, Alert, ExportJob, UserRole, AuditLog
)
from .serializers import (
    DashboardSerializer, DashboardListSerializer, WidgetSerializer,
    DataIngestionSerializer, IngestionEventSerializer, MetricSnapshotSerializer,
    AlertSerializer, ExportJobSerializer, UserRoleSerializer, AuditLogSerializer,
    DataIngestionRequestSerializer
)
from .permissions import (
    IsAdminRole, IsEditorOrAdmin, IsOwnerOrAdmin, 
    HasAPIKey, CanExportData
)

# Create your views here.

# ============== Original Mock API Endpoints ==============

@api_view(['GET'])
def test_api(request):
    """Test endpoint to verify API is working"""
    return Response({
        'message': 'API is working!',
        'status': 'success',
        'timestamp': datetime.now().isoformat()
    })

@api_view(['GET'])
def revenue_data(request):
    """Get revenue data for the dashboard"""
    # Generate sample revenue data for the last 12 months
    data = [
        {'name': 'Jan', 'value': 45000},
        {'name': 'Feb', 'value': 52000},
        {'name': 'Mar', 'value': 48000},
        {'name': 'Apr', 'value': 61000},
        {'name': 'May', 'value': 58000},
        {'name': 'Jun', 'value': 67000},
        {'name': 'Jul', 'value': 72000},
        {'name': 'Aug', 'value': 69000},
        {'name': 'Sep', 'value': 78000},
        {'name': 'Oct', 'value': 82000},
        {'name': 'Nov', 'value': 85000},
        {'name': 'Dec', 'value': 91000}
    ]
    
    return Response(data)

@api_view(['GET'])
def channel_performance(request):
    """Get channel performance data"""
    channels = [
        {'name': 'Google Ads', 'value': 35000, 'comparison': 31000},
        {'name': 'Facebook', 'value': 28000, 'comparison': 25000},
        {'name': 'Instagram', 'value': 22000, 'comparison': 19000},
        {'name': 'LinkedIn', 'value': 18000, 'comparison': 16000},
        {'name': 'Twitter', 'value': 12000, 'comparison': 14000},
        {'name': 'YouTube', 'value': 15000, 'comparison': 12000}
    ]
    
    return Response(channels)

@api_view(['GET'])
def audience_segments(request):
    """Get audience segments data"""
    segments = [
        {'name': 'Millennials', 'value': 32500, 'color': 'hsl(var(--chart-1))'},
        {'name': 'Gen Z', 'value': 28000, 'color': 'hsl(var(--chart-2))'},
        {'name': 'Gen X', 'value': 19500, 'color': 'hsl(var(--chart-3))'},
        {'name': 'Baby Boomers', 'value': 12000, 'color': 'hsl(var(--chart-4))'},
        {'name': 'Gen Alpha', 'value': 8000, 'color': 'hsl(var(--chart-5))'}
    ]
    
    return Response(segments)

@api_view(['GET'])
def metrics_data(request):
    """Get metrics data for the dashboard"""
    metrics = {
        'totalRevenue': {
            'value': '$812.2K',
            'change': 12.5,
            'changeType': 'increase'
        },
        'totalUsers': {
            'value': '164.3K',
            'change': 8.2,
            'changeType': 'increase'
        },
        'conversions': {
            'value': '12.4K',
            'change': 15.8,
            'changeType': 'increase'
        },
        'growthRate': {
            'value': '24.7%',
            'change': 3.2,
            'changeType': 'increase'
        }
    }
    
    return Response(metrics)


# ============== Custom Dashboard Management ==============

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class DashboardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing custom dashboards
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DashboardListSerializer
        return DashboardSerializer
    
    def get_queryset(self):
        user = self.request.user
        try:
            user_role = UserRole.objects.get(user=user)
            if user_role.role == 'admin':
                return Dashboard.objects.all()
        except UserRole.DoesNotExist:
            pass
        
        # Non-admins only see their own dashboards
        return Dashboard.objects.filter(owner=user)
    
    def perform_create(self, serializer):
        dashboard = serializer.save(owner=self.request.user)
        self._log_action('create', dashboard)
    
    def perform_update(self, serializer):
        dashboard = serializer.save()
        self._log_action('update', dashboard)
    
    def perform_destroy(self, instance):
        self._log_action('delete', instance)
        instance.delete()
    
    def _log_action(self, action_type, dashboard):
        AuditLog.objects.create(
            user=self.request.user,
            action_type=action_type,
            resource_type='Dashboard',
            resource_id=dashboard.id,
            details={'dashboard_name': dashboard.name},
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
    
    def _get_client_ip(self):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return self.request.META.get('REMOTE_ADDR')
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a dashboard with all its widgets"""
        dashboard = self.get_object()
        new_dashboard = Dashboard.objects.create(
            name=f"{dashboard.name} (Copy)",
            description=dashboard.description,
            owner=request.user,
            is_default=False,
            layout_config=dashboard.layout_config
        )
        
        # Duplicate widgets
        for widget in dashboard.widgets.all():
            Widget.objects.create(
                dashboard=new_dashboard,
                widget_type=widget.widget_type,
                title=widget.title,
                data_source=widget.data_source,
                position_x=widget.position_x,
                position_y=widget.position_y,
                width=widget.width,
                height=widget.height,
                config=widget.config,
                refresh_interval=widget.refresh_interval
            )
        
        serializer = self.get_serializer(new_dashboard)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get the default dashboard for the user"""
        dashboard = Dashboard.objects.filter(
            owner=request.user, 
            is_default=True
        ).first()
        
        if not dashboard:
            dashboard = Dashboard.objects.filter(owner=request.user).first()
        
        if dashboard:
            serializer = self.get_serializer(dashboard)
            return Response(serializer.data)
        return Response({'message': 'No dashboards found'}, status=status.HTTP_404_NOT_FOUND)


class WidgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing dashboard widgets
    """
    serializer_class = WidgetSerializer
    permission_classes = [IsAuthenticated, IsEditorOrAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Widget.objects.all()
        dashboard_id = self.request.query_params.get('dashboard', None)
        if dashboard_id:
            queryset = queryset.filter(dashboard_id=dashboard_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=False, methods=['post'])
    def bulk_update_positions(self, request):
        """Bulk update widget positions for drag-and-drop"""
        positions = request.data.get('positions', [])
        updated_count = 0
        
        for position in positions:
            widget_id = position.get('id')
            if widget_id:
                Widget.objects.filter(id=widget_id).update(
                    position_x=position.get('x', 0),
                    position_y=position.get('y', 0),
                    width=position.get('width'),
                    height=position.get('height')
                )
                updated_count += 1
        
        return Response({
            'message': f'Updated {updated_count} widget positions',
            'updated_count': updated_count
        })


# ============== Data Ingestion API ==============

@api_view(['POST'])
@permission_classes([HasAPIKey])
def ingest_data(request):
    """
    External API endpoint for data ingestion
    Requires X-API-Key header
    """
    serializer = DataIngestionRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'error': 'Invalid data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data_source = request.data_source
    
    # Rate limiting check
    hour_ago = timezone.now() - timedelta(hours=1)
    recent_requests = IngestionEvent.objects.filter(
        data_source=data_source,
        timestamp__gte=hour_ago
    ).count()
    
    if recent_requests >= data_source.rate_limit:
        return Response({
            'error': 'Rate limit exceeded',
            'limit': data_source.rate_limit,
            'period': '1 hour'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # Create ingestion event
    event = IngestionEvent.objects.create(
        data_source=data_source,
        event_type=serializer.validated_data['event_type'],
        payload=serializer.validated_data['payload'],
        metadata=serializer.validated_data.get('metadata', {})
    )
    
    # Update data source stats
    data_source.last_ingestion = timezone.now()
    data_source.total_requests += 1
    data_source.save()
    
    # Process metrics if payload contains them
    if 'metrics' in serializer.validated_data['payload']:
        metrics = serializer.validated_data['payload']['metrics']
        for metric_name, metric_value in metrics.items():
            MetricSnapshot.objects.create(
                metric_name=metric_name,
                value=metric_value,
                tags=serializer.validated_data.get('metadata', {})
            )
    
    return Response({
        'message': 'Data ingested successfully',
        'event_id': event.id,
        'timestamp': event.timestamp.isoformat()
    }, status=status.HTTP_201_CREATED)


class DataIngestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing data ingestion sources
    """
    serializer_class = DataIngestionSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        try:
            user_role = UserRole.objects.get(user=user)
            if user_role.role == 'admin':
                return DataIngestion.objects.all()
        except UserRole.DoesNotExist:
            pass
        return DataIngestion.objects.filter(owner=user)
    
    def perform_create(self, serializer):
        import secrets
        # Generate API key
        api_key = f"ds_{secrets.token_urlsafe(32)}"
        serializer.save(owner=self.request.user, api_key=api_key)
    
    @action(detail=True, methods=['post'])
    def regenerate_key(self, request, pk=None):
        """Regenerate API key for a data source"""
        import secrets
        data_source = self.get_object()
        data_source.api_key = f"ds_{secrets.token_urlsafe(32)}"
        data_source.save()
        
        serializer = self.get_serializer(data_source)
        return Response(serializer.data)


class IngestionEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing ingestion events
    """
    serializer_class = IngestionEventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['event_type']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        queryset = IngestionEvent.objects.all()
        data_source_id = self.request.query_params.get('data_source', None)
        if data_source_id:
            queryset = queryset.filter(data_source_id=data_source_id)
        return queryset


# ============== Real-time Metrics ==============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def realtime_metrics(request):
    """
    Get real-time metrics for live dashboard updates
    """
    metric_names = request.query_params.getlist('metrics')
    time_range = request.query_params.get('range', '1h')
    
    # Parse time range
    time_map = {
        '1h': timedelta(hours=1),
        '6h': timedelta(hours=6),
        '24h': timedelta(hours=24),
        '7d': timedelta(days=7),
    }
    delta = time_map.get(time_range, timedelta(hours=1))
    start_time = timezone.now() - delta
    
    # Get metrics
    queryset = MetricSnapshot.objects.filter(timestamp__gte=start_time)
    if metric_names:
        queryset = queryset.filter(metric_name__in=metric_names)
    
    # Group by metric name
    metrics = {}
    for snapshot in queryset:
        if snapshot.metric_name not in metrics:
            metrics[snapshot.metric_name] = []
        metrics[snapshot.metric_name].append({
            'value': float(snapshot.value),
            'timestamp': snapshot.timestamp.isoformat(),
            'tags': snapshot.tags
        })
    
    return Response(metrics)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsEditorOrAdmin])
def post_metric(request):
    """
    Post a metric snapshot (for internal use)
    """
    serializer = MetricSnapshotSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============== Export Functionality ==============

class ExportJobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing export jobs
    """
    serializer_class = ExportJobSerializer
    permission_classes = [IsAuthenticated, CanExportData]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        try:
            user_role = UserRole.objects.get(user=user)
            if user_role.role == 'admin':
                return ExportJob.objects.all()
        except UserRole.DoesNotExist:
            pass
        return ExportJob.objects.filter(requested_by=user)
    
    def perform_create(self, serializer):
        export_job = serializer.save(requested_by=self.request.user)
        # Trigger export processing (in production, use Celery)
        self._process_export(export_job)
    
    def _process_export(self, export_job):
        """Process export job (simplified version)"""
        try:
            export_job.status = 'processing'
            export_job.save()
            
            # Generate export based on format
            if export_job.format == 'csv':
                file_path = self._generate_csv_export(export_job)
            elif export_job.format == 'json':
                file_path = self._generate_json_export(export_job)
            else:
                raise ValueError(f"Unsupported format: {export_job.format}")
            
            export_job.status = 'completed'
            export_job.file_path = file_path
            export_job.completed_at = timezone.now()
            export_job.save()
        except Exception as e:
            export_job.status = 'failed'
            export_job.error_message = str(e)
            export_job.save()
    
    def _generate_csv_export(self, export_job):
        """Generate CSV export"""
        # This is a simplified version - expand based on your needs
        import os
        from django.conf import settings
        
        export_dir = os.path.join(settings.BASE_DIR, 'exports')
        os.makedirs(export_dir, exist_ok=True)
        
        filename = f"export_{export_job.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(export_dir, filename)
        
        # Get data based on dashboard
        if export_job.dashboard:
            data = self._get_dashboard_data(export_job.dashboard)
        else:
            data = self._get_metrics_data(export_job.filters)
        
        # Write CSV
        with open(filepath, 'w', newline='') as csvfile:
            if data:
                writer = csv.DictWriter(csvfile, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
        
        return filepath
    
    def _generate_json_export(self, export_job):
        """Generate JSON export"""
        import json
        import os
        from django.conf import settings
        
        export_dir = os.path.join(settings.BASE_DIR, 'exports')
        os.makedirs(export_dir, exist_ok=True)
        
        filename = f"export_{export_job.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(export_dir, filename)
        
        if export_job.dashboard:
            data = self._get_dashboard_data(export_job.dashboard)
        else:
            data = self._get_metrics_data(export_job.filters)
        
        with open(filepath, 'w') as jsonfile:
            json.dump(data, jsonfile, indent=2, default=str)
        
        return filepath
    
    def _get_dashboard_data(self, dashboard):
        """Get data for dashboard export"""
        # Simplified - customize based on your data structure
        return [{
            'dashboard_name': dashboard.name,
            'description': dashboard.description,
            'widgets_count': dashboard.widgets.count(),
            'created_at': dashboard.created_at.isoformat()
        }]
    
    def _get_metrics_data(self, filters):
        """Get metrics data for export"""
        queryset = MetricSnapshot.objects.all()
        if 'metric_names' in filters:
            queryset = queryset.filter(metric_name__in=filters['metric_names'])
        if 'start_date' in filters:
            queryset = queryset.filter(timestamp__gte=filters['start_date'])
        
        return list(queryset.values('metric_name', 'value', 'unit', 'timestamp'))


# ============== Alerts & Monitoring ==============

class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing alerts
    """
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        try:
            user_role = UserRole.objects.get(user=user)
            if user_role.role == 'admin':
                return Alert.objects.all()
        except UserRole.DoesNotExist:
            pass
        return Alert.objects.filter(owner=user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def triggered(self, request):
        """Get all triggered alerts"""
        alerts = self.get_queryset().filter(status='triggered')
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)


# ============== User Roles & Permissions ==============

class UserRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user roles (admin only)
    """
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = UserRole.objects.all()
    pagination_class = StandardResultsSetPagination


# ============== Audit Logs ==============

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing audit logs (admin only)
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = AuditLog.objects.all()
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'resource_type', 'action_type']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
