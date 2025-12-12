# Django REST Framework imports
from rest_framework import permissions


class RoleBasedPermission(permissions.BasePermission):
    """Base permission class for role-based access control"""
    allowed_roles = []
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in self.allowed_roles


class CanAccessHardwareIncidents(RoleBasedPermission):
    """Allows service_maintenance and superadmin to access hardware incidents"""
    allowed_roles = ['service_maintenance', 'superadmin']


class CanAccessSoftwareIncidents(RoleBasedPermission):
    """Allows service_integration and superadmin to access software incidents"""
    allowed_roles = ['service_integration', 'superadmin']


class CanAccessEquipment(RoleBasedPermission):
    """Allows service_maintenance and superadmin to access equipment"""
    allowed_roles = ['service_maintenance', 'superadmin']


class CanAccessReports(RoleBasedPermission):
    """Allows service_integration and superadmin to access reports"""
    allowed_roles = ['service_integration', 'superadmin']


class CanAccessDashboards(RoleBasedPermission):
    """Allows chef_departement and superadmin to access dashboards"""
    allowed_roles = ['chef_departement', 'superadmin']


class IsReadOnlyOrSuperadmin(permissions.BasePermission):
    """Allows read-only access for chef_departement, full access for superadmin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superadmin has full access
        if request.user.role == 'superadmin':
            return True
        
        # Chef de département has read-only access
        if request.user.role == 'chef_departement':
            return request.method in permissions.SAFE_METHODS
        
        return False
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanModifyHardwareIncidents(permissions.BasePermission):
    """Allows modification of hardware incidents for service_maintenance and superadmin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read operations allowed for chef_departement
        if request.user.role == 'chef_departement' and request.method in permissions.SAFE_METHODS:
            return True
        
        # Full access for service_maintenance and superadmin
        return request.user.role in ['service_maintenance', 'superadmin']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanModifySoftwareIncidents(permissions.BasePermission):
    """Allows modification of software incidents for service_integration and superadmin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read operations allowed for chef_departement
        if request.user.role == 'chef_departement' and request.method in permissions.SAFE_METHODS:
            return True
        
        # Full access for service_integration and superadmin
        return request.user.role in ['service_integration', 'superadmin']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanModifyEquipment(permissions.BasePermission):
    """Allows modification of equipment for service_maintenance and superadmin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read operations allowed for chef_departement
        if request.user.role == 'chef_departement' and request.method in permissions.SAFE_METHODS:
            return True
        
        # Full access for service_maintenance and superadmin
        return request.user.role in ['service_maintenance', 'superadmin']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class CanModifyReports(permissions.BasePermission):
    """Allows modification of reports for service_integration and superadmin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read operations allowed for chef_departement
        if request.user.role == 'chef_departement' and request.method in permissions.SAFE_METHODS:
            return True
        
        # Full access for service_integration and superadmin
        return request.user.role in ['service_integration', 'superadmin']
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)
