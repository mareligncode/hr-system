import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let token = '';

// Helper to log in and get token
const login = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@hotel.com', // Assuming an admin user exists
            password: 'password123'
        });
        token = res.data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed. Please ensure an admin user exists with admin@hotel.com / password123');
        process.exit(1);
    }
};

const verifyShifts = async () => {
    await login();
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
        // 1. Create Shift Type
        console.log('Creating shift type...');
        const typeRes = await axios.post(`${API_URL}/shifts/types`, {
            name: 'Morning Shift',
            code: 'MORN',
            department_id: 1, // Assuming department 1 exists
            start_time: '08:00:00',
            end_time: '16:00:00'
        }, config);
        const shiftTypeId = typeRes.data.id;
        console.log('Shift type created:', shiftTypeId);

        // 2. Create Assignment
        console.log('Creating shift assignment...');
        const assignRes = await axios.post(`${API_URL}/shifts/assignments`, {
            employee_id: 1, // Assuming employee 1 exists
            shift_type_id: shiftTypeId,
            assignment_date: '2026-04-01',
            created_by: 1
        }, config);
        const assignmentId = assignRes.data.id;
        console.log('Assignment created:', assignmentId);

        // 3. Test Conflict Detection
        console.log('Testing conflict detection...');
        try {
            await axios.post(`${API_URL}/shifts/assignments`, {
                employee_id: 1,
                shift_type_id: shiftTypeId,
                assignment_date: '2026-04-01'
            }, config);
        } catch (error) {
            console.log('Conflict detected correctly:', error.response.data.error);
        }

        // 4. Create Swap Request
        console.log('Creating swap request...');
        const swapRes = await axios.post(`${API_URL}/shifts/swaps`, {
            shift_assignment_id: assignmentId,
            target_employee_id: 2, // Assuming employee 2 exists
            reason: 'Medical appointment'
        }, config);
        console.log('Swap request created:', swapRes.data.id);

        console.log('Verification successful!');
    } catch (error) {
        console.error('Verification failed:', error.response ? error.response.data : error.message);
    }
};

verifyShifts();
