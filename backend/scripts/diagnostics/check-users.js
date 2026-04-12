import { User } from './models/index.js';
import sequelize from './config/database.js';

const checkUsers = async () => {
    try {
        const users = await User.findAll();
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(`- ${u.email} (Role: ${u.role}, Status: ${u.status})`));
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
};

checkUsers();
