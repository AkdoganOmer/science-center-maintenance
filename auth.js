// Check authentication status
function checkAuth() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Check if user is admin
function isAdmin() {
    return localStorage.getItem('username') === 'admin';
}

// Update navbar with user info and admin menu
function updateNavbar() {
    const username = localStorage.getItem('username');
    if (username) {
        // Add admin menu if user is admin
        if (isAdmin()) {
            const navbarNav = document.querySelector('.navbar-nav');
            const existingAdminLink = document.querySelector('a[href="galleries.html"]');
            
            if (navbarNav && !existingAdminLink) {
                const adminMenuItem = document.createElement('li');
                adminMenuItem.className = 'nav-item';
                adminMenuItem.innerHTML = '<a class="nav-link" href="galleries.html">Galeri Yönetimi</a>';
                navbarNav.appendChild(adminMenuItem);
            }
        }

        // Add user info and logout button if not already present
        const existingUserInfo = document.querySelector('.ms-auto');
        if (!existingUserInfo) {
            const userInfoHtml = `
                <div class="ms-auto d-flex align-items-center">
                    <span class="text-light me-3">
                        ${isAdmin() ? '👑 Admin' : 'Kullanıcı'}: ${username}
                    </span>
                    <button onclick="handleLogout()" class="btn btn-outline-light">Çıkış Yap</button>
                </div>
            `;
            document.querySelector('.navbar .container').insertAdjacentHTML('beforeend', userInfoHtml);
        }
    }
}

// Initialize auth check
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        updateNavbar();
    }
}); 