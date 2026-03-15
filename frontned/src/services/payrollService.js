import api from './api';

const payrollService = {
    getAllPeriods: async (page = 1, limit = 10) => {
        const response = await api.get(`/payroll/periods?page=${page}&limit=${limit}`);
        return response.data;
    },

    createPeriod: async (data) => {
        const response = await api.post('/payroll/periods', data);
        return response.data;
    },

    getPeriodById: async (id) => {
        const response = await api.get(`/payroll/periods/${id}`);
        return response.data;
    },

    calculatePayroll: async (id) => {
        const response = await api.post(`/payroll/periods/${id}/calculate`);
        return response.data;
    },

    reviewPayroll: async (id) => {
        const response = await api.post(`/payroll/periods/${id}/review`);
        return response.data;
    },

    approvePayroll: async (id) => {
        const response = await api.post(`/payroll/periods/${id}/approve`);
        return response.data;
    },

    getMyPayslips: async () => {
        const response = await api.get('/payroll/my-payslips');
        return response.data;
    }
};

export default payrollService;
