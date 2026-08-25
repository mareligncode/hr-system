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
    
    /**
     * Export report as Excel
     */
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
        window.URL.revokeObjectURL(url);
    },

    /**
     * Export report as PDF
     */
    exportReportPDF: async (type, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `/reports/export-pdf/${type}${queryString ? `?${queryString}` : ''}`;
        
        const response = await api.get(url, {
            responseType: 'blob'
        });

        // Create download link
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `report-${type}-${new Date().getTime()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    }
};

export default reportService;
