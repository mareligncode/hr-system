import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useSettings } from './context/SettingsContext.jsx';
import PageLoader from './components/common/PageLoader.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LoginPage              = lazy(() => import('./pages/auth/LoginPage.jsx'));
const RegisterPage           = lazy(() => import('./pages/auth/RegisterPage.jsx'));
const ForgotPasswordPage     = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage      = lazy(() => import('./pages/auth/ResetPasswordPage.jsx'));
const VerifyEmailPage        = lazy(() => import('./pages/auth/VerifyEmailPage.jsx'));

// ─── Core pages ───────────────────────────────────────────────────────────────
const LandingPage            = lazy(() => import('./pages/LandingPage.jsx'));
const ProfilePage            = lazy(() => import('./pages/ProfilePage.jsx'));

// ─── Admin pages ──────────────────────────────────────────────────────────────
const Dashboard              = lazy(() => import('./pages/admin/Dashboard.jsx'));
const RoleManagement         = lazy(() => import('./pages/admin/RoleManagement.jsx'));
const AuditLogList           = lazy(() => import('./pages/admin/AuditLogList.jsx'));
const ExecutiveDashboard     = lazy(() => import('./pages/admin/ExecutiveDashboard.jsx'));
const HRDashboard            = lazy(() => import('./pages/admin/HRDashboard.jsx'));
const ManagerDashboard       = lazy(() => import('./pages/admin/ManagerDashboard.jsx'));
const FinanceDashboard       = lazy(() => import('./pages/admin/FinanceDashboard.jsx'));
const ReportCenter           = lazy(() => import('./pages/admin/ReportCenter.jsx'));
const NotificationTemplates  = lazy(() => import('./pages/admin/NotificationTemplates.jsx'));

// ─── Organization pages ───────────────────────────────────────────────────────
const DepartmentsPage        = lazy(() => import('./pages/organization/DepartmentsPage.jsx'));
const PositionsPage          = lazy(() => import('./pages/organization/PositionsPage.jsx'));
const OrgChartPage           = lazy(() => import('./pages/organization/OrgChartPage.jsx'));

// ─── Employee pages ───────────────────────────────────────────────────────────
const EmployeeDirectory      = lazy(() => import('./pages/employees/EmployeeDirectory.jsx'));
const EmployeeCreate         = lazy(() => import('./pages/employees/EmployeeCreate.jsx'));
const EmployeeProfile        = lazy(() => import('./pages/employees/EmployeeProfile.jsx'));

// ─── Attendance pages ─────────────────────────────────────────────────────────
const AttendanceDashboard    = lazy(() => import('./pages/attendance/AttendanceDashboard.jsx'));
const AttendanceCalendar     = lazy(() => import('./pages/attendance/AttendanceCalendar.jsx'));
const TeamAttendance         = lazy(() => import('./pages/attendance/TeamAttendance.jsx'));
const AttendanceApprovals    = lazy(() => import('./pages/attendance/AttendanceApprovals.jsx'));
const AttendanceReports      = lazy(() => import('./pages/attendance/AttendanceReports.jsx'));

// ─── Leave pages ──────────────────────────────────────────────────────────────
const LeaveRequestPage       = lazy(() => import('./pages/leave/LeaveRequestPage.jsx'));
const LeaveBalancePage       = lazy(() => import('./pages/leave/LeaveBalancePage.jsx'));
const LeaveApprovalsPage     = lazy(() => import('./pages/leave/LeaveApprovalsPage.jsx'));
const LeaveTypePage          = lazy(() => import('./pages/leave/LeaveTypePage.jsx'));
const LeaveBlackoutPage      = lazy(() => import('./pages/leave/LeaveBlackoutPage.jsx'));
const LeaveEncashmentPage    = lazy(() => import('./pages/leave/LeaveEncashmentPage.jsx'));

// ─── Shift pages ──────────────────────────────────────────────────────────────
const ShiftTypesPage         = lazy(() => import('./pages/shifts/ShiftTypesPage.jsx'));
const ShiftCalendarPage      = lazy(() => import('./pages/shifts/ShiftCalendarPage.jsx'));
const ShiftTemplatesPage     = lazy(() => import('./pages/shifts/ShiftTemplatesPage.jsx'));
const MyShiftsPage           = lazy(() => import('./pages/shifts/MyShiftsPage.jsx'));
const ShiftSwapPage          = lazy(() => import('./pages/shifts/ShiftSwapPage.jsx'));
const ShiftReportsPage       = lazy(() => import('./pages/shifts/ShiftReportsPage.jsx'));
const ShiftRotationsPage     = lazy(() => import('./pages/shifts/ShiftRotationsPage.jsx'));

