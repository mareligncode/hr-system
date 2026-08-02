# 🚀 Deployment Instructions - HR Attendance System

## Prerequisites Checklist

### Server Requirements
- [ ] Node.js 14.x or higher installed
- [ ] MySQL 5.7 or higher running
- [ ] npm or yarn package manager
- [ ] Git for version control
- [ ] SSL certificate for HTTPS (production)

### Database Requirements
- [ ] MySQL database created
- [ ] Database user with full permissions
- [ ] Backup strategy in place
- [ ] Connection string ready

---

## Step 1: Backend Deployment

### 1.1 Install Dependencies
```bash
cd d:/hr-system/backend

# Install all required packages
npm install

# Install PDF generation dependencies
npm install pdfkit

# Verify installation
npm list pdfkit exceljs date-fns
```

### 1.2 Database Setup
```bash
# Create new migration for policies and violations
npx sequelize-cli migration:create --name create-attendance-policies-and-violations

# Run migrations
npx sequelize-cli db:migrate

# If migrations fail, check and fix, then retry
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate
```

**Manual SQL (if needed)**:
```sql
-- Run this if Sequelize migrations fail
SOURCE backend/migrations/create_policies_violations.sql;
```

### 1.3 Environment Configuration
```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env
```

**Required Environment Variables**:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=hr_system
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_very_secure_random_string_here
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com
```

### 1.4 Start Backend
```bash
# Production mode
npm run start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name hr-backend
pm2 save
pm2 startup
```

---

## Step 2: Frontend Deployment

### 2.1 Install Dependencies
```bash
cd d:/hr-system/frontned

# Install packages
npm install

# Install new dependencies for PDF features
npm install framer-motion date-fns

# Verify
npm list framer-motion date-fns react-hot-toast
```

### 2.2 Environment Setup
```bash
# Create .env file
cp .env.example .env

# Edit configuration
nano .env
```

**Required Environment Variables**:
```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_VERSION=3.0.0
```

### 2.3 Build for Production
```bash
# Create optimized build
npm run build

