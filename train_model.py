import pandas as pd
import pickle
import os
import hashlib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

try:
    import joblib
except ImportError:
    joblib = None

from backend.preprocess import preprocess_batch

DATASET_PATH = os.path.join("dataset", "fine-foods", "Reviews.csv")
OUTPUT_DIR = os.path.join("backend", "models")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATASET_PATH)
print(f"Total rows: {len(df)}")

print("Sampling 200k rows...")
df = df.sample(n=200000, random_state=42).reset_index(drop=True)

print("Mapping scores to sentiment labels...")


def map_sentiment(score):
    if score >= 4:
        return "positive"
    elif score == 3:
        return "neutral"
    else:
        return "negative"


df["sentiment"] = df["Score"].apply(map_sentiment)

print("Preprocessing text...")
df["cleaned"] = preprocess_batch(df["Text"].tolist())

print("Vectorizing with TF-IDF...")
vectorizer = TfidfVectorizer(max_features=50000, ngram_range=(1, 2), sublinear_tf=True)
X = vectorizer.fit_transform(df["cleaned"])

print("Encoding labels...")
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df["sentiment"])

print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training Logistic Regression...")
model = LogisticRegression(C=5, max_iter=1000, random_state=42)
model.fit(X_train, y_train)

print("Evaluating...")
accuracy = model.score(X_test, y_test)
print(f"Test accuracy: {accuracy:.4f}")

print("Saving models...")
model_path = os.path.join(OUTPUT_DIR, "model.pkl")
vectorizer_path = os.path.join(OUTPUT_DIR, "vectorizer.pkl")
label_encoder_path = os.path.join(OUTPUT_DIR, "label_encoder.pkl")

if joblib is not None:
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(label_encoder, label_encoder_path)
else:
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)
    with open(label_encoder_path, "wb") as f:
        pickle.dump(label_encoder, f)
    print("Warning: Using pickle. Install joblib for better security: pip install joblib")

# Compute and print SHA256 hashes for verification
print("\nModel file hashes (for verify_file_integrity in predict.py):")
for filename in ["model.pkl", "vectorizer.pkl", "label_encoder.pkl"]:
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    print(f"  {filename}: '{file_hash}'")

print("\nDone! Models saved to backend/models/")
