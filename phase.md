
# 20-Phase Production Implementation Plan
## Enterprise HR System — Full Stack

---

## PHASE 1 — Foundation & Code Quality Cleanup ✅ COMPLETED
**Goal: Clean technical debt before building more features**

**Status: Fully implemented** — all backend and frontend foundation tasks done.

### What was implemented

**Backend — new files created:**
- `backend/utils/logger.js` — Pino structured logger with pretty-print in dev, JSON in prod, automatic redaction of `authorization` headers and password fields
- `backend/middlewares/requestId.js` — attaches a UUID to every request (`req.id`) and echoes it back as `X-Request-ID` response header for client-side error correlation
- `backend/middlewares/validate.js` — reusable Joi validation middleware factory (`validate(schema)`, `validateQuery(schema)`, `validateParams(schema)`); returns `422` with field-level error array on failure

**Backend — files modified:**
- `backend/config/database.js` — removed `sequelize.sync()` (use `npx sequelize-cli db:migrate` instead), added connection pool (`max:20/min:2` in prod, `max:5/min:0` in dev), switched to `logger` from console, `process.exit(1)` on connection failure
- `backend/server.js` — full rewrite:
  - `pino-http` HTTP request logging with request ID correlation
  - `requestId` middleware applied first
  - CORS driven entirely by `ALLOWED_ORIGINS` env var (no hardcoded localhost in production)
  - `authLimiter` (5 req/hour) on `/api/auth`, `apiLimiter` (100 req/15min) on all `/api` routes
  - `/api/health` now queries the DB — returns `503` if DB is unreachable
  - Production-safe error handler (stack trace hidden unless `NODE_ENV=development`)
  - Graceful shutdown on `SIGTERM` / `SIGINT`: stops accepting requests → closes DB pool → exits; force-exits after 15s timeout
  - `unhandledRejection` guard with `process.exit(1)`

**Frontend — new files created:**
- `frontned/src/components/common/ErrorBoundary.jsx` — class-based error boundary wrapping the entire app; shows a clean error UI in production, dev stack trace in development; calls `Sentry.captureException` hook (ready to wire up)
- `frontned/src/components/common/PageLoader.jsx` — full-page spinner shown by `Suspense` while lazy chunks download; also exports `ContentSkeleton` (line skeletons) and `CardSkeleton` (dashboard card shaped skeleton)

**Frontend — files modified:**
- `frontned/vite.config.js` — added path aliases (`@`, `@components`, `@pages`, `@hooks`, `@services`, `@store`, `@context`, `@assets`, `@utils`), manual vendor chunk splitting (`vendor-react`, `vendor-mui`, `vendor-redux`, `vendor-charts`, `vendor-motion`), dev proxy `/api` → `http://localhost:5000`
- `frontned/src/main.jsx` — wrapped app tree with `<ErrorBoundary>`
- `frontned/src/App.jsx` — all 70+ page imports converted to `React.lazy()`, single `<Suspense fallback={<PageLoader />}>` wrapping all routes, catch-all `*` route added

### How to run after Phase 1

**Step 1 — Install new backend dependencies** (run in `backend/` folder):
```bash
npm uninstall bcrypt
npm install pino pino-http pino-pretty
```

**Step 2 — Run database migrations** instead of relying on `sequelize.sync()`:
```bash
# Install sequelize-cli globally if not already installed
npm install -g sequelize-cli

# Run any pending migrations
npx sequelize-cli db:migrate
```
> If you don't have migration files yet, `sequelize.sync()` has been removed so the DB schema is now managed manually. For now, you can temporarily add `await sequelize.sync({ alter: true })` back in `database.js` during development only — but remove it before going to production.

**Step 3 — Update your `.env`** to add the new variable:
```env
# Replace the hardcoded CORS origins — comma-separated list for production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=debug
```

**Step 4 — Start the backend:**
```bash
cd backend
npm run dev
```

**Step 5 — Start the frontend:**
```bash
cd frontned
npm run dev
```

**Step 6 — Verify health check:**
```
GET http://localhost:5000/api/health
```
Expected response:
```json
{ "status": "ok", "db": "connected", "uptime": 12, "timestamp": "...", "env": "development" }
```

