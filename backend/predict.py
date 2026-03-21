import os
import hashlib

try:
    import joblib
except ImportError:
    import pickle as _pickle
    joblib = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Expected SHA256 hashes for model files (to verify integrity)
EXPECTED_HASHES = {
    "model.pkl": None,  # Set after training if desired
    "vectorizer.pkl": None,
    "label_encoder.pkl": None,
}

_model = None
_vectorizer = None
_label_encoder = None


def _verify_file_integrity(filepath: str) -> bool:
    """Verify file integrity using SHA256 hash."""
    if EXPECTED_HASHES.get(os.path.basename(filepath)) is None:
        return True  # Skip verification if no hash configured
    
    expected_hash = EXPECTED_HASHES[os.path.basename(filepath)]
    with open(filepath, "rb") as f:
        actual_hash = hashlib.sha256(f.read()).hexdigest()
    return actual_hash == expected_hash


def load_models():
    global _model, _vectorizer, _label_encoder
    if _model is None:
        model_path = os.path.join(MODELS_DIR, "model.pkl")
        vectorizer_path = os.path.join(MODELS_DIR, "vectorizer.pkl")
        label_encoder_path = os.path.join(MODELS_DIR, "label_encoder.pkl")
        
        # Verify file integrity before loading
        for filepath in [model_path, vectorizer_path, label_encoder_path]:
            if not os.path.exists(filepath):
                raise FileNotFoundError(f"Model file not found: {filepath}")
            if not _verify_file_integrity(filepath):
                raise ValueError(f"Model file integrity check failed: {filepath}")
        
        # Use joblib (safer for numpy arrays) with fallback to pickle
        if joblib is not None:
            _model = joblib.load(model_path)
            _vectorizer = joblib.load(vectorizer_path)
            _label_encoder = joblib.load(label_encoder_path)
        else:
            # Fallback to pickle with warning
            import warnings
            warnings.warn(
                "joblib not available, using pickle. "
                "This is less secure. Install joblib: pip install joblib"
            )
            with open(model_path, "rb") as f:
                _model = _pickle.load(f)
            with open(vectorizer_path, "rb") as f:
                _vectorizer = _pickle.load(f)
            with open(label_encoder_path, "rb") as f:
                _label_encoder = _pickle.load(f)


def predict(texts: list[str], vectorized_texts):
    load_models()
    predictions = _model.predict(vectorized_texts)
    probabilities = _model.predict_proba(vectorized_texts)
    confidence = probabilities.max(axis=1)
    labels = _label_encoder.inverse_transform(predictions)
    return labels, confidence


def vectorize(texts: list[str]):
    load_models()
    return _vectorizer.transform(texts)
