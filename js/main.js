// main.js - Logic for main dashboard page
let refreshIntervalId = null;

/**
 * Render users table
 */
function renderUsersTable(users) {
    const container = document.getElementById('usersTableContainer');
    document.getElementById('usersCount').textContent = `${users.length} records`;
    
    if (users.length === 0) {
        UIUtils.renderEmptyState('usersTableContainer', 'No users found', `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `);
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>User Type</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.username || 'N/A'}</td>
                <td>${user.password || 'N/A'}</td>
                <td><span class="${UIUtils.getBadgeClass(user.loginner_type)}">${user.loginner_type}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Render access logs table
 */
function renderLogsTable(logs) {
    const container = document.getElementById('logsTableContainer');
    document.getElementById('logsCount').textContent = `${logs.length} records`;
    
    if (logs.length === 0) {
        UIUtils.renderEmptyState('logsTableContainer', 'No access logs found', `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
        `);
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Log ID</th>
                    <th>User ID</th>
                    <th>Loginner Type</th>
                    <th>Accessed At</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    logs.forEach(log => {
        html += `
            <tr>
                <td title="${log.log_id}">${UIUtils.truncate(log.log_id)}</td>
                <td title="${log.user_id}">${UIUtils.truncate(log.user_id)}</td>
                <td><span class="${UIUtils.getBadgeClass(log.loginner)}">${log.loginner}</span></td>
                <td>${UIUtils.formatDate(log.accessed_at)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Update status display
 */
function updateStatus(status, error = null) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const statusTime = document.getElementById('statusTime');
    const reconnectBtn = document.getElementById('reconnectBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    
    statusDot.className = 'status-dot ' + status;
    
    switch(status) {
        case 'connected':
            statusText.textContent = 'Connected';
            reconnectBtn.textContent = 'Reconnect';
            refreshBtn.disabled = false;
            break;
        case 'connecting':
            statusText.textContent = 'Connecting...';
            reconnectBtn.disabled = true;
            refreshBtn.disabled = true;
            break;
        case 'disconnected':
            statusText.textContent = 'Disconnected';
            reconnectBtn.textContent = 'Connect to Database';
            reconnectBtn.disabled = false;
            refreshBtn.disabled = true;
            break;
    }
    
    statusTime.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
    
    const errorContainer = document.getElementById('errorContainer');
    if (error) {
        errorContainer.innerHTML = `<div class="error-message">⚠️ ${error}</div>`;
    } else {
        errorContainer.innerHTML = '';
    }
}

/**
 * Fetch all data from database
 */
async function fetchData() {
    if (!dbService.checkConnection()) {
        updateStatus('disconnected', 'Database not connected');
        return;
    }
    
    try {
        updateStatus('connected');
        
        const [users, logs] = await Promise.all([
            dbService.getUsers(),
            dbService.getAccessLogs()
        ]);
        
        renderUsersTable(users);
        renderLogsTable(logs);
        updateStatus('connected');
        
    } catch (error) {
        console.error('Error fetching data:', error);
        updateStatus('disconnected', error.message);
        
        UIUtils.renderEmptyState('usersTableContainer', 'Failed to load users data');
        UIUtils.renderEmptyState('logsTableContainer', 'Failed to load access logs');
    }
}

/**
 * Connect/Reconnect to database
 */
async function reconnect() {
    updateStatus('connecting');
    
    if (dbService.init()) {
        await fetchData();
        startAutoRefresh();
    } else {
        updateStatus('disconnected', 'Failed to initialize database connection');
    }
}

/**
 * Refresh data manually
 */
async function refreshData() {
    if (dbService.checkConnection()) {
        await fetchData();
    }
}

/**
 * Start automatic data refresh
 */
function startAutoRefresh() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
    }
    
    refreshIntervalId = setInterval(() => {
        if (dbService.checkConnection()) {
            refreshData();
        }
    }, CONFIG.app.refreshInterval);
}

/**
 * Stop automatic data refresh
 */
function stopAutoRefresh() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
}

/**
 * Initialize on page load
 */
window.addEventListener('DOMContentLoaded', async () => {
    updateStatus('connecting');
    
    if (dbService.init()) {
        await fetchData();
        startAutoRefresh();
    } else {
        updateStatus('disconnected', 'Failed to initialize database connection');
    }
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});