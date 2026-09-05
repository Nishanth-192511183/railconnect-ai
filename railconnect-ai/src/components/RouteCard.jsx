import { ArrowRight, ChevronRight } from 'lucide-react'
import RiskBadge from './RiskBadge'
import Button from './Button'

export default function RouteCard({ route, onSelect }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      {route.tag && (
        <div style={{
          display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
          color: route.tag === 'RECOMMENDED' ? 'var(--success)' : 'var(--navy-accent)',
          background: route.tag === 'RECOMMENDED' ? 'var(--success-bg)' : '#EEF2F7',
          padding: '3px 10px', borderRadius: 5, marginBottom: 14,
        }}>
          {route.tag}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {route.legs.map((leg, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
              <div style={{ minWidth: 52, fontWeight: 700 }}>{leg.depart}</div>
              <div style={{ fontWeight: 600 }}>{leg.from}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0 2px 26px', color: 'var(--text-muted)', fontSize: 13 }}>
              <span style={{ display: 'inline-block', width: 1, height: 16, background: 'var(--border-strong)', marginLeft: 4 }} />
              <span>{leg.train}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
              <div style={{ minWidth: 52, fontWeight: 700 }}>{leg.arrive}</div>
              <div style={{ fontWeight: 600 }}>{leg.to}</div>
            </div>
            {i < route.connections.length && (
              <div style={{
                margin: '8px 0 8px 62px', padding: '8px 12px', background: '#F7F8FA',
                border: '1px solid var(--border)', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 320,
              }}>
                <div style={{ fontSize: 12.5 }}>
                  <span className="text-muted">Connection · </span>
                  <span style={{ fontWeight: 600 }}>{route.connections[i].buffer}</span>
                </div>
                <RiskBadge level={route.connections[i].risk} compact />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 28 }}>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Journey Reliability</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{route.reliability} / 100</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Total Duration</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{route.totalDuration}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Estimated Cost</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>₹{route.cost.toLocaleString('en-IN')}</div>
          </div>
        </div>
       <Button onClick={() => onSelect(route)} icon={ChevronRight}>View Journey</Button>
      </div>
    </div>
  )
}
