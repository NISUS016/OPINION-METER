import { useState, useCallback, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function SearchBar({ onSearch, isLoading = false }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${API_URL}/suggest?q=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
        setHighlightedIndex(-1)
      } catch (err) {
        setSuggestions([])
      }
    }

    const debounce = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(debounce)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0) {
        const selected = suggestions[highlightedIndex]
        onSearch(selected.product_id, selected.summary)
        setShowSuggestions(false)
        setQuery(selected.summary)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }, [showSuggestions, suggestions, highlightedIndex, onSearch])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(null, query.trim())
      setShowSuggestions(false)
    }
  }, [query, onSearch, isLoading])

  const handleSuggestionClick = (item) => {
    setQuery(item.summary)
    onSearch(item.product_id, item.summary)
    setShowSuggestions(false)
  }

  return (
    <div ref={containerRef} style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search a product to analyze reviews..."
            style={styles.input}
            disabled={isLoading}
            aria-label="Search keyword"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          />
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul style={styles.suggestionsList} role="listbox">
          {suggestions.map((item, index) => (
            <li
              key={item.product_id}
              style={{
                ...styles.suggestionItem,
                ...(index === highlightedIndex ? styles.suggestionItemActive : {})
              }}
              onClick={() => handleSuggestionClick(item)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              {item.summary}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '640px',
    position: 'relative',
    zIndex: 10,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    fontSize: '18px',
    pointerEvents: 'none',
    opacity: 0.6,
  },
  input: {
    width: '100%',
    height: '64px',
    padding: '0 140px 0 56px',
    fontSize: '16px',
    fontFamily: 'var(--font-body)',
    backgroundColor: '#131B2B',
    border: '1px solid #232E42',
    borderRadius: '9999px',
    color: 'var(--on-surface)',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  button: {
    position: 'absolute',
    right: '8px',
    top: '8px',
    bottom: '8px',
    padding: '0 32px',
    backgroundColor: 'var(--primary-container)',
    color: 'var(--on-primary-container)',
    fontFamily: 'var(--font-headline)',
    fontWeight: '700',
    fontSize: '14px',
    border: 'none',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--surface-container)',
    borderRadius: '12px',
    marginTop: '8px',
    padding: '8px 0',
    listStyle: 'none',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
    zIndex: 100,
    maxHeight: '320px',
    overflowY: 'auto',
  },
  suggestionItem: {
    padding: '14px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    color: 'var(--on-surface-variant)',
    transition: 'background-color 0.15s ease',
  },
  suggestionItemActive: {
    backgroundColor: 'var(--surface-container-high)',
    color: 'var(--on-surface)',
  },
}