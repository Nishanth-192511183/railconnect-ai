import { AlertTriangle } from 'lucide-react'

export default function DelayAlert({ trainLabel, delayBy, expectedArrival, nextDeparture, status }) {
  return (
    <div className="card" style={{ padding: 20, borderLeft: '3px solid var(--danger)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <AlertTriangle size={17} color="var(--danger)" />
        <h4 style={{ fontSize: 15, color: 'var(--danger)' }}>Connection Risk Detected</h4>
      </div>
      <p style={{ fontSize: 14.5, marginBottom: 14 }}>
        {trainLabel} is currently running <strong>{delayBy}</strong> behind schedule.
      </p>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div>
          <div className="text-muted" style={{ fontSize: 12 }}>Expected Arrival</div>
          <div style={{ fontWeight: 700 }}>{expectedArrival}</div>
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: 12 }}>Next Train Departure</div>
          <div style={{ fontWeight: 700 }}>{nextDeparture}</div>
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: 12 }}>Connection Status</div>
          <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{status}</div>
        </div>
      </div>
    </div>
  )
}
