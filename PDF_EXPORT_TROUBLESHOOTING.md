# 🔧 PDF Export Troubleshooting Guide

## 🎯 Current Issue Summary

**Symptoms**:
- Clicking PDF button does nothing
- Browser console shows: `404 (Not Found)`
- Error: `Failed to load resource: /api/reports/export-pdf/employee-headcount`

**Root Cause**: Backend server not restarted after adding new PDF routes

---

## ✅ SOLUTION (Quick Fix)

### Windows Users - Use the Batch File:
1. Double-click `restart-backend.bat` in the project root
2. Wait for "Server running on port 5000"
3. Keep terminal window open
4. Test PDF export in browser

### Manual Method:

```bash
# 1. Open PowerShell/CMD in D:\hr-system\backend
cd D:\hr-system\backend

# 2. Stop any running Node processes
# Press Ctrl+C if server is running in a terminal
# OR use Task Manager to end node.exe processes

# 3. Start server
npm start

# 4. You should see:
# "Server running on port 5000 [development]"
# "Database connected"
```

---

## 📋 Step-by-Step Fix

### Step 1: Verify pdfkit is Installed ✅
```bash
cd D:\hr-system\backend
npm list pdfkit
```

**Expected output**: 
```
backend@1.0.0 D:\hr-system\backend
└── pdfkit@0.13.0
```

**Status**: ✅ Already installed (completed)

---

### Step 2: Restart Backend Server ⏳
```bash
# In D:\hr-system\backend directory

# Option A: If server running in terminal
Ctrl+C (to stop)
npm start (to start)

# Option B: If server running in background
taskkill /F /IM node.exe
npm start

# Option C: Use the restart-backend.bat file
# Double-click restart-backend.bat
```

**What to look for**:
```
✓ Server running on port 5000 [development]
✓ Database pool connected
```

---

### Step 3: Verify Backend is Responding
**Open browser**:
```
http://localhost:5000/api/health
```

**Expected response**:
```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 10,
  "timestamp": "2026-08-02T12:00:00.000Z",
  "env": "development"
}
```

✅ **If you see this**: Backend is working!
❌ **If connection refused**: Backend not running → Go back to Step 2
❌ **If database error**: Check MySQL is running

---

### Step 4: Test PDF Route Directly
**In browser (must be logged in first)**:
```
http://localhost:5000/api/reports/export-pdf/employee-headcount
```

**Expected**: PDF file downloads automatically

**Possible responses**:
- ✅ **PDF downloads**: Success! Route is working
- ❌ **401 Unauthorized**: Need to login first
- ❌ **403 Forbidden**: Wrong role (need admin/hr/finance)
- ❌ **404 Not Found**: Server not restarted → Go to Step 2
- ❌ **500 Server Error**: Check backend console for errors

---

### Step 5: Test in Report Center UI

1. **Login** to HR System: http://localhost:3000
2. **Navigate**: Dashboard → Reports → Report Center
3. **Click PDF button** on "Employee Headcount" report
4. **Observe**:
   - Loading spinner appears
   - Toast notification: "Generating PDF report..."
   - PDF downloads automatically
   - Toast notification: "PDF report downloaded successfully!"

---

## 🐛 Detailed Troubleshooting

### Issue: Backend Won't Start

**Error**: `Error: Cannot find module 'pdfkit'`
```bash
cd D:\hr-system\backend
npm install pdfkit
npm start
```

**Error**: `Port 5000 is already in use`
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# Or kill all node processes
taskkill /F /IM node.exe

# Then start again
npm start
```

**Error**: `Database connection failed`
```bash
# Check MySQL is running
# Windows: Services → MySQL → Start

# Or restart MySQL
net stop MySQL80
net start MySQL80
```

---

### Issue: 404 Not Found (After Server Restart)

**Verify file exists**:
```bash
dir D:\hr-system\backend\services\reportPDFService.js
```

**If file missing**: File wasn't created properly

**Check imports in reportController.js**:
```javascript
// Should have this import at top:
import ReportPDFService from '../services/reportPDFService.js';

