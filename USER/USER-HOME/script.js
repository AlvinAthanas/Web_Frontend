document.addEventListener('DOMContentLoaded', function() {
    // Highlight current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const itemPage = item.getAttribute('data-page');
        if (currentPage === itemPage) {
            item.classList.add('active');
        }
    });

    // Load user data
    function loadUserData() {
        // In a real app, fetch from your API
        const userData = {
            firstName: 'elna',
            lastName: 'athanas lengeju',
            email: 'elna@gmail.com'
        };
        
        // Update profile elements if they exist
        const profileName = document.getElementById('profile-name');
        if (profileName) profileName.textContent = `${userData.firstName} ${userData.lastName}`;
        
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) profileEmail.textContent = userData.email;
        
        const profileAvatar = document.getElementById('profile-avatar');
        if (profileAvatar) profileAvatar.textContent = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
        
        const userName = document.getElementById('user-first-name');
        if (userName) userName.textContent = userData.firstName;
        
        const userFullName = document.getElementById('user-full-name');
        if (userFullName) userFullName.textContent = `${userData.firstName} ${userData.lastName}`;
        
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) userAvatar.textContent = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
    }
    
    loadUserData();
});