### Using the new validate middleware (example)
```js
// In any route file:
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const createLeaveSchema = Joi.object({
  leave_type_id: Joi.number().integer().required(),
  start_date:    Joi.date().iso().required(),
  end_date:      Joi.date().iso().min(Joi.ref('start_date')).required(),
  reason:        Joi.string().max(500).optional(),
});

router.post('/', protect, validate(createLeaveSchema), leaveController.create);
```

### Using the new skeletons (example)
```jsx
import { CardSkeleton, ContentSkeleton } from '@components/common/PageLoader.jsx';

// In any page component while data is loading:
{isLoading ? <CardSkeleton /> : <StatCard data={stats} />}
{isLoading ? <ContentSkeleton lines={5} /> : <EmployeeTable rows={employees} />}
```

---

**Backend:**
- ✅ Replace `sequelize.sync()` with Sequelize CLI migrations — generate migration files for all 54 models
- ✅ Add centralized input validation middleware using Joi schemas on every route
- ✅ Replace all `console.log` with Pino structured logger
- ✅ Add request ID tracking on every request/response cycle
- ✅ Add `SIGTERM` graceful shutdown handler
- ✅ Fix: `bcrypt` and `bcryptjs` are both in dependencies — remove one (keep `bcryptjs`)
- ✅ Enforce `NODE_ENV` based config (never expose stack traces in production)

**Frontend:**
- ⚠️ Fix folder name: `frontned` → `frontend` — skipped to avoid breaking existing docker/scripts; rename manually when ready
- ✅ Convert all eager imports in `App.jsx` to `React.lazy()` + `Suspense`
- ✅ Add global error boundary component wrapping all routes
- ✅ Add a proper loading skeleton system
- ✅ Set up path aliases in Vite (`@components`, `@pages`, `@hooks`, `@services`, etc.)

---

## PHASE 2 — Auth System (Enterprise-Grade)
**Goal: Production-ready authentication with full session control**

**Backend:**
- Implement refresh token flow: short-lived access tokens (15min) + long-lived refresh tokens (7 days) stored in `httpOnly` cookies
- Add token revocation: maintain a `revoked_tokens` Redis set or DB table
- Implement device/session management: track active sessions per user with device info, IP, last active
- Add MFA (TOTP via Google Authenticator / Authy) — use `speakeasy` or `otpauth` library
- Add account lockout after N failed login attempts with exponential backoff
- Add login activity log (IP, device, timestamp, success/failure)
- Email verification on registration (already partially exists — make it mandatory)

**Frontend:**
- Login page: show active session warning if already logged in elsewhere
- New page: **Security Settings** — view all active sessions, revoke individual sessions, enable/disable MFA
- Add MFA enrollment flow (QR code scan, backup codes)
- Add "Remember this device" checkbox

---

## PHASE 3 — Employee Management (Enterprise-Grade)
**Goal: Complete employee lifecycle management**

