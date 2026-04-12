import api from './api';

const dashboardService = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },
    getExpiringAssets: async () => {
        const response = await api.get('/dashboard/expiring');
        return response.data;
    },
    getActivity: async () => {
        const response = await api.get('/dashboard/activity');
        return response.data;
    },
    getEmployeeDashboard: async () => {
        const response = await api.get('/dashboard/employee');
        return response.data;
    }
};

export default dashboardService;
