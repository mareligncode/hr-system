import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import organizationReducer from './organizationSlice.js';
import employeeReducer from './employeeSlice.js';
import roleReducer from './roleSlice.js';
import auditReducer from './auditSlice.js';

const store = configureStore({
    reducer: {
        auth: authReducer,
        organization: organizationReducer,
        employees: employeeReducer,
        roles: roleReducer,
        audit: auditReducer,
    },
});

export default store;
