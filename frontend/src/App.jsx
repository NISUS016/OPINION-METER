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
    fetch(`${API_URL}/products?limit=10&min_reviews=50`)
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
      {/* Volumetric Glow Background */}
      <div style={styles.glowBackground}></div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>ReviewLens</span>
          <span style={styles.navTagline}>Know what buyers actually think</span>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Hero Section */}
        {!results && (
          <div style={styles.hero}>
            <h1 style={styles.heroTitle}>
              The Pulse of <span style={styles.heroAccent}>Every Review.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Aggregate sentiment, extract keywords, and unlock product insights with AI-driven analysis.
            </p>
          </div>
        )}

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Analyzing reviews...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Sample Products */}
        {!results && !loading && sampleProducts.length > 0 && (
          <div style={styles.sampleSection}>
            <div style={styles.sampleHeader}>
              <span style={styles.sampleLabel}>TRENDING</span>
            </div>
            <div style={styles.productGrid}>
              {sampleProducts.slice(0, 6).map((product) => (
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

        {/* Results Section */}
        {results && (
          <div style={styles.resultsSection}>
            <div style={styles.resultsHeader}>
              <button 
                style={styles.backButton}
                onClick={() => setResults(null)}
              >
                <span style={styles.backIcon}>←</span>
                Back to Search
              </button>
              <h2 style={styles.resultsTitle}>Results for "{results.productSummary}"</h2>
            </div>
            <ResultsChart summary={results.summary} />
            <h3 style={styles.reviewsTitle}>Individual Reviews</h3>
            <div style={styles.reviewList}>
              {results.reviews.map((review, index) => (
                <ReviewCard
                  key={`${review.text.slice(0, 50)}-${index}`}
                  review={review}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feature Cards (only on home) */}
        {!results && !loading && (
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📊</div>
              <h3 style={styles.featureTitle}>Sentiment Mapping</h3>
              <p style={styles.featureText}>
                Instantly visualize the emotional arc of thousands of user reviews in seconds.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎯</div>
              <h3 style={styles.featureTitle}>Key Feature Extraction</h3>
              <p style={styles.featureText}>
                AI identifies exactly which features users love and where the product fails.
              </p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>✨</div>
              <h3 style={styles.featureTitle}>AI Summary</h3>
              <p style={styles.featureText}>
                Get a concise, bulleted report of the "Buyer's Consensus" without reading a single word.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>© 2024 ReviewLens AI</span>
        <span style={styles.footerPowered}>Powered by GPT-4o Engine</span>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--surface)',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBackground: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.15) 0%, rgba(9, 14, 25, 0) 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(14, 19, 30, 0.8)',
    backdropFilter: 'blur(12px)',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  navLogo: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--primary)',
    fontFamily: 'var(--font-headline)',
    letterSpacing: '-0.02em',
  },
  navTagline: {
    fontSize: '13px',
    color: '#8B9AAD',
    fontFamily: 'var(--font-label)',
    fontWeight: '500',
  },
  main: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '120px 24px 60px',
    minHeight: '100vh',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    fontFamily: 'var(--font-headline)',
    color: 'var(--on-surface)',
    marginBottom: '16px',
    fontStyle: 'italic',
  },
  heroAccent: {
    color: 'var(--primary)',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--on-surface-variant)',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  loadingContainer: {
    marginTop: '40px',
    textAlign: 'center',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--surface-container-high)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    fontSize: '16px',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-body)',
  },
  errorContainer: {
    marginTop: '40px',
    padding: '16px 24px',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: '12px',
  },
  errorText: {
    fontSize: '14px',
    color: 'var(--negative)',
  },
  sampleSection: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '48px',
  },
  sampleHeader: {
    marginBottom: '16px',
  },
  sampleLabel: {
    fontSize: '11px',
    fontFamily: 'var(--font-label)',
    letterSpacing: '0.15em',
    color: 'var(--on-surface-variant)',
    textTransform: 'uppercase',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
    width: '100%',
  },
  productCard: {
    padding: '16px 20px',
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid rgba(60, 73, 71, 0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  productName: {
    fontSize: '14px',
    color: 'var(--on-surface)',
    fontFamily: 'var(--font-body)',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productMeta: {
    fontSize: '12px',
    color: 'var(--on-surface-variant)',
    fontFamily: 'var(--font-label)',
  },
  resultsSection: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '20px',
  },
  resultsHeader: {
    marginBottom: '24px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--surface-container-low)',
    border: '1px solid var(--outline-variant)',
    color: 'var(--on-surface-variant)',
    fontSize: '14px',
    fontFamily: 'var(--font-label)',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: '10px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  backIcon: {
    fontSize: '16px',
  },
  resultsTitle: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'var(--font-headline)',
    color: 'var(--on-surface)',
  },
  reviewsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: 'var(--font-headline)',
    color: 'var(--on-surface)',
    marginTop: '32px',
    marginBottom: '16px',
  },
  reviewList: {
    width: '100%',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '900px',
    marginTop: '80px',
  },
  featureCard: {
    padding: '32px',
    backgroundColor: 'var(--surface-container-low)',
    borderRadius: '12px',
    border: '1px solid rgba(60, 73, 71, 0.05)',
    transition: 'all 0.2s ease',
  },
  featureIcon: {
    fontSize: '32px',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '700',
    fontFamily: 'var(--font-headline)',
    color: 'var(--on-surface)',
    marginBottom: '8px',
  },
  featureText: {
    fontSize: '14px',
    color: 'var(--on-surface-variant)',
    lineHeight: '1.6',
  },
  footer: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    padding: '24px 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(60, 73, 71, 0.1)',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: '14px',
    fontFamily: 'var(--font-label)',
    color: 'var(--on-surface-variant)',
  },
  footerPowered: {
    fontSize: '12px',
    fontFamily: 'var(--font-label)',
    letterSpacing: '0.1em',
    color: '#ADB5CA',
    textTransform: 'uppercase',
  },
}