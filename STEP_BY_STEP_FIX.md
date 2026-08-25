# 🔧 Step-by-Step Fix for PDF Export 404 Error

## 📌 Current Status
- ✅ pdfkit installed
- ✅ Code files created
- ✅ Routes configured
- ❌ **Backend server not running OR needs restart**

---

## 🎯 Simple 3-Step Fix

### Step 1: Check if Backend is Running

**Double-click**: `test-backend.bat`

**You'll see one of two results:**

#### Result A: Backend is RUNNING ✅
```
✓ Backend is RUNNING on port 5000
{
  "status": "ok",
  "db": "connected",
  ...
}
```
**If you see this**: Backend is working! Go to Step 3.

#### Result B: Backend is NOT RUNNING ❌
```
✗ Backend is NOT RUNNING

Please start the backend server:
  1. Open new terminal
  2. cd D:\hr-system\backend
  3. npm start
```
**If you see this**: Go to Step 2.

---

### Step 2: Start/Restart Backend Server

#### Method A: Use Restart Script (Recommended)
1. **Double-click**: `restart-backend.bat`
2. **Wait** for message: "Server running on port 5000"
3. **Keep terminal open** (don't close it)
4. Go to Step 3

#### Method B: Manual Terminal
1. Open **new** PowerShell or CMD terminal
2. Type these commands:
```bash
cd D:\hr-system\backend
npm start
```
3. Wait for: "Server running on port 5000"
4. Keep terminal open
5. Go to Step 3

---

### Step 3: Test PDF Export

1. **Open browser**: http://localhost:3000
2. **Login** (if not already logged in)
3. **Navigate**: Dashboard → Reports → Report Center
4. **Click** the red **PDF** button on any report
5. **Wait** for download

**Expected Result**: 
- Loading spinner appears
- Toast: "Generating PDF report..."
- PDF downloads automatically
- Toast: "PDF report downloaded successfully!"
- File appears in Downloads folder

**If still 404**: See troubleshooting below

---

## 🔍 Troubleshooting

### Issue: Still Getting 404 After Restart

#### Check 1: Is Backend Really Running?
```bash
# Open browser and go to:
http://localhost:5000/api/health
```

**Should see**:
```json
{"status":"ok","db":"connected",...}
```

**If connection refused**: Backend not running → Go back to Step 2

---

#### Check 2: Are You Logged In?
1. Check top-right corner of website
2. Should see your name
3. If not logged in, click Login

---

#### Check 3: Do You Have Permission?
- Must be logged in as **Admin**, **HR**, or **Finance**
- Employees cannot access Report Center
- Managers can access only some reports

**Check your role**:
1. Top-right corner → Your Name
2. Check what role is displayed
3. If wrong role, logout and login as admin

---

#### Check 4: Check Browser Console
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Click PDF button again
4. Look at the error message

**Common errors**:
- `404`: Backend not running or route not loaded
- `401`: Not logged in
- `403`: Wrong role/permission
- `500`: Server error (check backend terminal)

---

#### Check 5: Check Backend Terminal
Look at the terminal where backend is running.

**After clicking PDF button, you should see**:
```
POST /api/auth/... 200
GET /api/reports/export-pdf/employee-headcount 200
```

**If you see**:
- `404`: Route not found → Server needs restart
- `500`: Server error → Check error message
- Nothing: Request not reaching backend → Check network

---

### Issue: Backend Won't Start

#### Error: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix**:
```bash
# Kill process on port 5000
taskkill /F /IM node.exe

# Then start again
npm start
```

---

#### Error: Cannot Find Module
```
Error: Cannot find module 'pdfkit'
```

**Fix**:
```bash
cd D:\hr-system\backend
npm install pdfkit
npm start
```

---

#### Error: Database Connection Failed
```
Error: Connection to database failed
```

**Fix**:
1. Check MySQL is running
2. Windows Services → MySQL → Start
3. Or restart: `net stop MySQL80` then `net start MySQL80`
4. Then restart backend: `npm start`

---

## 📋 Complete Verification Checklist

Run through this checklist:

### Backend:
- [ ] Terminal shows "Server running on port 5000"
- [ ] http://localhost:5000/api/health returns OK
- [ ] No red error messages in terminal
- [ ] pdfkit is installed (`npm list pdfkit`)

### Frontend:
- [ ] Website loads: http://localhost:3000
- [ ] Can login successfully
- [ ] Top-right shows your name/role
- [ ] Report Center page loads
- [ ] Can see list of reports with PDF buttons

### PDF Export:
- [ ] Click PDF button
- [ ] Loading spinner appears
- [ ] No 404 error in console (F12)
- [ ] Toast notification appears
- [ ] PDF file downloads
- [ ] PDF opens and has data

---

## 🎬 Visual Guide

### What You Should See:

#### 1. Backend Terminal (After Start)
```
> npm start

Server running on port 5000 [development]
Database pool connected
Ready to accept requests
```
✅ **This is correct** - Backend is running

---

#### 2. Health Check (Browser)
**URL**: http://localhost:5000/api/health

**Response**:
```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 45,
  "timestamp": "2026-08-02T10:30:00.000Z",
  "env": "development"
}
```
✅ **This is correct** - Backend is healthy

---

#### 3. Report Center Page
You should see:
- List of 15 reports
- Each report has two buttons:
  - Red **PDF** button (with file icon)
  - Green **Excel** button (with download icon)

---

#### 4. After Clicking PDF
You should see:
1. Loading spinner on button
2. Toast notification (top-right): "Generating PDF report..."
3. After 1-3 seconds: PDF downloads
4. Toast changes to: "PDF report downloaded successfully!"
5. Check Downloads folder for: `report-employee-headcount-[number].pdf`

---

## 🚀 Quick Commands Reference

### Test Backend:
```bash
curl http://localhost:5000/api/health
```

### Start Backend:
```bash
cd D:\hr-system\backend
npm start
```

### Install Dependencies:
```bash
cd D:\hr-system\backend
npm install pdfkit
```

### Kill Node Processes:
```bash
taskkill /F /IM node.exe
```

### Check Running Processes:
```bash
tasklist | findstr node
```

---

## 💡 Pro Tips

1. **Keep backend terminal open** while using the app
2. **Watch backend logs** when clicking PDF button
3. **Check browser Network tab** (F12 → Network) to see actual requests
4. **Test with Postman** if browser fails
5. **Clear browser cache** if weird issues occur
6. **Try incognito mode** to rule out extension issues

---

## 📞 Still Not Working?

If you've tried everything and it still doesn't work:

### Collect Debug Info:
1. **Backend terminal output** (copy error messages)
2. **Browser console errors** (F12 → Console, screenshot)
3. **Network tab** (F12 → Network, screenshot failed request)
4. **Your role** (what shows in top-right corner)
5. **Health check result** (http://localhost:5000/api/health)

### Check These Files:
1. `backend/services/reportPDFService.js` - Does it exist?
2. `backend/controllers/reportController.js` - Check line ~410 for exportReportPDF
3. `backend/routes/reportRoutes.js` - Check for export-pdf route

### Last Resort:
1. Stop everything (close all terminals)
2. Reboot computer
3. Start MySQL service
4. Start backend: `cd D:\hr-system\backend && npm start`
5. Start frontend: `cd D:\hr-system\frontned && npm start`
6. Try again

---

## ✅ Success Indicators

When everything works perfectly:

✅ Backend terminal shows no errors  
✅ Health check returns 200 OK  
✅ Login works  
✅ Report Center loads  
✅ PDF button shows loading spinner  
✅ Toast notification appears  
✅ PDF downloads automatically  
✅ PDF opens with data and formatting  
✅ Can export multiple reports  
✅ Both PDF and Excel work  

**Status**: System is working perfectly! 🎉

---

**Last Updated**: 2026-08-02  
**Quick Fix**: Double-click `restart-backend.bat`  
**Test**: Double-click `test-backend.bat`  
**Help**: See QUICK_FIX_GUIDE.md  