// ─── Recruitment pages ────────────────────────────────────────────────────────
const PublicCareersPage      = lazy(() => import('./pages/recruitment/PublicCareersPage.jsx'));
const JobDetailPage          = lazy(() => import('./pages/recruitment/JobDetailPage.jsx'));
const ApplyJobPage           = lazy(() => import('./pages/recruitment/ApplyJobPage.jsx'));
const JobManagementPage      = lazy(() => import('./pages/recruitment/JobManagementPage.jsx'));
const JobCreatePage          = lazy(() => import('./pages/recruitment/JobCreatePage.jsx'));
const ApplicantListPage      = lazy(() => import('./pages/recruitment/ApplicantListPage.jsx'));
const ApplicantDetailPage    = lazy(() => import('./pages/recruitment/ApplicantDetailPage.jsx'));
const RecruitmentPipelinePage = lazy(() => import('./pages/recruitment/RecruitmentPipelinePage.jsx'));
const InterviewManagementPage = lazy(() => import('./pages/recruitment/InterviewManagementPage.jsx'));
const InterviewRoomPage      = lazy(() => import('./pages/recruitment/InterviewRoomPage.jsx'));
const OfferManagementPage    = lazy(() => import('./pages/recruitment/OfferManagementPage.jsx'));

// ─── Payroll pages ────────────────────────────────────────────────────────────
const PayrollPeriods         = lazy(() => import('./pages/payroll/PayrollPeriods.jsx'));
const PayrollRun             = lazy(() => import('./pages/payroll/PayrollRun.jsx'));
const PayrollReview          = lazy(() => import('./pages/payroll/PayrollReview.jsx'));
const EmployeePayslips       = lazy(() => import('./pages/payroll/EmployeePayslips.jsx'));

// ─── Finance pages ────────────────────────────────────────────────────────────
const PayrollDashboard       = lazy(() => import('./pages/finance/PayrollDashboard.jsx'));
const MyFinancePage          = lazy(() => import('./pages/finance/MyFinancePage.jsx'));

// ─── Performance pages ────────────────────────────────────────────────────────
const PerformanceDashboard   = lazy(() => import('./pages/performance/PerformanceDashboard.jsx'));
const Feedback360Page        = lazy(() => import('./pages/performance/Feedback360Page.jsx'));
const RecognitionWall        = lazy(() => import('./pages/performance/RecognitionWall.jsx'));
const DisciplinaryPortal     = lazy(() => import('./pages/performance/DisciplinaryPortal.jsx'));

// ─── LMS pages ────────────────────────────────────────────────────────────────
const TrainingCatalog        = lazy(() => import('./pages/performance/TrainingCatalog.jsx'));
const CoursePlayer           = lazy(() => import('./pages/performance/CoursePlayer.jsx'));
const ComplianceDashboard    = lazy(() => import('./pages/performance/ComplianceDashboard.jsx'));

// ─── Welfare & Asset pages ────────────────────────────────────────────────────
const AssetInventory         = lazy(() => import('./pages/performance/AssetInventory.jsx'));
const AccommodationPortal    = lazy(() => import('./pages/performance/AccommodationPortal.jsx'));
const WelfareSupportPage     = lazy(() => import('./pages/performance/WelfareSupportPage.jsx'));

// ─── Legacy recruitment pages (Phase 7 duplicates kept for compat) ────────────
const JobBoard               = lazy(() => import('./pages/performance/JobBoard.jsx'));
const ApplicantTrackingSystem = lazy(() => import('./pages/performance/ApplicantTrackingSystem.jsx'));
const InterviewScheduler     = lazy(() => import('./pages/performance/InterviewScheduler.jsx'));

// ─── Notification pages ───────────────────────────────────────────────────────
const NotificationCenter     = lazy(() => import('./pages/notifications/NotificationCenter.jsx'));
const NotificationPreferences = lazy(() => import('./pages/notifications/NotificationPreferences.jsx'));

// ─────────────────────────────────────────────────────────────────────────────

