import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = {
  positive: '#22c55e',
  neutral: '#eab308',
  negative: '#ef4444',
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
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
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
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  badge: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  badgeText: {
    padding: '8px 16px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '20px',
  },
  statItem: {
    fontSize: '16px',
    fontWeight: '500',
  },
}
