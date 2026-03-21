import { useState, useCallback } from 'react'

export default function SearchBar({ onSearch, isLoading = false }) {
  const [query, setQuery] = useState('')

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query.trim())
    }
  }, [query, onSearch, isLoading])

  return (
    <form onSubmit={handleSubmit} style={styles.form} role="search" aria-label="Product search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a product (e.g., chocolate, coffee, snacks)"
        style={styles.input}
        disabled={isLoading}
        aria-label="Search keyword"
        aria-describedby="search-hint"
      />
      <button
        type="submit"
        style={{
          ...styles.button,
          ...(isLoading ? styles.buttonDisabled : {})
        }}
        disabled={isLoading || !query.trim()}
        aria-busy={isLoading}
      >
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
      <span id="search-hint" style={{ display: 'none' }}>
        Enter a product name to search for reviews
      </span>
    </form>
  )
}

const styles = {
  form: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    maxWidth: '600px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
}
