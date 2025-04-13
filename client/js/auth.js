// API Configuration
const API_URL = 'http://localhost:3001/api';
let csrfToken = '';

// DOM Elements
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const registerUsername = document.getElementById('registerUsername');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const loginFormDiv = document.getElementById('loginForm');
const registerFormDiv = document.getElementById('registerForm');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
showRegisterBtn.addEventListener('click', showRegisterForm);
showLoginBtn.addEventListener('click', showLoginForm);

// Form Visibility
function showRegisterForm() {
    loginFormDiv.classList.add('hidden');
    registerFormDiv.classList.remove('hidden');
    clearMessages();
}

function showLoginForm() {
    registerFormDiv.classList.add('hidden');
    loginFormDiv.classList.remove('hidden');
    clearMessages();
}

function clearMessages() {
    loginMessage.textContent = '';
    registerMessage.textContent = '';
}

// Message Display
function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.className = `text-center text-sm ${isError ? 'text-red-500' : 'text-green-500'}`;
    element.classList.add('fade-in');
}

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    try {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if (!username || !password) {
            showMessage(loginMessage, 'Please fill in all fields', true);
            return;
        }

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const data = await response.json();
            showMessage(loginMessage, data.error || 'Login failed', true);
            return;
        }

        const data = await response.json();
        updateUIForLoggedInUser(username);
    } catch (error) {
        console.error('Login error:', error);
        showMessage(loginMessage, 'Failed to connect to server. Please try again later.', true);
    }
}

// Register Handler
async function handleRegister(e) {
    e.preventDefault();
    try {
        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();
        const confirmPassword = registerConfirmPassword.value.trim();
        const email = registerEmail.value.trim();

        if (!username || !password || !confirmPassword || !email) {
            showMessage(registerMessage, 'Please fill in all fields', true);
            return;
        }

        if (password !== confirmPassword) {
            showMessage(registerMessage, 'Passwords do not match', true);
            return;
        }

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({ username, password, email })
        });

        if (!response.ok) {
            const data = await response.json();
            if (data.errors && Array.isArray(data.errors)) {
                const errorMessages = data.errors.map(error => error.msg || error).join(', ');
                showMessage(registerMessage, errorMessages, true);
            } else {
                showMessage(registerMessage, data.error || 'Registration failed', true);
            }
            return;
        }

        const data = await response.json();
        showMessage(registerMessage, 'Registration successful!');
        showLoginForm();
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(registerMessage, 'Failed to connect to server. Please try again later.', true);
    }
}

// Check Authentication Status
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_URL}/auth/check-auth`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            updateUIForLoggedInUser(data.username);
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged-in user
function updateUIForLoggedInUser(username) {
    console.log('Updating UI for logged in user:', username);
    
    // Hide both forms
    loginFormDiv.classList.add('hidden');
    registerFormDiv.classList.add('hidden');
    
    // Create and show welcome message with profile
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'p-6 text-center slide-in';
    welcomeDiv.innerHTML = `
        <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
                <div class="flex justify-center mb-4">
                    <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-3xl text-gray-600">${username.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
                <h2 class="text-2xl font-bold mb-2">Welcome, ${username}!</h2>
                <p class="text-gray-600 mb-4">You are successfully logged in.</p>
                
                <div class="mb-6">
                    <button id="profileBtn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Profile
                    </button>
                </div>
                
                <button id="logoutBtn" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Logout
                </button>
            </div>
        </div>
    `;
    
    // Add welcome message to container
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    
    container.innerHTML = '';
    container.appendChild(welcomeDiv);
    
    // Add event listeners with error handling
    try {
        const logoutBtn = document.getElementById('logoutBtn');
        const profileBtn = document.getElementById('profileBtn');
        
        if (!logoutBtn || !profileBtn) {
            console.error('One or more buttons not found');
            return;
        }
        
        logoutBtn.addEventListener('click', handleLogout);
        profileBtn.addEventListener('click', showProfile);
        
        console.log('Event listeners attached successfully');
    } catch (error) {
        console.error('Error attaching event listeners:', error);
    }
}

// Show Profile
async function showProfile() {
    console.log('Showing profile');
    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Profile data:', data);
            
            const profileDiv = document.createElement('div');
            profileDiv.className = 'p-6 slide-in';
            profileDiv.innerHTML = `
                <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-4">Profile Information</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" id="firstName" value="${data.profile?.firstName || ''}"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" id="lastName" value="${data.profile?.lastName || ''}"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea id="bio" rows="3"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">${data.profile?.bio || ''}</textarea>
                            </div>
                            <button id="saveProfile" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const container = document.querySelector('.container');
            if (!container) {
                console.error('Container element not found');
                return;
            }
            
            container.innerHTML = '';
            container.appendChild(profileDiv);
            
            const saveProfileBtn = document.getElementById('saveProfile');
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', saveProfile);
            }
        } else {
            console.error('Failed to fetch profile:', response.status);
            showMessage(document.createElement('div'), 'Failed to load profile', true);
        }
    } catch (error) {
        console.error('Profile error:', error);
        showMessage(document.createElement('div'), 'Failed to load profile', true);
    }
}

// Save Profile
async function saveProfile() {
    try {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const bio = document.getElementById('bio').value;
        
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({ firstName, lastName, bio })
        });
        
        if (response.ok) {
            showMessage(document.createElement('div'), 'Profile updated successfully!');
            setTimeout(() => {
                const username = document.querySelector('.text-2xl').textContent.split(',')[1].trim();
                updateUIForLoggedInUser(username);
            }, 1500);
        } else {
            const data = await response.json();
            showMessage(document.createElement('div'), data.error || 'Failed to update profile', true);
        }
    } catch (error) {
        console.error('Save profile error:', error);
        showMessage(document.createElement('div'), 'Failed to update profile', true);
    }
}

// Update UI for logged-out user
function updateUIForLoggedOutUser() {
    // Show login form by default
    loginFormDiv.classList.remove('hidden');
    registerFormDiv.classList.add('hidden');
}

// Logout Handler
async function handleLogout() {
    console.log('Handling logout');
    try {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log('Logout successful');
            // Clear any stored user data
            username = '';
            csrfToken = '';
            
            // Clear container
            const container = document.querySelector('.container');
            if (container) {
                container.innerHTML = '';
            }
            
            // Show login form and hide register form
            loginFormDiv.classList.remove('hidden');
            registerFormDiv.classList.add('hidden');
            
            // Clear form fields
            loginUsername.value = '';
            loginPassword.value = '';
            
            // Show success message
            showMessage(loginMessage, 'Logged out successfully!');
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } else {
            const data = await response.json();
            console.error('Logout error:', data.error);
            showMessage(loginMessage, 'Failed to logout', true);
        }
    } catch (error) {
        console.error('Logout error:', error);
        showMessage(loginMessage, 'Failed to connect to server', true);
    }
}

// Initialize
checkAuthStatus(); 