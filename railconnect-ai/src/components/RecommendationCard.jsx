import { ShieldCheck } from 'lucide-react'
import Button from './Button'

export default function RecommendationCard({ summary, detail, onSelect }) {
  return (
    <div className="card" style={{ padding: 20, borderLeft: '3px solid var(--navy-800)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <ShieldCheck size={17} color="var(--navy-800)" />
        <h4 style={{ fontSize: 15 }}>RailConnect Recommendation</h4>
      </div>
      <p style={{ fontSize: 14.5, marginBottom: 6 }}>{summary}</p>
      <p className="text-muted" style={{ fontSize: 13.5, marginBottom: 16 }}>{detail}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="badge badge-low">RECOMMENDED</span>
        {onSelect && <Button size="sm" onClick={onSelect}>Select This Journey</Button>}
      </div>
    </div>
  )
}
