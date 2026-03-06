import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import DepartmentsPage from './pages/organization/DepartmentsPage.jsx';
import PositionsPage from './pages/organization/PositionsPage.jsx';
import OrgChartPage from './pages/organization/OrgChartPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/profile" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/profile" replace /> : <RegisterPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/positions" element={<PositionsPage />} />
          <Route path="/org-chart" element={<OrgChartPage />} />
        </Route>

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/profile' : '/login'} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
