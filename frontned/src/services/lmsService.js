import api from './api';

const lmsService = {
    getCourses: (params) => api.get('/lms/courses', { params }),
    getCourseDetail: (id) => api.get(`/lms/courses/${id}`),
    updateProgress: (id, data) => api.put(`/lms/courses/${id}/progress`, data),
    submitQuiz: (id, data) => api.post(`/lms/courses/${id}/quiz`, data),

    // Certifications (using existing routes if they exist, otherwise performance)
    getCertifications: (employeeId) => api.get(`/employees/${employeeId}/certifications`),
    addCertification: (data) => api.post('/certifications', data),
};

export default lmsService;
