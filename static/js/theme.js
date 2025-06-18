/**
 * Theme management for Fake News Detection System
 * Handles dark/light mode switching with persistence
 */

class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getPreferredTheme();
        this.init();
    }

    init() {
        this.setTheme(this.theme);
        this.setupThemeToggle();
        this.watchSystemTheme();
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    getPreferredTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        this.updateThemeIcon();
        this.setStoredTheme(theme);
        
        // Dispatch custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Add visual feedback
        this.showThemeChangeAnimation();
    }

    updateThemeIcon() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            // Add keyboard support
            themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
    }

    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!this.getStoredTheme()) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    showThemeChangeAnimation() {
        // Create a brief animation to indicate theme change
        const body = document.body;
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
        
        // Show a toast notification
        this.showThemeChangeToast();
    }

    showThemeChangeToast() {
        const toastHtml = `
            <div class="toast-container position-fixed bottom-0 end-0 p-3">
                <div id="themeToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <i class="fas fa-palette text-primary me-2"></i>
                        <strong class="me-auto">Theme Changed</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        Switched to ${this.theme} mode
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing toast
        const existingToast = document.querySelector('.toast-container');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Add new toast
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        
        // Show toast
        const toastElement = document.getElementById('themeToast');
        const toast = new bootstrap.Toast(toastElement, { delay: 2000 });
        toast.show();
        
        // Clean up after toast is hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            const container = toastElement.closest('.toast-container');
            if (container) {
                container.remove();
            }
        });
    }

    // Method to get current theme for other scripts
    getCurrentTheme() {
        return this.theme;
    }

    // Method to check if dark mode is active
    isDarkMode() {
        return this.theme === 'dark';
    }

    // Method to apply theme-specific styles to charts
    getChartTheme() {
        if (this.isDarkMode()) {
            return {
                backgroundColor: 'transparent',
                color: '#e9ecef',
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#e9ecef'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#e9ecef'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e9ecef'
                        }
                    }
                }
            };
        } else {
            return {
                backgroundColor: 'transparent',
                color: '#2e3a46',
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#2e3a46'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#2e3a46'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#2e3a46'
                        }
                    }
                }
            };
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
});

// Listen for theme changes to update any charts or theme-dependent components
window.addEventListener('themeChanged', function(e) {
    // Update any existing charts with new theme
    if (typeof Chart !== 'undefined' && Chart.instances) {
        Chart.instances.forEach(chart => {
            const themeConfig = window.themeManager.getChartTheme();
            
            // Update chart options
            if (chart.options.scales) {
                Object.assign(chart.options.scales, themeConfig.scales);
            }
            if (chart.options.plugins) {
                Object.assign(chart.options.plugins, themeConfig.plugins);
            }
            
            chart.update();
        });
    }
    
    // Update any other theme-dependent components
    updateCodeHighlighting();
    updateDataTables();
});

/**
 * Update code highlighting themes if Prism.js is available
 */
function updateCodeHighlighting() {
    if (typeof Prism !== 'undefined') {
        const theme = window.themeManager.getCurrentTheme();
        const existingTheme = document.querySelector('link[href*="prism"]');
        
        if (existingTheme) {
            const newHref = theme === 'dark' 
                ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-dark.min.css'
                : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css';
            
            existingTheme.href = newHref;
        }
    }
}

/**
 * Update DataTables styling for theme changes
 */
function updateDataTables() {
    if (typeof $.fn.DataTable !== 'undefined') {
        const theme = window.themeManager.getCurrentTheme();
        
        $('.dataTables_wrapper').each(function() {
            if (theme === 'dark') {
                $(this).addClass('dt-dark-theme');
            } else {
                $(this).removeClass('dt-dark-theme');
            }
        });
    }
}

/**
 * Utility function to get CSS custom property value with theme consideration
 */
function getCSSVariable(property, fallback = '') {
    return getComputedStyle(document.documentElement).getPropertyValue(property) || fallback;
}

/**
 * Apply theme-appropriate colors to elements
 */
function applyThemeColors(element, colorMap) {
    const theme = window.themeManager.getCurrentTheme();
    const colors = colorMap[theme] || colorMap.light;
    
    Object.entries(colors).forEach(([property, value]) => {
        element.style.setProperty(property, value);
    });
}

// Export for use in other modules
window.ThemeManager = ThemeManager;
