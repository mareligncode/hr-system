import api from './api';

const recruitmentService = {
    // ─── Job Postings (Primary Job Management) ───────────────────────────────────
    getAllJobPostings: async (params) => {
        const response = await api.get('/job-postings', { params });
        return response.data;
    },
    getJobPostingById: async (id) => {
        const response = await api.get(`/job-postings/${id}`);
        return response.data;
    },
    createJobPosting: async (data) => {
        const response = await api.post('/job-postings', data);
        return response.data;
    },
    updateJobPosting: async (id, data) => {
        const response = await api.put(`/job-postings/${id}`, data);
        return response.data;
    },
    deleteJobPosting: async (id) => {
        const response = await api.delete(`/job-postings/${id}`);
        return response.data;
    },
    publishJobPosting: async (id) => {
        const response = await api.put(`/job-postings/${id}/publish`);
        return response.data;
    },

    // ─── Public Careers Page ─────────────────────────────────────────────────────
    getPublicJobPostings: async () => {
        const response = await api.get('/job-postings/public');
        return response.data;
    },
    getPublicJobPostingById: async (id) => {
        const response = await api.get(`/job-postings/public/${id}`);
        return response.data;
    },

    // ─── Application Submission (Public) ─────────────────────────────────────────
    submitApplication: async (formData) => {
        const response = await api.post('/job-applications/submit', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // ─── Application Management (HR/Admin) ───────────────────────────────────────
    getAllApplications: async (params) => {
        const response = await api.get('/job-applications', { params });
        return response.data;
    },
    getApplicationById: async (id) => {
        const response = await api.get(`/job-applications/${id}`);
        return response.data;
    },
    updateApplicationStatus: async (id, data) => {
        const response = await api.put(`/job-applications/${id}/status`, data);
        return response.data;
    },
    getApplicationTimeline: async (id) => {
        const response = await api.get(`/job-applications/${id}/timeline`);
        return response.data;
    },
    getPipelineAnalytics: async (params) => {
        const response = await api.get('/job-applications/analytics/pipeline', { params });
        return response.data;
    },

    // ─── Interviews ──────────────────────────────────────────────────────────────
    getInterviews: async (params) => {
        const response = await api.get('/interviews', { params });
        return response.data;
    },
    scheduleInterview: async (data) => {
        const response = await api.post('/interviews', data);
        return response.data;
    },
    getInterviewById: async (id) => {
        const response = await api.get(`/interviews/${id}`);
        return response.data;
    },
    submitInterviewFeedback: async (data) => {
        const { interview_id, ...feedback } = data;
        const response = await api.post(`/interviews/${interview_id}/feedback`, feedback);
        return response.data;
    },

    // ─── Offers ──────────────────────────────────────────────────────────────────
    getOffers: async (params) => {
        const response = await api.get('/offers', { params });
        return response.data;
    },
    createOffer: async (data) => {
        const response = await api.post('/offers', data);
        return response.data;
    },
    getOfferById: async (id) => {
        const response = await api.get(`/offers/${id}`);
        return response.data;
    },
    acceptOffer: async (id) => {
        const response = await api.post(`/offers/${id}/accept`);
        return response.data;
    },
    rejectOffer: async (id, data) => {
        const response = await api.post(`/offers/${id}/reject`, data);
        return response.data;
    },

    // ─── Legacy / Mixed Routes ───────────────────────────────────────────────────
    getApplicants: async () => {
        const response = await api.get('/applicants');
        return response.data;
    },
};

export default recruitmentService;
