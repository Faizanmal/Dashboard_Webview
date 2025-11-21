from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Dashboard, Widget, DataIngestion, IngestionEvent, 
    MetricSnapshot, Alert, ExportJob, UserRole, AuditLog
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserRoleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role', 'permissions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class WidgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Widget
        fields = [
            'id', 'dashboard', 'widget_type', 'title', 'data_source',
            'position_x', 'position_y', 'width', 'height', 'config',
            'refresh_interval', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DashboardSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    widgets = WidgetSerializer(many=True, read_only=True)
    widget_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Dashboard
        fields = [
            'id', 'name', 'description', 'owner', 'is_default',
            'layout_config', 'widgets', 'widget_count', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_widget_count(self, obj):
        return obj.widgets.count()


class DashboardListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    owner = UserSerializer(read_only=True)
    widget_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Dashboard
        fields = [
            'id', 'name', 'description', 'owner', 'is_default',
            'widget_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_widget_count(self, obj):
        return obj.widgets.count()


class DataIngestionSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    event_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DataIngestion
        fields = [
            'id', 'source_name', 'api_key', 'description', 'owner',
            'is_active', 'rate_limit', 'last_ingestion', 'total_requests',
            'event_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'last_ingestion', 'total_requests', 'created_at', 'updated_at']
        extra_kwargs = {
            'api_key': {'write_only': True}
        }
    
    def get_event_count(self, obj):
        return obj.events.count()


class IngestionEventSerializer(serializers.ModelSerializer):
    data_source_name = serializers.CharField(source='data_source.source_name', read_only=True)
    
    class Meta:
        model = IngestionEvent
        fields = [
            'id', 'data_source', 'data_source_name', 'event_type',
            'payload', 'metadata', 'timestamp', 'processed'
        ]
        read_only_fields = ['id', 'timestamp']


class MetricSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetricSnapshot
        fields = [
            'id', 'metric_name', 'value', 'unit', 'tags', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class AlertSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'name', 'description', 'metric_name', 'comparison_type',
            'threshold_value', 'owner', 'status', 'notification_email',
            'webhook_url', 'last_triggered', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'last_triggered', 'created_at', 'updated_at']


class ExportJobSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)
    dashboard_name = serializers.CharField(source='dashboard.name', read_only=True)
    
    class Meta:
        model = ExportJob
        fields = [
            'id', 'name', 'format', 'dashboard', 'dashboard_name',
            'requested_by', 'status', 'file_path', 'error_message',
            'filters', 'created_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'requested_by', 'status', 'file_path', 
            'error_message', 'created_at', 'completed_at'
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'username', 'action_type', 'resource_type',
            'resource_id', 'details', 'ip_address', 'user_agent', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class DataIngestionRequestSerializer(serializers.Serializer):
    """Serializer for external data ingestion requests"""
    event_type = serializers.CharField(max_length=100)
    payload = serializers.JSONField()
    metadata = serializers.JSONField(required=False, default=dict)
    timestamp = serializers.DateTimeField(required=False)
    
    def validate_event_type(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Event type cannot be empty")
        return value.strip()
    
    def validate_payload(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Payload must be a JSON object")
        return value
