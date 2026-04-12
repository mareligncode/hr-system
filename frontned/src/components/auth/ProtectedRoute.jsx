import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protects routes that require authentication and specific permissions/roles
 */
const ProtectedRoute = ({ children, requiredPermission, requiredRoles }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role check
    if (requiredRoles && !requiredRoles.includes(user?.role)) {
        return <Navigate to="/profile" replace />;
    }

    // Permission check
    if (requiredPermission && user?.role !== 'admin' && !user?.permissions?.includes(requiredPermission)) {
        return <Navigate to="/profile" replace />;
    }

    return children;
};

export default ProtectedRoute;
