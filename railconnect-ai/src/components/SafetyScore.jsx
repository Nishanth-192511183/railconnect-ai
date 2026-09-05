export default function SafetyScore({ score, label = 'Journey Reliability', size = 'md' }) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)'
  const big = size === 'lg'
  return (
    <div>
      <div className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: big ? 40 : 26, color: 'var(--navy-900)', lineHeight: 1 }}>
        {score}<span style={{ fontSize: big ? 18 : 14, color: 'var(--text-muted)', fontWeight: 600 }}> / 100</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: '#EAEDF1', marginTop: 8, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}
