# Hotel HR Management System

A comprehensive, multilingual (English & Amharic) HR and Attendance Management System built for the hospitality industry.

## 🚀 Key Features

- **Multilingual Support**: Fully localized in English and Amharic (አማርኛ).
- **Attendance Tracking**: Real-time clock-in/out with GPS and photo verification.
- **Organization Structure**: Dynamic org charts, department, and position management.
- **Employee Management**: Profile tracking, document storage, and directory access.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for 6 distinct actor roles.

---

## 👥 Actor Roles & Responsibilities (Implementation through Phase 5)

### 1. Administrator
- **System Config**: Manage system-wide settings and role permissions.
- **Audit Logs**: Access detailed logs of all system activities for security and compliance.
- **User Management**: Direct control over user accounts and password resets.
- **Global Visibility**: Unrestricted access to all modules including attendance and employee data.

### 2. HR Manager
- **Employee Lifecycle**: Handle onboarding, profile management, and document verification.
- **Org Management**: Create and modify departments and positions.
- **Global Attendance**: Monitor attendance logs across the entire hotel.
- **Reporting**: Generate and export payroll and compliance reports.

### 3. Department Manager
- **Team Dashboard**: Scoped view focusing on their department's metrics and alerts.
- **Attendance Approvals**: Review and approve "Pending" attendance logs for their team.
- **Correction Queue**: Approve or reject employee requests for manual time fixes.
- **Team Monitoring**: Real-time visibility into who is currently clocked in within their unit.

### 4. Finance Officer
- **Payroll Data**: Access to finalized attendance reports for salary processing.
- **Workforce Analytics**: View distribution of staff by contract type and department.
- **Exporting**: Download attendance logs in CSV format for third-party payroll integration.

### 5. General Manager (GM)
- **Executive Overview**: High-level dashboard showing hotel-wide workforce health.
- **Strategic Data**: Access to the interactive Org Chart and global staff statistics.

### 6. Staff Employee
- **Personal Dashboard**: View daily tasks, weekly work hours, and overtime statistics.
- **Time Tracking**: Use the one-tap widget to clock-in and clock-out (GPS verified).
- **History & Fixes**: View personal attendance history and submit correction requests for missed clocks.
- **Self-Service**: Manage personal documents and view their own profile details.

---

## 🔄 Application Workflow (Step-by-Step)

### 🔑 Stage 1: Security & Identity (Phase 1)
1.  **Staff Registration**: New employees register with their Employee ID.
2.  **Verification**: Account activation via email link.
3.  **Role Delegation**: Admins assign roles (HR, Manager, etc.) to define what the user can see.

### 🏢 Stage 2: Organizational setup (Phase 2)
1.  **Departments**: HR creates the hotel units (e.g., "Kitchen", "Front Office").
2.  **Manager Assignment**: Each department is linked to a **Department Manager**.
3.  **Positions**: Specific roles are created within departments with salary ranges.

### 👤 Stage 3: Workforce Onboarding (Phase 3)
1.  **Digital Profile**: HR completes detailed records for each hire.
2.  **Cloud Storage**: IDs, contracts, and certifications are uploaded securely.
3.  **Directory**: Staff can now browse the team across the hotel.

### 📊 Stage 4: Scoped Operations (Phase 4)
1.  **Personalized Dashboards**: The system automatically serves data based on the user's role.
2.  **Admin Alerts**: Dashboard flags expiring staff documents automatically.

### 🕒 Stage 5: Time & Attendance (Phase 5)
1.  **Clocking**: Staff clock-in/out daily with GPS and photo proof.
2.  **Management**: Managers monitor their live team status.
3.  - **Corrections**: Staff request time fixes; Managers review and approve them.
4.  **Finalization**: Finance exports the attendance CSV for payroll processing.

---

## 📈 Implementation Progress

### Phase 1: Authentication & User Management
- JWT-based secure authentication.
- Multi-factor logic (6-digit code password reset).
- Role assignment system.

### Phase 2: Organization Structure
- Department & Position CRUD operations.
- Interactive Org Chart visualization.

### Phase 3: Employee Management
- Centralized employee directory.
- Document management (PDF/Images) via Cloudinary.
- Comprehensive profile tracking.

### Phase 4: Scoped Dashboards
- Role-specific UI components.
- Automated data scoping (Managers see only their team).
- Compliance alerts for document expiry.

### Phase 5: Attendance Management
- **Clocking System**: Backend logic for work/overtime calculation.
- **Correction Workflow**: Formal request/approval system for time gaps.
- **Export Engine**: CSV generation for attendance reports.
- **Team View**: Real-time attendance monitoring for managers.

---

## 🛠️ Tech Stack

- **Frontend**: React, Redux Toolkit, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, Sequelize (MySQL).
- **Storage**: Cloudinary (Documents/Photos).
- **Internationalization**: Custom i18n system for Amharic support.
