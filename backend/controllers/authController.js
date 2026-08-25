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
    // This is now handled by the refreshToken function above
    return refreshToken(req, res);
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

/**
 * Generate MFA setup QR code
 */
export const setupMfa = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if MFA is already enabled
        const existingMfa = await UserMfa.findOne({ where: { user_id: userId } });
        if (existingMfa && existingMfa.is_enabled) {
            return res.status(400).json({ 
                success: false,
                message: 'MFA is already enabled for this account' 
            });
        }

        // Generate MFA secret and QR code
        const mfaData = await AuthService.generateMfaSecret(user);
        const backupCodes = await AuthService.generateBackupCodes();

        // Store secret (not enabled yet - user needs to verify first)
        await UserMfa.upsert({
            user_id: userId,
            secret_key: mfaData.secret,
            backup_codes: backupCodes.map(code => ({
                code: crypto.createHash('sha256').update(code).digest('hex'),
                used: false
            })),
            is_enabled: false
        });

        res.json({
            success: true,
            message: 'MFA setup initiated',
            qrCode: mfaData.qrCode,
            manualEntryKey: mfaData.manualEntryKey,
            backupCodes: backupCodes
        });

    } catch (error) {
        logger.error({ err: error }, 'MFA setup error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Verify MFA setup and enable it
 */
export const verifyMfa = async (req, res) => {
    try {
        const { totp_token } = req.body;
        const userId = req.user.id;

        const userMfa = await UserMfa.findOne({ where: { user_id: userId } });
        if (!userMfa) {
            return res.status(404).json({
                success: false,
                message: 'MFA setup not found. Please start MFA setup first.'
            });
        }

        if (userMfa.is_enabled) {
            return res.status(400).json({
                success: false,
                message: 'MFA is already enabled'
            });
        }

        // Verify TOTP token
        const isValid = AuthService.verifyTotpToken(userMfa.secret_key, totp_token);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid TOTP token'
            });
        }

        // Enable MFA
        await userMfa.update({
            is_enabled: true,
            enabled_at: new Date()
        });

        await User.update(
            { mfa_enabled: true },
            { where: { id: userId } }
        );

        await logActivity(
            userId, 'MFA_ENABLED', 'User', userId,
            null, null, req
        );

        res.json({
            success: true,
            message: 'MFA enabled successfully'
        });

    } catch (error) {
        logger.error({ err: error }, 'MFA verification error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Disable MFA
 */
export const disableMfa = async (req, res) => {
    try {
        const { password, totp_token } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            include: [{ model: UserMfa }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        if (!(await user.validPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        if (!user.UserMfa || !user.UserMfa.is_enabled) {
            return res.status(400).json({
                success: false,
                message: 'MFA is not enabled'
            });
        }

        // Verify TOTP token
        const isValid = AuthService.verifyTotpToken(user.UserMfa.secret_key, totp_token);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid TOTP token'
            });
        }

        // Disable MFA
        await user.UserMfa.destroy();
        await user.update({ mfa_enabled: false });

        await logActivity(
            userId, 'MFA_DISABLED', 'User', userId,
            null, null, req
        );

        res.json({
            success: true,
            message: 'MFA disabled successfully'
        });

    } catch (error) {
        logger.error({ err: error }, 'MFA disable error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get user's active sessions
 */
export const getSessions = async (req, res) => {
    try {
        const userId = req.user.id;

        const sessions = await UserSession.findAll({
            where: {
                user_id: userId,
                terminated_at: null
            },
            order: [['last_activity_at', 'DESC']],
            attributes: [
                'id', 'device_name', 'device_type', 'browser_name', 
                'browser_version', 'os_name', 'os_version', 'ip_address',
                'location', 'is_current', 'created_at', 'last_activity_at'
            ]
        });

        res.json({
            success: true,
            sessions: sessions
        });

    } catch (error) {
        logger.error({ err: error }, 'Get sessions error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await UserSession.findOne({
            where: {
                id: sessionId,
                user_id: userId,
                terminated_at: null
            }
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Terminate session
        await session.update({ terminated_at: new Date() });

        // Revoke associated refresh tokens
        await RefreshToken.update(
            { is_revoked: true, revoked_at: new Date() },
            {
                where: {
                    user_id: userId,
                    ip_address: session.ip_address,
                    is_revoked: false
                }
            }
        );

        res.json({
            success: true,
            message: 'Session revoked successfully'
        });

    } catch (error) {
        logger.error({ err: error }, 'Revoke session error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Revoke all other sessions (keep current)
 */
export const revokeAllSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentSessionToken = req.cookies.refreshToken;

        // Find current refresh token to preserve it
        let currentRefreshToken = null;
        if (currentSessionToken) {
            currentRefreshToken = await RefreshToken.findOne({
                where: { token: currentSessionToken, user_id: userId }
            });
        }

        // Revoke all refresh tokens except current
        const whereClause = { user_id: userId, is_revoked: false };
        if (currentRefreshToken) {
            whereClause.id = { [Op.ne]: currentRefreshToken.id };
        }

        await RefreshToken.update(
            { is_revoked: true, revoked_at: new Date() },
            { where: whereClause }
        );

        // Terminate all sessions except current
        const sessionWhereClause = { user_id: userId, terminated_at: null };
        if (currentRefreshToken) {
            sessionWhereClause.ip_address = { [Op.ne]: currentRefreshToken.ip_address };
        }

        await UserSession.update(
            { terminated_at: new Date() },
            { where: sessionWhereClause }
        );

        res.json({
            success: true,
            message: 'All other sessions revoked successfully'
        });

    } catch (error) {
        logger.error({ err: error }, 'Revoke all sessions error');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Temporary endpoint to seed admin user (for Render deployment)
export const seedAdmin = async (req, res) => {
    try {
        // Create admin role
        const [adminRole] = await Role.findOrCreate({
            where: { code: 'admin' },
            defaults: {
                name: 'Admin',
                code: 'admin',
                description: 'Full system access',
                is_system: true
            }
        });

        // Create admin user
        const adminEmail = 'admin@hotel.com';
        const adminPassword = 'Admin@1234';

        const [adminUser, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                employee_id: 'SYSTEM001',
                email: adminEmail,
                password_hash: adminPassword,
                first_name: 'System',
                last_name: 'Administrator',
                role: 'admin',
                status: 'active',
                email_verified_at: new Date()
            }
        });

        if (created) {
            logger.info('Super Admin created!');
        } else {
            await adminUser.update({ role: 'admin', status: 'active' });
            logger.info('Admin user already exists, refreshed role and status');
        }

        // Seed standard roles
        const standardRoles = [
            { code: 'hr', name: 'HR Manager' },
            { code: 'manager', name: 'Department Manager' },
            { code: 'finance', name: 'Finance Officer' },
            { code: 'employee', name: 'Employee' },
            { code: 'gm', name: 'General Manager' },
        ];

        for (const r of standardRoles) {
            await Role.findOrCreate({
                where: { code: r.code },
                defaults: { name: r.name, code: r.code, is_system: true }
            });
        }

        res.json({
            success: true,
            message: created ? 'Admin user created successfully' : 'Admin user already exists',
            admin: {
                email: adminEmail,
                password: adminPassword
            }
        });
    } catch (error) {
        logger.error({ err: error }, 'Seed admin error');
        res.status(500).json({
            success: false,
            message: 'Failed to seed admin user',
            error: error.message
        });
    }
};

// Temporary endpoint to activate user (for testing without email)
export const activateUser = async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateData = {
            status: 'active',
            email_verified_at: new Date()
        };

        if (role) {
            updateData.role = role;
        }

        await user.update(updateData);

        res.json({
            success: true,
            message: 'User activated successfully',
            user: {
                email: user.email,
                status: user.status,
                role: user.role
            }
        });
    } catch (error) {
        logger.error({ err: error }, 'Activate user error');
        res.status(500).json({
            success: false,
            message: 'Failed to activate user',
            error: error.message
        });
    }
};
