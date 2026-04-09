import User from './User.js';
import Department from './Department.js';
import Position from './Position.js';
import Employee from './Employee.js';
import EmployeeDocument from './EmployeeDocument.js';
import EmployeeCertification from './EmployeeCertification.js';
import AuditLog from './AuditLog.js';
import Role from './Role.js';
import Permission from './Permission.js';
import UserRole from './UserRole.js';
import RolePermission from './RolePermission.js';
import Attendance from './Attendance.js';
import AttendanceCorrection from './AttendanceCorrection.js';
import AttendanceBreak from './AttendanceBreak.js';
import LeaveType from './LeaveType.js';
import LeaveRequest from './LeaveRequest.js';
import ShiftType from './ShiftType.js';
import ShiftAssignment from './ShiftAssignment.js';
import ShiftSwapRequest from './ShiftSwapRequest.js';
import ShiftTemplate from './ShiftTemplate.js';
import ShiftRotation from './ShiftRotation.js';
import JobPosting from './JobPosting.js';
import Applicant from './Applicant.js';
import JobApplication from './JobApplication.js';
import ApplicantDocument from './ApplicantDocument.js';
import Interview from './Interview.js';
import InterviewFeedback from './InterviewFeedback.js';
import Offer from './Offer.js';
import PayrollPeriod from './PayrollPeriod.js';
import PayrollItem from './PayrollItem.js';
import Notification from './Notification.js';
import NotificationSetting from './NotificationSetting.js';
import NotificationTemplate from './NotificationTemplate.js';
import LeaveBlackoutDate from './LeaveBlackoutDate.js';
import LeaveBalance from './LeaveBalance.js';
import LeaveEncashment from './LeaveEncashment.js';
import PerformanceKPI from './PerformanceKPI.js';
import EmployeeKPIScore from './EmployeeKPIScore.js';
import PerformanceReview from './PerformanceReview.js';
import Badge from './Badge.js';
import EmployeeBadge from './EmployeeBadge.js';
import DisciplinaryRecord from './DisciplinaryRecord.js';
import Course from './Course.js';
import CourseProgress from './CourseProgress.js';
import QuizQuestion from './QuizQuestion.js';
import QuizAttempt from './QuizAttempt.js';
import Asset from './Asset.js';
import AssetAssignment from './AssetAssignment.js';
import Uniform from './Uniform.js';
import Accommodation from './Accommodation.js';
import WelfareRequest from './WelfareRequest.js';
import Expense from './Expense.js';
import TipPool from './TipPool.js';

// User & Role (Many-to-Many)
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id' });

// UserRole & Department Association (for scoping)
UserRole.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(UserRole, { foreignKey: 'department_id' });
UserRole.belongsTo(User, { foreignKey: 'user_id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id' });

// Role & Permission (Many-to-Many)
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id' });

