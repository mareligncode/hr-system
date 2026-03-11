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
import EmployeeDirectory from './pages/employees/EmployeeDirectory.jsx';
import EmployeeCreate from './pages/employees/EmployeeCreate.jsx';
import EmployeeProfile from './pages/employees/EmployeeProfile.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import RoleManagement from './pages/admin/RoleManagement.jsx';
import AuditLogList from './pages/admin/AuditLogList.jsx';
import AttendanceDashboard from './pages/attendance/AttendanceDashboard.jsx';
import TeamAttendance from './pages/attendance/TeamAttendance.jsx';
import AttendanceApprovals from './pages/attendance/AttendanceApprovals.jsx';
import AttendanceReports from './pages/attendance/AttendanceReports.jsx';

// Leave
import LeaveRequestPage from './pages/leave/LeaveRequestPage.jsx';
import LeaveBalancePage from './pages/leave/LeaveBalancePage.jsx';
import LeaveApprovalsPage from './pages/leave/LeaveApprovalsPage.jsx';
import LeaveTypePage from './pages/leave/LeaveTypePage.jsx';

import AttendanceCalendar from './pages/attendance/AttendanceCalendar.jsx';
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/attendance" element={<AttendanceDashboard />} />
          <Route path="/attendance/calendar" element={<AttendanceCalendar />} />

          <Route path="/attendance/team" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <TeamAttendance />
            </ProtectedRoute>
          } />

          <Route path="/attendance/approvals" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <AttendanceApprovals />
            </ProtectedRoute>
          } />

          <Route path="/attendance/reports" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'finance']}>
              <AttendanceReports />
            </ProtectedRoute>
          } />

          <Route path="/employees" element={
            <ProtectedRoute requiredPermission="view_employees">
              <EmployeeDirectory />
            </ProtectedRoute>
          } />

          <Route path="/employees/create" element={
            <ProtectedRoute requiredPermission="manage_employees">
              <EmployeeCreate />
            </ProtectedRoute>
          } />

          <Route path="/employees/:id" element={
            <ProtectedRoute requiredPermission="view_employees">
              <EmployeeProfile />
            </ProtectedRoute>
          } />

          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/positions" element={<PositionsPage />} />

          <Route path="/org-chart" element={
            <ProtectedRoute requiredPermission="view_employees">
              <OrgChartPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/roles" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <RoleManagement />
            </ProtectedRoute>
          } />

          <Route path="/admin/audit" element={
            <ProtectedRoute requiredPermission="view_audit_logs">
              <AuditLogList />
            </ProtectedRoute>
          } />

          {/* Leave Management */}
          <Route path="/leave/request" element={<LeaveRequestPage />} />
          <Route path="/leave/history" element={<LeaveBalancePage />} />
          <Route path="/leave/approvals" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <LeaveApprovalsPage />
            </ProtectedRoute>
          } />
          <Route path="/leave/types" element={
            <ProtectedRoute requiredRoles={['admin', 'hr']}>
              <LeaveTypePage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
