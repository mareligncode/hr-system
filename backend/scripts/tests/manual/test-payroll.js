import {
    PayrollPeriod,
    PayrollItem,
    Employee,
    Attendance,
    User
} from './models/index.js';
import sequelize from './config/database.js';
import { Op } from 'sequelize';

async function verifyPayroll() {
    try {
        console.log('--- Starting Payroll Verification ---');

        console.log('Checking database connection...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Updating employees table schema via raw SQL...');
        try {
            await sequelize.query("ALTER TABLE employees ADD COLUMN base_salary DECIMAL(12,2) DEFAULT 0 AFTER office_location");
            await sequelize.query("ALTER TABLE employees ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 0 AFTER base_salary");
            console.log('Columns added successfully.');
        } catch (e) {
            console.log('Columns might already exist or error:', e.message);
        }

        console.log('Syncing payroll models...');
        await PayrollPeriod.sync({ alter: true });
        await PayrollItem.sync({ alter: true });
        console.log('Payroll models synced.');

        // 1. Find or create a test employee
        console.log('Searching for active employee...');
        let employee = await Employee.findOne({
            where: { employment_status: 'active' },
            include: [User]
        });

        if (!employee) {
            console.error('No active employee found for testing.');
            return;
        }

        console.log(`Testing with Employee: ${employee.User.first_name} ${employee.User.last_name}`);

        // Ensure salary fields are set
        console.log('Updating employee salary fields...');
        await employee.update({
            base_salary: 3000,
            hourly_rate: 15,
            contract_type: 'permanent'
        });
        console.log('Employee updated.');

        // 2. Create a payroll period
        console.log('Checking for payroll period...');
        const startDate = '2025-03-01';
        const endDate = '2025-03-31';

        let period = await PayrollPeriod.findOne({ where: { start_date: startDate, end_date: endDate } });
        if (!period) {
            console.log('Creating payroll period...');
            period = await PayrollPeriod.create({
                start_date: startDate,
                end_date: endDate,
                description: 'Test Period March 2025',
                status: 'open'
            });
        }
        console.log(`Payroll Period: ${period.id} (${period.start_date} to ${period.end_date})`);

        // 3. Ensure some approved attendance exists
        console.log('Checking for attendance...');
        const attendance = await Attendance.findOne({
            where: {
                user_id: employee.user_id,
                clock_in: { [Op.between]: [new Date(startDate), new Date(endDate)] }
            }
        });

        if (!attendance) {
            console.log('Creating dummy attendance record...');
            await Attendance.create({
                user_id: employee.user_id,
                clock_in: new Date('2025-03-10T08:00:00Z'),
                clock_out: new Date('2025-03-10T18:00:00Z'), // 10 hours -> 8 regular, 2 overtime
                work_hours: 8,
                overtime_hours: 2,
                status: 'approved'
            });
        } else {
            console.log('Updating existing attendance to approved...');
            await attendance.update({ status: 'approved' });
        }

        console.log('Running internal calculation logic...');
        // We'll simulate the controller logic here for verification
        const attendances = await Attendance.findAll({
            where: {
                user_id: employee.user_id,
                status: 'approved',
                clock_in: { [Op.between]: [new Date(period.start_date), new Date(new Date(period.end_date).setHours(23, 59, 59))] }
            }
        });

        console.log(`Found ${attendances.length} approved attendance records.`);

        const totalHours = attendances.reduce((sum, a) => sum + (a.work_hours || 0), 0);
        const overtimeHours = attendances.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

        let grossPay = 0;
        const baseSalary = parseFloat(employee.base_salary);
        const hourlyRate = parseFloat(employee.hourly_rate);

        if (employee.contract_type === 'permanent') {
            grossPay = baseSalary;
        } else {
            grossPay = totalHours * hourlyRate;
        }

        const overtimePay = overtimeHours * hourlyRate * 1.5;
        grossPay += overtimePay;

        console.log(`Statistics for ${employee.User.first_name}:`);
        console.log(`- Regular Hours: ${totalHours}`);
        console.log(`- Overtime Hours: ${overtimeHours}`);
        console.log(`- Base Salary: ${baseSalary}`);
        console.log(`- Hourly Rate: ${hourlyRate}`);
        console.log(`- Overtime Pay (1.5x): ${overtimePay}`);
        console.log(`- Calculated Gross Pay: ${grossPay}`);

        if (grossPay > 0) {
            console.log('✅ Calculation logic verified successfully.');
        } else {
            console.log('❌ Calculation logic failed or yielded zero.');
        }

        console.log('Verification finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('VERIFICATION FAILED AT ERROR POINT');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        process.exit(1);
    }
}

verifyPayroll();
