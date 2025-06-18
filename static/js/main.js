/**
 * Main JavaScript file for Fake News Detection System
 * Handles global functionality and utilities
 */

// Fix Chart.js compatibility - prevent forEach error
if (typeof Chart !== 'undefined') {
    // Override Chart.instances to prevent forEach errors
    Chart.instances = Chart.instances || [];
    if (!Chart.instances.forEach) {
        Chart.instances.forEach = function() {};
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Add loading states to forms
    initializeFormLoading();
    
    // Initialize auto-hide alerts
    initializeAutoHideAlerts();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize copy to clipboard functionality
    initializeCopyToClipboard();
    
    // Add animation classes to elements on scroll
    initializeScrollAnimations();
});

/**
 * Add loading states to form submissions
 */
function initializeFormLoading() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                // Store original text
                const originalText = submitBtn.innerHTML;
                
                // Add loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                
                // Reset after 30 seconds (fallback)
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 30000);
            }
        });
    });
}

/**
 * Auto-hide success alerts after 5 seconds
 */
function initializeAutoHideAlerts() {
    const alerts = document.querySelectorAll('.alert-success, .alert-info');
    
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

/**
 * Smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Copy to clipboard functionality
 */
function initializeCopyToClipboard() {
    const copyButtons = document.querySelectorAll('[data-copy-target]');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-copy-target');
            const target = document.querySelector(targetId);
            
            if (target) {
                const text = target.textContent || target.value;
                
                navigator.clipboard.writeText(text).then(() => {
                    // Show success feedback
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check me-2"></i>Copied!';
                    this.classList.add('btn-success');
                    this.classList.remove('btn-secondary');
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.classList.remove('btn-success');
                        this.classList.add('btn-secondary');
                    }, 2000);
                }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    // Show feedback
                    Swal.fire({
                        icon: 'success',
                        title: 'Copied!',
                        text: 'Text copied to clipboard',
                        timer: 2000,
                        showConfirmButton: false
                    });
                });
            }
        });
    });
}

/**
 * Add animations when elements come into view
 */
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation class
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));
    
    // Also observe cards and other elements
    const cards = document.querySelectorAll('.card:not(.animate__animated)');
    cards.forEach(card => observer.observe(card));
}

/**
 * Utility function to format numbers with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Utility function to format file sizes
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show loading overlay
 */
function showLoading(message = 'Loading...') {
    const loadingHtml = `
        <div id="globalLoading" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style="background-color: rgba(0,0,0,0.7); z-index: 9999;">
            <div class="text-center text-white">
                <div class="spinner-border mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div>${message}</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.remove();
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show confirmation dialog
 */
function confirmAction(title, text, confirmButtonText = 'Yes', cancelButtonText = 'Cancel') {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true
    });
}

/**
 * Show success message
 */
function showSuccess(title, text = '') {
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        timer: 3000,
        showConfirmButton: false
    });
}

/**
 * Show error message
 */
function showError(title, text = '') {
    Swal.fire({
        icon: 'error',
        title: title,
        text: text
    });
}

/**
 * Show info message
 */
function showInfo(title, text = '') {
    Swal.fire({
        icon: 'info',
        title: title,
        text: text
    });
}

/**
 * Initialize data tables with native JavaScript
 */
function initializeDataTables() {
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
        // Add Bootstrap table classes for styling
        table.classList.add('table', 'table-striped', 'table-hover');
        
        // Add search functionality if needed
        const searchInput = table.parentElement.querySelector('.table-search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterTable(table, this.value);
            });
        }
    });
}

/**
 * Simple table filtering function
 */
function filterTable(table, searchTerm) {
    const rows = table.querySelectorAll('tbody tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

/**
 * Handle AJAX errors globally
 */
function handleAjaxError(xhr, status, error) {
    console.error('AJAX Error:', status, error);
    
    let message = 'An error occurred while processing your request.';
    
    if (xhr.status === 404) {
        message = 'The requested resource was not found.';
    } else if (xhr.status === 500) {
        message = 'Internal server error. Please try again later.';
    } else if (xhr.status === 403) {
        message = 'You do not have permission to perform this action.';
    }
    
    showError('Error', message);
}

/**
 * Setup native fetch defaults
 */
window.fetchWithDefaults = function(url, options = {}) {
    const token = document.querySelector('meta[name=csrf-token]');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['X-CSRFToken'] = token.getAttribute('content');
    }
    
    return fetch(url, {
        ...options,
        headers
    }).catch(error => {
        handleAjaxError({status: 0, statusText: 'Network Error'}, 'error', error.message);
        throw error;
    });
};

/**
 * Initialize character counters for textareas
 */
function initializeCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[data-max-length]');
    
    textareas.forEach(textarea => {
        const maxLength = parseInt(textarea.getAttribute('data-max-length'));
        const counterId = textarea.id + '_counter';
        
        // Create counter element
        const counter = document.createElement('div');
        counter.id = counterId;
        counter.className = 'text-muted small mt-1';
        counter.textContent = `0 / ${maxLength} characters`;
        
        textarea.parentNode.appendChild(counter);
        
        // Update counter on input
        textarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            counter.textContent = `${currentLength} / ${maxLength} characters`;
            
            if (currentLength > maxLength * 0.9) {
                counter.classList.add('text-warning');
                counter.classList.remove('text-muted');
            } else {
                counter.classList.add('text-muted');
                counter.classList.remove('text-warning');
            }
            
            if (currentLength >= maxLength) {
                counter.classList.add('text-danger');
                counter.classList.remove('text-warning', 'text-muted');
            }
        });
    });
}

// Initialize character counters on page load
document.addEventListener('DOMContentLoaded', initializeCharacterCounters);
