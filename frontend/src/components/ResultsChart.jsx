import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = {
  positive: '#10B981',
  neutral: '#64748B',
  negative: '#F43F5E',
}

export default function ResultsChart({ summary }) {
  const data = [
    { name: 'Positive', value: summary.positive, fill: COLORS.positive },
    { name: 'Neutral', value: summary.neutral, fill: COLORS.neutral },
    { name: 'Negative', value: summary.negative, fill: COLORS.negative },
  ].filter(d => d.value > 0)

  const getOverallSentiment = () => {
    const { positive, neutral, negative } = summary
    if (positive > neutral && positive > negative) return 'Positive'
    if (negative > neutral && negative > positive) return 'Negative'
    return 'Neutral'
  }

  const getSentimentColor = () => {
    const sentiment = getOverallSentiment().toLowerCase()
    return COLORS[sentiment]
  }

  return (
    <div style={styles.container}>
      <div style={styles.badge}>
        <span style={{ ...styles.badgeText, backgroundColor: getSentimentColor() }}>
          Overall: {getOverallSentiment()}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
            }}
          />
          <Legend 
            wrapperStyle={{
              fontFamily: 'var(--font-label)',
              color: 'var(--on-surface-variant)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={{ color: COLORS.positive }}>Positive: {summary.positive}</span>
        </div>
        <div style={styles.statItem}>
          <span style={{ color: COLORS.neutral }}>Neutral: {summary.neutral}</span>
        </div>
        <div style={styles.statItem}>
          <span style={{ color: COLORS.negative }}>Negative: {summary.negative}</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px',
    backgroundColor: 'var(--surface-container-low)',
    borderRadius: '12px',
    border: '1px solid rgba(60, 73, 71, 0.05)',
  },
  badge: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  badgeText: {
    padding: '10px 20px',
    borderRadius: '9999px',
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
    fontFamily: 'var(--font-label)',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginTop: '20px',
  },
  statItem: {
    fontSize: '14px',
    fontFamily: 'var(--font-label)',
    fontWeight: '500',
  },
}