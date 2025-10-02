// dbService.js - Database operations service
class DatabaseService {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
    }

    /**
     * Initialize Supabase client
     * @returns {boolean} Connection status
     */
    init() {
        try {
            if (!window.supabase) {
                throw new Error('Supabase library not loaded');
            }
            
            this.supabase = window.supabase.createClient(
                CONFIG.supabase.url,
                CONFIG.supabase.anonKey
            );
            
            this.isConnected = true;
            return true;
        } catch (error) {
            console.error('Database initialization failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Check if database is connected
     * @returns {boolean}
     */
    checkConnection() {
        return this.supabase !== null && this.isConnected;
    }

    /**
     * Fetch all users
     * @returns {Promise<Array>}
     */
    async getUsers() {
        if (!this.checkConnection()) {
            throw new Error('Database not connected');
        }

        const { data, error } = await this.supabase
            .from('users')
            .select('username, password, loginner_type, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Fetch access logs
     * @returns {Promise<Array>}
     */
    async getAccessLogs() {
        if (!this.checkConnection()) {
            throw new Error('Database not connected');
        }

        const { data, error } = await this.supabase
            .from('access_logs')
            .select('log_id, user_id, loginner, accessed_at')
            .order('accessed_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Add a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>}
     */
    async addUser(userData) {
        if (!this.checkConnection()) {
            throw new Error('Database not connected');
        }

        const { data, error } = await this.supabase
            .from('users')
            .insert([{
                user_id: this.generateUUID(),
                username: userData.username,
                password: userData.password,
                loginner_type: userData.loginner_type,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return data[0];
    }

    /**
     * Delete user by username
     * @param {string} username
     * @returns {Promise<void>}
     */
    async deleteUser(username) {
        if (!this.checkConnection()) {
            throw new Error('Database not connected');
        }

        const { error } = await this.supabase
            .from('users')
            .delete()
            .eq('username', username);

        if (error) throw error;
    }

    /**
     * Generate UUID v4
     * @returns {string}
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Export singleton instance
const dbService = new DatabaseService();