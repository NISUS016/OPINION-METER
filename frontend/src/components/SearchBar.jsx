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
      <form onSubmit={handleSubmit} style={styles.form} role="search" aria-label="Product search">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a product (e.g., chocolate, coffee, snacks)"
          style={styles.input}
          disabled={isLoading}
          aria-label="Search keyword"
          aria-describedby="search-hint"
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
          aria-busy={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
        <span id="search-hint" style={{ display: 'none' }}>
          Enter a product name to search for reviews
        </span>
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
    maxWidth: '600px',
    position: 'relative',
  },
  form: {
    display: 'flex',
    gap: '10px',
    width: '100%',
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
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    marginTop: '4px',
    padding: 0,
    listStyle: 'none',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 100,
    maxHeight: '300px',
    overflowY: 'auto',
  },
  suggestionItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  },
  suggestionItemActive: {
    backgroundColor: '#f3f4f6',
  },
}
