import api from './api';

const employeeService = {
    // Employee Basics
    getEmployees: async (params) => {
        const response = await api.get('/employees', { params });
        return response.data;
    },
    getEmployeeById: async (id) => {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    },
    createEmployee: async (data) => {
        const response = await api.post('/employees', data);
        return response.data;
    },
    updateEmployee: async (id, data) => {
        const response = await api.put(`/employees/${id}`, data);
        return response.data;
    },
    deleteEmployee: async (id) => {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    },
    searchEmployees: async (query) => {
        const response = await api.get(`/employees/search`, { params: { q: query } });
        return response.data;
    },
    exportEmployees: async () => {
        const response = await api.get('/employees/export', { responseType: 'blob' });
        return response.data;
    },

    // Documents
    getDocuments: async (employeeId) => {
        const response = await api.get(`/documents/employee/${employeeId}`);
        return response.data;
    },
    uploadDocument: async (data) => {
        const response = await api.post('/documents', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    verifyDocument: async (id) => {
        const response = await api.put(`/documents/${id}/verify`);
        return response.data;
    },
    deleteDocument: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },
    getDocumentDownloadUrl: async (documentId) => {
        const response = await api.get(`/documents/${documentId}/download`);
        return response.data;
    },

    // Certifications
    getCertifications: async (employeeId) => {
        const response = await api.get(`/certifications/employee/${employeeId}`);
        return response.data;
    },
    createCertification: async (data) => {
        const response = await api.post('/certifications', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    updateCertification: async (id, data) => {
        const response = await api.put(`/certifications/${id}`, data);
        return response.data;
    },
    deleteCertification: async (id) => {
        const response = await api.delete(`/certifications/${id}`);
        return response.data;
    },
    getCertificationDownloadUrl: async (id) => {
        const response = await api.get(`/certifications/${id}/download`);
        return response.data;
    }
};

export default employeeService;
