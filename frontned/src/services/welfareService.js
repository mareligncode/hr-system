import api from './api';

const welfareService = {
    // Assets
    getAssets: (params) => api.get('/welfare/assets', { params }),
    assignAsset: (data) => api.post('/welfare/assets/assign', data),
    returnAsset: (id, data) => api.put(`/welfare/assets/assignments/${id}/return`, data),

    // Welfare
    getWelfareRequests: (params) => api.get('/welfare/requests', { params }),
    createWelfareRequest: (data) => api.post('/welfare/requests', data),

    // Accommodation
    getAccommodations: () => api.get('/welfare/accommodation'),
    assignRoom: (data) => api.post('/welfare/accommodation/assign', data),
};

export default welfareService;
