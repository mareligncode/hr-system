import api from './api';

class AuthService {
    /**
     * Login with optional MFA support
     */
    async login(credentials) {
        const response = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
            totp_token: credentials.totpToken,
            remember_device: credentials.rememberDevice
        }, {
            withCredentials: true // Include cookies for refresh token
        });
        
        if (response.data.success) {
            // Store access token and user data
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
    }

    /**
     * Logout and revoke session
     */
    async logout() {
        try {
            await api.post('/auth/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    }

    /**
     * Refresh access token using httpOnly cookie
     */
    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh', {}, {
                withCredentials: true
            });
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return response.data;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            throw error;
        }
    }

    /**
     * Forgot password
     */
    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    }

    /**
     * Reset password with code
     */
    async resetPassword(email, code, password) {
        const response = await api.post('/auth/reset-password', {
            email,
            code,
            password
        });
        return response.data;
    }

    /**
     * Change password
     */
    async changePassword(oldPassword, newPassword) {
        const response = await api.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword
        });
        return response.data;
    }

    /**
     * Setup MFA - get QR code and backup codes
     */
    async setupMfa() {
        const response = await api.post('/auth/mfa/setup');
        return response.data;
    }

    /**
     * Verify MFA setup with TOTP token
     */
    async verifyMfa(totpToken) {
        const response = await api.post('/auth/mfa/verify', {
            totp_token: totpToken
        });
        
        // Update user data to reflect MFA is now enabled
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.mfa_enabled = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        return response.data;
    }

    /**
     * Disable MFA
     */
    async disableMfa(password, totpToken) {
        const response = await api.post('/auth/mfa/disable', {
            password,
            totp_token: totpToken
        });
        
        // Update user data to reflect MFA is now disabled
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.mfa_enabled = false;
        localStorage.setItem('user', JSON.stringify(user));
        
        return response.data;
    }

    /**
     * Get active sessions
     */
    async getSessions() {
        const response = await api.get('/auth/sessions');
        return response.data;
    }

    /**
     * Revoke a specific session
     */
    async revokeSession(sessionId) {
        const response = await api.delete(`/auth/sessions/${sessionId}`);
        return response.data;
    }

    /**
     * Revoke all other sessions (keep current)
     */
    async revokeAllSessions() {
        const response = await api.post('/auth/sessions/revoke-all');
        return response.data;
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Get current token from localStorage
     */
    getCurrentToken() {
        return localStorage.getItem('token');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getCurrentToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        return user?.permissions?.includes(permission) || false;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user?.role === role;
    }
}

export const authService = new AuthService();
export default authService;