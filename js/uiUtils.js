
const UIUtils = {
    /**
     * Show status message
     * @param {string} elementId - Container element ID
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info)
     */
    showMessage(elementId, message, type = 'info') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.textContent = message;
        
        element.innerHTML = '';
        element.appendChild(messageDiv);

        if (type === 'success') {
            setTimeout(() => {
                element.innerHTML = '';
            }, 5000);
        }
    },

    /**
     * Update connection status indicator
     * @param {string} status - Connection status (connected, disconnected, connecting)
     */
    updateConnectionStatus(status, message = '') {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (!statusDot || !statusText) return;

        statusDot.className = `status-dot ${status}`;
        
        const statusMessages = {
            connected: 'Connected to database',
            disconnected: 'Database connection failed',
            connecting: 'Connecting to database...'
        };

        statusText.textContent = message || statusMessages[status] || status;
    },

    /**
     * Show/hide loading indicator
     * @param {boolean} show
     * @param {string} buttonId
     * @param {string} loadingId
     */
    toggleLoading(show, buttonId = null, loadingId = null) {
        if (loadingId) {
            const loading = document.getElementById(loadingId);
            if (loading) {
                loading.style.display = show ? 'block' : 'none';
            }
        }

        if (buttonId) {
            const button = document.getElementById(buttonId);
            if (button) {
                button.disabled = show;
            }
        }
    },

    /**
     * Format date/timestamp
     * @param {string} dateString
     * @returns {string}
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    },

    /**
     * Format Unix timestamp
     * @param {number} seconds
     * @returns {string}
     */
    formatTimestamp(seconds) {
        if (!seconds) return 'N/A';
        const date = new Date(seconds * 1000);
        return date.toLocaleString();
    },

    /**
     * Truncate long strings (like UUIDs)
     * @param {string} str
     * @param {number} length
     * @returns {string}
     */
    truncate(str, length = 8) {
        if (!str) return 'N/A';
        return str.length > length ? `${str.substring(0, length)}...` : str;
    },

    /**
     * Get badge class for user type
     * @param {string} type
     * @returns {string}
     */
    getBadgeClass(type) {
        return `badge badge-${type}`;
    },


    renderEmptyState(containerId, message, icon = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                ${icon}
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Render loading state
     * @param {string} containerId
     * @param {string} message
     */
    renderLoadingState(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
};