import PDFDocument from 'pdfkit';
import { Attendance, User, Employee, Department, AttendanceBreak } from '../models/index.js';
import { Op } from 'sequelize';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

/**
 * Professional PDF Report Generator for Attendance System
 * Supports multiple report types with beautiful formatting
 */

class PDFReportService {
    constructor() {
        this.colors = {
            primary: '#3B82F6',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            dark: '#1F2937',
            gray: '#6B7280',
            light: '#F3F4F6'
        };
    }

    /**
     * Create a new PDF document with company branding
     */
    createDocument() {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            info: {
                Title: 'Attendance Report',
                Author: 'HR Management System',
                Subject: 'Employee Attendance Records',
                CreationDate: new Date()
            }
        });

        return doc;
    }

    /**
     * Add header with company logo and title
     */
    addHeader(doc, title, subtitle = '') {
        // Company header background
        doc.rect(0, 0, doc.page.width, 120)
           .fill(this.colors.primary);

        // Company name
        doc.fontSize(24)
           .fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .text('HR MANAGEMENT SYSTEM', 50, 30, { align: 'center' });

        // Report title
        doc.fontSize(18)
           .text(title, 50, 60, { align: 'center' });

        // Subtitle
        if (subtitle) {
            doc.fontSize(10)
               .fillColor('#E5E7EB')
               .text(subtitle, 50, 85, { align: 'center' });
        }

        // Generation date
        doc.fontSize(8)
           .text(`Generated: ${format(new Date(), 'PPpp')}`, 50, 100, { align: 'center' });

        doc.moveDown(4);
        return doc;
    }

    /**
     * Add footer with page numbers
     */
    addFooter(doc, pageNumber, totalPages) {
        const bottom = doc.page.height - 50;
        
        doc.fontSize(8)
           .fillColor(this.colors.gray)
           .text(
               `Page ${pageNumber} of ${totalPages}`,
               50,
               bottom,
               { align: 'center', width: doc.page.width - 100 }
           );

        doc.fontSize(7)
           .text(
               'Confidential - For Internal Use Only',
               50,
               bottom + 15,
               { align: 'center', width: doc.page.width - 100 }
           );
    }

    /**
     * Add section header
     */
    addSectionHeader(doc, title, icon = '📊') {
        doc.fontSize(14)
           .fillColor(this.colors.dark)
           .font('Helvetica-Bold')
           .text(`${icon} ${title}`, { underline: true });
        
        doc.moveDown(0.5);
        return doc;
    }

    /**
     * Add statistics cards
     */
    addStatisticsCards(doc, stats) {
        const startY = doc.y;
        const cardWidth = 120;
        const cardHeight = 70;
        const gap = 20;

        const cards = [
            { title: 'Total Days', value: stats.totalDays, color: this.colors.primary, icon: '📅' },
            { title: 'Present', value: stats.present, color: this.colors.success, icon: '✅' },
            { title: 'Absent', value: stats.absent, color: this.colors.danger, icon: '❌' },
            { title: 'Total Hours', value: `${stats.totalHours}h`, color: this.colors.primary, icon: '⏱️' },
            { title: 'Overtime', value: `${stats.overtime}h`, color: this.colors.warning, icon: '⚡' },
            { title: 'Late Arrivals', value: stats.lateArrivals, color: this.colors.warning, icon: '⏰' },
            { title: 'Violations', value: stats.violations, color: this.colors.danger, icon: '⚠️' },
            { title: 'Avg Hours/Day', value: `${stats.avgHours}h`, color: this.colors.success, icon: '📊' }
        ];

        let x = 50;
        let y = startY;
        let cardsInRow = 0;

        cards.forEach((card, index) => {
            // Draw card background
            doc.roundedRect(x, y, cardWidth, cardHeight, 5)
               .fillAndStroke(this.colors.light, card.color);

            // Icon
            doc.fontSize(20)
               .fillColor(card.color)
               .text(card.icon, x + 10, y + 10);

            // Value
            doc.fontSize(20)
               .font('Helvetica-Bold')
               .fillColor(this.colors.dark)
               .text(card.value, x + 10, y + 35, { width: cardWidth - 20, align: 'center' });

            // Title
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(this.colors.gray)
               .text(card.title.toUpperCase(), x + 10, y + 55, { width: cardWidth - 20, align: 'center' });

            cardsInRow++;
            
            if (cardsInRow === 4) {
                x = 50;
                y += cardHeight + gap;
                cardsInRow = 0;
            } else {
                x += cardWidth + gap;
            }
        });

        doc.y = y + cardHeight + 30;
        return doc;
    }

    /**
     * Add detailed attendance table
     */
    addAttendanceTable(doc, records) {
        this.addSectionHeader(doc, 'Detailed Attendance Records', '📋');

        const tableTop = doc.y;
        const rowHeight = 25;
        const colWidths = [60, 100, 60, 60, 50, 50, 60];
        const headers = ['Date', 'Employee', 'Clock In', 'Clock Out', 'Hours', 'OT', 'Status'];

        // Table header
        let x = 50;
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .fillColor('#FFFFFF');

        headers.forEach((header, i) => {
            doc.rect(x, tableTop, colWidths[i], rowHeight)
               .fill(this.colors.primary);
            
            doc.fillColor('#FFFFFF')
               .text(header, x + 5, tableTop + 8, { width: colWidths[i] - 10, align: 'center' });
            
            x += colWidths[i];
        });

        // Table rows
        let y = tableTop + rowHeight;
        
        records.forEach((record, index) => {
            // Alternate row colors
            const bgColor = index % 2 === 0 ? '#FFFFFF' : this.colors.light;
            
            x = 50;
            headers.forEach((header, i) => {
                doc.rect(x, y, colWidths[i], rowHeight)
                   .fill(bgColor);
                x += colWidths[i];
            });

            // Add data
            x = 50;
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(this.colors.dark);

            const data = [
                format(new Date(record.clock_in), 'MMM dd'),
                `${record.User?.first_name} ${record.User?.last_name}`.substring(0, 15),
                format(new Date(record.clock_in), 'HH:mm'),
                record.clock_out ? format(new Date(record.clock_out), 'HH:mm') : '--:--',
                record.work_hours || '0',
                record.overtime_hours || '0',
                record.status.toUpperCase()
            ];

            data.forEach((value, i) => {
                // Status color coding
                if (i === 6) {
                    if (value === 'APPROVED') doc.fillColor(this.colors.success);
                    else if (value === 'REJECTED') doc.fillColor(this.colors.danger);
                    else doc.fillColor(this.colors.warning);
                }

                doc.text(value, x + 5, y + 8, { width: colWidths[i] - 10, align: 'center' });
                doc.fillColor(this.colors.dark);
                x += colWidths[i];
            });

            y += rowHeight;

            // New page if needed
            if (y > doc.page.height - 100) {
                doc.addPage();
                y = 50;
            }
        });

        doc.y = y + 20;
        return doc;
    }

    /**
     * Add violations summary
     */
    addViolationsSummary(doc, violations) {
        if (!violations || violations.length === 0) return doc;

        this.addSectionHeader(doc, 'Violations Summary', '⚠️');

        violations.forEach((violation, index) => {
            const y = doc.y;

            // Severity badge
            let badgeColor;
            switch (violation.severity) {
                case 'critical': badgeColor = this.colors.danger; break;
                case 'high': badgeColor = this.colors.warning; break;
                case 'medium': badgeColor = '#F59E0B'; break;
                default: badgeColor = this.colors.gray;
            }

            doc.roundedRect(50, y, 495, 60, 5)
               .fillAndStroke('#FFFFFF', badgeColor);

            // Violation type
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor(badgeColor)
               .text(violation.violation_type.replace(/_/g, ' ').toUpperCase(), 60, y + 10);

            // Description
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(this.colors.dark)
               .text(violation.description, 60, y + 25, { width: 430 });

            // Status and date
            doc.fontSize(7)
               .fillColor(this.colors.gray)
               .text(
                   `Status: ${violation.status.toUpperCase()} | ${format(new Date(violation.created_at), 'PP')}`,
                   60,
                   y + 45
               );

            doc.moveDown(3);
        });

        return doc;
    }

    /**
     * Add department comparison chart (text-based)
     */
    addDepartmentComparison(doc, departments) {
        this.addSectionHeader(doc, 'Department Comparison', '🏢');

        departments.forEach(dept => {
            const y = doc.y;
            const barMaxWidth = 400;
            const barHeight = 20;

            // Department name
            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor(this.colors.dark)
               .text(dept.name, 50, y);

            // Attendance rate bar
            const barWidth = (dept.attendanceRate / 100) * barMaxWidth;
            doc.rect(50, y + 15, barMaxWidth, barHeight)
               .fill(this.colors.light);
            
            doc.rect(50, y + 15, barWidth, barHeight)
               .fill(this.colors.success);

            // Percentage
            doc.fontSize(8)
               .fillColor('#FFFFFF')
               .text(`${dept.attendanceRate}%`, 55, y + 19);

            // Stats
            doc.fontSize(7)
               .fillColor(this.colors.gray)
               .text(
                   `${dept.totalEmployees} employees | ${dept.avgHours}h avg | ${dept.violations} violations`,
                   460,
                   y + 20,
                   { width: 80, align: 'right' }
               );

            doc.moveDown(2);
        });

        return doc;
    }

    /**
     * Add monthly trend graph (text-based representation)
     */
    addMonthlyTrend(doc, trendData) {
        this.addSectionHeader(doc, 'Monthly Attendance Trend', '📈');

        const graphHeight = 150;
        const graphWidth = 495;
        const startX = 50;
        const startY = doc.y;

        // Draw graph background
        doc.rect(startX, startY, graphWidth, graphHeight)
           .fill(this.colors.light);

        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const y = startY + (graphHeight / 5) * i;
            doc.fontSize(7)
               .fillColor(this.colors.gray)
               .text(100 - (i * 20), startX - 25, y - 3);
            
            doc.moveTo(startX, y)
               .lineTo(startX + graphWidth, y)
               .stroke('#E5E7EB');
        }

        // Plot data points
        const pointGap = graphWidth / (trendData.length - 1);
        let prevX = startX;
        let prevY = startY + graphHeight - (trendData[0].value / 100 * graphHeight);

        trendData.forEach((point, index) => {
            if (index === 0) return;

            const x = startX + (pointGap * index);
            const y = startY + graphHeight - (point.value / 100 * graphHeight);

            // Draw line
            doc.moveTo(prevX, prevY)
               .lineTo(x, y)
               .stroke(this.colors.primary, 2);

            // Draw point
            doc.circle(x, y, 3)
               .fill(this.colors.primary);

            prevX = x;
            prevY = y;

            // X-axis label (show every 5th day)
            if (index % 5 === 0) {
                doc.fontSize(6)
                   .fillColor(this.colors.gray)
                   .text(point.label, x - 15, startY + graphHeight + 5);
            }
        });

        doc.y = startY + graphHeight + 30;
        return doc;
    }

    /**
     * Add employee summary section
     */
    addEmployeeSummary(doc, employee, summary) {
        this.addSectionHeader(doc, 'Employee Summary', '👤');

        const y = doc.y;

        // Employee info card
        doc.roundedRect(50, y, 495, 100, 5)
           .fill(this.colors.light);

        // Name and details
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor(this.colors.dark)
           .text(`${employee.first_name} ${employee.last_name}`, 70, y + 20);

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(this.colors.gray)
           .text(`Employee ID: ${employee.Employee?.employee_number || 'N/A'}`, 70, y + 40)
           .text(`Department: ${employee.Employee?.Department?.name || 'N/A'}`, 70, y + 55)
           .text(`Position: ${employee.Employee?.Position?.title || 'N/A'}`, 70, y + 70);

        // Summary stats on the right
        const rightX = 350;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(this.colors.dark)
           .text('Period Summary', rightX, y + 20);

        doc.fontSize(8)
           .font('Helvetica')
           .text(`Working Days: ${summary.workingDays}`, rightX, y + 40)
           .text(`Days Present: ${summary.present} (${summary.attendanceRate}%)`, rightX, y + 55)
           .text(`Total Hours: ${summary.totalHours}h`, rightX, y + 70)
           .text(`Punctuality: ${summary.punctualityRate}%`, rightX, y + 85);

        doc.moveDown(5);
        return doc;
    }

    /**
     * Generate Individual Employee Report
     */
    async generateEmployeeReport(userId, startDate, endDate) {
        const doc = this.createDocument();
        
        // Fetch data
        const user = await User.findByPk(userId, {
            include: [{
                model: Employee,
                include: [Department, { model: Position }]
            }]
        });

        const attendance = await Attendance.findAll({
            where: {
                user_id: userId,
                clock_in: { [Op.between]: [startDate, endDate] }
            },
            include: [
                { model: AttendanceBreak }
                // { model: AttendanceViolation } // Model doesn't exist
            ],
            order: [['clock_in', 'DESC']]
        });

        // const violations = await AttendanceViolation.findAll({
        //     where: {
        //         user_id: userId,
        //         created_at: { [Op.between]: [startDate, endDate] }
        //     }
        // });

        // Calculate statistics
        const stats = this.calculateStats(attendance);
        const summary = {
            workingDays: this.getWorkingDays(startDate, endDate),
            present: attendance.length,
            attendanceRate: ((attendance.length / this.getWorkingDays(startDate, endDate)) * 100).toFixed(1),
            totalHours: stats.totalHours,
            punctualityRate: stats.punctualityRate
        };

        // Build PDF
        this.addHeader(
            doc,
            'INDIVIDUAL ATTENDANCE REPORT',
            `Period: ${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`
        );

        this.addEmployeeSummary(doc, user, summary);
        this.addStatisticsCards(doc, stats);
        
        doc.addPage();
        this.addAttendanceTable(doc, attendance);
        
        if (violations.length > 0) {
            doc.addPage();
            this.addViolationsSummary(doc, violations);
        }

        this.addFooter(doc, 1, 3);

        return doc;
    }

    /**
     * Generate Department Report
     */
    async generateDepartmentReport(departmentId, startDate, endDate) {
        const doc = this.createDocument();

        // Fetch department data
        const department = await Department.findByPk(departmentId, {
            include: [{
                model: Employee,
                include: [{
                    model: User,
                    include: [{
                        model: Attendance,
                        where: { clock_in: { [Op.between]: [startDate, endDate] } },
                        required: false,
                        include: [AttendanceBreak] // AttendanceViolation model doesn't exist
                    }]
                }]
            }]
        });

        // Calculate department statistics
        const employees = department.Employees || [];
        const allAttendance = employees.flatMap(emp => emp.User?.Attendances || []);
        
        const stats = this.calculateStats(allAttendance);
        stats.totalEmployees = employees.length;

        // Build PDF
        this.addHeader(
            doc,
            `${department.name.toUpperCase()} DEPARTMENT REPORT`,
            `Period: ${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`
        );

        // Department overview
        this.addSectionHeader(doc, 'Department Overview', '🏢');
        
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(this.colors.dark)
           .text(`Total Employees: ${employees.length}`, 70)
           .text(`Manager: ${department.Manager?.first_name} ${department.Manager?.last_name}`, 70)
           .text(`Average Attendance Rate: ${stats.attendanceRate}%`, 70);

        doc.moveDown(2);

        this.addStatisticsCards(doc, stats);

        doc.addPage();
        this.addAttendanceTable(doc, allAttendance);

        // Employee breakdown
        doc.addPage();
        this.addSectionHeader(doc, 'Employee Performance', '👥');

        employees.forEach(emp => {
            const empAttendance = emp.User?.Attendances || [];
            const empStats = this.calculateStats(empAttendance);

            doc.fontSize(9)
               .font('Helvetica-Bold')
               .fillColor(this.colors.dark)
               .text(`${emp.User?.first_name} ${emp.User?.last_name}`, 70);

            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(this.colors.gray)
               .text(`Days Present: ${empAttendance.length} | Hours: ${empStats.totalHours}h | Violations: ${empStats.violations}`, 70);

            doc.moveDown();
        });

        return doc;
    }

    /**
     * Generate Company-Wide Report (Admin/HR)
     */
    async generateCompanyReport(startDate, endDate, options = {}) {
        const doc = this.createDocument();

        // Fetch all data
        const departments = await Department.findAll({
            include: [{
                model: Employee,
                include: [{
                    model: User,
                    include: [{
                        model: Attendance,
                        where: { clock_in: { [Op.between]: [startDate, endDate] } },
                        required: false,
                        include: [AttendanceBreak] // AttendanceViolation model doesn't exist
                    }]
                }]
            }]
        });

        const allAttendance = departments.flatMap(dept =>
            dept.Employees.flatMap(emp => emp.User?.Attendances || [])
        );

        // const allViolations = await AttendanceViolation.findAll({
        //     where: { created_at: { [Op.between]: [startDate, endDate] } },
        //     include: [User]
        // });

        // Calculate company-wide statistics
        const stats = this.calculateStats(allAttendance);
        const totalEmployees = departments.reduce((sum, dept) => sum + dept.Employees.length, 0);
        stats.totalEmployees = totalEmployees;

        // Build PDF
        this.addHeader(
            doc,
            'COMPANY-WIDE ATTENDANCE REPORT',
            `Period: ${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`
        );

        // Executive summary
        this.addSectionHeader(doc, 'Executive Summary', '📊');
        
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(this.colors.dark)
           .text(`Total Employees: ${totalEmployees}`, 70)
           .text(`Total Attendance Records: ${allAttendance.length}`, 70)
           .text(`Company Attendance Rate: ${stats.attendanceRate}%`, 70)
           .text(`Total Violations: ${allViolations.length}`, 70);

        doc.moveDown(2);

        this.addStatisticsCards(doc, stats);

        // Department comparison
        doc.addPage();
        const deptComparison = departments.map(dept => {
            const deptAttendance = dept.Employees.flatMap(emp => emp.User?.Attendances || []);
            const deptStats = this.calculateStats(deptAttendance);
            
            return {
                name: dept.name,
                totalEmployees: dept.Employees.length,
                attendanceRate: deptStats.attendanceRate,
                avgHours: deptStats.avgHours,
                violations: deptStats.violations
            };
        });

        this.addDepartmentComparison(doc, deptComparison);

        // Monthly trend
        doc.addPage();
        const trendData = this.generateTrendData(allAttendance, startDate, endDate);
        this.addMonthlyTrend(doc, trendData);

        // Violations summary
        if (allViolations.length > 0) {
            doc.addPage();
            this.addViolationsSummary(doc, allViolations.slice(0, 10)); // Top 10
        }

        // Detailed attendance (if requested)
        if (options.includeDetails) {
            doc.addPage();
            this.addAttendanceTable(doc, allAttendance.slice(0, 50)); // First 50
        }

        return doc;
    }

    /**
     * Helper: Calculate statistics from attendance records
     */
    calculateStats(attendance) {
        const present = attendance.filter(a => a.clock_in).length;
        const totalHours = attendance.reduce((sum, a) => sum + (parseFloat(a.work_hours) || 0), 0);
        const overtime = attendance.reduce((sum, a) => sum + (parseFloat(a.overtime_hours) || 0), 0);
        const lateArrivals = attendance.filter(a => {
            // Simplified: Check if clock-in is after 9:05 AM
            if (!a.clock_in) return false;
            const clockIn = new Date(a.clock_in);
            const hours = clockIn.getHours();
            const minutes = clockIn.getMinutes();
            return hours > 9 || (hours === 9 && minutes > 5);
        }).length;

        // const violations = attendance.reduce((sum, a) => 
        //     sum + (a.AttendanceViolations?.length || 0), 0
        // );
        const violations = 0; // AttendanceViolation model doesn't exist

        const approved = attendance.filter(a => a.status === 'approved').length;
        const pending = attendance.filter(a => a.status === 'pending').length;
        const rejected = attendance.filter(a => a.status === 'rejected').length;

        return {
            totalDays: attendance.length,
            present,
            absent: 0, // Would need working days calculation
            totalHours: totalHours.toFixed(1),
            overtime: overtime.toFixed(1),
            avgHours: present > 0 ? (totalHours / present).toFixed(1) : '0',
            lateArrivals,
            violations,
            attendanceRate: present > 0 ? ((approved / present) * 100).toFixed(1) : '0',
            punctualityRate: present > 0 ? (((present - lateArrivals) / present) * 100).toFixed(1) : '0',
            approved,
            pending,
            rejected
        };
    }

    /**
     * Helper: Get working days in period
     */
    getWorkingDays(startDate, endDate) {
        let count = 0;
        let current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) { // Not Sunday or Saturday
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    }

    /**
     * Helper: Generate trend data for graph
     */
    generateTrendData(attendance, startDate, endDate) {
        const data = [];
        let current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const dateStr = format(current, 'yyyy-MM-dd');
            const dayAttendance = attendance.filter(a => 
                format(new Date(a.clock_in), 'yyyy-MM-dd') === dateStr
            );

            data.push({
                label: format(current, 'MMM dd'),
                value: dayAttendance.length,
                date: dateStr
            });

            current.setDate(current.getDate() + 1);
        }

        return data;
    }
}

export default new PDFReportService();
