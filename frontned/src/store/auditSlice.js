import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import auditService from '../services/auditService';

export const fetchAuditLogs = createAsyncThunk('audit/fetchLogs', async (params, { rejectWithValue }) => {
    try {
        return await auditService.getLogs(params);
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
    }
});

const auditSlice = createSlice({
    name: 'audit',
    initialState: {
        logs: [],
        pagination: { total: 0, page: 1, totalPages: 1 },
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuditLogs.pending, (state) => { state.loading = true; })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload.logs || [];
                state.pagination = {
                    total: action.payload.total || 0,
                    page: action.payload.page || 1,
                    totalPages: action.payload.totalPages || 1
                };
            })
            .addCase(fetchAuditLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default auditSlice.reducer;
