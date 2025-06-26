/**
 * auth.js - Handles the login functionality
 * 
 * This is a simplified version for the project demonstration.
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get the login button
    const loginBtn = document.getElementById('loginBtn');
    
    // Add click event to the login button
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // For this demo, we'll just redirect to the planner page
            // In a real app, you would verify credentials first
            
            // Store a simple flag in localStorage to simulate being logged in
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirect to the planner page
            window.location.href = 'planner.html';
        });
    } else {
        console.error('Login button not found!');
    }
});