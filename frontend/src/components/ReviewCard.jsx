const COLORS = {
  positive: { bg: '#dcfce7', text: '#166534' },
  neutral: { bg: '#fef9c3', text: '#854d0e' },
  negative: { bg: '#fee2e2', text: '#991b1b' },
}

export default function ReviewCard({ review }) {
  const colorScheme = COLORS[review.label] || COLORS.neutral

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: colorScheme.bg,
            color: colorScheme.text,
          }}
        >
          {review.label.charAt(0).toUpperCase() + review.label.slice(1)}
        </span>
        <span style={styles.confidence}>
          {Math.round(review.confidence * 100)}% confidence
        </span>
      </div>
      <p style={styles.text}>{review.text}</p>
    </div>
  )
}

const styles = {
  card: {
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    marginBottom: '12px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  confidence: {
    fontSize: '12px',
    color: '#6b7280',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#374151',
  },
}
