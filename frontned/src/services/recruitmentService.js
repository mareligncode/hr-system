import api from './api';

const recruitmentService = {
    // Job Postings (Internal/HR)
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

    restoreJobPosting: async (id) => {
        const response = await api.post(`/job-postings/${id}/restore`);
        return response.data;
    },

    publishJobPosting: async (id) => {
        const response = await api.put(`/job-postings/${id}/publish`);
        return response.data;
    },

    // Job Postings (Public)
    getPublicJobPostings: async () => {
        const response = await api.get('/job-postings/public');
        return response.data;
    },

    getPublicJobPostingById: async (id) => {
        const response = await api.get(`/job-postings/public/${id}`);
        return response.data;
    },

    // Job Applications
    submitApplication: async (data) => {
        // data should be FormData for file upload
        const response = await api.post('/job-applications/submit', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

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

    // Applicants
    getAllApplicants: async () => {
        const response = await api.get('/applicants');
        return response.data;
    },

    getApplicantById: async (id) => {
        const response = await api.get(`/applicants/${id}`);
        return response.data;
    },

    updateApplicant: async (id, data) => {
        const response = await api.put(`/applicants/${id}`, data);
        return response.data;
    },

    // Phase 9: Interviews
    getPipelineAnalytics: async (params) => {
        const response = await api.get('/job-applications/analytics/pipeline', { params });
        return response.data;
    },

    getInterviews: async (params) => {
        const response = await api.get('/interviews', { params });
        return response.data;
    },

    getInterviewById: async (id) => {
        const response = await api.get(`/interviews/${id}`);
        return response.data;
    },

    scheduleInterview: async (data) => {
        const response = await api.post('/interviews', data);
        return response.data;
    },

    updateInterview: async (id, data) => {
        const response = await api.put(`/interviews/${id}`, data);
        return response.data;
    },

    submitInterviewFeedback: async (data) => {
        const response = await api.post(`/interviews/${data.interview_id}/feedback`, data);
        return response.data;
    },

    // Phase 9: Offers
    getOffers: async (params) => {
        const response = await api.get('/offers', { params });
        return response.data;
    },

    getOfferById: async (id) => {
        const response = await api.get(`/offers/${id}`);
        return response.data;
    },

    createOffer: async (data) => {
        const response = await api.post('/offers', data);
        return response.data;
    },

    updateOffer: async (id, data) => {
        const response = await api.put(`/offers/${id}`, data);
        return response.data;
    },

    acceptOffer: async (id) => {
        const response = await api.post(`/offers/${id}/accept`);
        return response.data;
    },

    rejectOffer: async (id, data) => {
        const response = await api.post(`/offers/${id}/reject`, data);
        return response.data;
    }
};

export default recruitmentService;
