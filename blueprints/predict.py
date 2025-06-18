from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models import Submission
from app import db
from utils.ml_utils import predict_news
from utils.content_extractor import extract_from_url
import re
from urllib.parse import urlparse

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/analyze_text')
@login_required
def analyze_text():
    title = request.args.get('title', '').strip()
    content = request.args.get('content', '').strip()
    
    if not title or not content:
        flash('Invalid input data.', 'error')
        return redirect(url_for('user.analyze'))
    
    try:
        # Predict using ML model
        result, confidence = predict_news(content)
        
        # Save to database
        submission = Submission(
            user_id=current_user.id,
            article_title=title,
            article_content=content[:1000],  # Truncate for storage
            source_type='text',
            result=result,
            confidence=confidence
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return render_template('user/result.html',
                             submission=submission,
                             title=title,
                             content=content)
    
    except Exception as e:
        flash('Error analyzing the article. Please try again.', 'error')
        return redirect(url_for('user.analyze'))

@predict_bp.route('/analyze_url')
@login_required
def analyze_url():
    url = request.args.get('url', '').strip()
    
    if not url:
        flash('Invalid URL.', 'error')
        return redirect(url_for('user.analyze'))
    
    # Validate URL format
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            flash('Please provide a valid URL.', 'error')
            return redirect(url_for('user.analyze'))
    except:
        flash('Please provide a valid URL.', 'error')
        return redirect(url_for('user.analyze'))
    
    try:
        # Extract content from URL
        title, content = extract_from_url(url)
        
        if not title or not content:
            flash('Could not extract content from the URL. Please try a different URL or use text input.', 'error')
            return redirect(url_for('user.analyze'))
        
        # Predict using ML model
        result, confidence = predict_news(content)
        
        # Save to database
        submission = Submission(
            user_id=current_user.id,
            article_title=title,
            article_content=content[:1000],  # Truncate for storage
            source_type='url',
            source_url=url,
            result=result,
            confidence=confidence
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return render_template('user/result.html',
                             submission=submission,
                             title=title,
                             content=content,
                             source_url=url)
    
    except Exception as e:
        flash('Error extracting or analyzing content from URL. Please try again.', 'error')
        return redirect(url_for('user.analyze'))
