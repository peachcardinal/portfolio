(function() {
    'use strict';
    
    const THEME_KEY = 'themeOverride';
    const THEME_DARK = 'dark';
    const THEME_LIGHT = 'light';
    
    function getCurrentTheme() {
        const override = localStorage.getItem(THEME_KEY);
        if (override === THEME_LIGHT || override === THEME_DARK) {
            return override;
        }
        // Auto theme based on local time: 09:00-20:59 = light, 21:00-08:59 = dark
        const hour = new Date().getHours();
        return (hour >= 9 && hour < 21) ? THEME_LIGHT : THEME_DARK;
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
        setTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    }
    
    function checkAutoTheme() {
        const override = localStorage.getItem(THEME_KEY);
        if (!override) {
            const theme = getCurrentTheme();
            const current = document.documentElement.getAttribute('data-theme');
            if (theme !== current) {
                setTheme(theme);
            }
        }
    }
    
    // Initialize theme on load
    setTheme(getCurrentTheme());
    
    // Set up toggle button
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Check theme every minute (only if no override)
    setInterval(checkAutoTheme, 60000);
})();
