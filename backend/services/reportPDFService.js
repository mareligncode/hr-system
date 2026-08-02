import PDFDocument from 'pdfkit';
import {
    Employee,
    Department,
    Position,
    User,
    Attendance,
    LeaveRequest,
    PayrollItem,
    PayrollPeriod,
    JobPosting,
    Applicant,
    JobApplication,
    LeaveType
} from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Professional PDF Report Generation Service
 * Supports multiple report types with charts and professional formatting
 */

class ReportPDFService {
    // Color scheme
    static COLORS = {
        primary: '#3B82F6',
        secondary: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        dark: '#1F2937',
        light: '#F3F4F6',
        text: '#374151',
        muted: '#9CA3AF'
    };

    /**
     * Add company header to PDF
     */
    static addHeader(doc, title, subtitle = '') {
        // Company name/logo area
        doc
            .fillColor(this.COLORS.primary)
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('HR MANAGEMENT SYSTEM', 50, 50);

        // Report title
        doc
            .fillColor(this.COLORS.dark)
            .fontSize(18)
            .font('Helvetica-Bold')
            .text(title, 50, 90);

        if (subtitle) {
            doc
                .fillColor(this.COLORS.muted)
                .fontSize(12)
                .font('Helvetica')
                .text(subtitle, 50, 115);
        }

        // Horizontal line
        doc
            .strokeColor(this.COLORS.light)
            .lineWidth(2)
            .moveTo(50, 140)
            .lineTo(550, 140)
            .stroke();

        return 160; // Return Y position after header
    }

    /**
     * Add footer to PDF
     */
    static addFooter(doc, pageNumber) {
        const bottomMargin = 50;
        
        doc
            .fontSize(9)
            .fillColor(this.COLORS.muted)
            .font('Helvetica')
            .text(
                `Page ${pageNumber} • Generated on ${new Date().toLocaleDateString()} • Confidential`,
                50,
                doc.page.height - bottomMargin,
                { align: 'center', width: 500 }
            );
    }

    /**
     * Add statistics card
     */
    static addStatCard(doc, x, y, label, value, color = this.COLORS.primary) {
        const cardWidth = 120;
        const cardHeight = 70;

        // Card background
        doc
            .fillColor(color)
            .opacity(0.1)
            .rect(x, y, cardWidth, cardHeight)
            .fill();

        doc.opacity(1);

        // Value
        doc
            .fillColor(color)
            .fontSize(24)
            .font('Helvetica-Bold')
            .text(value, x + 10, y + 15, { width: cardWidth - 20, align: 'center' });

        // Label
        doc
            .fillColor(this.COLORS.text)
            .fontSize(10)
            .font('Helvetica')
            .text(label, x + 10, y + 45, { width: cardWidth - 20, align: 'center' });

        return y + cardHeight + 10;
    }

