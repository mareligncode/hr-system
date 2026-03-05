import { jest } from '@jest/globals';
import User from '../models/User.js';
import sequelize from '../config/database.js';

describe('User Model', () => {
    beforeAll(async () => {
        // Sync models
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should hash password before saving', async () => {
        const user = await User.create({
            employee_id: 'EMP001',
            email: 'test@example.com',
            password_hash: 'password123',
            first_name: 'Test',
            last_name: 'User'
        });

        expect(user.password_hash).not.toBe('password123');
        expect(user.password_hash).toBeDefined();

        const isValid = await user.validPassword('password123');
        expect(isValid).toBe(true);
    });

    it('should fail with duplicate email', async () => {
        await expect(User.create({
            employee_id: 'EMP002',
            email: 'test@example.com', // same email
            password_hash: 'password123',
            first_name: 'Jane',
            last_name: 'Doe'
        })).rejects.toThrow();
    });
});
