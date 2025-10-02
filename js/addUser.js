// addUser.js - Logic for add user page

/**
 * Validate user input
 */
function validateUserInput(userData) {
    if (!userData.username || !userData.password || !userData.loginner_type) {
        return { valid: false, message: 'Please fill in all required fields' };
    }

    if (userData.username.length < 3) {
        return { valid: false, message: 'Username must be at least 3 characters long' };
    }

    if (userData.password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }

    return { valid: true };
}

/**
 * Toggle loading state
 */
function toggleLoadingState(show) {
    const loading = document.getElementById('loadingIndicator');
    const submitBtn = document.getElementById('submitBtn');
    
    if (show) {
        loading.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding User...';
    } else {
        loading.style.display = 'none';
        submitBtn.disabled = !dbService.checkConnection();
        submitBtn.textContent = 'Add User';
    }
}

/**
 * Reset form
 */
function resetForm() {
    document.getElementById('addUserForm').reset();
    document.getElementById('statusMessage').innerHTML = '';
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username').trim(),
        password: formData.get('password'),
        loginner_type: formData.get('loginner_type')
    };

    // Validate input
    const validation = validateUserInput(userData);
    if (!validation.valid) {
        UIUtils.showMessage('statusMessage', validation.message, 'error');
        return;
    }

    toggleLoadingState(true);

    try {
        await dbService.addUser(userData);
        UIUtils.showMessage(
            'statusMessage',
            `User "${userData.username}" has been successfully added to the system!`,
            'success'
        );
        resetForm();
    } catch (error) {
        console.error('Error adding user:', error);
        
        let errorMessage = 'Failed to add user: ' + error.message;
        if (error.message.includes('duplicate key')) {
            errorMessage = 'Username already exists. Please choose a different username.';
        }
        
        UIUtils.showMessage('statusMessage', errorMessage, 'error');
    } finally {
        toggleLoadingState(false);
    }
}

/**
 * Initialize page
 */
window.addEventListener('DOMContentLoaded', () => {
    // Initialize database connection
    if (dbService.init()) {
        UIUtils.updateConnectionStatus('connected');
        document.getElementById('submitBtn').disabled = false;
    } else {
        UIUtils.updateConnectionStatus('disconnected', 'Failed to initialize database connection');
        UIUtils.showMessage('statusMessage', 'Failed to initialize database connection', 'error');
        document.getElementById('submitBtn').disabled = true;
    }

    // Attach form submit handler
    document.getElementById('addUserForm').addEventListener('submit', handleSubmit);
});
