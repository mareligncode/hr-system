import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// Async thunks
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return { token, user };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await api.post('/auth/logout');
    } catch (_err) {
        // Even if server call fails, clear local state
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/users/me');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
    try {
        const isFormData = profileData instanceof FormData;
        const response = await api.put('/users/me', profileData, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, code, password }, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/reset-password', { email, code, password });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/change-password', passwords);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
    try {
        const response = await api.get(`/auth/verify-email/${token}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
});

// Helpers to restore session
const storedToken = localStorage.getItem('token');
const storedUser = (() => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
})();

const initialState = {
    user: storedUser || null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
    successMessage: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        // Login
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        // Logout
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });

        // Fetch Profile
        builder
            .addCase(fetchProfile.pending, (state) => { state.loading = true; })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        // Update Profile
        builder
            .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = { ...state.user, ...action.payload };
                state.successMessage = 'Profile updated successfully';
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        // Forgot password
        builder
            .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(forgotPassword.fulfilled, (state, action) => { state.loading = false; state.successMessage = action.payload.message; })
            .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        // Reset password
        builder
            .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(resetPassword.fulfilled, (state, action) => { state.loading = false; state.successMessage = action.payload.message; })
            .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        // Change password
        builder
            .addCase(changePassword.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(changePassword.fulfilled, (state, action) => { state.loading = false; state.successMessage = action.payload.message; })
            .addCase(changePassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        // Verify email
        builder
            .addCase(verifyEmail.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(verifyEmail.fulfilled, (state, action) => { state.loading = false; state.successMessage = action.payload.message; })
            .addCase(verifyEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    }
});

export const { clearErrors, clearSuccess } = authSlice.actions;
export default authSlice.reducer;
