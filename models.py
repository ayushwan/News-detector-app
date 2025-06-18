from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from app import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    status = db.Column(db.String(20), default='active')  # 'active' or 'blocked'
    avatar = db.Column(db.String(200), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with submissions
    submissions = db.relationship('Submission', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def get_submission_count(self):
        return len(self.submissions)
    
    def get_fake_count(self):
        return len([s for s in self.submissions if s.result == 'FAKE'])
    
    def get_real_count(self):
        return len([s for s in self.submissions if s.result == 'REAL'])

class Submission(db.Model):
    __tablename__ = 'submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    article_title = db.Column(db.String(200), nullable=False)
    article_content = db.Column(db.Text, nullable=False)
    source_type = db.Column(db.String(20), nullable=False)  # 'text', 'file', 'url'
    source_url = db.Column(db.String(500), nullable=True)
    result = db.Column(db.String(10), nullable=False)  # 'FAKE' or 'REAL'
    confidence = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Submission {self.id}: {self.result}>'
