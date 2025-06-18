from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, make_response
from flask_login import login_required, current_user
from models import User, Submission
from app import db
from datetime import datetime
import csv
import io

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    # Get statistics
    total_users = User.query.filter_by(role='user').count()
    total_submissions = Submission.query.count()
    fake_submissions = Submission.query.filter_by(result='FAKE').count()
    real_submissions = Submission.query.filter_by(result='REAL').count()
    blocked_users = User.query.filter_by(status='blocked').count()
    
    # Get recent activity
    recent_users = User.query.filter_by(role='user')\
                           .order_by(User.created_at.desc())\
                           .limit(5).all()
    
    recent_submissions = Submission.query.order_by(Submission.timestamp.desc())\
                                        .limit(10).all()
    
    return render_template('admin/dashboard.html',
                         total_users=total_users,
                         total_submissions=total_submissions,
                         fake_submissions=fake_submissions,
                         real_submissions=real_submissions,
                         blocked_users=blocked_users,
                         recent_users=recent_users,
                         recent_submissions=recent_submissions)

@admin_bp.route('/users')
@login_required
@admin_required
def users():
    page = request.args.get('page', 1, type=int)
    status_filter = request.args.get('status', '')
    search = request.args.get('search', '')
    
    query = User.query.filter_by(role='user')
    
    if status_filter:
        query = query.filter(User.status == status_filter)
    
    if search:
        query = query.filter(
            (User.name.contains(search)) | 
            (User.email.contains(search))
        )
    
    users = query.order_by(User.created_at.desc())\
               .paginate(page=page, per_page=20, error_out=False)
    
    return render_template('admin/users.html',
                         users=users,
                         status_filter=status_filter,
                         search=search)

@admin_bp.route('/users/<int:user_id>/toggle_status', methods=['POST'])
@login_required
@admin_required
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    
    if user.role == 'admin':
        flash('Cannot modify admin users.', 'error')
        return redirect(url_for('admin.users'))
    
    user.status = 'blocked' if user.status == 'active' else 'active'
    
    try:
        db.session.commit()
        flash(f'User {user.name} has been {"blocked" if user.status == "blocked" else "unblocked"}.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Error updating user status.', 'error')
    
    return redirect(url_for('admin.users'))

@admin_bp.route('/users/<int:user_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    
    if user.role == 'admin':
        flash('Cannot delete admin users.', 'error')
        return redirect(url_for('admin.users'))
    
    try:
        db.session.delete(user)
        db.session.commit()
        flash(f'User {user.name} has been deleted.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Error deleting user.', 'error')
    
    return redirect(url_for('admin.users'))

@admin_bp.route('/submissions')
@login_required
@admin_required
def submissions():
    page = request.args.get('page', 1, type=int)
    result_filter = request.args.get('result', '')
    source_filter = request.args.get('source', '')
    user_filter = request.args.get('user', '')
    
    query = Submission.query
    
    if result_filter:
        query = query.filter(Submission.result == result_filter)
    
    if source_filter:
        query = query.filter(Submission.source_type == source_filter)
    
    if user_filter:
        query = query.join(User).filter(
            (User.name.contains(user_filter)) |
            (User.email.contains(user_filter))
        )
    
    submissions = query.order_by(Submission.timestamp.desc())\
                      .paginate(page=page, per_page=20, error_out=False)
    
    return render_template('admin/submissions.html',
                         submissions=submissions,
                         result_filter=result_filter,
                         source_filter=source_filter,
                         user_filter=user_filter)

@admin_bp.route('/download_report')
@login_required
@admin_required
def download_report():
    # Create CSV report
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['User Name', 'User Email', 'Article Title', 'Source Type', 
                    'Result', 'Confidence', 'Timestamp'])
    
    # Write data
    submissions = Submission.query.join(User).all()
    for submission in submissions:
        writer.writerow([
            submission.user.name,
            submission.user.email,
            submission.article_title,
            submission.source_type,
            submission.result,
            f"{submission.confidence:.2f}%",
            submission.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    # Create response
    output.seek(0)
    response = make_response(output.getvalue())
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = f'attachment; filename=fake_news_report_{datetime.now().strftime("%Y%m%d")}.csv'
    
    return response

@admin_bp.route('/api/stats')
@login_required
@admin_required
def api_stats():
    # Get monthly statistics for charts
    from sqlalchemy import func, extract
    
    monthly_stats = db.session.query(
        extract('month', Submission.timestamp).label('month'),
        func.count(Submission.id).label('total'),
        func.sum(func.case([(Submission.result == 'FAKE', 1)], else_=0)).label('fake'),
        func.sum(func.case([(Submission.result == 'REAL', 1)], else_=0)).label('real')
    ).group_by('month').all()
    
    return jsonify({
        'monthly_stats': [
            {
                'month': stat.month,
                'total': stat.total,
                'fake': stat.fake,
                'real': stat.real
            }
            for stat in monthly_stats
        ]
    })
