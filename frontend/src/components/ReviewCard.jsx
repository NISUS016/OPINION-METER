export default function ReviewCard({ review }) {
  const getSentimentStyle = (label) => {
    switch (label) {
      case 'positive':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--positive)',
        }
      case 'negative':
        return {
          bg: 'rgba(244, 63, 94, 0.1)',
          color: 'var(--negative)',
        }
      default:
        return {
          bg: 'rgba(100, 116, 139, 0.1)',
          color: 'var(--neutral)',
        }
    }
  }

  const sentimentStyle = getSentimentStyle(review.label)

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: sentimentStyle.bg,
            color: sentimentStyle.color,
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
    padding: '20px',
    backgroundColor: 'var(--surface-container-low)',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid rgba(60, 73, 71, 0.05)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontFamily: 'var(--font-label)',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  confidence: {
    fontSize: '12px',
    fontFamily: 'var(--font-label)',
    color: 'var(--on-surface-variant)',
  },
  text: {
    margin: 0,
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    lineHeight: '1.6',
    color: 'var(--on-surface-variant)',
  },
}