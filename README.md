# Enterprise Hotel HR & Workforce Management System
A mature, enterprise-grade Human Resource Management System (HRMS) specifically engineered for the high-intensity hospitality sector. This platform addresses the unique complexity of hotel operations, transforming them from manual overhead into automated, data-driven assets.

---

## The Problem Statement: "The Hospitality Overhead"
Managing a hotel workforce without a specialized system leads to significant operational leakages:
* **The "Shift Chaos"**: Spreadsheets for 24/7 rotations cause conflicts, "ghost" shifts, and high employee stress.
* **Payroll Leakage**: Manual attendance tracking costs hotels 3–5% of their total labor budget in inaccuracies.
* **Compliance Blind Spots**: Missing a liquor license or health certificate expiry can shut down an F&B outlet.
* **Recruitment Fatigue**: High turnover forces HR to spend disproportionate time screening repetitive CVs.
* **Disconnected Deskless Workers**: Floor staff lack a mobile-first way to securely access schedules and payslips.

##  The Solution & Implementation
Our HRMS eliminates manual overhead through intelligent automation, providing an immediate return on investment (ROI) via reduced labor costs and eliminated compliance risks.

**How We Solve It:**
* **Intelligent Shift Engine**: Drag-and-drop 24/7 rotation scheduling with peer-to-peer shift swaps.
* **Geofenced Attendance**: Real-time geolocation IP-validated clock-in paired with automated background cron-jobs for no-show tracking.
* **Precision Payroll Pipeline**: Direct backend bridge from attendance to payslip, automatically calculating overtime, deductions, and tip distributions.
* **Proactive Compliance Monitor**: Automated alert workflows act as a digital "Compliance Officer" for expiring legal documents.
* **Integrated ATS**: Streamlined recruitment pipeline from CV submission to generating formal digital offer letters.

---

## ⚖️ Core Business Rules
The system enforces strict operational logic to maintain compliance, efficiency, and fairness:
1. **Granular RBAC (Role-Based Access Control)**: Strict hierarchy with 6 distinct roles (Admin, General Manager, HR, Finance, Dept Manager, Employee). Actions are strictly gated based on user roles.
2. **Multi-Level Approvals**: Sequential workflows for shift swaps, leave requests, and attendance corrections requiring appropriate managerial sign-off.
3. **Automated Break Management**: System-enforced break durations bound by specific shift length logic. 
4. **End-to-End Audit Logging**: A forensic, immutable record of all critical system actions to guarantee accountability.
5. **Localization Support**: First-class multi-language architecture (e.g., English and Amharic) to accommodate diverse workforces.



##  Actor Hierarchy & Permission Tree
┌─────────────────────────────────────────────────────────────────────────────┐
│                             LEVEL 1 (TOP)                                    │
│                       SYSTEM ADMINISTRATOR                                   │
│                   (System Architecture & Control)                            │
│                                   │                                          │
│                                   ▼                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                             LEVEL 2                                          │
│                        GENERAL MANAGER                                       │
│                  (Global Oversight & Approvals)                              │
│                                   │                                          │
│                     ┌──────────────┴──────────────┐                          │
│                    ▼                              ▼                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                    LEVEL 3                          LEVEL 3                  │
│              HR MANAGER                         FINANCE MANAGER              │
│       (Workforce Analytics & ATS)          (Payroll & Budgets)               │
│                    │                              │                          │
│                    └──────────────┬───────────────┘                          │
│                                   ▼                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                             LEVEL 4                                          │
│                      DEPARTMENT MANAGER                                      │
│             (Shift Planning & Leave Approvals)                               │
│                                   │                                          │
│                                   ▼                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                            LEVEL 5                                          │
│                          EMPLOYEE                                           │
│              (Clock-ins, Shift Swaps, Self-Service)                         │
└─────────────────────────────────────────────────────────────────────────────┘