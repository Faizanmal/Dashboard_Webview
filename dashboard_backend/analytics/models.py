from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import json

# Create your models here.

class Dashboard(models.Model):
    """Custom dashboard configuration"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboards')
    is_default = models.BooleanField(default=False)
    layout_config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.owner.username}"


class Widget(models.Model):
    """Widget configuration for dashboards"""
    WIDGET_TYPES = [
        ('chart', 'Chart'),
        ('metric', 'Metric Card'),
        ('table', 'Data Table'),
        ('gauge', 'Gauge'),
        ('map', 'Geographic Map'),
    ]
    
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE, related_name='widgets')
    widget_type = models.CharField(max_length=50, choices=WIDGET_TYPES)
    title = models.CharField(max_length=255)
    data_source = models.CharField(max_length=255)  # API endpoint or query identifier
    position_x = models.IntegerField(default=0)
    position_y = models.IntegerField(default=0)
    width = models.IntegerField(default=4)
    height = models.IntegerField(default=3)
    config = models.JSONField(default=dict, blank=True)  # Chart type, colors, etc.
    refresh_interval = models.IntegerField(default=60, help_text="Refresh interval in seconds")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['position_y', 'position_x']
        
    def __str__(self):
        return f"{self.title} ({self.widget_type})"


class DataIngestion(models.Model):
    """Track ingested data from external sources"""
    source_name = models.CharField(max_length=255)
    api_key = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data_sources')
    is_active = models.BooleanField(default=True)
    rate_limit = models.IntegerField(default=100, help_text="Requests per hour")
    last_ingestion = models.DateTimeField(null=True, blank=True)
    total_requests = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.source_name} - {self.owner.username}"


class IngestionEvent(models.Model):
    """Individual data ingestion events"""
    data_source = models.ForeignKey(DataIngestion, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['event_type']),
            models.Index(fields=['processed']),
        ]
        
    def __str__(self):
        return f"{self.event_type} - {self.timestamp}"


class MetricSnapshot(models.Model):
    """Store metric values over time for real-time updates"""
    metric_name = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=20, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True)
    tags = models.JSONField(default=dict, blank=True)  # For filtering/grouping
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['metric_name', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]
        
    def __str__(self):
        return f"{self.metric_name}: {self.value} at {self.timestamp}"


class Alert(models.Model):
    """Alert configuration for threshold monitoring"""
    COMPARISON_TYPES = [
        ('gt', 'Greater Than'),
        ('lt', 'Less Than'),
        ('eq', 'Equal To'),
        ('gte', 'Greater Than or Equal'),
        ('lte', 'Less Than or Equal'),
    ]
    
    ALERT_STATUS = [
        ('active', 'Active'),
        ('triggered', 'Triggered'),
        ('resolved', 'Resolved'),
        ('disabled', 'Disabled'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    metric_name = models.CharField(max_length=255)
    comparison_type = models.CharField(max_length=10, choices=COMPARISON_TYPES)
    threshold_value = models.DecimalField(max_digits=20, decimal_places=2)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    status = models.CharField(max_length=20, choices=ALERT_STATUS, default='active')
    notification_email = models.EmailField(blank=True)
    webhook_url = models.URLField(blank=True)
    last_triggered = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} ({self.metric_name} {self.comparison_type} {self.threshold_value})"


class ExportJob(models.Model):
    """Track export jobs"""
    EXPORT_FORMATS = [
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
        ('json', 'JSON'),
    ]
    
    EXPORT_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    name = models.CharField(max_length=255)
    format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE, related_name='exports', null=True, blank=True)
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exports')
    status = models.CharField(max_length=20, choices=EXPORT_STATUS, default='pending')
    file_path = models.CharField(max_length=500, blank=True)
    error_message = models.TextField(blank=True)
    filters = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.format} ({self.status})"


class UserRole(models.Model):
    """Extended user roles for RBAC"""
    ROLE_CHOICES = [
        ('viewer', 'Viewer'),
        ('editor', 'Editor'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dashboard_role')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    permissions = models.JSONField(default=dict, blank=True)  # Granular permissions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user__username']
        
    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
    def has_permission(self, permission_name):
        """Check if user has specific permission"""
        if self.role == 'admin':
            return True
        return self.permissions.get(permission_name, False)


class AuditLog(models.Model):
    """Audit log for tracking user actions"""
    ACTION_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
        ('export', 'Export'),
        ('import', 'Import'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    resource_type = models.CharField(max_length=100)  # Dashboard, Widget, etc.
    resource_id = models.IntegerField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['resource_type', '-timestamp']),
        ]
        
    def __str__(self):
        username = self.user.username if self.user else 'Unknown'
        return f"{username} - {self.action_type} {self.resource_type} at {self.timestamp}"
