import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const verifyScoping = async () => {
    try {
        // 1. Log in as a manager
        // We'll use the first manager found or a hardcoded email if we know one
        // For this test, we'll assume there's a manager@example.com (or similar from seed)
        console.log('Logging in as manager...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'manager@example.com', // Replace with a real manager email from your seed
            password: 'password123'
        });
        const token = loginRes.data.token;
        const managerDept = loginRes.data.user.Employee?.department_id;

        console.log(`Manager logged in. Department ID: ${managerDept}`);

        // 2. Fetch employees
        console.log('Fetching employees...');
        const empRes = await axios.get(`${API_URL}/employees`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const allSameDept = empRes.data.every(emp => emp.department_id === managerDept);
        console.log(`Employees fetched: ${empRes.data.length}`);
        console.log(`All employees belong to department ${managerDept}: ${allSameDept}`);

        if (!allSameDept) {
            console.error('VERIFICATION FAILED: Found employees from other departments!');
            process.exit(1);
        }

        // 3. Fetch shifts
        console.log('Fetching shift assignments...');
        const shiftRes = await axios.get(`${API_URL}/shifts/assignments`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const shiftsAllSameDept = shiftRes.data.every(s => s.Employee?.department_id === managerDept);
        console.log(`Shifts fetched: ${shiftRes.data.length}`);
        console.log(`All shifts belong to employees in department ${managerDept}: ${shiftsAllSameDept}`);

        if (!shiftsAllSameDept) {
            console.error('VERIFICATION FAILED: Found shifts from other departments!');
            process.exit(1);
        }

        console.log('VERIFICATION SUCCESSFUL: Departmental scoping is enforced.');
    } catch (error) {
        console.error('Verification failed with error:', error.response?.data || error.message);
        process.exit(1);
    }
};

verifyScoping();
