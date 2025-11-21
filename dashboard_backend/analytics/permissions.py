from rest_framework import permissions
from .models import UserRole


class IsAdminRole(permissions.BasePermission):
    """
    Permission check for admin role
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            user_role = UserRole.objects.get(user=request.user)
            return user_role.role == 'admin'
        except UserRole.DoesNotExist:
            return False


class IsEditorOrAdmin(permissions.BasePermission):
    """
    Permission check for editor or admin role
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow read-only for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        try:
            user_role = UserRole.objects.get(user=request.user)
            return user_role.role in ['editor', 'admin']
        except UserRole.DoesNotExist:
            return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners or admins to edit/delete
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is admin
        try:
            user_role = UserRole.objects.get(user=request.user)
            if user_role.role == 'admin':
                return True
        except UserRole.DoesNotExist:
            pass
        
        # Check if user is owner
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'requested_by'):
            return obj.requested_by == request.user
        
        return False


class HasAPIKey(permissions.BasePermission):
    """
    Permission check for API key authentication
    """
    def has_permission(self, request, view):
        from .models import DataIngestion
        
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return False
        
        try:
            data_source = DataIngestion.objects.get(api_key=api_key, is_active=True)
            # Attach data_source to request for use in view
            request.data_source = data_source
            return True
        except DataIngestion.DoesNotExist:
            return False


class CanExportData(permissions.BasePermission):
    """
    Permission check for data export capability
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            user_role = UserRole.objects.get(user=request.user)
            # Admins and editors can export
            if user_role.role in ['admin', 'editor']:
                return True
            # Check specific permission for viewers
            return user_role.has_permission('can_export')
        except UserRole.DoesNotExist:
            return False
