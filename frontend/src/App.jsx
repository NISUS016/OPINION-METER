import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import ResultsChart from './components/ResultsChart'
import ReviewCard from './components/ReviewCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [sampleProducts, setSampleProducts] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/products?limit=10`)
      .then(res => res.json())
      .then(data => setSampleProducts(data.products || []))
      .catch(() => {})
  }, [])

  const handleSearch = async (productId, productSummary) => {
    setLoading(true)
    setError(null)
    setQuery(productSummary)

    try {
      const reviewsRes = await fetch(`${API_URL}/products/${productId}?limit=50`)
      if (!reviewsRes.ok) throw new Error('Failed to fetch reviews')
      const reviewsData = await reviewsRes.json()

      if (reviewsData.reviews.length === 0) {
        setError('No reviews found for this product.')
        setResults(null)
        setLoading(false)
        return
      }

      const analyzeRes = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewsData.reviews.map(r => r.text) }),
      })
      if (!analyzeRes.ok) throw new Error('Analysis failed')
      const analyzeData = await analyzeRes.json()

      const reviewsWithAnalysis = reviewsData.reviews.map((r, i) => ({
        ...r,
        label: analyzeData.results[i].label,
        confidence: analyzeData.results[i].confidence,
      }))

      setResults({
        summary: analyzeData.summary,
        reviews: reviewsWithAnalysis,
        productSummary: productSummary,
      })
    } catch (err) {
      setError('Failed to fetch and analyze reviews. Please try again.')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>OpinionMeter</h1>
        <p style={styles.subtitle}>Discover what people really think about products</p>
      </header>

      <main style={styles.main}>
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {loading && <p style={styles.loading}>Analyzing reviews...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {sampleProducts.length > 0 && !results && (
          <div style={styles.sampleSection}>
            <h3 style={styles.sampleTitle}>Popular Products</h3>
            <div style={styles.productGrid}>
              {sampleProducts.map((product) => (
                <button
                  key={product.product_id}
                  style={styles.productCard}
                  onClick={() => handleSearch(product.product_id, product.summary)}
                  disabled={loading}
                >
                  <span style={styles.productName}>{product.summary}</span>
                  <span style={styles.productMeta}>{product.review_count} reviews · {product.avg_score} avg</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {results && (
          <>
            <h2 style={styles.sectionTitle}>Results for "{results.productSummary}"</h2>
            <ResultsChart summary={results.summary} />
            <h3 style={styles.sectionTitle}>Individual Reviews</h3>
            <div style={styles.reviewList}>
              {results.reviews.map((review, index) => (
                <ReviewCard
                  key={`${review.text.slice(0, 50)}-${index}`}
                  review={review}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#4f46e5',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    margin: 0,
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loading: {
    fontSize: '18px',
    color: '#6b7280',
    marginTop: '20px',
  },
  error: {
    fontSize: '16px',
    color: '#ef4444',
    marginTop: '20px',
  },
  sampleSection: {
    width: '100%',
    marginTop: '40px',
  },
  sampleTitle: {
    fontSize: '20px',
    color: '#1f2937',
    marginBottom: '16px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    width: '100%',
  },
  productCard: {
    padding: '16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  productName: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productMeta: {
    fontSize: '12px',
    color: '#6b7280',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    marginTop: '30px',
    marginBottom: '16px',
    fontSize: '20px',
    color: '#1f2937',
  },
  reviewList: {
    width: '100%',
  },
}
