import api from './api';

const roleService = {
    getRoles: async () => {
        const response = await api.get('/roles');
        return response.data;
    },
    createRole: async (roleData) => {
        const response = await api.post('/roles', roleData);
        return response.data;
    },
    updateRole: async (id, roleData) => {
        const response = await api.put(`/roles/${id}`, roleData);
        return response.data;
    },
    deleteRole: async (id) => {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    },
    getPermissions: async () => {
        const response = await api.get('/roles/permissions');
        return response.data;
    },
    assignRole: async (assignmentData) => {
        const response = await api.post('/roles/assign', assignmentData);
        return response.data;
    },
    unassignRole: async (assignmentData) => {
        const response = await api.delete('/roles/unassign', { data: assignmentData });
        return response.data;
    }
};

export default roleService;
