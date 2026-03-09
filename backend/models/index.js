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
    RolePermission
};
