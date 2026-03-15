import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useSettings } from './context/SettingsContext.jsx';
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

// Shifts
import ShiftTypesPage from './pages/shifts/ShiftTypesPage.jsx';
import ShiftCalendarPage from './pages/shifts/ShiftCalendarPage.jsx';
import ShiftTemplatesPage from './pages/shifts/ShiftTemplatesPage.jsx';
import MyShiftsPage from './pages/shifts/MyShiftsPage.jsx';
import ShiftSwapPage from './pages/shifts/ShiftSwapPage.jsx';
import ShiftReportsPage from './pages/shifts/ShiftReportsPage.jsx';
import ShiftRotationsPage from './pages/shifts/ShiftRotationsPage.jsx';

// Recruitment
import PublicCareersPage from './pages/recruitment/PublicCareersPage.jsx';
import JobDetailPage from './pages/recruitment/JobDetailPage.jsx';
import ApplyJobPage from './pages/recruitment/ApplyJobPage.jsx';
import JobManagementPage from './pages/recruitment/JobManagementPage.jsx';
import JobCreatePage from './pages/recruitment/JobCreatePage.jsx';
import ApplicantListPage from './pages/recruitment/ApplicantListPage.jsx';
import ApplicantDetailPage from './pages/recruitment/ApplicantDetailPage.jsx';
import RecruitmentPipelinePage from './pages/recruitment/RecruitmentPipelinePage.jsx';
import InterviewManagementPage from './pages/recruitment/InterviewManagementPage.jsx';
import InterviewRoomPage from './pages/recruitment/InterviewRoomPage.jsx';
import OfferManagementPage from './pages/recruitment/OfferManagementPage.jsx';

// Payroll
import PayrollPeriods from './pages/payroll/PayrollPeriods.jsx';
import PayrollRun from './pages/payroll/PayrollRun.jsx';
import PayrollReview from './pages/payroll/PayrollReview.jsx';
import EmployeePayslips from './pages/payroll/EmployeePayslips.jsx';

// Notifications
import NotificationCenter from './pages/notifications/NotificationCenter.jsx';
import NotificationPreferences from './pages/notifications/NotificationPreferences.jsx';
import NotificationTemplates from './pages/admin/NotificationTemplates.jsx';

// Dashboards & Reports (Phase 12) 
import ExecutiveDashboard from './pages/admin/ExecutiveDashboard.jsx';
import HRDashboard from './pages/admin/HRDashboard.jsx';
import ManagerDashboard from './pages/admin/ManagerDashboard.jsx';
import FinanceDashboard from './pages/admin/FinanceDashboard.jsx';
import ReportCenter from './pages/admin/ReportCenter.jsx';

import AttendanceCalendar from './pages/attendance/AttendanceCalendar.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { theme } = useSettings();

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#2563eb',
      },
      background: {
        default: theme === 'dark' ? '#030712' : '#f8fafc',
        paper: theme === 'dark' ? '#111827' : '#ffffff',
      },
      text: {
        primary: theme === 'dark' ? '#f9fafb' : '#0f172a',
        secondary: theme === 'dark' ? '#9ca3af' : '#475569',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
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

          {/* Public Recruitment routes */}
          <Route path="/careers" element={<PublicCareersPage />} />
          <Route path="/careers/:id" element={<JobDetailPage />} />
          <Route path="/careers/apply/:id" element={<ApplyJobPage />} />

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
            {/* Shift Management */}
            <Route path="/shifts/my" element={<MyShiftsPage />} />
            <Route path="/shifts/calendar" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <ShiftCalendarPage />
              </ProtectedRoute>
            } />
            <Route path="/shifts/types" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <ShiftTypesPage />
              </ProtectedRoute>
            } />
            <Route path="/shifts/templates" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <ShiftTemplatesPage />
              </ProtectedRoute>
            } />
            <Route path="/shifts/swaps" element={<ShiftSwapPage />} />
            <Route path="/shifts/reports" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'finance']}>
                <ShiftReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/shifts/rotations" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <ShiftRotationsPage />
              </ProtectedRoute>
            } />

            {/* Recruitment Management */}
            <Route path="/recruitment/jobs" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <JobManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/jobs/create" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <JobCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/jobs/edit/:id" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <JobCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/applicants" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <ApplicantListPage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/applicants/:id" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <ApplicantDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/pipeline" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <RecruitmentPipelinePage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/interviews" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <InterviewManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/interviews/room/:id" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <InterviewRoomPage />
              </ProtectedRoute>
            } />
            <Route path="/recruitment/offers" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <OfferManagementPage />
              </ProtectedRoute>
            } />

            {/* Payroll Management */}
            <Route path="/payroll/periods" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'finance']}>
                <PayrollPeriods />
              </ProtectedRoute>
            } />
            <Route path="/payroll/run/:id" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'finance']}>
                <PayrollRun />
              </ProtectedRoute>
            } />
            <Route path="/payroll/review/:id" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'finance']}>
                <PayrollReview />
              </ProtectedRoute>
            } />
            <Route path="/payroll/payslips" element={<EmployeePayslips />} />

            {/* Notification Management */}
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/settings/notifications" element={<NotificationPreferences />} />
            <Route path="/admin/notifications/templates" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <NotificationTemplates />
              </ProtectedRoute>
            } />

            {/* Reports & Dashboards (Phase 12) */}
            <Route path="/dashboard/executive" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'finance']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/hr" element={
              <ProtectedRoute requiredRoles={['admin', 'hr']}>
                <HRDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/manager" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/finance" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'finance']}>
                <FinanceDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'finance']}>
                <ReportCenter />
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
    </ThemeProvider>
  );
}

export default App;
