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

// Leave Management
User.hasMany(LeaveType, { foreignKey: 'created_by' });
LeaveType.belongsTo(User, { as: 'Creator', foreignKey: 'created_by' });

Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id' });

LeaveType.hasMany(LeaveRequest, { foreignKey: 'leave_type_id' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });

LeaveRequest.belongsTo(User, { as: 'Approver', foreignKey: 'approved_by' });

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
    ApplicantDocument
};
