import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import organizationReducer from './organizationSlice.js';

const store = configureStore({
    reducer: {
        auth: authReducer,
        organization: organizationReducer,
    },
});

export default store;
