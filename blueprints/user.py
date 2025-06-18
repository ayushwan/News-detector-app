from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app, send_file
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models import User, Submission
from app import db
import os
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'admin':
        return redirect(url_for('admin.dashboard'))
    
    # Get user statistics
    total_submissions = len(current_user.submissions)
    fake_count = current_user.get_fake_count()
    real_count = current_user.get_real_count()
    
    # Get recent submissions
    recent_submissions = Submission.query.filter_by(user_id=current_user.id)\
                                       .order_by(Submission.timestamp.desc())\
                                       .limit(5).all()
    
    return render_template('user/dashboard.html',
                         total_submissions=total_submissions,
                         fake_count=fake_count,
                         real_count=real_count,
                         recent_submissions=recent_submissions)

@user_bp.route('/analyze', methods=['GET', 'POST'])
@login_required
def analyze():
    if request.method == 'POST':
        source_type = request.form.get('source_type')
        
        if source_type == 'text':
            title = request.form.get('title', '').strip()
            content = request.form.get('content', '').strip()
            
            if not title or not content:
                flash('Please provide both title and content.', 'error')
                return render_template('user/analyze.html')
            
            # Redirect to prediction
            return redirect(url_for('predict.analyze_text', 
                                  title=title, content=content))
        
        elif source_type == 'file':
            if 'file' not in request.files:
                flash('Please select a file.', 'error')
                return render_template('user/analyze.html')
            
            file = request.files['file']
            if file.filename == '':
                flash('Please select a file.', 'error')
                return render_template('user/analyze.html')
            
            if not file.filename.lower().endswith('.txt'):
                flash('Only .txt files are allowed.', 'error')
                return render_template('user/analyze.html')
            
            # Read file content
            try:
                content = file.read().decode('utf-8')
                title = request.form.get('file_title', '').strip() or \
                       os.path.splitext(file.filename)[0]
                
                return redirect(url_for('predict.analyze_text',
                                      title=title, content=content))
            except Exception as e:
                flash('Error reading file. Please try again.', 'error')
                return render_template('user/analyze.html')
        
        elif source_type == 'url':
            url = request.form.get('url', '').strip()
            
            if not url:
                flash('Please provide a URL.', 'error')
                return render_template('user/analyze.html')
            
            return redirect(url_for('predict.analyze_url', url=url))
    
    return render_template('user/analyze.html')

@user_bp.route('/history')
@login_required
def history():
    page = request.args.get('page', 1, type=int)
    result_filter = request.args.get('result', '')
    source_filter = request.args.get('source', '')
    
    query = Submission.query.filter_by(user_id=current_user.id)
    
    if result_filter:
        query = query.filter(Submission.result == result_filter)
    
    if source_filter:
        query = query.filter(Submission.source_type == source_filter)
    
    submissions = query.order_by(Submission.timestamp.desc())\
                      .paginate(page=page, per_page=10, error_out=False)
    
    return render_template('user/history.html', 
                         submissions=submissions,
                         result_filter=result_filter,
                         source_filter=source_filter)

@user_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'update_profile':
            name = request.form.get('name', '').strip()
            email = request.form.get('email', '').strip().lower()
            
            if not name or not email:
                flash('Name and email are required.', 'error')
                return render_template('user/profile.html')
            
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=email).first()
            if existing_user and existing_user.id != current_user.id:
                flash('Email address already taken.', 'error')
                return render_template('user/profile.html')
            
            current_user.name = name
            current_user.email = email
            
            try:
                db.session.commit()
                flash('Profile updated successfully.', 'success')
            except Exception as e:
                db.session.rollback()
                flash('Error updating profile.', 'error')
        
        elif action == 'change_password':
            current_password = request.form.get('current_password', '')
            new_password = request.form.get('new_password', '')
            confirm_password = request.form.get('confirm_password', '')
            
            if not check_password_hash(current_user.password_hash, current_password):
                flash('Current password is incorrect.', 'error')
                return render_template('user/profile.html')
            
            if len(new_password) < 6:
                flash('New password must be at least 6 characters long.', 'error')
                return render_template('user/profile.html')
            
            if new_password != confirm_password:
                flash('New passwords do not match.', 'error')
                return render_template('user/profile.html')
            
            current_user.password_hash = generate_password_hash(new_password)
            
            try:
                db.session.commit()
                flash('Password changed successfully.', 'success')
            except Exception as e:
                db.session.rollback()
                flash('Error changing password.', 'error')
    
    return render_template('user/profile.html')
