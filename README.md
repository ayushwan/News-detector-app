# Fake News Detection System

A comprehensive web application for detecting fake news using machine learning and natural language processing. Built with Flask, SQLite, and modern web technologies.

## 🚀 Features

### User Features
- **User Registration & Authentication** - Secure user registration and login system
- **Multiple Input Methods**:
  - Plain text input
  - File upload (.txt files)
  - URL analysis with automatic content extraction
- **AI-Powered Analysis** - Machine learning model for fake news detection
- **Confidence Scores** - Detailed confidence percentages for predictions
- **Result Sharing** - Share results on social media platforms (WhatsApp, Facebook, Twitter, LinkedIn, Telegram)
- **History Tracking** - View and filter submission history
- **PDF Export** - Download analysis results as PDF reports
- **User Profiles** - Manage profile information and view statistics
- **Dark/Light Mode** - Toggle between themes with system preference detection

### Admin Features
- **Admin Dashboard** - Comprehensive overview of system statistics
- **User Management** - View, block, and manage user accounts
- **Submission Monitoring** - Track all submissions with filtering options
- **Analytics** - Visual charts and reports using Chart.js
- **Export Functionality** - Download system reports in CSV format

### Technical Features
- **Responsive Design** - Mobile-first Bootstrap 5 interface
- **Real-time Validation** - Client-side form validation with feedback
- **Error Handling** - Custom 404 and 500 error pages
- **Accessibility** - WCAG compliant design with keyboard navigation
- **Performance** - Optimized loading with animations and transitions

## 🛠 Technology Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database engine
- **Werkzeug** - Security utilities
- **scikit-learn** - Machine learning library
- **BeautifulSoup4** - Web content extraction

### Frontend
- **HTML5** - Semantic markup
- **Bootstrap 5** - CSS framework
- **JavaScript (ES6+)** - Client-side functionality
- **Chart.js** - Data visualization
- **SweetAlert2** - Enhanced alerts and modals
- **Animate.css** - CSS animations
- **Font Awesome** - Icon library
- **jsPDF** - PDF generation

### Machine Learning
- **TF-IDF Vectorization** - Text feature extraction
- **Logistic Regression** - Classification model
- **Natural Language Processing** - Text preprocessing and analysis

## 📋 Requirements

- Python 3.8+
- Modern web browser with JavaScript enabled
- Internet connection for CDN resources

## 🚀 Quick Start

### Deploy on Replit (Recommended)
1. Fork this repository on Replit
2. Click "Run" - all dependencies install automatically
3. Access your app at the provided URL
4. Register an account and start analyzing news

### Local Installation
For detailed local setup instructions, see [INSTALLATION.md](INSTALLATION.md)

**Quick local setup:**
```bash
git clone <repository-url>
cd fake-news-detection-system
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r dependencies.txt
python main.py
