// Main Application Logic & Navigation
window.App = window.App || {};

(function() {
    const renderNavbar = () => {
        const path = window.location.pathname;
        const page = path.split("/").pop() || "index.html";
        
        // Don't show full nav on login/signup/landing if desired, 
        // but user asked for "shared across all pages". 
        // We'll show a simplified one for Landing, and full for App.
        
        const isAuthPage = page === 'login.html' || page === 'signup.html';
        const isLanding = page === 'index.html' || page === '';
        
        let navContent = '';
        
        if (isAuthPage) {
            navContent = `
                <div class="container nav-container">
                    <a href="index.html" class="logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                        AquaLabel
                    </a>
                    <a href="index.html" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Back to Home</a>
                </div>
            `;
        } else if (isLanding) {
             navContent = `
                <div class="container nav-container">
                    <a href="index.html" class="logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                        AquaLabel
                    </a>
                    <div class="nav-links">
                        <a href="login.html">Login</a>
                        <a href="signup.html" class="btn btn-primary" style="color: white;">Sign Up</a>
                    </div>
                </div>
            `;
        } else {
            // App Pages
            navContent = `
                <div class="container nav-container">
                    <a href="dashboard.html" class="logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                        AquaLabel
                    </a>
                    <div class="nav-links">
                        <a href="dashboard.html" class="${page === 'dashboard.html' ? 'active' : ''}">Dashboard</a>
                        <a href="design.html" class="${page === 'design.html' ? 'active' : ''}">Create</a>
                        <a href="saved-designs.html" class="${page === 'saved-designs.html' ? 'active' : ''}">My Designs</a>
                        <a href="community.html" class="${page === 'community.html' ? 'active' : ''}">Community</a>
                        <a href="profile.html" class="${page === 'profile.html' ? 'active' : ''}">Profile</a>
                        <a href="index.html" style="margin-left: 1rem; color: #ef4444;">Logout</a>
                    </div>
                </div>
            `;
        }

        const nav = document.createElement('nav');
        nav.className = 'navbar';
        nav.innerHTML = navContent;
        document.body.prepend(nav);
    };

    // Toast Notification System
    const showToast = (message, type = 'info') => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `
            <div style="font-size: 1.2rem;">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-msg">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Public API
    window.App.showToast = showToast;

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        renderNavbar();
    });

})();
