# Fake News Detection System - Installation Guide

## Quick Start (Recommended)

### Option 1: Deploy on Replit (Easiest)
1. Fork this repository on Replit
2. Click the "Run" button - all dependencies will install automatically
3. The application will start on port 5000
4. Create your admin account and start using the system

### Option 2: Local Development Setup

#### Prerequisites
- Python 3.11 or higher
- PostgreSQL (or SQLite for development)
- Git

#### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd fake-news-detection-system
   ```

2. **Set Up Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r dependencies.txt
   ```
   
   Or if using uv (recommended):
   ```bash
   uv sync
   ```
   
   Note: This project uses uv for dependency management. The dependencies.txt file is provided for traditional pip installations.

4. **Set Environment Variables**
   Create a `.env` file in the project root:
   ```env
   SESSION_SECRET=your-secret-key-here
   DATABASE_URL=postgresql://username:password@localhost/fake_news_db
   # Or for SQLite: DATABASE_URL=sqlite:///instance/database.db
   ```

5. **Set Up Database**
   
   For PostgreSQL:
   ```bash
   createdb fake_news_db
   ```
   
   The application will automatically create tables on first run.

6. **Train the ML Model**
   ```bash
   cd ml_model
   python train_model.py
   cd ..
   ```

7. **Run the Application**
   ```bash
   python main.py
   ```
   
   Or with Gunicorn (production):
   ```bash
   gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
   ```

8. **Access the Application**
   Open your browser and go to `http://localhost:5000`

## Configuration Options

### Database Configuration
- **PostgreSQL** (recommended for production): Set `DATABASE_URL` to your PostgreSQL connection string
- **SQLite** (development): Use `sqlite:///instance/database.db` for local development

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Secret key for session encryption | Required |
| `DATABASE_URL` | Database connection string | SQLite by default |
| `FLASK_ENV` | Flask environment | production |
| `FLASK_DEBUG` | Enable debug mode | False |

## First-Time Setup

### Creating Admin Account
1. Register a new account through the web interface
2. Access the database and update the user's role to 'admin'
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Training Custom ML Model
The system includes a pre-trained model, but you can train your own:

1. Prepare your dataset in the format expected by `ml_model/train_model.py`
2. Run the training script:
   ```bash
   cd ml_model
   python train_model.py
   ```
3. The new model will be saved as `model.pkl`

## Features Overview

### User Features
- **Text Analysis**: Paste news text directly for analysis
- **File Upload**: Upload .txt files for batch analysis
- **URL Analysis**: Extract and analyze news from URLs
- **History Tracking**: View all previous submissions
- **Results Sharing**: Share analysis results on social media

### Admin Features
- **Dashboard**: Overview of system statistics and trends
- **User Management**: View, block, and manage user accounts
- **Submission Monitoring**: Track all news submissions
- **Analytics**: Detailed charts and reporting
- **Data Export**: Download system reports

### Technical Features
- **Machine Learning**: TF-IDF + Logistic Regression for fake news detection
- **Web Scraping**: Automatic content extraction from news URLs
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Secure Authentication**: Password hashing and session management

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check database permissions

2. **Model Loading Error**
   - Run the training script: `python ml_model/train_model.py`
   - Verify the model.pkl file exists in ml_model/

3. **Dependencies Not Installing**
   - Use Python 3.11 or higher
   - Update pip: `pip install --upgrade pip`
   - Try using virtual environment

4. **Port Already in Use**
   - Change port in main.py or use: `python main.py --port 5001`
   - Kill existing processes: `pkill -f python`

### Performance Optimization

1. **Database Optimization**
   - Use PostgreSQL for production
   - Enable connection pooling
   - Regular database maintenance

2. **ML Model Performance**
   - Increase model complexity for better accuracy
   - Add more training data
   - Experiment with different algorithms

3. **Web Performance**
   - Use Gunicorn with multiple workers
   - Enable static file caching
   - Optimize database queries

## Production Deployment

### Recommended Stack
- **Web Server**: Gunicorn + Nginx
- **Database**: PostgreSQL
- **Caching**: Redis (optional)
- **Monitoring**: Application logs and metrics

### Security Considerations
- Use strong SESSION_SECRET
- Enable HTTPS in production
- Regular security updates
- Database connection encryption
- Input validation and sanitization

### Scaling Options
- **Horizontal Scaling**: Multiple application instances
- **Database Scaling**: Read replicas, connection pooling
- **ML Model**: Separate service for model inference
- **Load Balancing**: Distribute traffic across instances

## Support

### Getting Help
- Check the troubleshooting section above
- Review application logs for error details
- Ensure all dependencies are correctly installed
- Verify environment variables are set

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog
- **June 18, 2025**: Initial release with complete fake news detection system
- **Features**: User authentication, ML analysis, admin dashboard, URL processing
- **Tech Stack**: Flask, PostgreSQL, scikit-learn, Bootstrap 5