    /**
     * Add simple bar chart
     */
    static addBarChart(doc, x, y, data, title, width = 450, height = 150) {
        // Title
        doc
            .fillColor(this.COLORS.dark)
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(title, x, y);

        y += 25;

        const chartHeight = height;
        const barWidth = (width - (data.length + 1) * 10) / data.length;
        const maxValue = Math.max(...data.map(d => d.value));

        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const barX = x + index * (barWidth + 10);
            const barY = y + chartHeight - barHeight;

            // Bar
            doc
                .fillColor(this.COLORS.primary)
                .rect(barX, barY, barWidth, barHeight)
                .fill();

            // Value on top
            doc
                .fillColor(this.COLORS.dark)
                .fontSize(9)
                .font('Helvetica-Bold')
                .text(
                    item.value.toString(),
                    barX,
                    barY - 15,
                    { width: barWidth, align: 'center' }
                );

            // Label below
            doc
                .fillColor(this.COLORS.text)
                .fontSize(8)
                .font('Helvetica')
                .text(
                    item.label,
                    barX,
                    y + chartHeight + 5,
                    { width: barWidth, align: 'center' }
                );
        });

        return y + chartHeight + 30;
    }

    /**
     * Add data table
     */
    static addTable(doc, x, y, columns, rows, options = {}) {
        const { columnWidths = [], maxY = 700 } = options;
        const tableWidth = 500;
        const rowHeight = 25;
        const headerHeight = 30;

        // Calculate column widths if not provided
        const colWidths = columnWidths.length > 0 
            ? columnWidths 
            : columns.map(() => tableWidth / columns.length);

        // Header
        let currentX = x;
        doc
            .fillColor(this.COLORS.primary)
            .rect(x, y, tableWidth, headerHeight)
            .fill();

        columns.forEach((col, i) => {
            doc
                .fillColor('white')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(
                    col,
                    currentX + 5,
                    y + 8,
                    { width: colWidths[i] - 10, align: 'left' }
                );
            currentX += colWidths[i];
        });

        y += headerHeight;

        // Rows
        rows.forEach((row, rowIndex) => {
            // Check if we need a new page
            if (y > maxY) {
                doc.addPage();
                y = 50;
                
                // Repeat header on new page
                currentX = x;
                doc
                    .fillColor(this.COLORS.primary)
                    .rect(x, y, tableWidth, headerHeight)
                    .fill();

                columns.forEach((col, i) => {
                    doc
                        .fillColor('white')
                        .fontSize(10)
                        .font('Helvetica-Bold')
                        .text(
                            col,
                            currentX + 5,
                            y + 8,
                            { width: colWidths[i] - 10, align: 'left' }
                        );
                    currentX += colWidths[i];
                });

                y += headerHeight;
            }

            // Alternating row colors
            if (rowIndex % 2 === 0) {
                doc
                    .fillColor(this.COLORS.light)
                    .rect(x, y, tableWidth, rowHeight)
                    .fill();
            }

            currentX = x;
            row.forEach((cell, cellIndex) => {
                doc
                    .fillColor(this.COLORS.text)
                    .fontSize(9)
                    .font('Helvetica')
                    .text(
                        String(cell || ''),
                        currentX + 5,
                        y + 7,
                        { width: colWidths[cellIndex] - 10, align: 'left' }
                    );
                currentX += colWidths[cellIndex];
            });

            // Row border
            doc
                .strokeColor(this.COLORS.light)
                .lineWidth(0.5)
                .moveTo(x, y + rowHeight)
                .lineTo(x + tableWidth, y + rowHeight)
                .stroke();

            y += rowHeight;
        });

        return y + 10;
    }

    /**
     * Generate Employee Headcount Report PDF
     */
    static async generateEmployeeHeadcountPDF() {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Fetch data
        const employees = await Employee.findAll({
            where: { employment_status: 'active' },
            include: [
                { model: Department, attributes: ['name'] },
                { model: Position, attributes: ['title'] },
                { model: User, attributes: ['first_name', 'last_name', 'email'] }
            ],
            order: [['employee_number', 'ASC']]
        });

        const deptDistribution = await Employee.findAll({
            attributes: [
                [sequelize.col('Department.name'), 'name'],
                [sequelize.fn('COUNT', sequelize.col('Employee.user_id')), 'count']
            ],
            include: [{
                model: Department,
                attributes: [],
                where: { is_active: true }
            }],
            where: { employment_status: 'active' },
            group: ['Department.id', 'Department.name'],
            raw: true,
            subQuery: false
        });

        // Header
        let yPos = this.addHeader(
            doc,
            'Employee Headcount Report',
            `Total Active Employees: ${employees.length} • As of ${new Date().toLocaleDateString()}`
        );

        // Statistics Cards
        const totalDepts = await Department.count({ where: { is_active: true } });
        const avgPerDept = Math.round(employees.length / totalDepts);

        this.addStatCard(doc, 50, yPos, 'Total Employees', employees.length, this.COLORS.primary);
        this.addStatCard(doc, 190, yPos, 'Departments', totalDepts, this.COLORS.success);
        this.addStatCard(doc, 330, yPos, 'Avg per Dept', avgPerDept, this.COLORS.warning);
        yPos += 90;

        // Department Distribution Chart
        const chartData = deptDistribution.map(d => ({
            label: d.name.substring(0, 10),
            value: parseInt(d.count)
        }));

        yPos = this.addBarChart(doc, 50, yPos, chartData, 'Employee Distribution by Department');

        // Employee Table
        doc.addPage();
        yPos = 50;

        doc
            .fillColor(this.COLORS.dark)
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Employee Details', 50, yPos);
        yPos += 30;

        const tableColumns = ['#', 'Name', 'Department', 'Position', 'Email'];
        const tableRows = employees.map((emp, index) => [
            (index + 1).toString(),
            `${emp.User.first_name} ${emp.User.last_name}`,
            emp.Department?.name || 'N/A',
            emp.Position?.title || 'N/A',
            emp.User.email
        ]);

        this.addTable(doc, 50, yPos, tableColumns, tableRows, {
            columnWidths: [30, 120, 110, 110, 130]
        });

        // Footer
        this.addFooter(doc, 1);

        return doc;
    }

    /**
     * Generate Payroll Summary Report PDF
     */
    static async generatePayrollSummaryPDF() {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Fetch latest payroll period
        const latestPeriod = await PayrollPeriod.findOne({
            order: [['end_date', 'DESC']],
            where: { status: 'approved' }
        });

        if (!latestPeriod) {
            // No payroll data
            this.addHeader(doc, 'Payroll Summary Report', 'No payroll data available');
            this.addFooter(doc, 1);
            return doc;
        }

        // Fetch payroll items
        const payrollItems = await PayrollItem.findAll({
            where: { payroll_period_id: latestPeriod.id },
            include: [
                { model: User, attributes: ['first_name', 'last_name'] },
                { 
                    model: User, 
                    as: 'User',
                    include: [{ 
                        model: Employee, 
                        include: [{ model: Department, attributes: ['name'] }] 
                    }]
                }
            ],
            order: [[sequelize.col('User.last_name'), 'ASC']]
        });

        // Calculate totals
        const totalGross = payrollItems.reduce((sum, item) => sum + parseFloat(item.gross_pay || 0), 0);
        const totalNet = payrollItems.reduce((sum, item) => sum + parseFloat(item.net_pay || 0), 0);
        const totalOT = payrollItems.reduce((sum, item) => sum + parseFloat(item.overtime_hours || 0), 0);
        const totalDeductions = totalGross - totalNet;

        // Header
        let yPos = this.addHeader(
            doc,
            'Payroll Summary Report',
            `Period: ${new Date(latestPeriod.start_date).toLocaleDateString()} - ${new Date(latestPeriod.end_date).toLocaleDateString()}`
        );

        // Statistics Cards
        this.addStatCard(doc, 50, yPos, 'Total Gross Pay', `$${totalGross.toLocaleString()}`, this.COLORS.primary);
        this.addStatCard(doc, 190, yPos, 'Total Net Pay', `$${totalNet.toLocaleString()}`, this.COLORS.success);
        this.addStatCard(doc, 330, yPos, 'Total Deductions', `$${totalDeductions.toLocaleString()}`, this.COLORS.warning);
        yPos += 80;

        this.addStatCard(doc, 50, yPos, 'OT Hours', totalOT.toFixed(1), this.COLORS.secondary);
        this.addStatCard(doc, 190, yPos, 'Employees Paid', payrollItems.length, this.COLORS.success);
        yPos += 90;

        // Payroll Details Table
        doc.addPage();
        yPos = 50;

        doc
            .fillColor(this.COLORS.dark)
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Payroll Details', 50, yPos);
        yPos += 30;

        const tableColumns = ['Employee', 'Department', 'Gross', 'OT Hrs', 'Net Pay'];
        const tableRows = payrollItems.map(item => [
            `${item.User.first_name} ${item.User.last_name}`,
            item.User.Employee?.Department?.name || 'N/A',
            `$${parseFloat(item.gross_pay || 0).toFixed(2)}`,
            parseFloat(item.overtime_hours || 0).toFixed(1),
            `$${parseFloat(item.net_pay || 0).toFixed(2)}`
        ]);

        this.addTable(doc, 50, yPos, tableColumns, tableRows, {
            columnWidths: [140, 120, 80, 60, 100]
        });

        // Footer
        this.addFooter(doc, 1);

        return doc;
    }

    /**
     * Generate Attendance Summary Report PDF
     */
    static async generateAttendanceSummaryPDF(startDate, endDate) {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Fetch attendance data
        const attendanceRecords = await Attendance.findAll({
            where: {
                clock_in: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [
                { 
                    model: User, 
                    attributes: ['first_name', 'last_name'],
                    include: [{ 
                        model: Employee, 
                        include: [{ model: Department, attributes: ['name'] }] 
                    }]
                }
            ],
            order: [[sequelize.col('User.last_name'), 'ASC']]
        });

        // Calculate statistics
        const totalDays = attendanceRecords.length;
        const approvedDays = attendanceRecords.filter(a => a.status === 'approved').length;
        const pendingDays = attendanceRecords.filter(a => a.status === 'pending').length;
        const totalHours = attendanceRecords.reduce((sum, a) => sum + parseFloat(a.work_hours || 0), 0);
        const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

        // Header
        let yPos = this.addHeader(
            doc,
            'Attendance Summary Report',
            `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
        );

        // Statistics Cards
        this.addStatCard(doc, 50, yPos, 'Total Records', totalDays, this.COLORS.primary);
        this.addStatCard(doc, 190, yPos, 'Approved', approvedDays, this.COLORS.success);
        this.addStatCard(doc, 330, yPos, 'Pending', pendingDays, this.COLORS.warning);
        yPos += 80;

        this.addStatCard(doc, 50, yPos, 'Total Hours', totalHours.toFixed(1), this.COLORS.secondary);
        this.addStatCard(doc, 190, yPos, 'Avg Hours/Day', avgHours, this.COLORS.primary);
        yPos += 90;

        // Attendance Details Table
        doc.addPage();
        yPos = 50;

        doc
            .fillColor(this.COLORS.dark)
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Attendance Details', 50, yPos);
        yPos += 30;

        const tableColumns = ['Date', 'Employee', 'Clock In', 'Clock Out', 'Hours', 'Status'];
        const tableRows = attendanceRecords.map(record => [
            new Date(record.clock_in).toLocaleDateString(),
            `${record.User.first_name} ${record.User.last_name}`,
            new Date(record.clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            record.clock_out ? new Date(record.clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            parseFloat(record.work_hours || 0).toFixed(1),
            record.status.toUpperCase()
        ]);

        this.addTable(doc, 50, yPos, tableColumns, tableRows, {
            columnWidths: [70, 120, 60, 60, 50, 60]
        });

        // Footer
        this.addFooter(doc, 1);

        return doc;
    }

    /**
     * Generate Leave Summary Report PDF
     */
    static async generateLeaveSummaryPDF(startDate, endDate) {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Fetch leave requests
        const leaveRequests = await LeaveRequest.findAll({
            where: {
                start_date: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [
                { model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
                { model: LeaveType, attributes: ['name'] }
            ],
            order: [['start_date', 'DESC']]
        });

        // Calculate statistics
        const totalRequests = leaveRequests.length;
        const approved = leaveRequests.filter(l => l.status === 'approved').length;
        const pending = leaveRequests.filter(l => l.status === 'pending').length;
        const rejected = leaveRequests.filter(l => l.status === 'rejected').length;
        const totalDays = leaveRequests.reduce((sum, l) => sum + (l.total_days || 0), 0);

        // Header
        let yPos = this.addHeader(
            doc,
            'Leave Summary Report',
            `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
        );

        // Statistics Cards
        this.addStatCard(doc, 50, yPos, 'Total Requests', totalRequests, this.COLORS.primary);
        this.addStatCard(doc, 190, yPos, 'Approved', approved, this.COLORS.success);
        this.addStatCard(doc, 330, yPos, 'Pending', pending, this.COLORS.warning);
        yPos += 80;

        this.addStatCard(doc, 50, yPos, 'Rejected', rejected, this.COLORS.danger);
        this.addStatCard(doc, 190, yPos, 'Total Days', totalDays, this.COLORS.secondary);
        yPos += 90;

        // Leave Details Table
        doc.addPage();
        yPos = 50;

        doc
            .fillColor(this.COLORS.dark)
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Leave Request Details', 50, yPos);
        yPos += 30;

        const tableColumns = ['Employee', 'Type', 'Start Date', 'Days', 'Status'];
        const tableRows = leaveRequests.map(leave => [
            `${leave.Employee.User.first_name} ${leave.Employee.User.last_name}`,
            leave.LeaveType.name,
            new Date(leave.start_date).toLocaleDateString(),
            leave.total_days.toString(),
            leave.status.toUpperCase()
        ]);

        this.addTable(doc, 50, yPos, tableColumns, tableRows, {
            columnWidths: [140, 100, 90, 50, 70]
        });

        // Footer
        this.addFooter(doc, 1);

        return doc;
    }

    /**
     * Generate Recruitment Summary Report PDF
     */
    static async generateRecruitmentSummaryPDF() {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Fetch job postings
        const jobPostings = await JobPosting.findAll({
            include: [
                { model: Department, attributes: ['name'] },
                { model: Position, attributes: ['title'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        // Fetch applications
        const applications = await JobApplication.findAll({
            include: [
                { model: Applicant, include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
                { model: JobPosting }
            ],
            order: [['applied_at', 'DESC']],
            limit: 100
        });

        // Calculate statistics
        const totalJobs = jobPostings.length;
        const activeJobs = jobPostings.filter(j => j.status === 'published').length;
        const totalApplicants = applications.length;
        const pendingReview = applications.filter(a => a.status === 'pending').length;

        // Header
        let yPos = this.addHeader(
            doc,
            'Recruitment Summary Report',
            `Generated on ${new Date().toLocaleDateString()}`
        );

        // Statistics Cards
        this.addStatCard(doc, 50, yPos, 'Total Jobs', totalJobs, this.COLORS.primary);
        this.addStatCard(doc, 190, yPos, 'Active Jobs', activeJobs, this.COLORS.success);
        this.addStatCard(doc, 330, yPos, 'Total Applicants', totalApplicants, this.COLORS.secondary);
        yPos += 80;

        this.addStatCard(doc, 50, yPos, 'Pending Review', pendingReview, this.COLORS.warning);
        yPos += 90;

        // Active Job Postings Table
        doc
            .fillColor(this.COLORS.dark)
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Active Job Postings', 50, yPos);
        yPos += 30;

        const jobColumns = ['Position', 'Department', 'Posted Date', 'Status'];
        const jobRows = jobPostings.slice(0, 20).map(job => [
            job.Position?.title || job.title,
            job.Department?.name || 'N/A',
            new Date(job.created_at).toLocaleDateString(),
            job.status.toUpperCase()
        ]);

        this.addTable(doc, 50, yPos, jobColumns, jobRows, {
            columnWidths: [150, 120, 100, 80]
        });

        // Footer
        this.addFooter(doc, 1);

        return doc;
    }
}

export default ReportPDFService;
