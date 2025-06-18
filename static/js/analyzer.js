/**
 * News Analysis JavaScript functionality
 * Handles form validation, file processing, and result display
 */

class NewsAnalyzer {
    constructor() {
        this.currentForm = null;
        this.maxFileSize = 16 * 1024 * 1024; // 16MB
        this.allowedFileTypes = ['.txt'];
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupFileHandling();
        this.setupUrlValidation();
        this.setupTabSwitching();
        this.setupCharacterCounters();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('#textForm, #fileForm, #urlForm');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        });
    }

    validateForm(form) {
        let isValid = true;
        const formId = form.id;

        // Clear previous errors
        this.clearFormErrors(form);

        switch (formId) {
            case 'textForm':
                isValid = this.validateTextForm(form);
                break;
            case 'fileForm':
                isValid = this.validateFileForm(form);
                break;
            case 'urlForm':
                isValid = this.validateUrlForm(form);
                break;
        }

        return isValid;
    }

    validateTextForm(form) {
        let isValid = true;
        
        const title = form.querySelector('#title');
        const content = form.querySelector('#content');

        // Validate title
        if (!title.value.trim()) {
            this.showFieldError(title, 'Title is required');
            isValid = false;
        } else if (title.value.trim().length < 5) {
            this.showFieldError(title, 'Title must be at least 5 characters long');
            isValid = false;
        }

        // Validate content
        if (!content.value.trim()) {
            this.showFieldError(content, 'Content is required');
            isValid = false;
        } else if (content.value.trim().length < 50) {
            this.showFieldError(content, 'Content must be at least 50 characters long');
            isValid = false;
        } else if (content.value.trim().length > 10000) {
            this.showFieldError(content, 'Content must be less than 10,000 characters');
            isValid = false;
        }

        return isValid;
    }

    validateFileForm(form) {
        let isValid = true;
        
        const fileInput = form.querySelector('#file');
        const file = fileInput.files[0];

        if (!file) {
            this.showFieldError(fileInput, 'Please select a file');
            isValid = false;
        } else {
            // Check file type
            const fileName = file.name.toLowerCase();
            const hasValidExtension = this.allowedFileTypes.some(ext => 
                fileName.endsWith(ext)
            );

            if (!hasValidExtension) {
                this.showFieldError(fileInput, 'Only .txt files are allowed');
                isValid = false;
            }

            // Check file size
            if (file.size > this.maxFileSize) {
                this.showFieldError(fileInput, `File size must be less than ${this.formatFileSize(this.maxFileSize)}`);
                isValid = false;
            }

            // Check if file is empty
            if (file.size === 0) {
                this.showFieldError(fileInput, 'File cannot be empty');
                isValid = false;
            }
        }

        return isValid;
    }

    validateUrlForm(form) {
        let isValid = true;
        
        const urlInput = form.querySelector('#url');
        const url = urlInput.value.trim();

        if (!url) {
            this.showFieldError(urlInput, 'URL is required');
            isValid = false;
        } else if (!this.isValidUrl(url)) {
            this.showFieldError(urlInput, 'Please enter a valid URL');
            isValid = false;
        } else if (!this.isNewsUrl(url)) {
            this.showFieldError(urlInput, 'URL should point to a news article');
            isValid = false;
        }

        return isValid;
    }

    validateField(field) {
        this.clearFieldError(field);
        
        const value = field.value.trim();
        const fieldName = field.name;

        switch (fieldName) {
            case 'title':
                if (!value) {
                    this.showFieldError(field, 'Title is required');
                } else if (value.length < 5) {
                    this.showFieldError(field, 'Title must be at least 5 characters long');
                }
                break;
                
            case 'content':
                if (!value) {
                    this.showFieldError(field, 'Content is required');
                } else if (value.length < 50) {
                    this.showFieldError(field, 'Content must be at least 50 characters long');
                }
                break;
                
            case 'url':
                if (!value) {
                    this.showFieldError(field, 'URL is required');
                } else if (!this.isValidUrl(value)) {
                    this.showFieldError(field, 'Please enter a valid URL');
                }
                break;
        }
    }

    setupFileHandling() {
        const fileInput = document.getElementById('file');
        if (!fileInput) return;

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelection(file);
            }
        });

        // Drag and drop functionality
        const fileFormContainer = document.getElementById('file-content');
        if (fileFormContainer) {
            this.setupDragAndDrop(fileFormContainer, fileInput);
        }
    }

    handleFileSelection(file) {
        const preview = document.getElementById('filePreview');
        const previewContent = document.getElementById('filePreviewContent');
        
        if (!preview || !previewContent) return;

        // Validate file
        if (!this.isValidFile(file)) {
            preview.style.display = 'none';
            return;
        }

        // Show file info
        this.showFileInfo(file);

        // Read and preview file content
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const preview_text = content.length > 300 ? content.substring(0, 300) + '...' : content;
            
            previewContent.textContent = preview_text;
            preview.style.display = 'block';
            
            // Animate preview appearance
            preview.classList.add('animate__animated', 'animate__fadeIn');
        };
        
        reader.onerror = () => {
            this.showFieldError(document.getElementById('file'), 'Error reading file');
            preview.style.display = 'none';
        };
        
        reader.readAsText(file);
    }

    isValidFile(file) {
        const fileName = file.name.toLowerCase();
        const hasValidExtension = this.allowedFileTypes.some(ext => 
            fileName.endsWith(ext)
        );

        if (!hasValidExtension) {
            this.showFieldError(document.getElementById('file'), 'Only .txt files are allowed');
            return false;
        }

        if (file.size > this.maxFileSize) {
            this.showFieldError(document.getElementById('file'), `File size must be less than ${this.formatFileSize(this.maxFileSize)}`);
            return false;
        }

        if (file.size === 0) {
            this.showFieldError(document.getElementById('file'), 'File cannot be empty');
            return false;
        }

        return true;
    }

    showFileInfo(file) {
        const fileSize = this.formatFileSize(file.size);
        const fileName = file.name;
        
        // You could add a file info display here
        console.log(`Selected file: ${fileName} (${fileSize})`);
    }

    setupDragAndDrop(container, fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.remove('drag-over');
            }, false);
        });

        container.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.handleFileSelection(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    setupUrlValidation() {
        const urlInput = document.getElementById('url');
        if (!urlInput) return;

        urlInput.addEventListener('input', (e) => {
            let url = e.target.value.trim();
            
            // Auto-add https if no protocol
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
                e.target.value = url;
            }
        });

        urlInput.addEventListener('blur', () => {
            this.validateField(urlInput);
        });
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('#analysisMethod button');
        
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (e) => {
                const targetId = e.target.getAttribute('data-bs-target');
                const targetPane = document.querySelector(targetId);
                
                if (targetPane) {
                    // Focus on first input in the active tab
                    const firstInput = targetPane.querySelector('input, textarea');
                    if (firstInput) {
                        setTimeout(() => firstInput.focus(), 100);
                    }
                    
                    // Clear any previous errors when switching tabs
                    const form = targetPane.querySelector('form');
                    if (form) {
                        this.clearFormErrors(form);
                    }
                }
            });
        });
    }

    setupCharacterCounters() {
        const contentTextarea = document.getElementById('content');
        if (!contentTextarea) return;

        const counter = document.getElementById('contentCounter');
        if (!counter) return;

        contentTextarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            counter.textContent = count.toLocaleString();
            
            // Update counter color based on content length
            if (count < 50) {
                counter.className = 'text-warning';
            } else if (count > 9000) {
                counter.className = 'text-danger';
            } else {
                counter.className = 'text-success';
            }
        });
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    isNewsUrl(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();
            
            // Basic check for news-like domains
            const newsIndicators = [
                'news', 'times', 'post', 'herald', 'tribune', 'guardian', 
                'reuters', 'associated', 'press', 'bbc', 'cnn', 'fox', 
                'nbc', 'abc', 'cbs', 'npr', 'bloomberg', 'wsj', 'nytimes'
            ];
            
            return newsIndicators.some(indicator => domain.includes(indicator)) ||
                   domain.includes('news') || 
                   url.includes('/news/') ||
                   url.includes('/article/') ||
                   url.includes('/story/');
        } catch (_) {
            return false;
        }
    }

    showFieldError(field, message) {
        field.classList.add('is-invalid');
        
        // Find or create error message element
        let errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        
        const errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    clearFormErrors(form) {
        const invalidFields = form.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => {
            this.clearFieldError(field);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showAnalysisProgress() {
        const progressHtml = `
            <div class="analysis-progress">
                <div class="progress mb-3">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                </div>
                <div class="text-center">
                    <div class="spinner-border text-primary mb-2" role="status">
                        <span class="visually-hidden">Analyzing...</span>
                    </div>
                    <div>Analyzing content with AI...</div>
                </div>
            </div>
        `;
        
        return progressHtml;
    }
}

// Initialize analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.newsAnalyzer = new NewsAnalyzer();
});

// Export for use in other modules
window.NewsAnalyzer = NewsAnalyzer;
