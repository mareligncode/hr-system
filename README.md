# 🏨 Hotel HR Management System - Full Implementation Guide (Phases 1-4)

This comprehensive guide details the operations and responsibilities for each of the **6 System Actors** across the first four completed development phases. The system is built for a real-world large-scale hotel environment with strict Role-Based Access Control (RBAC).

---

## 🚀 OVERVIEW OF PHASES (1-4)
- **PHASE 1: Foundation & Auth** – Secure login, registration, and password recovery across web/mobile.
- **PHASE 2: Org Structure** – Management of departments, positions, and hotel hierarchy.
- **PHASE 3: Employee Management** – Full employee profiles, document uploads, and directory.
- **PHASE 4: RBAC & Security** – Granular permissions, role assignments, and immutable audit logs.

---

## 👨‍💼 ROLE 1: System Administrator (IT)
*Accountable for system integrity, security configuration, and technical health.*

### Phase 1 (Foundation & Security)
1. **System Bootstrap:** Ensure the primary IT admin account is active.
2. **Environment Audit:** Verify `.env` configurations for DB connection and JWT security.
3. **Connectivity:** Test email service integration for verification emails.

### Phase 2 (Global Configuration)
1. **Master Data:** Configure top-level hotel properties if multi-property.
2. **Technical Support:** Troubleshoot any hierarchy logic errors in the SQL views.

### Phase 3 (Infrastructure)
1. **File Storage:** Verify Cloudinary or S3 storage buckets are receiving uploaded documents.
2. **Employee Numbers:** Monitor the automatic `EMP-YYYY-XXXX` sequence generator.

### Phase 4 (Security & Audit)
1. **Access Configuration:**
   - **Permissions Matrix:** Go to **Admin -> Security** and toggle specific module access.
   - **Scoped Roles:** Assign roles via the **Assignments** panel. Use the **Scope** dropdown to limit a manager's access to a specific department.
2. **Audit Oversight:** Navigate to **Audit Logs** (`/admin/audit`).
   - Toggle **Timeline View** for a visual chronological history of system changes.
   - Use the **JSON Viewer** to inspect before/after data states.

---

## 🏢 ROLE 2: HR Manager
*Handles the complete employee lifecycle and ensures hotel-wide compliance.*

### Phase 2 (Organization Planning)
1. **Departments:** Create the hotel's structure (Front Office, F&B, Housekeeping, Executive).
2. **Positions:** Add specific roles (e.g., "Executive Chef", "Night Auditor") and link them to departments.
3. **Hierarchy:** Verify the Reporting Structure in the **Positions** view to ensure proper supervision links.

### Phase 3 (Onboarding & Documentation)
1. **Employee Recruitment:** Use the **Add Employee Wizard** (3-step form).
   - Step 1: Personal Info & Profile Photo.
   - Step 2: Contract Details (Hire Date, Salary).
   - Step 3: Emergency Contacts & Banking.
2. **Directory Management:** 
   - Toggle between **Grid View** and **List View**.
   - Use **Advanced Filters** to find staff by Department or Status.
3. **Compliance:** Open an employee profile -> **Documents** tab.
   - Upload Passport/ID or Work Contract.
   - Assign Expiry Dates to track document validity.

### Phase 4 (Security & Compliance Monitoring)
1. **System Dashboard:** Monitor the landing page for **Compliance Alerts** (Expiring Documents/Certs).
2. **Role Delegation:** Assign department-specific manager roles to ensure data privacy between units.
3. **Activity Review:** Use the **Audit Timeline** to verify that onboarding and document updates are being performed correctly by staff.

---

## 👨‍💼 ROLE 3: Department Manager
*Manages team visibility and operational workflow within their specific scope.*

### Phase 3 (Team Visibility)
1. **Department Focus:** Access the **Employee Directory** and notice the restricted view (scoped to your department members).
2. **Search & Filter:** Find subordinates quickly using the search bar for performance reviews or shift planning.
3. **Profile Review:** View team members' profiles to check certifications or contact details in emergencies.

### Phase 4 (Managerial Authority)
1. **UI Tailoring:** Verify that only "Manager" actions (like viewing reports) are visible in your sidebar.
2. **Log Review:** See a timeline of activity for employees under your direct command.

---

## 🤵 ROLE 4: Staff Employee
*Standard hotel staff utilizing self-service features and personal data management.*

### Phase 1 (Self-Service Auth)
1. **Registration:** Sign up for an account (if permitted by policy).
2. **Security:** Use the **Forgot Password** flow to reset credentials via email verification code.
3. **Password Change:** Log in and change your temporary password provided by HR.

### Phase 3 (Personal Portfolio)
1. **My Profile:** View your own comprehensive record including Salary History and Hire Date.
2. **Self-Upload:** Upload your own Certifications or Training documents to the **Documents** tab.
3. **Digital Badge:** View your Employee ID and Profile photo as it appears on the hotel roster.

### Phase 4 (Profile Security)
1. **Restricted Access:** Verify you CANNOT access the Audit Logs, Admin Panel, or other staff salaries.

---

## 💰 ROLE 5: Finance / Payroll Officer
*Audits payroll-related data and financial organization structures.*

### Phase 2 & 3 (Financial Audit)
1. **Salary Ranges:** Access **Positions** to verify that Min/Max salary ranges align with the budget.
2. **Contract Type:** Filter the Directory to audit "Permanent" vs "Temporary" staff for payroll planning.
3. **Data Export:** Click **Export CSV** in the directory to pull a data sheet for external payroll processing.

### Phase 4 (Financial Security)
1. **Role Verification:** Ensure that Finance roles have "Read" access to salary data but "No Access" to system settings.

---

## 👑 ROLE 6: General Manager / Hotel Owner
*Strategic oversight of the hotel workforce and workforce health analytics.*

### Phase 2 & 3 (Workforce Analytics)
1. **Executive Stats:** Review the **Dashboard Count Cards** (Total Staff, Vacant Positions, Department Distribution).
2. **Org Visualization:** Use the **Organization Chart** to visualize the entire hotel chain of command.
3. **Search:** Quickly pull up any manager's profile to review tenure or certifications.

### Phase 4 (Accountability & Health)
1. **Executive Dashboard:** Get an instant pulse on hotel health via **Total Workforce**, **Active Certs**, and **Recent Activity**.
2. **Compliance Monitoring:** Review the **Expiring Assets** list to ensure the hotel meets legal and safety certification requirements.
3. **Audit Oversight:** Use the **Visual Timeline** to monitor high-level administrative changes across the property.

---

## 🛡️ SYSTEM VERIFICATION (QA)
Before concluding Phase 4, ensure:
- [ ] **Cross-Device:** Dashboard works on Tablet/Mobile.
- [ ] **Data Integrity:** No "Ghost" employees exist without Users.
- [ ] **Auth:** JWT token expires and requires re-login properly.
- [ ] **Search:** Autocomplete search finds employees by name/ID/email.

