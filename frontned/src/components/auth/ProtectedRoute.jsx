import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protects routes that require authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
