from fastapi import FastAPI, Query, HTTPException, Path as PathParam
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import os

from preprocess import preprocess_batch
from predict import predict, vectorize

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://opinion-meter.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "dataset", "fine-foods", "Reviews.csv"
)

# Cache for dataset to avoid reloading on every request
_dataset_cache = None
_products_cache = None


def get_dataset() -> pd.DataFrame:
    """Load and cache the dataset."""
    global _dataset_cache
    if _dataset_cache is None:
        if not os.path.exists(DATASET_PATH):
            raise HTTPException(
                status_code=503,
                detail="Dataset not found. Please ensure Reviews.csv is placed in dataset/fine-foods/"
            )
        try:
            _dataset_cache = pd.read_csv(DATASET_PATH)
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=503, detail="Dataset file is empty")
        except pd.errors.ParserError as e:
            raise HTTPException(status_code=503, detail=f"Dataset file is corrupted: {str(e)}")
    return _dataset_cache


def get_products() -> pd.DataFrame:
    """Get unique products with their details."""
    global _products_cache
    if _products_cache is None:
        df = get_dataset()
        _products_cache = df.groupby('ProductId').agg({
            'Summary': 'first',
            'Text': 'count',
            'Score': 'mean'
        }).reset_index()
        _products_cache.columns = ['product_id', 'summary', 'review_count', 'avg_score']
    return _products_cache


class AnalyzeRequest(BaseModel):
    reviews: list[str] = Field(..., min_length=1, max_length=100)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/search")
def search(
    q: str = Query(..., min_length=1, max_length=100, description="Search keyword"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of results")
):
    # Input sanitization - strip whitespace
    q = q.strip()
    
    try:
        df = get_dataset()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {str(e)}")
    
    # Use regex for more flexible search with special character escaping
    escaped_q = str(q).replace("\\", "\\\\").replace(".", "\\.").replace("+", "\\+")
    results = df[df["Text"].str.contains(escaped_q, case=False, na=False, regex=True)].head(limit)
    reviews = [
        {"text": str(row["Text"]), "score": int(row["Score"])}
        for _, row in results.iterrows()
    ]
    return {"query": q, "count": len(reviews), "reviews": reviews}


@app.get("/products")
def search_products(
    q: str = Query(..., min_length=1, max_length=100, description="Search products by name"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of results")
):
    """Search for products by their review summary/name."""
    q = q.strip()
    
    try:
        products = get_products()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load products: {str(e)}")
    
    # Search in product summary
    escaped_q = str(q).replace("\\", "\\\\").replace(".", "\\.")
    results = products[products["summary"].str.contains(escaped_q, case=False, na=False, regex=True)].head(limit)
    
    return {
        "query": q,
        "count": len(results),
        "products": [
            {
                "product_id": row["product_id"],
                "summary": str(row["summary"]),
                "review_count": int(row["review_count"]),
                "avg_score": round(float(row["avg_score"]), 2)
            }
            for _, row in results.iterrows()
        ]
    }


@app.get("/products/{product_id}")
def get_product_reviews(
    product_id: str = PathParam(..., description="Product ID"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of reviews")
):
    """Get all reviews for a specific product by ProductId."""
    try:
        df = get_dataset()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {str(e)}")
    
    results = df[df["ProductId"] == product_id].head(limit)
    
    if len(results) == 0:
        raise HTTPException(status_code=404, detail=f"Product not found: {product_id}")
    
    # Get product info
    product_summary = results.iloc[0]["Summary"]
    
    reviews = [
        {
            "text": str(row["Text"]), 
            "score": int(row["Score"]),
            "summary": str(row["Summary"])
        }
        for _, row in results.iterrows()
    ]
    
    return {
        "product_id": product_id,
        "product_summary": str(product_summary),
        "count": len(reviews),
        "reviews": reviews
    }


@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    # Validate each review in the batch
    for i, review in enumerate(data.reviews):
        if not review or not review.strip():
            raise HTTPException(
                status_code=400,
                detail=f"Empty review at index {i}"
            )
        if len(review) > 10000:
            raise HTTPException(
                status_code=400,
                detail=f"Review at index {i} exceeds maximum length of 10000 characters"
            )
    
    try:
        preprocessed = preprocess_batch(data.reviews)
        vectors = vectorize(preprocessed)
        labels, confidences = predict(preprocessed, vectors)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    summary = {"positive": 0, "neutral": 0, "negative": 0, "total": len(labels)}
    results = []
    for text, label, conf in zip(data.reviews, labels, confidences):
        summary[label] += 1
        results.append(
            {"text": text, "label": label, "confidence": round(float(conf), 2)}
        )
    return {"summary": summary, "results": results}
