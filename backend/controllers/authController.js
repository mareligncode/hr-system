import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user && (await user.validPassword(password))) {

            user.last_login_at = new Date();
            user.last_login_ip = req.ip;
            await user.save();

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    employee_id: user.employee_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    status: user.status
                },
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const logout = async (req, res) => {
    // In stateless JWT auth, logout is handled client-side by dropping the token.
    res.json({ message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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

            const updatedUser = await user.save();
            res.json({
                id: updatedUser.id,
                email: updatedUser.email,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                phone: updatedUser.phone
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.reset_code || user.reset_code !== code) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        if (new Date() > user.reset_code_expires_at) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        user.password_hash = password;
        user.reset_code = null;
        user.reset_code_expires_at = null;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
        res.status(500).json({ message: 'Server error', error: error.message });
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
