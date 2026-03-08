import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roleService from '../services/roleService';

export const fetchRoles = createAsyncThunk('roles/fetchAll', async (_, { rejectWithValue }) => {
    try {
        return await roleService.getRoles();
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch roles');
    }
});

export const fetchPermissions = createAsyncThunk('roles/fetchPermissions', async (_, { rejectWithValue }) => {
    try {
        return await roleService.getPermissions();
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch permissions');
    }
});

const roleSlice = createSlice({
    name: 'roles',
    initialState: {
        roles: [],
        permissions: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => { state.loading = true; })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.permissions = action.payload;
            });
    },
});

export default roleSlice.reducer;
