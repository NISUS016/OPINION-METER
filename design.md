# OpinionMeter — Design Document (v1)

## Overview

OpinionMeter is a sentiment analysis web app for online product reviews. Users search for a product keyword, the app fetches matching reviews from the Amazon Fine Food Reviews dataset, runs them through an NLP + Logistic Regression pipeline, and displays a sentiment breakdown with a chart and individual review cards.

**Version:** v1 (submission build)  
**Team:** Mini project, B.Tech ECS, RBU Nagpur  

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Python, FastAPI |
| ML | scikit-learn — Logistic Regression + TF-IDF |
| NLP | NLTK — tokenization, stopword removal, stemming |
| Hosting (frontend) | Vercel |
| Hosting (backend) | Render.com |
| Database | None — dataset loaded in memory via pandas |

---

## Dataset

**Amazon Fine Food Reviews**  
- Source: Kaggle (`snap/amazon-fine-food-reviews`)  
- File: `Reviews.csv`  
- Size: ~568,000 rows  
- Columns used: `Text` (review body), `Score` (1–5 star rating)  
- Location in repo: `dataset/Reviews.csv`

### Label Mapping

| Star Score | Sentiment Label |
|---|---|
| 1–2 | negative |
| 3 | neutral |
| 4–5 | positive |

---

## Repo Structure

```
opinion-meter/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── predict.py               # ML inference logic
│   ├── preprocess.py            # Text cleaning + NLTK pipeline
│   ├── models/
│   │   ├── model.pkl            # Trained Logistic Regression model
│   │   ├── vectorizer.pkl       # Fitted TF-IDF vectorizer
│   │   └── label_encoder.pkl    # Label encoder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ResultsChart.jsx
│   │   │   └── ReviewCard.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── dataset/
│   └── Reviews.csv              # Kaggle dataset (not committed to git)
├── train_model.py               # Offline training script — run once
├── DESIGN.md                    # This file
└── README.md
```

> `dataset/` and `backend/models/` should be added to `.gitignore`. Commit only the code, not the large files.

---

## ML Pipeline

### Training (offline, run once)

```
Reviews.csv
  → load + sample 200k rows
  → map Score → sentiment label (negative / neutral / positive)
  → text preprocessing (NLTK)
      - lowercase
      - remove HTML tags, URLs, punctuation
      - remove stopwords
      - Porter stemming
  → TF-IDF vectorization
      - max_features: 50,000
      - ngram_range: (1, 2)   ← bigrams catch "not good", "very bad"
      - sublinear_tf: True
  → train Logistic Regression (C=5, max_iter=1000)
  → evaluate on 20% test split
  → save model.pkl, vectorizer.pkl, label_encoder.pkl
```

### Inference (per request)

```
review text (string)
  → preprocess.py  (same pipeline as training, no fitting)
  → vectorizer.transform()
  → model.predict() + model.predict_proba()
  → return { label, confidence }
```

---

## API Endpoints

### `GET /search`

Search reviews by keyword.

**Query params:**
- `q` (string) — product keyword e.g. `chocolate`
- `limit` (int, default 50) — number of reviews to return

**Response:**
```json
{
  "query": "chocolate",
  "count": 50,
  "reviews": [
    {
      "text": "This chocolate is absolutely amazing...",
      "score": 5
    }
  ]
}
```

---

### `POST /analyze`

Run sentiment analysis on a list of review texts.

**Request body:**
```json
{
  "reviews": ["Amazing product!", "Terrible quality.", "It is okay."]
}
```

**Response:**
```json
{
  "summary": {
    "positive": 42,
    "neutral": 5,
    "negative": 3,
    "total": 50
  },
  "results": [
    { "text": "Amazing product!", "label": "positive", "confidence": 0.94 },
    { "text": "Terrible quality.", "label": "negative", "confidence": 0.91 },
    { "text": "It is okay.", "label": "neutral", "confidence": 0.73 }
  ]
}
```

---

### `GET /health`

Health check for Render.

**Response:**
```json
{ "status": "ok" }
```

---

## Frontend — User Flow

```
1. User lands on homepage
2. Types a product keyword in the search bar (e.g. "coffee")
3. App calls GET /search?q=coffee
4. App calls POST /analyze with the returned reviews
5. Results page shows:
   - Overall sentiment badge (Positive / Neutral / Negative)
   - Pie or bar chart — breakdown of positive / neutral / negative counts
   - List of review cards, each showing:
       - Review text (truncated)
       - Sentiment label badge (color coded)
       - Confidence percentage
```

### Sentiment Color Coding

| Label | Color |
|---|---|
| positive | Green |
| neutral | Amber / Yellow |
| negative | Red |

---

## Frontend Components

| Component | Responsibility |
|---|---|
| `SearchBar.jsx` | Controlled input + search button, calls API on submit |
| `ResultsChart.jsx` | Renders pie/bar chart using Chart.js or Recharts |
| `ReviewCard.jsx` | Displays individual review text + sentiment badge |
| `App.jsx` | State management, API calls, routing between search and results views |

---

## Environment Variables

### Backend (`backend/.env`)

```
ALLOWED_ORIGINS=https://opinion-meter.vercel.app
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=https://opinion-meter-api.onrender.com
```

---

## CORS Configuration

Backend must allow requests from the Vercel frontend domain. Configured in `main.py` using `fastapi.middleware.cors.CORSMiddleware`.

---

## Deployment

### Backend → Render.com
- Connect GitHub repo
- Root directory: `backend/`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Upload `model.pkl`, `vectorizer.pkl`, `label_encoder.pkl` via Render's environment or persistent disk

### Frontend → Vercel
- Connect GitHub repo
- Root directory: `frontend/`
- Framework preset: Vite
- Set `VITE_API_URL` in Vercel environment variables

---

## .gitignore Entries

```
dataset/
backend/models/
backend/__pycache__/
*.pkl
*.csv
.env
node_modules/
dist/
```

---

## What the Planner Agent Should Build (Task Scope)

1. `train_model.py` — offline training script 
2. `backend/preprocess.py` — text cleaning functions
3. `backend/predict.py` — load pkl files, run inference
4. `backend/main.py` — FastAPI app with `/search`, `/analyze`, `/health` routes + CORS
5. `backend/requirements.txt`
6. `frontend/` — Vite + React app with `SearchBar`, `ResultsChart`, `ReviewCard` components
7. `frontend/.env` — API URL config
8. `README.md` — setup and run instructions