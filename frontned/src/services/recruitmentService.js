import api from './api';

const recruitmentService = {
    // Jobs
    getJobs: (params) => api.get('/recruitment/jobs', { params }),
    createJob: (data) => api.post('/recruitment/jobs', data),

    // Applicants & ATS
    getApplicants: () => api.get('/recruitment/applicants'),
    updateApplicationStatus: (id, data) => api.put(`/recruitment/applications/${id}/status`, data),

    // Interviews
    getInterviews: () => api.get('/recruitment/interviews'),
    scheduleInterview: (data) => api.post('/recruitment/interviews', data),
};

export default recruitmentService;