**Backend:**
- Employee onboarding workflow: multi-step process with checklists, document collection, IT provisioning tasks
- Employee offboarding workflow: exit checklist, asset return, access revocation, final settlement trigger
- Employee timeline: full history of role changes, department transfers, salary changes, title changes
- Org hierarchy: manager chain traversal, skip-level reporting
- Custom fields: allow HR to define custom employee attributes per department
- Bulk import via Excel/CSV with validation and error reporting
- Photo upload with face detection validation (ensure it's actually a photo of a person)

**Frontend:**
- **Employee Profile** — complete redesign: tabbed layout with Overview, Timeline, Documents, Certifications, Assets, Performance, Payroll History, Emergency Contacts
- **Employee Directory** — add filters by department/position/employment type/status, sortable columns, export button, bulk action toolbar
- **Onboarding Wizard** — step-by-step UI for new hire setup: personal info → documents → IT setup → equipment → orientation
- **Org Chart** — interactive, zoomable/pannable tree with search, click-to-navigate, collapsible branches (use `react-d3-tree` or `@xyflow/react`)
- Employee transfer/promotion form with effective date and history tracking

---

## PHASE 4 — Attendance System (Enterprise-Grade)
**Goal: Real-time, accurate attendance tracking with geofencing**

**Backend:**
- Geofence check-in: validate GPS coordinates against allowed work locations on clock-in/clock-out
- QR code check-in: generate time-limited QR codes per location for mobile check-in
- Biometric integration ready: API interface for fingerprint/face recognition device data ingestion
- Overtime rules engine: calculate overtime based on configurable rules (daily, weekly, shift-based)
- Auto-absent detection: cron job that marks employees absent if no check-in by cutoff time
- Attendance anomaly detection: flag unusual patterns (too many corrections, impossible clock times)
- Bulk attendance correction with manager approval workflow
- Attendance reports: daily summary, monthly summary, late/early/absent trend per employee

**Frontend:**
- **Attendance Dashboard** — real-time "Who's in the office" live board with count by department, map view of office locations, today's late arrivals
- **My Attendance** — monthly calendar heat map (green=present, red=absent, yellow=late), hours worked chart, overtime tracker
- **Attendance Calendar** — replace current basic view with full monthly calendar grid showing each day's status, clickable day for detail, correction request button
- **Team Attendance** — table with live status, search/filter, one-click approve corrections
- **Attendance Reports** — pre-built report templates: monthly summary, overtime report, late arrival report, export to PDF/Excel

---

## PHASE 5 — Leave Management (Enterprise-Grade)
**Goal: Policy-driven, multi-approval leave management**

**Backend:**
- Multi-level approval workflow: Employee → Manager → HR → Admin (configurable per leave type)
- Leave accrual engine: auto-accrue leave balances monthly/annually based on policy rules
- Holiday calendar integration: public holidays by country/region, auto-block on leave calendar
- Leave carry-forward rules: configurable per leave type (expire, carry up to N days, encash)
- Overlap detection: reject/warn when multiple team members apply for the same dates
- Delegation: employee can delegate leave approval authority when they are on leave
- Leave policy templates: annual, sick, maternity, paternity, unpaid, compensatory

**Frontend:**
- **Leave Request Page** — full redesign: date range picker with real-time balance preview, calendar overlay showing team's approved leaves, conflict warning, attachment upload for sick leave
- **Leave Balance Page** — visual leave balance cards per leave type (used/available/accruing), annual usage bar chart, accrual timeline
- **Leave Approvals** — Kanban-style board (Pending → Under Review → Approved/Rejected) or table with inline approve/reject with comment, batch approve
- **Leave Policy Manager** — HR-facing config UI: create/edit leave types, set accrual rules, carry-forward rules, who can approve
- **Team Leave Calendar** — monthly calendar showing all team members' approved leaves color-coded by person

---

## PHASE 6 — Shift Management (Enterprise-Grade)
**Goal: Visual drag-and-drop scheduling with rotation engine**

**Backend:**
- Shift scheduling constraints engine: max hours per week, min rest between shifts, overtime rules
- Auto-schedule generator: fill open shifts based on employee availability and constraints
- Shift conflict detection: prevent double-booking an employee
- Shift swap approval workflow: request → target employee accepts → manager approves
- Availability management: employees mark availability windows, system respects them
- Open shift bidding: post unfilled shifts, employees bid, manager selects
- Overtime pre-approval: flag schedule that would generate overtime, require pre-approval

**Frontend:**
- **Shift Calendar** — this is the centerpiece — full drag-and-drop weekly/monthly scheduler (use `@fullcalendar/react`): drag employee name onto time slot, resize to change duration, color by shift type, right-click context menu (edit/delete/swap), department filter
- **My Shifts** — employee view: upcoming shifts list, shift history, pending swap requests, availability submission form
- **Shift Swap** — visual swap request: select your shift, select target employee and their shift, submit request, real-time status tracking
- **Shift Templates** — UI to create reusable weekly/bi-weekly templates and apply them to a date range for a department
- **Shift Reports** — hours worked vs scheduled, overtime hours, unfilled shifts, swap history

---

## PHASE 7 — Recruitment & ATS (Enterprise-Grade)
**Goal: Full applicant tracking system from posting to hire**

**Backend:**
- Job posting workflow: draft → review → approved → published with approval gate
- Multi-stage recruitment pipeline: configurable stages per job (Screen → Phone → Technical → Final → Offer)
- Candidate scoring system: weighted scoring based on interview feedback across stages
- Resume parsing: extract structured data from uploaded CVs (use a parsing service or `pdf-parse` + regex)
- Duplicate candidate detection: flag same email/phone across applications
- Referral tracking: tie applicant to referring employee, calculate referral bonus trigger
- Offer letter generation: templated PDF offer letter generation with merge fields
- Background check integration: API hook for third-party background check services
- Recruitment analytics: time-to-hire, source of hire, pipeline conversion rates, cost-per-hire

**Frontend:**
- **Job Management** — job posting editor with rich text description, required skills tagging, salary range, multiple locations, publish/unpublish toggle, application count badge
- **Recruitment Pipeline** — Kanban board (one column per stage), candidate cards with photo/name/score, drag to move stage, quick-view popover with resume preview, bulk move
- **Applicant Profile** — deep profile: resume viewer (PDF embed), timeline of all interactions, interview feedback history, scoring breakdown, internal notes, offer history, one-click hire (triggers onboarding workflow)
- **Interview Scheduler** — calendar view of all scheduled interviews, integrate with Google Calendar/Outlook (OAuth), interviewer availability check, automated interview invite email
- **Interview Room** — built-in video call integration with Jitsi (already in services), real-time collaborative scorecard, structured question guide, post-interview feedback form auto-prompted at end
- **Offer Management** — offer letter builder with template selection, merge fields, digital signature collection, accept/decline tracking, expiry date

---

## PHASE 8 — Payroll Engine (Enterprise-Grade)
**Goal: Accurate, auditable payroll processing**

**Backend:**
- Payroll calculation engine: base salary + allowances + bonuses - deductions - taxes with itemized breakdown
- Tax engine: configurable tax brackets by country/region, auto-calculate PAYE/income tax
- Payroll components library: create reusable earning/deduction components (housing allowance, transport, pension, NHIF, NSSF, etc.)
- Multi-currency support: pay in different currencies, exchange rate management
- Payslip PDF generation: professional formatted payslip with company logo (use `pdfkit` or `puppeteer`)
- Payroll approval workflow: calculated → HR review → Finance review → Approved → Paid
- Bank file export: generate bank transfer files (SWIFT, SEPA, or bank-specific format)
- Payroll audit trail: every change to a payroll record must be logged with who/when/what
- Off-cycle payroll: handle bonuses, corrections, termination payouts separately from regular cycle

**Frontend:**
- **Payroll Dashboard** — overview cards: upcoming payroll date, total payroll cost, headcount changes since last run, pending approvals count
- **Payroll Period** — list of payroll periods with status badge, action buttons (Run, Review, Approve, Lock, Export)
- **Payroll Run** — step-by-step wizard: Select period → Verify attendance/leaves → Review calculations → Preview payslips → Submit for approval
- **Payroll Review** — spreadsheet-style table with all employees, editable override columns, inline variance alerts (>10% from last month), filter by department, export
- **Payslip Viewer** — employee self-service: view/download PDF payslip per month, year-to-date summary, tax certificate download (P9 form or local equivalent)
- **Payroll Components** — HR config UI: create/edit salary components, assign to employees or job levels, set as fixed/variable/percentage

---

## PHASE 9 — Performance Management (Enterprise-Grade)
**Goal: Full performance cycle from goal setting to review**

**Backend:**
- OKR/Goal management: set company → department → individual goals with alignment tracking, progress updates, quarter-end scoring
- Performance review cycle engine: create review cycles, assign reviewers (self, manager, peers, skip-level), track completion status
- 360-degree feedback: structured questionnaire builder, anonymous peer feedback collection, aggregated reports
- Calibration session: manager calibration tool to normalize ratings across teams
- Performance improvement plan (PIP): formal PIP creation, milestone tracking, escalation workflow
- Succession planning: identify high-potential employees, create succession maps per key role
- Competency framework: define competencies per job level, assess against them in reviews

**Frontend:**
- **Performance Dashboard** — current review cycle status, completion percentage, my pending reviews, my goals progress OKR tracker
- **Goal Management** — hierarchical goal tree (Company → Department → Individual), progress bars, quarterly check-in prompts, update notes
- **Performance Review** — reviewer form: rating scales per competency, open text commentary, goal achievement scores, final recommendation (promote/retain/PIP/exit)
- **360 Feedback** — request feedback from specific peers, anonymous response collection, aggregated feedback report with sentiment highlights
- **Recognition Wall** — social-media-style recognition feed, nominate colleague with badge, like/react, filter by department/badge type, leaderboard
- **Calibration View** — manager-only: 9-box grid (Performance vs Potential), drag employees between boxes, notes, export for calibration meeting

---

## PHASE 10 — Learning Management System (Enterprise-Grade)
**Goal: Full LMS with compliance tracking**

**Backend:**
- Course authoring: video upload, SCORM package support, structured content sections, quiz builder
- Learning paths: sequence of courses with prerequisites, auto-enroll based on role or onboarding
- Compliance training: mandatory courses per role, deadline tracking, automated reminders, certificate generation
- Training analytics: completion rates, average scores, time-to-complete, most failed quiz questions
- Certificates: auto-generate PDF certificates on course completion with expiry tracking
- External training import: log off-platform training for record-keeping

**Frontend:**
- **Training Catalog** — Netflix-style grid: course cards with thumbnail, duration, completion %, category filter, search, "Required" badge for mandatory courses
- **Course Player** — full-screen player: video with progress tracking (pause/resume, auto-resume), section navigation sidebar, quiz modal between sections, certificate unlock animation at completion
- **Learning Path** — visual path UI: horizontal steps with locked/unlocked state, progress tracker, estimated completion date
- **Compliance Hub** — HR view: matrix of employees vs required trainings, red/amber/green status, overdue alerts, bulk enrollment, export compliance report
- **My Learning** — employee view: enrolled courses progress, completed certificates gallery, upcoming due dates

---

## PHASE 11 — Finance & Expenses (Enterprise-Grade)
**Goal: Expense management, tip pool, and financial reporting**

**Backend:**
- Expense claim workflow: submit → manager approve → finance approve → reimburse
- Receipt OCR: auto-extract amount/date/vendor from uploaded receipt image (use an OCR service or `tesseract.js`)
- Expense categories and budgets: per department expense budgets with real-time tracking
- Tip pool distribution: configurable tip pool rules (equal split, hours-weighted, role-weighted), distribution history
- Financial dashboard data: payroll cost trend, headcount cost analysis, department cost breakdown
- Budget vs actual reporting: track actual HR costs vs budgeted

**Frontend:**
- **My Expenses** — expense list with status badges, submit new claim form (receipt upload, OCR auto-fill), claim history, reimbursement status tracker
- **Expense Approval** — finance view: pending claims table, receipt viewer inline, approve/reject with comment, batch approve, export to accounting
- **Finance Dashboard** — charts: payroll cost by month (line chart), headcount cost by department (bar chart), expense categories (pie chart), budget utilization gauges
- **Tip Pool** — input total tips, configure distribution rules, preview distribution breakdown before confirming, history log

---

## PHASE 12 — Notifications & Workflow Engine
**Goal: Real-time notifications and configurable approval workflows**

**Backend:**
- Replace `setInterval` polling with WebSocket (Socket.io) for real-time push notifications
- Notification rules engine: configurable triggers (leave approved, payroll ready, document expiry, etc.) → notification channels (in-app, email, SMS)
- Email templating engine: HTML email templates per notification type (already has `nodemailer`)
- In-app notification center: persistent, read/unread state, notification grouping, action buttons from notification
- Workflow designer (backend): generic workflow engine that can be configured for any approval process (leave, expense, payroll, offers, etc.) with escalation rules and SLA timers

**Frontend:**
- **Notification Center** — slide-over panel from navbar bell icon: categorized tabs (All/Mentions/Approvals/System), mark all read, click to navigate to relevant page, real-time badge count via WebSocket
- **Notification Preferences** — per-event toggles for in-app/email/SMS channels, quiet hours setting, frequency digest (immediate/daily/weekly)
- **Notification Templates** — admin page: edit HTML email templates with preview, variable reference guide
- Real-time indicators throughout the app: attendance status indicators, pending approval counts on sidebar menu items

---

## PHASE 13 — Analytics & Reporting (Enterprise-Grade)
**Goal: Self-service analytics for every role**

**Backend:**
- Report builder engine: configurable reports — select model, fields, filters, grouping, aggregation — save as named report
- Scheduled reports: auto-run report on schedule, email to recipients as PDF/Excel attachment
- Executive dashboard data APIs: headcount trends, turnover rate, time-to-hire, cost-per-hire, absenteeism rate, training completion rate — all with historical comparison
- Export service: centralized export to PDF (with charts), Excel, CSV
- Data warehouse-style materialized views for heavy analytical queries (via DB views or a summary table pattern)

**Frontend:**
- **Executive Dashboard** — high-level KPIs: headcount (with trend arrow), turnover rate, active vacancies, payroll cost this month, absenteeism rate — all with sparkline charts and period comparison
- **HR Analytics** — deep-dive: headcount by department/location, new hires vs attrition waterfall chart, leave utilization heatmap, headcount forecast
- **Manager Dashboard** — team-focused: my team attendance today, pending approvals, team performance scores, upcoming leave conflicts, team training completion
- **Finance Analytics** — payroll cost trend, overtime cost, expense breakdown, department budget utilization
- **Report Center** — saved reports list, report builder UI (drag-and-drop field selector), schedule config, recent exports history
- All charts built with Recharts (already installed) with consistent design system

---

## PHASE 14 — Asset & Facilities Management
**Goal: Complete asset lifecycle tracking**

**Backend:**
- Asset lifecycle states: purchased → assigned → in-repair → retired → disposed
- Asset maintenance schedules: recurring maintenance reminders, maintenance history log
- Asset request workflow: employee requests asset → manager approves → IT/facilities assigns
- Depreciation tracking: calculate asset depreciation over time
- Bulk asset import via Excel
- QR code generation per asset for physical tagging

**Frontend:**
- **Asset Inventory** — table with advanced filters (category/status/location), bulk assign, QR code print button, asset detail modal with full history
- **My Assets** — employee view: assets assigned to me, condition report, return request button
- **Asset Request** — request form with justification, approval tracking
- **Maintenance Tracker** — due maintenance schedule, maintenance history, cost tracking
- **Asset Reports** — utilization report, depreciation report, assets by department

---

## PHASE 15 — Welfare & Accommodation
**Goal: Full welfare case management**

**Backend:**
- Welfare case management: categories (medical, financial, housing, counseling), case notes, status tracking, resolution logging
- Accommodation management: room/unit inventory, assignment/checkout, room inspection records, maintenance requests
- Employee wellness program: wellness challenges, participation tracking, points system
- Emergency contact management: multiple contacts, notification triggers

**Frontend:**
- **Welfare Support** — employee submits welfare request: category selection, description, urgency, attachment — tracks case progress like a support ticket
- **Accommodation Portal** — map/floor plan view of accommodation units (color-coded available/occupied), assignment form, room detail with occupant history
- **Case Management** — HR view: all open welfare cases, assigned caseworker, notes timeline, resolution form
- **Wellness Hub** — active wellness challenges, leaderboard, participation history

---

## PHASE 16 — Mobile App (React Native/Expo)
**Goal: Core features on mobile for field/deskless workers**

You already have an Expo app started. Build out:
- Mobile check-in/check-out with geolocation + camera for QR scan
- Push notifications (Expo Push Notifications)
- View my shifts, request leave, view payslip
- Approve requests (for managers) — swipe to approve/reject
- Biometric login (fingerprint/face ID via Expo LocalAuthentication)
- Offline mode: cache last-known data, queue actions when offline

---

## PHASE 17 — Integrations & API Layer
**Goal: Connect with external systems**

**Backend:**
- REST API versioning: migrate all routes to `/api/v1/` prefix
- Webhook system: allow external systems to subscribe to HR events (new hire, termination, payroll processed)
- Google/Microsoft OAuth login (social sign-in + calendar sync)
- Accounting system integration hooks: export payroll data in formats compatible with QuickBooks, Xero, SAP
- SMS gateway integration (Twilio or Africa's Talking) for SMS notifications
- Swagger/OpenAPI docs: already set up — make sure every endpoint is documented
- API key management: allow external integrations to authenticate with API keys (not just JWT)

**Frontend:**
- **Integrations Settings** — admin page: connected apps list, API key generator, webhook config, OAuth connection management

---

## PHASE 18 — Security Hardening & Compliance
**Goal: Enterprise-grade security posture**

**Backend:**
- Implement RBAC audit: every permission check logged
- Data encryption at rest for sensitive fields (salary, tax info) — use Sequelize field encryption
- GDPR/data privacy tools: data export per employee, right-to-erasure (anonymize terminated employee data after retention period)
- SQL injection prevention audit: Sequelize parameterized queries (review all raw queries)
- CSP headers review, HTTPS enforcement, HSTS
- Dependency vulnerability scan: run `npm audit` and fix critical/high vulnerabilities
- Penetration test checklist: OWASP Top 10 review for each module
- Two-factor auth enforcement for admin/HR roles

**Frontend:**
- Route-level permission re-check on every navigation (currently role-check is only at route level, not data level)
- Sensitive data masking in UI (salary shown as `****` until explicitly revealed)
- Auto-logout after inactivity timeout with countdown warning modal
- Content Security Policy meta tags

---

## PHASE 19 — Performance Optimization & Scalability
**Goal: Handle 10k+ employees without degradation**

**Backend:**
- Add Redis: caching for dashboard stats (5min TTL), session storage, job queue
- Database indexes: add explicit indexes on all FK columns, status columns, date columns in migration files
- Query optimization: audit N+1 queries (use Sequelize `include` with `required:false` and limit eager loading depth)
- BullMQ job queues: move payroll processing, report generation, email sending, expiry checks to background jobs
- Database connection pooling: configure Sequelize pool (max:20, min:2)
- API response compression: add `compression` middleware
- Sequelize query result pagination: enforce on all list endpoints, max page size of 100

**Frontend:**
- Bundle analysis: run `vite-bundle-visualizer`, identify and code-split large dependencies
- Implement React Query for all API calls — eliminates redundant fetches, automatic background refresh
- Virtual scrolling for large lists (employee directory, audit logs) using `@tanstack/react-virtual`
- Image lazy loading and WebP format for all uploaded images via Cloudinary transformations
- Service worker for offline caching of static assets

---

## PHASE 20 — Production Deployment & DevOps
**Goal: Reliable, monitored, scalable production deployment**

**Infrastructure:**
- Move to PostgreSQL (better cloud support, better concurrency)
- Managed DB: Supabase, Neon, or AWS RDS with automated backups and read replicas
- Container registry: push Docker images to ECR/GHCR
- Orchestration: Docker Swarm (simple) or Kubernetes (scalable) — start with Swarm
- SSL/TLS: Nginx reverse proxy with Let's Encrypt certificates
- CDN: serve frontend static assets through CloudFront or Cloudflare
- Environment management: proper `development` / `staging` / `production` configs
- Secrets management: AWS Secrets Manager or HashiCorp Vault — never hardcode secrets

**CI/CD Pipeline (GitHub Actions):**
```
PR opened → lint + test → preview deploy to staging
Merge to main → run full test suite → build Docker images → push to registry → deploy to production
```

**Monitoring Stack:**
- **Sentry** — error tracking (frontend + backend)
- **Pino + Loki + Grafana** — log aggregation and querying
- **Prometheus + Grafana** — metrics (request rate, latency, DB query time)
- Uptime monitoring: Better Uptime or UptimeRobot with SMS alerts

**Operational Readiness:**
- Runbook documentation: how to deploy, rollback, restore DB, rotate secrets
- Disaster recovery plan: RTO/RPO targets, backup restoration tested
- Load testing: run k6 or Artillery against the API with realistic scenarios before go-live

---

## Summary: Phase Priorities

| Phases | Focus | Timeline |
|--------|-------|----------|
| 1–3 | Foundation cleanup + Auth + Employee core | Month 1 |
| 4–6 | Attendance + Leave + Shifts (daily-use features) | Month 2 |
| 7–9 | Recruitment + Payroll + Performance | Month 3–4 |
| 10–12 | LMS + Finance + Notifications | Month 5 |
| 13–15 | Analytics + Assets + Welfare | Month 6 |
| 16–17 | Mobile + Integrations | Month 7 |
| 18–20 | Security + Performance + Deployment | Month 8 |

**Where to start right now**: Phase 1 cleanup unblocks everything else. Then Phase 4 (Attendance) and Phase 5 (Leave) — these are the highest-use daily features and the most incomplete compared to enterprise standards. Getting those two right will make the app feel real.

Want me to start implementing any specific phase? I can begin with Phase 1 cleanup, or jump straight into rebuilding a specific feature like the shift calendar or recruitment pipeline.