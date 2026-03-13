import api from './api';

const shiftService = {
    // --- Shift Types ---
    getShiftTypes: (params) => api.get('/shifts/types', { params }),
    createShiftType: (data) => api.post('/shifts/types', data),
    updateShiftType: (id, data) => api.put(`/shifts/types/${id}`, data),
    deleteShiftType: (id) => api.delete(`/shifts/types/${id}`),

    // --- Shift Assignments ---
    getShiftAssignments: (params) => api.get('/shifts/assignments', { params }),
    getMyShifts: (params) => api.get('/shifts/assignments/my', { params }),
    createShiftAssignment: (data) => api.post('/shifts/assignments', data),
    bulkCreateAssignments: (data) => api.post('/shifts/assignments/bulk', data),
    checkConflict: (data) => api.post('/shifts/assignments/check-conflict', data),
    updateShiftAssignment: (id, data) => api.put(`/shifts/assignments/${id}`, data),
    deleteShiftAssignment: (id) => api.delete(`/shifts/assignments/${id}`),

    // --- Shift Swaps ---
    getShiftSwaps: (params) => api.get('/shifts/swaps', { params }),
    getMySwaps: (params) => api.get('/shifts/swaps/my', { params }),
    createShiftSwap: (data) => api.post('/shifts/swaps', data),
    approveShiftSwap: (id) => api.put(`/shifts/swaps/${id}/approve`),
    rejectShiftSwap: (id, data) => api.put(`/shifts/swaps/${id}/reject`, data),

    // --- Shift Templates ---
    getShiftTemplates: (params) => api.get('/shifts/templates', { params }),
    createShiftTemplate: (data) => api.post('/shifts/templates', data),
    updateShiftTemplate: (id, data) => api.put(`/shifts/templates/${id}`, data),
    deleteShiftTemplate: (id) => api.delete(`/shifts/templates/${id}`),
    applyShiftTemplate: (id, data) => api.post(`/shifts/templates/${id}/apply`, data),

    // --- Shift Rotations ---
    getShiftRotations: (params) => api.get('/shifts/rotations', { params }),
    createShiftRotation: (data) => api.post('/shifts/rotations', data),
    applyShiftRotation: (id, data) => api.post(`/shifts/rotations/${id}/apply`, data),

    // --- Shift Reports ---
    getShiftReports: (params) => api.get('/shifts/reports', { params }),
};

export default shiftService;
