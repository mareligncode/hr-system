import { User, Role, Permission, Employee, Department, Position, UserMfa, RefreshToken, UserSession, LoginAttempt } from '../models/index.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { logActivity } from '../services/auditService.js';
import { AuthService } from '../services/authService.js';
import logger from '../utils/logger.js';

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

/**
 * Enhanced login with refresh tokens, MFA, and session management
 */
export const login = async (req, res) => {
    try {
        const { email, password, totp_token, remember_device } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const deviceInfo = AuthService.parseDeviceInfo(userAgent);

        // Find user
        const user = await User.findOne({
            where: { email },
            include: [{ model: UserMfa }]
        });

        if (!user) {
            await AuthService.logLoginAttempt(
                email, null, ipAddress, userAgent, false, 'user_not_found'
            );
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check if account is locked
        if (await AuthService.isAccountLocked(user)) {
            await AuthService.logLoginAttempt(
                email, user.id, ipAddress, userAgent, false, 'account_locked'
            );
            return res.status(423).json({
                success: false,
                message: 'Account temporarily locked due to multiple failed login attempts',
                lockUntil: user.locked_until
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            await AuthService.logLoginAttempt(
                email, user.id, ipAddress, userAgent, false, 'account_inactive'
            );
            return res.status(403).json({
                success: false,
                message: 'Account is not active'
            });
        }

        // Verify password
        const isPasswordValid = await user.validPassword(password);
        if (!isPasswordValid) {
            await AuthService.handleFailedLogin(user);
            await AuthService.logLoginAttempt(
                email, user.id, ipAddress, userAgent, false, 'invalid_password'
            );
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check MFA if enabled
        if (user.mfa_enabled && user.UserMfa?.is_enabled) {
            if (!totp_token) {
                return res.status(200).json({
                    success: false,
                    mfa_required: true,
                    message: 'MFA token required'
                });
            }

            const isValidTotp = AuthService.verifyTotpToken(
                user.UserMfa.secret_key,
                totp_token
            );

            if (!isValidTotp) {
                await AuthService.handleFailedLogin(user);
                await AuthService.logLoginAttempt(
                    email, user.id, ipAddress, userAgent, false, 'mfa_failed'
                );
                return res.status(401).json({
                    success: false,
                    message: 'Invalid MFA token'
                });
            }

            // Update MFA last used
            await user.UserMfa.update({ last_used_at: new Date() });
        }

        // Successful login - reset failed attempts
        await AuthService.resetFailedAttempts(user);

        // Generate tokens
        const accessToken = AuthService.generateAccessToken(user);
        const refreshToken = await AuthService.generateRefreshToken(
            user, deviceInfo, ipAddress
        );

        // Create session
        const session = await AuthService.createSession(
            user, deviceInfo, ipAddress
        );

        // Log successful login
        await AuthService.logLoginAttempt(
            email, user.id, ipAddress, userAgent, true
        );

        // Fetch permissions and employee details
        const primaryRole = await Role.findOne({
            where: { code: user.role },
            include: [Permission]
        });

        const permissions = new Set();
        primaryRole?.Permissions?.forEach(p => permissions.add(p.code));

        const userWithPerms = await User.findByPk(user.id, {
            include: [
                { model: Role, include: [Permission] },
                { model: Employee, include: [Department, Position] }
            ]
        });

        userWithPerms.Roles?.forEach(role => {
            role.Permissions?.forEach(p => permissions.add(p.code));
        });

        // Audit log
        await logActivity(
            user.id, 'LOGIN', 'User', user.id,
            { device: deviceInfo, ip: ipAddress }, null, req
        );

        logger.info({
            userId: user.id,
            email: user.email,
            ip: ipAddress,
            device: deviceInfo
        }, 'User login successful');

        // Set refresh token in httpOnly cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.json({
            success: true,
            message: 'Login successful',
            access_token: accessToken,
            user: {
                id: user.id,
                employee_id: user.employee_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                status: user.status,
                profile_picture: user.profile_picture,
                profile_picture_url: user.profile_picture_url,
                mfa_enabled: user.mfa_enabled,
                permissions: Array.from(permissions),
                employee_details: userWithPerms.Employee ? {
                    id: userWithPerms.Employee.id,
                    department: userWithPerms.Employee.Department?.name,
                    department_id: userWithPerms.Employee.Department?.id,
                    position: userWithPerms.Employee.Position?.title,
                    position_id: userWithPerms.Employee.Position?.id,
                    employee_number: userWithPerms.Employee.employee_number
                } : null
            },
            session: {
                id: session.id,
                device: deviceInfo,
                created_at: session.created_at
            }
        });

    } catch (error) {
        logger.error({ err: error }, 'Login error');
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided'
            });
        }

        const refreshTokenRecord = await AuthService.verifyRefreshToken(token);
        if (!refreshTokenRecord) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        const user = refreshTokenRecord.User;
        const newAccessToken = AuthService.generateAccessToken(user);

        // Update session activity
        await UserSession.update(
            { last_activity_at: new Date() },
            {
                where: {
                    user_id: user.id,
                    is_current: true,
                    terminated_at: null
                }
            }
        );

        // Get permissions
        const primaryRole = await Role.findOne({
            where: { code: user.role },
            include: [Permission]
        });

        const permissions = new Set();
        primaryRole?.Permissions?.forEach(p => permissions.add(p.code));

        const userWithPerms = await User.findByPk(user.id, {
            include: [{ model: Role, include: [Permission] }]
        });

        userWithPerms.Roles?.forEach(role => {
            role.Permissions?.forEach(p => permissions.add(p.code));
        });

        res.json({
            success: true,
            access_token: newAccessToken,
            user: {
                id: user.id,
                employee_id: user.employee_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                mfa_enabled: user.mfa_enabled,
                permissions: Array.from(permissions)
            }
        });

    } catch (error) {
        logger.error({ err: error }, 'Refresh token error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Logout - revoke tokens and end session
 */
export const logout = async (req, res) => {
    try {
        const { refreshToken: token } = req.cookies;
        const userId = req.user.id;

        if (token) {
            await AuthService.revokeRefreshToken(token);
        }

        // End current session
        await UserSession.update(
            { terminated_at: new Date() },
            {
                where: {
                    user_id: userId,
                    is_current: true,
                    terminated_at: null
                }
            }
        );

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        await logActivity(
            userId, 'LOGOUT', 'User', userId,
            { ip: req.ip }, null, req
        );

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        logger.error({ err: error }, 'Logout error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
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
