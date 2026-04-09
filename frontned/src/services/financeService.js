import api from './api';

const financeService = {
    // Payroll API
    getPeriods: () => api.get('/payroll/periods'),
    createPeriod: (data) => api.post('/payroll/periods', data),
    getPeriod: (id) => api.get(`/payroll/periods/${id}`),
    calculatePayroll: (id) => api.post(`/payroll/periods/${id}/calculate`),
    reviewPayroll: (id) => api.post(`/payroll/periods/${id}/review`),
    approvePayroll: (id) => api.post(`/payroll/periods/${id}/approve`),
    generateOffCycle: (data) => api.post('/payroll/off-cycle', data),
    getMyPayslips: () => api.get('/payroll/my-payslips'),

    // Expense API
    submitExpense: (data) => api.post('/finance/expenses', data),
    getMyExpenses: () => api.get('/finance/expenses/me'),
    getPendingExpenses: () => api.get('/finance/expenses/pending'),
    approveExpense: (id, status) => api.put(`/finance/expenses/${id}/approve`, { status }),

    // Tip Pool API
    createTipPool: (data) => api.post('/finance/tips', data),
    getTipPools: () => api.get('/finance/tips')
};

export default financeService;
