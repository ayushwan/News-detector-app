"""
Training script for the fake news detection model.
This script creates and saves a TF-IDF + Logistic Regression model.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import re

def preprocess_text(text):
    """Clean and preprocess text"""
    if pd.isna(text):
        return ""
    
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

def create_sample_dataset():
    """Create a sample dataset for training"""
    # Sample fake news texts
    fake_news = [
        "SHOCKING: Scientists discover this one weird trick that doctors don't want you to know!",
        "BREAKING: Celebrity found dead in hotel room - you won't believe what happened next!",
        "Miracle cure for all diseases discovered but Big Pharma is hiding it from you!",
        "Government conspiracy revealed: They have been lying to us all along!",
        "Unbelievable footage shows aliens landing in downtown area - video proof inside!",
        "Local mom discovers this simple trick to lose 50 pounds in 2 weeks!",
        "Banks hate him! This man found a secret loophole to get free money!",
        "Doctors are amazed by this new supplement that reverses aging instantly!",
        "You won't believe what this teacher did when students weren't paying attention!",
        "Secret government documents leaked - the truth will shock you!"
    ]
    
    # Sample real news texts
    real_news = [
        "The Federal Reserve announced today a 0.25% increase in interest rates following their monthly meeting.",
        "Researchers at Harvard University published a study showing the effects of climate change on coral reefs.",
        "The mayor held a press conference to discuss the new infrastructure development plans for the city.",
        "Stock markets closed higher today as investors reacted positively to the latest employment data.",
        "Scientists at NASA announced the successful launch of their new Mars exploration rover mission.",
        "The Department of Health issued new guidelines for vaccination protocols in response to recent outbreaks.",
        "Local school district receives federal funding to improve STEM education programs in elementary schools.",
        "Weather service issues flood warning for coastal areas due to expected heavy rainfall this weekend.",
        "University researchers conduct study on the effectiveness of renewable energy sources in rural communities.",
        "City council approves budget allocation for public transportation improvements scheduled for next year."
    ]
    
    # Create labels (0 = fake, 1 = real)
    texts = fake_news + real_news
    labels = [0] * len(fake_news) + [1] * len(real_news)
    
    return texts, labels

def train_model():
    """Train and save the fake news detection model"""
    print("Creating sample dataset...")
    texts, labels = create_sample_dataset()
    
    print("Preprocessing text data...")
    processed_texts = [preprocess_text(text) for text in texts]
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        processed_texts, labels, test_size=0.2, random_state=42
    )
    
    print("Creating TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.9
    )
    
    print("Fitting vectorizer and transforming data...")
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    print("Training Logistic Regression model...")
    model = LogisticRegression(
        random_state=42,
        max_iter=1000,
        C=1.0
    )
    
    model.fit(X_train_tfidf, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Fake', 'Real']))
    
    print("Saving model...")
    model_data = {
        'model': model,
        'vectorizer': vectorizer
    }
    
    # Create model directory if it doesn't exist
    model_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'model.pkl')
    joblib.dump(model_data, model_path)
    
    print(f"Model saved to: {model_path}")
    return model, vectorizer

if __name__ == "__main__":
    train_model()
