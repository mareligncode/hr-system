import api from './api';

const reportService = {
    getExecutiveDashboard: async () => {
        const response = await api.get('/reports/dashboard/executive');
        return response.data;
    },
    getHRDashboard: async () => {
        const response = await api.get('/reports/dashboard/hr');
        return response.data;
    },
    getManagerDashboard: async () => {
        const response = await api.get('/reports/dashboard/manager');
        return response.data;
    },
    getFinanceDashboard: async () => {
        const response = await api.get('/reports/dashboard/finance');
        return response.data;
    },
    getReportData: async (type) => {
        const response = await api.get(`/reports/data?type=${type}`);
        return response.data;
    },
    exportReport: async (type) => {
        const response = await api.get(`/reports/export/${type}`, {
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report-${type}-${new Date().getTime()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};

export default reportService;
