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
};

export default leaveService;