function App() {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { theme } = useSettings();

    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: theme === 'dark' ? 'dark' : 'light',
                    primary: { main: '#2563eb' },
                    background: {
                        default: theme === 'dark' ? '#030712' : '#f8fafc',
                        paper:   theme === 'dark' ? '#111827' : '#ffffff',
                    },
                    text: {
                        primary:   theme === 'dark' ? '#f9fafb' : '#0f172a',
                        secondary: theme === 'dark' ? '#9ca3af' : '#475569',
                    },
                },
                shape: { borderRadius: 12 },
                typography: { fontFamily: '"Inter", sans-serif' },
                components: {
                    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
                },
            }),
        [theme],
    );

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <BrowserRouter>
                {/* Single Suspense boundary — shows PageLoader for any lazy chunk */}
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* ── Public landing ─────────────────────────────── */}
                        <Route path="/" element={<LandingPage />} />

                        {/* ── Auth routes ────────────────────────────────── */}
                        <Route
                            path="/login"
                            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                        />
                        <Route
                            path="/register"
                            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
                        />
                        <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
                        <Route path="/reset-password"         element={<ResetPasswordPage />} />
                        <Route path="/verify-email/:token"    element={<VerifyEmailPage />} />

                        {/* ── Public careers routes ──────────────────────── */}
                        <Route path="/careers"               element={<PublicCareersPage />} />
                        <Route path="/careers/:id"           element={<JobDetailPage />} />
                        <Route path="/careers/apply/:id"     element={<ApplyJobPage />} />

                        {/* ── Protected dashboard routes ─────────────────── */}
                        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

                            {/* Core */}
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile"   element={<ProfilePage />} />

                            {/* Attendance */}
                            <Route path="/attendance"          element={<AttendanceDashboard />} />
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

                            {/* Employees */}
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

                            {/* Organization */}
                            <Route path="/departments" element={<DepartmentsPage />} />
                            <Route path="/positions"   element={<PositionsPage />} />
                            <Route path="/org-chart" element={
                                <ProtectedRoute requiredPermission="view_employees">
                                    <OrgChartPage />
                                </ProtectedRoute>
                            } />

                            {/* Admin */}
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
                            <Route path="/admin/notifications/templates" element={
                                <ProtectedRoute requiredRoles={['admin']}>
                                    <NotificationTemplates />
                                </ProtectedRoute>
                            } />

                            {/* Leave */}
                            <Route path="/leave/request"     element={<LeaveRequestPage />} />
                            <Route path="/leave/history"     element={<LeaveBalancePage />} />
                            <Route path="/leave/encashments" element={<LeaveEncashmentPage />} />
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
                            <Route path="/leave/blackout" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr']}>
                                    <LeaveBlackoutPage />
                                </ProtectedRoute>
                            } />

                            {/* Shifts */}
                            <Route path="/shifts/my"       element={<MyShiftsPage />} />
                            <Route path="/shifts/swaps"    element={<ShiftSwapPage />} />
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
                            <Route path="/shifts/rotations" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                                    <ShiftRotationsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/shifts/reports" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'finance']}>
                                    <ShiftReportsPage />
                                </ProtectedRoute>
                            } />

                            {/* Recruitment */}
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
                            <Route path="/recruitment/ats" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr']}>
                                    <ApplicantTrackingSystem />
                                </ProtectedRoute>
                            } />

                            {/* Payroll */}
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

                            {/* Finance */}
                            <Route path="/finance/payroll" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'finance']}>
                                    <PayrollDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/finance/my" element={<MyFinancePage />} />

                            {/* Performance */}
                            <Route path="/performance"             element={<PerformanceDashboard />} />
                            <Route path="/performance/feedback"    element={<Feedback360Page />} />
                            <Route path="/performance/recognition" element={<RecognitionWall />} />
                            <Route path="/performance/discipline" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                                    <DisciplinaryPortal />
                                </ProtectedRoute>
                            } />

                            {/* LMS */}
                            <Route path="/training"   element={<TrainingCatalog />} />
                            <Route path="/training/:id" element={<CoursePlayer />} />
                            <Route path="/compliance" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                                    <ComplianceDashboard />
                                </ProtectedRoute>
                            } />

                            {/* Welfare & Assets */}
                            <Route path="/assets" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                                    <AssetInventory />
                                </ProtectedRoute>
                            } />
                            <Route path="/accommodation" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                                    <AccommodationPortal />
                                </ProtectedRoute>
                            } />
                            <Route path="/welfare" element={<WelfareSupportPage />} />

                            {/* Job board (employee-facing) */}
                            <Route path="/jobs"                          element={<JobBoard />} />
                            <Route path="/recruitment/interviews/schedule" element={
                                <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                                    <InterviewScheduler />
                                </ProtectedRoute>
                            } />

                            {/* Notifications */}
                            <Route path="/notifications"             element={<NotificationCenter />} />
                            <Route path="/notifications/preferences" element={<NotificationPreferences />} />

                            {/* Analytics & Reports */}
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

                        </Route>{/* end protected layout */}

                        {/* Catch-all — redirect unknown paths to dashboard or login */}
                        <Route
                            path="*"
                            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
                        />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
