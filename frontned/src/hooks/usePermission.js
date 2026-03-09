import { useSelector } from 'react-redux';

/**
 * Custom hook to check if the current user has specific roles or permissions.
 */
const usePermission = () => {
    const { user } = useSelector((state) => state.auth);

    /**
     * Checks if the user has a specific permission code.
     * Admin role always returns true.
     */
    const hasPermission = (permissionCode) => {
        if (!user) return false;
        if (user.role === 'admin') return true;

        // Backend flattens permissions into user.permissions array (see authMiddleware.js)
        // If not flattened, we might need to check user.Roles.Permissions
        return user.permissions?.includes(permissionCode);
    };

    /**
     * Checks if the user has any of the specified roles.
     */
    const hasRole = (roles) => {
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
    };

    /**
     * Checks if the user is an admin.
     */
    const isAdmin = user?.role === 'admin';

    return {
        user,
        hasPermission,
        hasRole,
        isAdmin,
        role: user?.role
    };
};

export default usePermission;
