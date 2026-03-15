import api from './api';

export const notificationService = {
    // Notifications
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data.unreadCount;
    },

    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    // Settings
    getSettings: async () => {
        const response = await api.get('/notifications/settings');
        return response.data;
    },

    updateSettings: async (settingsData) => {
        const response = await api.put('/notifications/settings', settingsData);
        return response.data;
    },

    // Admin Templates
    getTemplates: async () => {
        const response = await api.get('/notifications/templates');
        return response.data;
    },

    createTemplate: async (templateData) => {
        const response = await api.post('/notifications/templates', templateData);
        return response.data;
    },

    updateTemplate: async (id, templateData) => {
        const response = await api.put(`/notifications/templates/${id}`, templateData);
        return response.data;
    },

    deleteTemplate: async (id) => {
        const response = await api.delete(`/notifications/templates/${id}`);
        return response.data;
    }
};
