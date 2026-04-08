import api from './api';

const leaveService = {
    // Leave Types
    getLeaveTypes: () => api.get('/leave/types'),
    createLeaveType: (data) => api.post('/leave/types', data),

    // Leave Requests
    requestLeave: (data) => api.post('/leave/requests', data),
    getMyLeaveRequests: () => api.get('/leave/my'),

    // Approvals
    getPendingApprovals: () => api.get('/leave/pending'),
    approveLeave: (id, data) => api.put(`/leave/requests/${id}/approve`, data),

    // Blackout Dates
    getBlackoutDates: () => api.get('/leave/blackout'),
    createBlackoutDate: (data) => api.post('/leave/blackout', data),
    deleteBlackoutDate: (id) => api.delete(`/leave/blackout/${id}`),

    // Accruals
    runAccrual: () => api.post('/leave/accrual/run'),

    // Encashments
    requestEncashment: (data) => api.post('/leave/encashment', data),
    getEncashmentRequests: (status) => api.get('/leave/encashment', { params: { status } }),
    approveEncashment: (id, data) => api.put(`/leave/encashment/${id}/approve`, data),

    // Balances
    getMyLeaveBalances: () => api.get('/leave/balances/my'), // I need to add this endpoint to backend
};

export default leaveService;
