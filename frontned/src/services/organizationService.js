import api from './api';

const organizationService = {
    // Departments
    getDepartments: async () => {
        const response = await api.get('/departments');
        return response.data;
    },
    getDepartmentHierarchy: async () => {
        const response = await api.get('/departments/hierarchy');
        return response.data;
    },
    getDepartmentById: async (id) => {
        const response = await api.get(`/departments/${id}`);
        return response.data;
    },
    createDepartment: async (departmentData) => {
        const response = await api.post('/departments', departmentData);
        return response.data;
    },
    updateDepartment: async (id, departmentData) => {
        const response = await api.put(`/departments/${id}`, departmentData);
        return response.data;
    },
    deleteDepartment: async (id) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    },
    restoreDepartment: async (id) => {
        const response = await api.post(`/departments/${id}/restore`);
        return response.data;
    },

    // Positions
    getPositions: async (filters = {}) => {
        const response = await api.get('/positions', { params: filters });
        return response.data;
    },
    getPositionById: async (id) => {
        const response = await api.get(`/positions/${id}`);
        return response.data;
    },
    createPosition: async (positionData) => {
        const response = await api.post('/positions', positionData);
        return response.data;
    },
    updatePosition: async (id, positionData) => {
        const response = await api.put(`/positions/${id}`, positionData);
        return response.data;
    },
    deletePosition: async (id) => {
        const response = await api.delete(`/positions/${id}`);
        return response.data;
    },
    restorePosition: async (id) => {
        const response = await api.post(`/positions/${id}/restore`);
        return response.data;
    }
};

export default organizationService;
