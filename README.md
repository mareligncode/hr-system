# 🏨 Hotel HR Management System - Phase 1-4 Operations Guide

This document defines the roles, responsibilities, and expected workflows for all **6 System Actors** within the Hotel HR Management System, specifically covering the implementation completed in **Phases 1 through 4**.

---

## 🚀 Overview of Completed Phases
- **Phase 1: Foundation & Authentication** – Secure multi-platform login, registration, and code-based password recovery.
- **Phase 2: Organization Structure** – Management of hotels, departments, and positions.
- **Phase 3: Employee Management** – Lifecycle management of staff, document tracking, and certifications.
- **Phase 4: RBAC & Security** – Role-Based Access Control, scoped permissions, and immutable audit logging.

---

## 👥 System Actors & Responsibilities

### 👨‍💻 1. System Administrator (IT)
*Accountable for system integrity, security configuration, and technical health.*

- **Core Actions**:
  - **Security Configuration**: Manage granular permissions for all roles via the **Admin Panel**.
  - **User Lifecycle**: Monitor user accounts and verify email verification flows.
  - **Audit Oversight**: Review the immutable **Audit Logs** to track every creation, update, and deletion in the system.
  - **Environment Management**: Configure SMTP services, storage buckets (Cloudinary), and JWT security tokens.
- **Expected Outcome**: A stable, secure, and fully audited environment where data privacy is enforced at the database level.

### 🏢 2. HR Manager
*Handles the complete employee lifecycle and ensures hotel-wide compliance.*

- **Core Actions**:
  - **Onboarding**: Use the **3-Step Employee Wizard** to register new staff.
  - **Default Passwords**: Set explicit temporary passwords during onboarding or let them default to the employee's email.
  - **Org Management**: Define the hotel's department hierarchy and assign managers to each unit.
  - **Compliance Tracking**: Monitor expiring IDs, passports, and certifications through the **Dashboard Compliance Alerts**.
  - **Document Verification**: Review and verify documents uploaded by employees.
- **Expected Outcome**: An accurate, digital representation of the hotel workforce with up-to-date documentation.

### 👨‍💼 3. Department Manager
*Manages team visibility and operational workflow within their specific department scope.*

- **Core Actions**:
  - **Team Oversight**: Access a filtered **Employee Directory** showing only staff within their assigned department.
  - **Profile Review**: View subordinate profiles to check hire dates, contact info, and role-specific certifications.
  - **Self-Dashboard**: View personal department metrics and basic attendance/activity trends for their team.
- **Expected Outcome**: Effective management of departmental staff without access to sensitive data from other departments.

### 🤵 4. Staff Employee
*Utilizes self-service features for personal data management.*

- **Core Actions**:
  - **Self-Service Access**: Log in using their email and the temporary password (defaulted to email) provided by HR.
  - **Profile Management**: View their own hire date, employee number, and reporting manager.
  - **Document Portfolio**: Upload certifications and training records directly to their profile for HR review.
  - **Security**: Change passwords via the secure reset flow using a 6-digit email code.
- **Expected Outcome**: Reduced administrative burden on HR through employee self-service and data transparency.

### 💰 5. Finance / Payroll Officer
*Audits payroll-related data and financial organization structures.*

- **Core Actions**:
  - **Salary Audit**: View position-specific salary ranges and historical employee data.
  - **Data Export**: Export the employee directory to **CSV/Excel** for integration with external payroll systems.
  - **Contract Monitoring**: Track permanent vs. temporary staff distributions to forecast monthly labor costs.
- **Expected Outcome**: Accurate financial data extraction and audit-ready reporting.

### 👑 6. General Manager / Hotel Owner
*Strategic oversight of the hotel workforce and health analytics.*

- **Core Actions**:
  - **Executive Dashboard**: Get real-time counts for Total Workforce, Departmental Heatmaps, and Active Certifications.
  - **Org Visualization**: Use the **Interactive Org Chart** to see the hotel chain of command at a glance.
  - **Compliance Summary**: Identify critical documentation gaps across all departments to mitigate legal risks.
- **Expected Outcome**: High-level visibility into the hotel's operational pulse and workforce readiness.

---

## 🛡️ Implementation Highlights (Phases 1-4)

| Feature | Implementation Detail |
| :--- | :--- |
| **Authentication** | JWT-based with 6-digit code password reset. |
| **Passwords** | Admins can set passwords during creation or default to the employee's email. |
| **Access Control** | Roles are scoped to departments (e.g., a Manager only see their unit). |
| **Audit Log** | Every "Write" action is recorded with User ID, Timestamp, Action Type, and ID. |
| **Self-Service** | All roles can see their own Department/Position regardless of administrative privilege. |

---

## 🛠️ Verification Checklist
- [x] All 6 roles defined in `User` model ENUM.
- [x] Middlewares enforce "Authorize" and "HasPermission" checks.
- [x] Dashboard adapts UI components based on the logged-in role.
- [x] Audit logs record changes to Departments, Positions, and Employees.
