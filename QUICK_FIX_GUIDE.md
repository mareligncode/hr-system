# 🔧 Quick Fix Guide - PDF Reports 404 Error

## ❌ Problem
- Clicking PDF button shows **404 error**
- Console shows: `Failed to load resource: the server responded with a status of 404 (Not Found)`
- Route `/api/reports/export-pdf/employee-headcount` not found

## ✅ Solution

### Step 1: Install pdfkit (DONE ✅)
```bash
cd D:\hr-system\backend
npm install pdfkit
```
**Status**: ✅ Already installed

---

### Step 2: Restart Backend Server

#### Option A: If using npm
```bash
# Open terminal in D:\hr-system\backend
cd D:\hr-system\backend

# Stop any running server (Ctrl+C if running in terminal)

# Start server
npm start
```

#### Option B: If using nodemon
```bash
cd D:\hr-system\backend
npm run dev
```

#### Option C: If using PM2
```bash
pm2 restart hr-backend
# or
pm2 restart all
```

#### Option D: If using Windows Task Manager
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find "node.exe" processes
3. End all node processes
4. Restart: `cd D:\hr-system\backend && npm start`

---

### Step 3: Verify Server Started
You should see in terminal:
```
Server running on port 5000 [development]
Database connected
```

---

### Step 4: Test PDF Export

1. **Open browser**: http://localhost:5000/api/health
   - Should show: `{"status":"ok","db":"connected",...}`

2. **Login to HR System**: http://localhost:3000

3. **Navigate to Report Center**:
   - Dashboard → Reports → Report Center

4. **Click PDF button** on any report

5. **Expected result**: PDF file downloads automatically

---

## 🐛 If Still Not Working

### Check 1: Verify Backend is Running
```bash
# In browser or Postman
GET http://localhost:5000/api/health
```

**Expected**: 
```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 123,
  "timestamp": "2026-08-02T..."
}
```

**If 404**: Backend not running → Start it

---

### Check 2: Verify Route Exists
```bash
# Check if file exists
dir D:\hr-system\backend\services\reportPDFService.js
```

**Expected**: File should exist

**If missing**: The file wasn't created → Recreate it

---

### Check 3: Check Backend Console for Errors
Look for error messages in backend terminal:
- `Cannot find module 'pdfkit'` → Run `npm install pdfkit`
- `Module not found: reportPDFService` → Check import path
- Syntax errors → Check code formatting

---

### Check 4: Verify Import in Controller
Open `D:\hr-system\backend\controllers\reportController.js`

Should have at line ~16:
```javascript
import ReportPDFService from '../services/reportPDFService.js';
```

---

### Check 5: Test API Directly
```bash
# In browser or Postman (must be logged in)
GET http://localhost:5000/api/reports/export-pdf/employee-headcount
```

**Expected**: PDF file downloads

**If 401**: Need to login first
**If 403**: Check user role (must be admin/hr/finance)
**If 404**: Route not loaded → Restart server
**If 500**: Server error → Check backend console

---

## 🎯 Quick Restart Commands

### Windows PowerShell:
```powershell
# Navigate to backend
cd D:\hr-system\backend

# Kill any node processes
taskkill /F /IM node.exe

# Start server
npm start
```

### Windows CMD:
```cmd
cd D:\hr-system\backend
taskkill /F /IM node.exe
npm start
```

---

## 📝 Verification Checklist

After restart, verify:
- [ ] Backend terminal shows "Server running on port 5000"
- [ ] http://localhost:5000/api/health returns 200 OK
- [ ] Frontend can load (http://localhost:3000)
- [ ] Can login successfully
- [ ] Report Center page loads
- [ ] Clicking PDF button downloads file
- [ ] PDF opens correctly with data

---

## 🚨 Common Errors & Fixes

### Error: "Cannot find module 'pdfkit'"
**Fix**: 
```bash
cd D:\hr-system\backend
npm install pdfkit
npm start
```

---

### Error: "404 Not Found"
**Fix**: Server not restarted after adding new routes
```bash
# Restart backend server
Ctrl+C (stop)
npm start
```

---

### Error: "403 Forbidden"
**Fix**: User doesn't have permission
- Login as **Admin**, **HR**, or **Finance** role
- Employees and Managers don't have access to all reports

---

### Error: "500 Internal Server Error"
**Fix**: Check backend console for actual error
Common causes:
1. Database connection failed
2. Missing data in database
3. Syntax error in code

---

## 🔍 Debug Mode

### Enable Detailed Logging:
Edit `backend/server.js` or add console.log in:
- `backend/controllers/reportController.js` → `exportReportPDF` function
- `backend/routes/reportRoutes.js` → route definition

Example:
```javascript
export const exportReportPDF = async (req, res) => {
    console.log('PDF Export called:', req.params.type);
    try {
        const { type } = req.params;
        console.log('Generating PDF for:', type);
        
        // ... rest of code
    } catch (error) {
        console.error('PDF Export Error:', error);
        // ... error handling
    }
};
```

---

## 📱 Contact Points

### Check These Files:
1. `backend/services/reportPDFService.js` - PDF generator
2. `backend/controllers/reportController.js` - Export endpoint
3. `backend/routes/reportRoutes.js` - Route definition
4. `frontned/src/services/reportService.js` - API call
5. `frontned/src/pages/admin/ReportCenter.jsx` - UI component

### Dependencies Required:
```json
{
  "pdfkit": "^0.13.0"
}
```

---

## ✅ Success Indicators

When everything works:
1. ✅ Backend starts without errors
2. ✅ Health check returns OK
3. ✅ PDF button shows loading spinner
4. ✅ Toast notification: "Generating PDF report..."
5. ✅ Toast notification: "PDF report downloaded successfully!"
6. ✅ PDF file appears in Downloads folder
7. ✅ PDF opens with correct data and formatting

---

## 🎯 Final Steps

1. **Stop backend** (Ctrl+C in terminal)
2. **Verify pdfkit installed**: `npm list pdfkit` (should show version)
3. **Start backend**: `npm start`
4. **Wait for "Server running" message**
5. **Test PDF export** in browser
6. **Check browser Downloads folder** for PDF file

---

**Need Help?**
- Check backend terminal for error messages
- Check browser console (F12) for frontend errors
- Verify you're logged in as Admin/HR role
- Make sure backend is running on port 5000
- Make sure frontend is running on port 3000

---

**Last Updated**: 2026-08-02  
**Status**: pdfkit installed ✅  
**Next**: Restart backend server  
