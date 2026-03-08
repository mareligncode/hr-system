import api from './api';

const auditService = {
    getLogs: async (params) => {
        const response = await api.get('/audit', { params });
        return response.data;
    },
    exportLogs: async () => {
        const response = await api.get('/audit/export', { responseType: 'blob' });
        return response.data;
    }
};

export default auditService;
