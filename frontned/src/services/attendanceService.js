import api from './api';

const attendanceService = {
    clockIn: async (data) => {
        const response = await api.post('/attendance/clock-in', data);
        return response.data;
    },

    clockOut: async (data) => {
        const response = await api.post('/attendance/clock-out', data);
        return response.data;
    },

    getMyAttendance: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        const response = await api.get('/attendance/my', { params });
        return response.data;
    },

    getAttendanceSummary: async () => {
        const response = await api.get('/attendance/summary');
        return response.data;
    },

    getTeamAttendance: async (date, departmentId) => {
        const params = {};
        if (date) params.date = date;
        if (departmentId) params.department_id = departmentId;
        const response = await api.get('/attendance/team', { params });
        return response.data;
    },

    getAttendanceReports: async (startDate, endDate, departmentId) => {
        const params = { start_date: startDate, end_date: endDate };
        if (departmentId) params.department_id = departmentId;
        const response = await api.get('/attendance/reports', { params });
        return response.data;
    },

    getCorrectionRequests: async () => {
        const response = await api.get('/attendance/corrections');
        return response.data;
    },

    approveCorrection: async (id, status, comment) => {
        const response = await api.put(`/attendance/correction/${id}/approve`, { status, comment });
        return response.data;
    },

    approveAttendance: async (id, status, comment) => {
        const response = await api.put(`/attendance/${id}/approve`, { status, comment });
        return response.data;
    },

    requestCorrection: async (data) => {
        const response = await api.post('/attendance/correction', data);
        return response.data;
    },

    getSummary: async () => {
        const response = await api.get('/attendance/summary');
        return response.data;
    },

    exportAttendance: async (startDate, endDate, date) => {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (date) params.date = date;

        const response = await api.get('/attendance/export', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }
};

export default attendanceService;
