import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePermission?: keyof ReturnType<typeof usePermissions>;
  requireAny?: Array<keyof ReturnType<typeof usePermissions>>;
}

export function ProtectedRoute({ 
  children, 
  requirePermission,
  requireAny 
}: ProtectedRouteProps) {
  const permissions = usePermissions();

  // Check if user has required permission
  let hasAccess = true;
  
  if (requirePermission) {
    hasAccess = permissions[requirePermission] === true;
  } else if (requireAny && requireAny.length > 0) {
    hasAccess = requireAny.some(perm => permissions[perm] === true);
  }
  
  // If no permission specified, allow access (for routes that don't need specific permissions)
  if (!requirePermission && !requireAny) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