// User & Employee
User.hasOne(Employee, { foreignKey: 'user_id' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

// Department & Manager
Department.belongsTo(User, { as: 'Manager', foreignKey: 'manager_id' });
User.hasMany(Department, { as: 'ManagedDepartments', foreignKey: 'manager_id' });

// Department Hierarchy
Department.belongsTo(Department, { as: 'ParentDepartment', foreignKey: 'parent_department_id' });
Department.hasMany(Department, { as: 'SubDepartments', foreignKey: 'parent_department_id' });

// Position & Department
Position.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(Position, { foreignKey: 'department_id' });

// Employee & Position/Department
Employee.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(Employee, { foreignKey: 'department_id' });

Employee.belongsTo(Position, { foreignKey: 'position_id' });
Position.hasMany(Employee, { foreignKey: 'position_id' });

Employee.belongsTo(User, { as: 'Manager', foreignKey: 'reports_to' });
Employee.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

// Documents & Certifications
Employee.hasMany(EmployeeDocument, { foreignKey: 'employee_id' });
EmployeeDocument.belongsTo(Employee, { foreignKey: 'employee_id' });
EmployeeDocument.belongsTo(User, { as: 'Verifier', foreignKey: 'verified_by' });
EmployeeDocument.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

Employee.hasMany(EmployeeCertification, { foreignKey: 'employee_id' });
EmployeeCertification.belongsTo(Employee, { foreignKey: 'employee_id' });
EmployeeCertification.belongsTo(User, { as: 'Verifier', foreignKey: 'verified_by' });

// Audit Logs
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(AuditLog, { foreignKey: 'user_id' });

// Attendance
User.hasMany(Attendance, { foreignKey: 'user_id' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });
Attendance.belongsTo(User, { as: 'Verifier', foreignKey: 'verified_by' });

User.hasMany(AttendanceCorrection, { foreignKey: 'user_id' });
AttendanceCorrection.belongsTo(User, { foreignKey: 'user_id' });
AttendanceCorrection.belongsTo(Attendance, { foreignKey: 'attendance_id' });
Attendance.hasMany(AttendanceCorrection, { foreignKey: 'attendance_id' });
AttendanceCorrection.belongsTo(User, { as: 'Approver', foreignKey: 'approved_by' });

Attendance.hasMany(AttendanceBreak, { foreignKey: 'attendance_id' });
AttendanceBreak.belongsTo(Attendance, { foreignKey: 'attendance_id' });

// Leave Management
User.hasMany(LeaveType, { foreignKey: 'created_by' });
LeaveType.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id' });

LeaveType.hasMany(LeaveRequest, { foreignKey: 'leave_type_id' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });

LeaveRequest.belongsTo(User, { as: 'Approver', foreignKey: 'approved_by' });

// Blackout Dates
Department.hasMany(LeaveBlackoutDate, { foreignKey: 'department_id' });
LeaveBlackoutDate.belongsTo(Department, { foreignKey: 'department_id' });
LeaveBlackoutDate.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

// Leave Balances & Encashment
Employee.hasMany(LeaveBalance, { foreignKey: 'employee_id' });
LeaveBalance.belongsTo(Employee, { foreignKey: 'employee_id' });
LeaveType.hasMany(LeaveBalance, { foreignKey: 'leave_type_id' });
LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });

Employee.hasMany(LeaveEncashment, { foreignKey: 'employee_id' });
LeaveEncashment.belongsTo(Employee, { foreignKey: 'employee_id' });
LeaveType.hasMany(LeaveEncashment, { foreignKey: 'leave_type_id' });
LeaveEncashment.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });
LeaveEncashment.belongsTo(User, { as: 'Approver', foreignKey: 'approved_by' });

// Shift Management
Department.hasMany(ShiftType, { foreignKey: 'department_id' });
ShiftType.belongsTo(Department, { foreignKey: 'department_id' });

Employee.hasMany(ShiftAssignment, { foreignKey: 'employee_id' });
ShiftAssignment.belongsTo(Employee, { foreignKey: 'employee_id' });

ShiftType.hasMany(ShiftAssignment, { foreignKey: 'shift_type_id' });
ShiftAssignment.belongsTo(ShiftType, { foreignKey: 'shift_type_id' });

Employee.hasMany(ShiftSwapRequest, { as: 'RequestedSwaps', foreignKey: 'requesting_employee_id' });
ShiftSwapRequest.belongsTo(Employee, { as: 'Requester', foreignKey: 'requesting_employee_id' });

Employee.hasMany(ShiftSwapRequest, { as: 'TargetSwaps', foreignKey: 'target_employee_id' });
ShiftSwapRequest.belongsTo(Employee, { as: 'TargetEmployee', foreignKey: 'target_employee_id' });

ShiftAssignment.hasMany(ShiftSwapRequest, { foreignKey: 'shift_assignment_id', onDelete: 'CASCADE' });
ShiftSwapRequest.belongsTo(ShiftAssignment, { foreignKey: 'shift_assignment_id' });