# Test build locally (optional)
npx serve -s build
```

### 2.4 Deploy Build
```bash
# Option 1: Copy to web server
cp -r build/* /var/www/html/hr-system/

# Option 2: Deploy to hosting (example: Netlify)
netlify deploy --prod --dir=build

# Option 3: Use PM2 with serve
npm install -g serve
pm2 serve build 3000 --name hr-frontend --spa
pm2 save
```

---

## Step 3: Database Migrations

### 3.1 Create Migration Files

**Create**: `backend/migrations/YYYYMMDDHHMMSS-create-attendance-policies-and-violations.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create attendance_policies table
    await queryInterface.createTable('attendance_policies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      standard_work_hours: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 8.0
      },
      work_start_time: {
        type: Sequelize.TIME,
        defaultValue: '09:00:00'
      },
      work_end_time: {
        type: Sequelize.TIME,
        defaultValue: '17:00:00'
      },
      late_grace_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 15
      },
      early_departure_grace_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 15
      },
      late_penalty_type: {
        type: Sequelize.ENUM('warning', 'deduction', 'none'),
        defaultValue: 'warning'
      },
      late_penalty_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      max_late_allowed_per_month: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      early_departure_penalty_type: {
        type: Sequelize.ENUM('warning', 'deduction', 'half_day', 'none'),
        defaultValue: 'warning'
      },
      early_departure_penalty_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      mandatory_break_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 60
      },
      max_break_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 90
      },
      overtime_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      overtime_rate_multiplier: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 1.5
      },
      max_overtime_hours_per_day: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 4.0
      },
      overtime_requires_approval: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      auto_approve_on_time: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      require_manager_approval: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      geofencing_required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create attendance_violations table
    await queryInterface.createTable('attendance_violations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      attendance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'attendances',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      violation_type: {
        type: Sequelize.ENUM(
          'late_arrival',
          'early_departure',
          'insufficient_hours',
          'excessive_break',
          'no_break',
          'missing_clock_out',
          'missing_clock_in',
          'unauthorized_overtime',
          'geofence_violation',
          'missing_selfie',
          'other'
        ),
        allowNull: false
      },
      severity: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      expected_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      difference_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      penalty_applied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      penalty_type: {
        type: Sequelize.ENUM('warning', 'deduction', 'half_day', 'disciplinary', 'none'),
        allowNull: true
      },
      penalty_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      status: {
        type: Sequelize.ENUM('pending', 'acknowledged', 'excused', 'resolved', 'escalated'),
        defaultValue: 'pending'
      },
      resolved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolution_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      acknowledged_by_employee: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      acknowledged_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      employee_comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      escalated_to: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      escalation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create indexes
    await queryInterface.addIndex('attendance_violations', ['user_id'], {
      name: 'idx_violations_user'
    });
    await queryInterface.addIndex('attendance_violations', ['status'], {
      name: 'idx_violations_status'
    });
    await queryInterface.addIndex('attendance_violations', ['violation_type'], {
      name: 'idx_violations_type'
    });
    await queryInterface.addIndex('attendance_violations', ['created_at'], {
      name: 'idx_violations_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendance_violations');
    await queryInterface.dropTable('attendance_policies');
  }
};
```

### 3.2 Run Migrations
```bash
cd backend
npx sequelize-cli db:migrate
```

### 3.3 Seed Default Policy
```bash
# Create seeder
npx sequelize-cli seed:create --name default-attendance-policy
```

**Edit seeder file**:
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('attendance_policies', [{
      name: 'Default Company Policy',
      department_id: null,
      standard_work_hours: 8.0,
      work_start_time: '09:00:00',
      work_end_time: '17:00:00',
      late_grace_minutes: 15,
      early_departure_grace_minutes: 15,
      late_penalty_type: 'warning',
      max_late_allowed_per_month: 3,
      mandatory_break_minutes: 60,
      max_break_minutes: 90,
      overtime_enabled: true,
      overtime_rate_multiplier: 1.5,
      auto_approve_on_time: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('attendance_policies', null, {});
  }
};
```

```bash
# Run seeder
npx sequelize-cli db:seed:all
```

---

## Step 4: Verification

### 4.1 Backend Health Check
```bash
# Test API
curl http://localhost:5000/api/health

# Expected response: {"status":"ok","timestamp":"..."}
```

### 4.2 Database Verification
```sql
-- Connect to MySQL
mysql -u your_user -p hr_system

-- Check tables exist
SHOW TABLES LIKE 'attendance_%';

-- Should show:
-- attendance_policies
-- attendance_violations
-- (plus existing attendance tables)

-- Check default policy
SELECT * FROM attendance_policies;
```

### 4.3 Frontend Check
```bash
# Open in browser
http://localhost:3000

# Test features:
1. Login as employee
2. Navigate to Attendance Calendar
3. Click on a day (should show modal)
4. Try to export PDF (button should be visible)
5. Check statistics cards display
```

---

## Step 5: Production Checklist

- [ ] SSL certificate installed and configured
- [ ] Environment variables set correctly
- [ ] Database backups automated
- [ ] PM2 processes running and saved
- [ ] Firewall rules configured
- [ ] Domain DNS pointed correctly
- [ ] Error logging configured
- [ ] Monitoring alerts set up
- [ ] User accounts created
- [ ] Default policy configured
- [ ] Test PDF generation works
- [ ] Test bulk operations work
- [ ] Mobile responsiveness verified

---

## Troubleshooting

### Issue: PDF generation fails
```bash
# Check pdfkit installation
npm list pdfkit

# Reinstall if needed
npm uninstall pdfkit
npm install pdfkit

# Check file permissions
ls -la backend/services/pdfReportService.js
```

### Issue: Migrations fail
```bash
# Check database connection
mysql -u your_user -p

# Reset migrations (CAUTION: dev only)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate

# Or manually run SQL
mysql -u your_user -p hr_system < migration.sql
```

### Issue: Frontend build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for missing dependencies
npm audit fix

# Try build again
npm run build
```

---

## Post-Deployment

### User Training
1. Schedule training sessions by role
2. Share user documentation
3. Provide support contact
4. Monitor initial usage

### Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs hr-backend
pm2 logs hr-frontend

# Check system resources
pm2 status
```

### Maintenance
- Daily: Check error logs
- Weekly: Review user feedback
- Monthly: Update dependencies
- Quarterly: Performance optimization

---

## Success Criteria

✅ All users can login
✅ Calendar displays correctly
✅ PDF export works for all roles
✅ Bulk operations function
✅ Policies enforce correctly
✅ Mobile view works
✅ No console errors
✅ Performance is acceptable (<2s page load)

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Sign-off**: ___________
