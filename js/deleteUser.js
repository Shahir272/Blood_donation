// deleteUser.js - Logic for delete user page

/**
 * Render users table
 */
function renderUsersTable(users) {
    const container = document.getElementById('usersTableContainer');
    document.getElementById('usersCount').textContent = `${users.length} records`;
    
    if (users.length === 0) {
        UIUtils.renderEmptyState('usersTableContainer', 'No users found');
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>User Type</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.username || 'N/A'}</td>
                <td><span class="${UIUtils.getBadgeClass(user.loginner_type)}">${user.loginner_type}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Fetch and display users
 */
async function fetchUsers() {
    try {
        UIUtils.renderLoadingState('usersTableContainer', 'Loading users...');
        const users = await dbService.getUsers();
        renderUsersTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        document.getElementById('usersTableContainer').innerHTML = `
            <div class="empty-state message-error" style="color:#721c24;">
                Failed to load user list: ${error.message}
            </div>
        `;
    }
}

/**
 * Show message in message box
 */
function showMessage(message, isError = false) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = isError ? 'message-box message-error' : 'message-box message-success';
    messageBox.style.display = 'block';
}

/**
 * Handle delete operation
 */
async function handleDelete(username) {
    const deleteButton = document.getElementById('deleteButton');
    const usernameInput = document.getElementById('usernameToDelete');
    
    deleteButton.disabled = true;
    deleteButton.textContent = 'Deleting...';
    document.getElementById('messageBox').style.display = 'none';

    if (!username) {
        showMessage('Please enter a username.', true);
        deleteButton.disabled = false;
        deleteButton.textContent = 'PERMANENTLY DELETE RECORD';
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to permanently delete the user: ${username}?`)) {
        deleteButton.disabled = false;
        deleteButton.textContent = 'PERMANENTLY DELETE RECORD';
        return;
    }

    try {
        await dbService.deleteUser(username);
        showMessage(`Successfully deleted user: "${username}".`, false);
        
        // Refresh the list immediately
        await fetchUsers();

    } catch (error) {
        console.error('Deletion error:', error);
        showMessage(`Deletion failed. Error: ${error.message}. (Check your Supabase policies).`, true);
    } finally {
        deleteButton.disabled = false;
        deleteButton.textContent = 'PERMANENTLY DELETE RECORD';
        usernameInput.value = '';
    }
}

/**
 * Initialize page
 */
window.addEventListener('DOMContentLoaded', async () => {
    // Initialize database connection
    if (!dbService.init()) {
        console.error('Failed to initialize database');
        UIUtils.renderEmptyState('usersTableContainer', 'Failed to connect to database');
        return;
    }

    // Fetch initial user list
    await fetchUsers();

    // Attach form submit handler
    document.getElementById('deleteForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('usernameToDelete').value.trim();
        handleDelete(username);
    });
});