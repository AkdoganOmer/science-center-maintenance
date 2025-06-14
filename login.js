// Sample user data - normally this would come from a backend
const users = [
    { username: "admin", password: "1234" },
    { username: "teknisyen", password: "4321" }
];

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    // Check credentials
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store login status
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // Redirect to main page
        window.location.href = 'index.html';
    } else {
        // Show error message
        errorDiv.classList.remove('d-none');
        
        // Clear password field
        document.getElementById('password').value = '';
    }
    
    return false;
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
}); 