Department.hasMany(ShiftTemplate, { foreignKey: 'department_id' });
ShiftTemplate.belongsTo(Department, { foreignKey: 'department_id' });

ShiftRotation.belongsTo(Department, { foreignKey: 'department_id' });

// Recruitment Management
JobPosting.belongsTo(Position, { foreignKey: 'position_id' });
Position.hasMany(JobPosting, { foreignKey: 'position_id' });

JobPosting.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

JobPosting.hasMany(JobApplication, { foreignKey: 'job_posting_id' });
JobApplication.belongsTo(JobPosting, { foreignKey: 'job_posting_id' });

Applicant.hasMany(JobApplication, { foreignKey: 'applicant_id' });
JobApplication.belongsTo(Applicant, { foreignKey: 'applicant_id' });

Applicant.hasMany(ApplicantDocument, { foreignKey: 'applicant_id' });
ApplicantDocument.belongsTo(Applicant, { foreignKey: 'applicant_id' });

Applicant.belongsTo(Employee, { as: 'Referrer', foreignKey: 'referral_employee_id' });

// Interview & Feedback
JobApplication.hasMany(Interview, { foreignKey: 'job_application_id' });
Interview.belongsTo(JobApplication, { foreignKey: 'job_application_id' });

Interview.belongsTo(User, { as: 'Interviewer', foreignKey: 'interviewer_id' });
User.hasMany(Interview, { as: 'InterviewsDone', foreignKey: 'interviewer_id' });

Interview.hasMany(InterviewFeedback, { foreignKey: 'interview_id' });
InterviewFeedback.belongsTo(Interview, { foreignKey: 'interview_id' });

InterviewFeedback.belongsTo(User, { as: 'Interviewer', foreignKey: 'interviewer_id' });
User.hasMany(InterviewFeedback, { foreignKey: 'interviewer_id' });

// Offer
JobApplication.hasOne(Offer, { foreignKey: 'job_application_id' });
Offer.belongsTo(JobApplication, { foreignKey: 'job_application_id' });

Offer.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

// Payroll Management
User.hasMany(PayrollPeriod, { foreignKey: 'created_by' });
PayrollPeriod.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

PayrollPeriod.hasMany(PayrollItem, { foreignKey: 'payroll_period_id' });
PayrollItem.belongsTo(PayrollPeriod, { foreignKey: 'payroll_period_id' });

