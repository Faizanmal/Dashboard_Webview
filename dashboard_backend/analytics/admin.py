from django.contrib import admin
from .models import (
    Dashboard, Widget, DataIngestion, IngestionEvent,
    MetricSnapshot, Alert, ExportJob, UserRole, AuditLog
)

# Register your models here.

@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'is_default', 'created_at', 'updated_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['name', 'description', 'owner__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Widget)
class WidgetAdmin(admin.ModelAdmin):
    list_display = ['title', 'widget_type', 'dashboard', 'position_x', 'position_y', 'created_at']
    list_filter = ['widget_type', 'created_at']
    search_fields = ['title', 'data_source', 'dashboard__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(DataIngestion)
class DataIngestionAdmin(admin.ModelAdmin):
    list_display = ['source_name', 'owner', 'is_active', 'rate_limit', 'total_requests', 'last_ingestion']
    list_filter = ['is_active', 'created_at']
    search_fields = ['source_name', 'description', 'owner__username']
    readonly_fields = ['api_key', 'last_ingestion', 'total_requests', 'created_at', 'updated_at']


@admin.register(IngestionEvent)
class IngestionEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'data_source', 'timestamp', 'processed']
    list_filter = ['event_type', 'processed', 'timestamp']
    search_fields = ['event_type', 'data_source__source_name']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'


@admin.register(MetricSnapshot)
class MetricSnapshotAdmin(admin.ModelAdmin):
    list_display = ['metric_name', 'value', 'unit', 'timestamp']
    list_filter = ['metric_name', 'timestamp']
    search_fields = ['metric_name']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['name', 'metric_name', 'comparison_type', 'threshold_value', 'status', 'owner', 'last_triggered']
    list_filter = ['status', 'comparison_type', 'created_at']
    search_fields = ['name', 'metric_name', 'owner__username']
    readonly_fields = ['last_triggered', 'created_at', 'updated_at']


@admin.register(ExportJob)
class ExportJobAdmin(admin.ModelAdmin):
    list_display = ['name', 'format', 'status', 'requested_by', 'created_at', 'completed_at']
    list_filter = ['format', 'status', 'created_at']
    search_fields = ['name', 'requested_by__username']
    readonly_fields = ['created_at', 'completed_at']


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'created_at', 'updated_at']
    list_filter = ['role', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action_type', 'resource_type', 'resource_id', 'timestamp']
    list_filter = ['action_type', 'resource_type', 'timestamp']
    search_fields = ['user__username', 'resource_type']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
