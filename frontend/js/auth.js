// ============================================
// JOBCOCOON - AUTH LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ========================================
    // CHECK IF ALREADY LOGGED IN
    // ========================================
    if (isLoggedIn()) {
        window.location.href = 'pages/dashboard.html';
        return;
    }
    
    
    // ========================================
    // GET FORM ELEMENTS
    // ========================================
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtn = document.getElementById('toggleForm');
    const messageDiv = document.getElementById('message');
    
    
    // ========================================
    // LOGIN HANDLER
    // ========================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        if (!email || !password) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
            showMessage('Signing in...', 'info');
            
            await login(email, password);
            
            showMessage('Success! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'pages/dashboard.html';
            }, 800);
            
        } catch (error) {
            showMessage(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });
    
    
    // ========================================
    // REGISTER HANDLER
    // ========================================
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        
        // Validation
        if (!name || !email || !password) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        
        if (password.length < 8) {
            showMessage('Password must be at least 8 characters', 'error');
            return;
        }
        
        if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            showMessage('Password must contain letters and numbers', 'error');
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';
            showMessage('Creating your account...', 'info');
            
            await register(name, email, password);
            
            showMessage(
                '✅ Account created! Check your email for verification link.',
                'success'
            );
            
            registerForm.reset();
            
            setTimeout(() => {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                toggleBtn.innerHTML = 'New to JobCocoon? <span>Register</span>';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
                document.getElementById('email').value = email;
            }, 2500);
            
        } catch (error) {
            showMessage(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    });
    
    
    // ========================================
    // TOGGLE FORMS
    // ========================================
    toggleBtn.addEventListener('click', () => {
        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            toggleBtn.innerHTML = 'New to JobCocoon? <span>Register</span>';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            toggleBtn.innerHTML = 'Already have account? <span>Login</span>';
        }
        
        messageDiv.className = '';
        messageDiv.textContent = '';
    });
    
    
    // ========================================
    // MESSAGE HELPER
    // ========================================
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `show ${type}`;
    }
    
});