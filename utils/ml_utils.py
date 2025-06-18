import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import re
import string

# Global variables for model and vectorizer
model = None
vectorizer = None

def load_model():
    """Load the trained model and vectorizer"""
    global model, vectorizer
    
    model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_model', 'model.pkl')
    
    try:
        # Load the saved model and vectorizer
        model_data = joblib.load(model_path)
        model = model_data['model']
        vectorizer = model_data['vectorizer']
        return True
    except FileNotFoundError:
        # If model doesn't exist, create a simple one
        create_simple_model()
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        create_simple_model()
        return True

def create_simple_model():
    """Create a simple model for demonstration"""
    global model, vectorizer
    
    # Create a simple TF-IDF vectorizer
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    
    # Create a simple logistic regression model
    model = LogisticRegression(random_state=42)
    
    # Train with some dummy data for demonstration
    dummy_texts = [
        "This is a real news article about politics and government",
        "This is fake news spreading misinformation",
        "Scientific research shows important findings",
        "Unverified claims about celebrities",
        "Official government announcement",
        "Conspiracy theory without evidence"
    ]
    dummy_labels = [1, 0, 1, 0, 1, 0]  # 1 = Real, 0 = Fake
    
    # Fit vectorizer and model
    X = vectorizer.fit_transform(dummy_texts)
    model.fit(X, dummy_labels)

def preprocess_text(text):
    """Clean and preprocess text for analysis"""
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and digits
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text

def predict_news(text):
    """Predict if news is fake or real"""
    global model, vectorizer
    
    # Load model if not already loaded
    if model is None or vectorizer is None:
        load_model()
    
    # Preprocess text
    cleaned_text = preprocess_text(text)
    
    if not cleaned_text:
        return "REAL", 50.0  # Default for empty text
    
    try:
        # Vectorize the text
        X = vectorizer.transform([cleaned_text])
        
        # Get prediction and probability
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        # Convert to result format
        result = "REAL" if prediction == 1 else "FAKE"
        confidence = max(probabilities) * 100
        
        return result, confidence
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        # Return a simple heuristic-based prediction
        return heuristic_prediction(text)

def heuristic_prediction(text):
    """Simple heuristic-based prediction as fallback"""
    text_lower = text.lower()
    
    # Fake news indicators
    fake_indicators = [
        'shocking', 'unbelievable', 'you won\'t believe',
        'doctors hate', 'secret', 'conspiracy',
        'they don\'t want you to know', 'banned',
        'miracle cure', 'instant', 'guaranteed'
    ]
    
    # Real news indicators
    real_indicators = [
        'according to', 'research shows', 'study finds',
        'official', 'government', 'university',
        'professor', 'scientist', 'data shows'
    ]
    
    fake_score = sum(1 for indicator in fake_indicators if indicator in text_lower)
    real_score = sum(1 for indicator in real_indicators if indicator in text_lower)
    
    if fake_score > real_score:
        confidence = min(60 + fake_score * 10, 85)
        return "FAKE", confidence
    else:
        confidence = min(60 + real_score * 5, 80)
        return "REAL", confidence

# Initialize model on import
load_model()
