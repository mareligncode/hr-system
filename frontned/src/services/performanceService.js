import api from './api';

const performanceService = {
    // KPIs
    getKPIs: (params) => api.get('/performance/kpis', { params }),
    recordKPIScore: (data) => api.post('/performance/kpis/score', data),
    getEmployeeSummary: (userId) => api.get(`/performance/summary/${userId}`),

    // 360 Feedback
    requestFeedback: (data) => api.post('/performance/reviews/request', data),
    submitFeedback: (id, data) => api.put(`/performance/reviews/${id}/submit`, data),

    // Recognition
    getBadges: () => api.get('/performance/badges'),
    nominateColleague: (data) => api.post('/performance/nominate', data),
    awardBadge: (data) => api.post('/performance/award', data),
    getRecognitionWall: () => api.get('/performance/recognition-wall'),

    // Disciplinary
    issueWarning: (data) => api.post('/performance/discipline', data),
    getDisciplinaryHistory: (params) => api.get('/performance/discipline/history', { params }),
};

export default performanceService;