// Should have this function:
export const exportReportPDF = async (req, res) => { ... }
```

**Check routes in reportRoutes.js**:
```javascript
// Should have this route:
router.get('/export-pdf/:type', 
    authorize('admin', 'hr', 'finance', 'manager'), 
    exportReportPDF
);
```

---

### Issue: 403 Forbidden

**Cause**: User doesn't have permission

**Fix**: Login with correct role
- ✅ **Admin** - Full access
- ✅ **HR** - Full access
- ✅ **Finance** - Financial reports only
- ✅ **Manager** - Team reports only
- ❌ **Employee** - No access

**Check your role**:
1. Login to HR system
2. Check top-right corner for your name/role
3. If wrong role, logout and login with admin account

---

### Issue: 500 Internal Server Error

**Check backend console** for error details:

**Common errors**:

1. **Syntax Error in reportPDFService.js**
```
SyntaxError: Unexpected token
```
Fix: Check for typos, missing brackets, etc.

2. **Database Query Error**
```
SequelizeDatabaseError: ...
```
Fix: Check database has data (employees, departments, etc.)

3. **Missing Dependencies**
```
Error: Cannot find module ...
```
Fix: `npm install` in backend directory

---

### Issue: PDF Downloads but is Empty/Corrupted

**Check**:
1. Backend console for errors during generation
2. Database has actual data
3. PDF opens with Adobe Reader or browser PDF viewer

**Test with small dataset**: Try exporting when there's only 1-2 employees

---

### Issue: Loading Spinner Stuck

**Causes**:
1. Request timing out (large dataset)
2. Backend crashed
3. Network issue

**Debug**:
```bash
# Check backend console for errors
# Check browser Network tab (F12)
# Look for failed requests
```

---

## 🧪 Testing Each Report Type

### Test Employee Headcount
```
URL: http://localhost:5000/api/reports/export-pdf/employee-headcount
Required: At least 1 employee in database
Expected: PDF with employee list and statistics
```

### Test Payroll Summary
```
URL: http://localhost:5000/api/reports/export-pdf/payroll-summary
Required: At least 1 payroll period with status 'approved'
Expected: PDF with payroll breakdown
```

### Test Attendance Summary
```
URL: http://localhost:5000/api/reports/export-pdf/attendance-summary?startDate=2026-07-01&endDate=2026-07-31
Required: startDate and endDate parameters, attendance records
Expected: PDF with attendance data
```

### Test Leave Summary
```
URL: http://localhost:5000/api/reports/export-pdf/leave-summary?startDate=2026-07-01&endDate=2026-07-31
Required: startDate and endDate parameters, leave requests
Expected: PDF with leave data
```

### Test Recruitment Summary
```
URL: http://localhost:5000/api/reports/export-pdf/recruitment-summary
Required: At least 1 job posting
Expected: PDF with recruitment data
```

---

## 📊 Verification Matrix

| Check | Status | Fix |
|-------|--------|-----|
| pdfkit installed | ✅ DONE | `npm install pdfkit` |
| Backend restarted | ⏳ TODO | See Step 2 |
| Health check OK | ⏳ TODO | `http://localhost:5000/api/health` |
| PDF route works | ⏳ TODO | Test in browser |
| UI button works | ⏳ TODO | Test in Report Center |

---

## 🎯 Success Criteria

When everything works correctly:

1. ✅ Backend console shows no errors
2. ✅ Health check returns 200 OK
3. ✅ PDF route returns PDF file (not 404)
4. ✅ Report Center PDF button works
5. ✅ Loading spinner shows briefly
6. ✅ Toast notifications appear
7. ✅ PDF downloads to Downloads folder
8. ✅ PDF opens and displays data correctly
9. ✅ Charts and tables are formatted
10. ✅ All 5 report types work

---

## 🔍 Debugging Tools

### Backend Logs
```bash
# Check console output in backend terminal
# Look for:
# - "Server running on port 5000"
# - Any error messages in red
# - Request logs when clicking PDF button
```

### Browser DevTools
```bash
# Open browser DevTools (F12)
# Go to Console tab
# Look for errors (red text)
# Go to Network tab
# Click PDF button
# Watch for request to /api/reports/export-pdf/...
# Check Status Code (should be 200)
```

### Test with Postman
```bash
# Install Postman
# Create new GET request
# URL: http://localhost:5000/api/reports/export-pdf/employee-headcount
# Add Authorization header with JWT token
# Send request
# Should download PDF file
```

---

## 📞 Quick Support Checklist

Before asking for help, verify:

- [ ] pdfkit is installed (`npm list pdfkit`)
- [ ] Backend server is running (terminal shows "Server running")
- [ ] Health check works (`http://localhost:5000/api/health`)
- [ ] You're logged in as Admin or HR
- [ ] Database has data (at least 1 employee)
- [ ] MySQL is running
- [ ] No firewall blocking port 5000
- [ ] No antivirus blocking npm/node
- [ ] Browser console shows actual error message
- [ ] Backend console shows actual error message

---

## 🚀 Next Steps After Fix

Once PDF export works:

1. ✅ Test all 5 report types
2. ✅ Test with different user roles
3. ✅ Test with large datasets (100+ records)
4. ✅ Test Excel export still works
5. ✅ Verify PDFs print correctly
6. ✅ Train users on new feature
7. ✅ Monitor for errors in production
8. ✅ Gather user feedback

---

## 📚 Related Documentation

- **Complete Guide**: `docs/PDF_REPORTS_IMPLEMENTATION.md`
- **Quick Summary**: `docs/REPORTS_PDF_SUMMARY.md`
- **Deployment**: `docs/DEPLOYMENT_INSTRUCTIONS.md`
- **API Docs**: Backend controller comments

---

## ✅ Current Status

- [x] pdfkit installed
- [ ] Backend restarted → **DO THIS NOW**
- [ ] PDF routes working
- [ ] UI tested

**Next Action**: Run `restart-backend.bat` or manually restart backend server

---

**Last Updated**: 2026-08-02  
**Issue**: 404 - Routes not loaded  
**Fix**: Restart backend server  
**ETA**: 2 minutes  
