import { User, Role, Permission, Employee, Department, Position } from '../models/index.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { logActivity } from '../services/auditService.js';

// Helper to generate generic JWT tokens
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

export const register = async (req, res) => {
    try {
        const { employee_id, email, password, first_name, last_name, phone } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const employeeIdExists = await User.findOne({ where: { employee_id } });
        if (employeeIdExists) {
            return res.status(400).json({ message: 'Employee ID already exists' });
        }

        const user = await User.create({
            employee_id,
            email,
            password_hash: password,
            first_name,
            last_name,
            phone,
            status: 'pending' // requires email verification
        });

        if (user) {
            // Send verification email
            const verificationToken = generateToken(user.id);
            try {
                await sendVerificationEmail(user, verificationToken);
            } catch (error) {
                console.error('Email could not be sent. User created but unverified.');
            }

            res.status(201).json({
                message: 'User registered successfully. Please verify your email.',
                user: {
                    id: user.id,
                    employee_id: user.employee_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
                token: generateToken(user.id),
            });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: { email },
            include: [{
                model: Employee,
                include: [Department, Position]
            }]
        });

        if (user && (await user.validPassword(password))) {

            user.last_login_at = new Date();
            user.last_login_ip = req.ip;
            await user.save();

            await logActivity(user.id, 'LOGIN', 'User', user.id, null, { ip: req.ip }, req);

            // Fetch primary role and its permissions based on the user's string 'role' enum
            const primaryRole = await Role.findOne({
                where: { code: user.role },
                include: [Permission]
            });

            const permissions = new Set();
            primaryRole?.Permissions?.forEach(p => permissions.add(p.code));

            // Also check join table if they have additional roles
            const userWithPerms = await User.findByPk(user.id, {
                include: [{ model: Role, include: [Permission] }]
            });

            userWithPerms.Roles?.forEach(role => {
                role.Permissions?.forEach(p => permissions.add(p.code));
            });

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    employee_id: user.employee_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    status: user.status,
                    role: user.role,
                    profile_picture: user.profile_picture,
                    profile_picture_url: user.profile_picture_url,
                    permissions: Array.from(permissions),
                    employee_details: user.Employee ? {
                        id: user.Employee.id,
                        department: user.Employee.Department?.name,
                        department_id: user.Employee.Department?.id,
                        position: user.Employee.Position?.title,
                        position_id: user.Employee.Position?.id,
                        employee_number: user.Employee.employee_number
                    } : null
                },
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const logout = async (req, res) => {
    // In stateless JWT auth, logout is handled client-side by dropping the token.
    res.json({ message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Role, include: [Permission] }]
        });

        if (user) {
            const permissions = new Set();

            // Add from primary role string
            const primaryRole = await Role.findOne({
                where: { code: user.role },
                include: [Permission]
            });
            primaryRole?.Permissions?.forEach(p => permissions.add(p.code));

            // Add from joined roles
            user.Roles?.forEach(role => {
                role.Permissions?.forEach(p => permissions.add(p.code));
            });

            const userData = user.toJSON();
            userData.permissions = Array.from(permissions);
            userData.profile_picture_url = user.profile_picture_url;
            res.json(userData);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user) {
            user.first_name = req.body.first_name || user.first_name;
            user.last_name = req.body.last_name || user.last_name;
            user.phone = req.body.phone || user.phone;
            user.language_preference = req.body.language_preference || user.language_preference;

            if (req.body.password) {
                user.password_hash = req.body.password;
            }

            if (req.file) {
                user.profile_picture = req.file.path;
            }

            const updatedUser = await user.save();

            // Also update linked Employee record if it exists
            const employee = await Employee.findOne({ where: { user_id: req.user.id } });
            if (employee) {
                // List of fields that belong to the Employee model and are allowed to be updated by the user
                const allowedEmployeeFields = [
                    'date_of_birth', 'gender', 'marital_status', 'nationality',
                    'id_number', 'id_type', 'id_expiry_date',
                    'bank_name', 'bank_account_number', 'bank_account_name', 'bank_iban', 'bank_swift',
                    'tax_id', 'social_security_number',
                    'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
                    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
                    'work_email', 'work_phone', 'office_location'
                ];

                const employeeUpdateData = {};
                allowedEmployeeFields.forEach(field => {
                    if (req.body[field] !== undefined) {
                        employeeUpdateData[field] = req.body[field] === '' ? null : req.body[field];
                    }
                });

                if (Object.keys(employeeUpdateData).length > 0) {
                    await employee.update(employeeUpdateData);
                }
            }

            // Refetch user with associations to return complete data
            const finalUser = await User.findByPk(user.id, {
                attributes: { exclude: ['password_hash'] },
                include: [{ model: Employee }]
            });

            res.json(finalUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit numeric code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.reset_code = resetCode;
        user.reset_code_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        try {
            await sendPasswordResetEmail(user, resetCode);
            res.json({ message: 'Password reset code sent to email' });
        } catch (error) {
            res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;
        console.log(`Reset password attempt for: ${email}, Code provided: ${code}`);

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`Reset password failed: User not found for ${email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`User found. Stored code: ${user.reset_code}, Expires at: ${user.reset_code_expires_at}`);

        if (!user.reset_code || user.reset_code !== code) {
            console.log(`Reset password failed: Code mismatch. Stored: ${user.reset_code}, Provided: ${code}`);
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        if (new Date() > user.reset_code_expires_at) {
            console.log(`Reset password failed: Code expired. Now: ${new Date()}, Expires at: ${user.reset_code_expires_at}`);
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        user.password_hash = password;
        user.reset_code = null;
        user.reset_code_expires_at = null;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.email_verified_at = new Date();
        user.status = 'active';
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired verification token', error: error.message });
    }
};

export const refresh = async (req, res) => {
    try {
        // Simple token issuance, assuming the old token is still validly evaluated by protect MiddleWare
        // In fully stateless JWT, you typically send a refresh token in httpOnly cookie.
        const newToken = generateToken(req.user.id);
        res.json({
            message: 'Token refreshed',
            token: newToken
        });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;

        // Find user by req.user.id (from the protect middleware)
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify old password
        if (!(await user.validPassword(old_password))) {
            return res.status(401).json({ message: 'Invalid old password' });
        }

        // Update with new password
        user.password_hash = new_password; // Let model hook handle hashing
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
