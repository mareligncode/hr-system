import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import organizationService from '../services/organizationService';

// Async Thunks for Departments
export const fetchDepartments = createAsyncThunk(
    'organization/fetchDepartments',
    async (_, { rejectWithValue }) => {
        try {
            return await organizationService.getDepartments();
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch departments');
        }
    }
);

export const fetchDepartmentHierarchy = createAsyncThunk(
    'organization/fetchDepartmentHierarchy',
    async (_, { rejectWithValue }) => {
        try {
            return await organizationService.getDepartmentHierarchy();
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch hierarchy');
        }
    }
);

export const createDepartment = createAsyncThunk(
    'organization/createDepartment',
    async (departmentData, { rejectWithValue }) => {
        try {
            return await organizationService.createDepartment(departmentData);
        } catch (error) {
            return rejectWithValue(error.response?.data?.details || error.response?.data?.error || 'Failed to create department');
        }
    }
);

export const updateDepartment = createAsyncThunk(
    'organization/updateDepartment',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await organizationService.updateDepartment(id, data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.details || error.response?.data?.error || 'Failed to update department');
        }
    }
);

export const deleteDepartment = createAsyncThunk(
    'organization/deleteDepartment',
    async (id, { rejectWithValue }) => {
        try {
            await organizationService.deleteDepartment(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete department');
        }
    }
);

// Async Thunks for Positions
export const fetchPositions = createAsyncThunk(
    'organization/fetchPositions',
    async (filters, { rejectWithValue }) => {
        try {
            return await organizationService.getPositions(filters);
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch positions');
        }
    }
);

export const createPosition = createAsyncThunk(
    'organization/createPosition',
    async (positionData, { rejectWithValue }) => {
        try {
            return await organizationService.createPosition(positionData);
        } catch (error) {
            return rejectWithValue(error.response?.data?.details || error.response?.data?.error || 'Failed to create position');
        }
    }
);

const initialState = {
    departments: [],
    hierarchy: [],
    positions: [],
    loading: false,
    error: null,
    successMessage: null
};

const organizationSlice = createSlice({
    name: 'organization',
    initialState,
    reducers: {
        clearOrgErrors: (state) => { state.error = null; },
        clearOrgSuccess: (state) => { state.successMessage = null; }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Departments
            .addCase(fetchDepartments.pending, (state) => { state.loading = true; })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Hierarchy
            .addCase(fetchDepartmentHierarchy.fulfilled, (state, action) => {
                state.hierarchy = action.payload;
            })
            // Create Department
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.departments.push(action.payload);
                state.successMessage = 'Department created successfully';
            })
            // Update Department
            .addCase(updateDepartment.fulfilled, (state, action) => {
                const index = state.departments.findIndex(d => d.id === action.payload.id);
                if (index !== -1) state.departments[index] = action.payload;
                state.successMessage = 'Department updated successfully';
            })
            // Delete Department
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.departments = state.departments.filter(d => d.id !== action.payload);
                state.successMessage = 'Department deleted successfully';
            })
            // Fetch Positions
            .addCase(fetchPositions.pending, (state) => { state.loading = true; })
            .addCase(fetchPositions.fulfilled, (state, action) => {
                state.loading = false;
                state.positions = action.payload;
            })
            // Create Position
            .addCase(createPosition.fulfilled, (state, action) => {
                state.positions.push(action.payload);
                state.successMessage = 'Position created successfully';
            });
    }
});

export const { clearOrgErrors, clearOrgSuccess } = organizationSlice.actions;
export default organizationSlice.reducer;
