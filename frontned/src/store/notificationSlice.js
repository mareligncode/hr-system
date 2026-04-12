import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../services/notificationService';

// Async Thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            return await notificationService.getNotifications();
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch notifications');
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            return await notificationService.getUnreadCount();
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch unread count');
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            await notificationService.markAsRead(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
        }
    }
);

export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.markAllAsRead();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to mark all as read');
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (id, { rejectWithValue }) => {
        try {
            await notificationService.deleteNotification(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to delete notification');
        }
    }
);

const initialState = {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Optimistic unread reduction when viewing dropdown
        clearUnreadCount: (state) => {
            state.unreadCount = 0;
        },
        // Useful for real-time WebSocket additions later
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Unread Count
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })

            // Mark As Read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const id = action.payload;
                const notification = state.items.find(n => n.id === id);
                if (notification && !notification.is_read) {
                    notification.is_read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })

            // Mark All As Read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.items.forEach(n => { n.is_read = true; });
                state.unreadCount = 0;
            })

            // Delete
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const id = action.payload;
                const notification = state.items.find(n => n.id === id);
                if (notification && !notification.is_read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.items = state.items.filter(n => n.id !== id);
            });
    }
});

export const { clearUnreadCount, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
