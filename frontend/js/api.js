// ============================================
// JOBCOCOON - API HELPER
// ============================================

const API_URL = 'http://localhost:5000';


// ============================================
// TOKEN MANAGEMENT
// ============================================

function saveToken(token) {
    localStorage.setItem('jobcocoon_token', token);
}

function getToken() {
    return localStorage.getItem('jobcocoon_token');
}

function removeToken() {
    localStorage.removeItem('jobcocoon_token');
}

function isLoggedIn() {
    return !!getToken();
}


// ============================================
// GENERIC API CALL
// ============================================

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // Session expired
        if (response.status === 401) {
            removeToken();
            throw new Error('Session expired. Please login again.');
        }
        
        // No content
        if (response.status === 204) {
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Something went wrong');
        }
        
        return data;
        
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Is backend running?');
        }
        throw error;
    }
}


// ============================================
// AUTHENTICATION
// ============================================

async function login(email, password) {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');
    
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });
    
    if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 401) {
            throw new Error('Invalid email or password');
        }
        
        if (response.status === 403) {
            throw new Error(data.detail || 'Please verify your email first');
        }
        
        throw new Error(data.detail || 'Login failed');
    }
    
    const data = await response.json();
    saveToken(data.access_token);
    return data;
}


async function register(name, email, password) {
    return await apiCall('/auth/register', 'POST', {
        name,
        email,
        password,
    });
}


async function getCurrentUser() {
    return await apiCall('/auth/me');
}


async function resendVerification(email) {
    return await apiCall('/auth/resend-verification', 'POST', { email });
}


function logout() {
    removeToken();
    window.location.href = '../index.html';
}