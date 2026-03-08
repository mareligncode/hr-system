import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import employeeService from '../services/employeeService';

export const fetchEmployees = createAsyncThunk(
    'employees/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            return await employeeService.getEmployees(params);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchEmployeeById = createAsyncThunk(
    'employees/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            return await employeeService.getEmployeeById(id);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const employeeSlice = createSlice({
    name: 'employees',
    initialState: {
        employees: [],
        currentEmployee: null,
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10
        }
    },
    reducers: {
        clearCurrentEmployee: (state) => {
            state.currentEmployee = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                // Backend currently returns a direct array, not { employees, total }
                state.employees = Array.isArray(action.payload) ? action.payload : (action.payload.employees || []);
                state.pagination.total = Array.isArray(action.payload) ? action.payload.length : (action.payload.total || 0);
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch employees';
            })
            .addCase(fetchEmployeeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployeeById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentEmployee = action.payload;
            })
            .addCase(fetchEmployeeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch employee details';
            });
    }
});

export const { clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