User.hasMany(PayrollItem, { foreignKey: 'user_id' });
PayrollItem.belongsTo(User, { foreignKey: 'user_id' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

NotificationSetting.belongsTo(User, { foreignKey: 'user_id' });

// Phase 4: Performance & Mastery
Department.hasMany(PerformanceKPI, { foreignKey: 'department_id' });
PerformanceKPI.belongsTo(Department, { foreignKey: 'department_id' });

Employee.hasMany(EmployeeKPIScore, { foreignKey: 'employee_id' });
EmployeeKPIScore.belongsTo(Employee, { foreignKey: 'employee_id' });
PerformanceKPI.hasMany(EmployeeKPIScore, { foreignKey: 'kpi_id' });
EmployeeKPIScore.belongsTo(PerformanceKPI, { foreignKey: 'kpi_id' });
EmployeeKPIScore.belongsTo(User, { as: 'Recorder', foreignKey: 'recorded_by' });

Employee.hasMany(PerformanceReview, { foreignKey: 'employee_id' });
PerformanceReview.belongsTo(Employee, { foreignKey: 'employee_id' });
PerformanceReview.belongsTo(User, { as: 'Reviewer', foreignKey: 'reviewer_id' });

Badge.hasMany(EmployeeBadge, { foreignKey: 'badge_id' });
EmployeeBadge.belongsTo(Badge, { foreignKey: 'badge_id' });
Employee.hasMany(EmployeeBadge, { foreignKey: 'employee_id' });
EmployeeBadge.belongsTo(Employee, { foreignKey: 'employee_id' });
EmployeeBadge.belongsTo(User, { as: 'Nominator', foreignKey: 'nominated_by' });

Employee.hasMany(DisciplinaryRecord, { foreignKey: 'employee_id' });
DisciplinaryRecord.belongsTo(User, { as: 'Issuer', foreignKey: 'issued_by' });

// Phase 5: LMS (Learning Management System)
Department.hasMany(Course, { foreignKey: 'department_id' });
Course.belongsTo(Department, { foreignKey: 'department_id' });

Employee.hasMany(CourseProgress, { foreignKey: 'employee_id' });
CourseProgress.belongsTo(Employee, { foreignKey: 'employee_id' });
Course.hasMany(CourseProgress, { foreignKey: 'course_id' });
CourseProgress.belongsTo(Course, { foreignKey: 'course_id' });

Course.hasMany(QuizQuestion, { foreignKey: 'course_id' });
QuizQuestion.belongsTo(Course, { foreignKey: 'course_id' });

Employee.hasMany(QuizAttempt, { foreignKey: 'employee_id' });
QuizAttempt.belongsTo(Employee, { foreignKey: 'employee_id' });
QuizAttempt.belongsTo(Course, { foreignKey: 'course_id' });

// Phase 6: Workforce Welfare & Assets
Employee.hasMany(AssetAssignment, { foreignKey: 'employee_id' });
AssetAssignment.belongsTo(Employee, { foreignKey: 'employee_id' });
Asset.hasMany(AssetAssignment, { foreignKey: 'asset_id' });
AssetAssignment.belongsTo(Asset, { foreignKey: 'asset_id' });

Employee.hasMany(WelfareRequest, { foreignKey: 'employee_id' });
WelfareRequest.belongsTo(Employee, { foreignKey: 'employee_id' });
User.hasMany(WelfareRequest, { as: 'Handler', foreignKey: 'handled_by' });
WelfareRequest.belongsTo(User, { as: 'Handler', foreignKey: 'handled_by' });

Accommodation.hasMany(Employee, { foreignKey: 'accommodation_id' });
Employee.belongsTo(Accommodation, { foreignKey: 'accommodation_id' });

// Phase 7: Financial Integrity
Employee.hasMany(Expense, { foreignKey: 'employee_id' });
Expense.belongsTo(Employee, { foreignKey: 'employee_id' });
Expense.belongsTo(User, { as: 'Approver', foreignKey: 'approved_by' });

Department.hasMany(TipPool, { foreignKey: 'department_id' });
TipPool.belongsTo(Department, { foreignKey: 'department_id' });
TipPool.belongsTo(User, { as: 'Distributor', foreignKey: 'distributed_by' });

export {
    User,
    Department,
    Position,
    Employee,
    EmployeeDocument,
    EmployeeCertification,
    AuditLog,
    Role,
    Permission,
    UserRole,
    RolePermission,
    Attendance,
    AttendanceCorrection,
    AttendanceBreak,
    LeaveType,
    LeaveRequest,
    ShiftType,
    ShiftAssignment,
    ShiftSwapRequest,
    ShiftTemplate,
    ShiftRotation,
    JobPosting,
    Applicant,
    JobApplication,
    ApplicantDocument,
    Interview,
    InterviewFeedback,
    Offer,
    PayrollPeriod,
    PayrollItem,
    Notification,
    NotificationSetting,
    NotificationTemplate,
    LeaveBlackoutDate,
    LeaveBalance,
    LeaveEncashment,
    PerformanceKPI,
    EmployeeKPIScore,
    PerformanceReview,
    Badge,
    EmployeeBadge,
    DisciplinaryRecord,
    Course,
    CourseProgress,
    QuizQuestion,
    QuizAttempt,
    Asset,
    AssetAssignment,
    Uniform,
    Accommodation,
    WelfareRequest,
    Expense,
    TipPool
};
