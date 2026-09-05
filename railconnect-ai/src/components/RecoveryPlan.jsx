import { Train } from 'lucide-react'

export default function RecoveryPlan({ timeline, safetyScore }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: 18, marginBottom: 10 }}>
          AI Recovery Plan
        </h3>
        <p className="text-muted">
          An alternative journey has been prepared for you.
        </p>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: 18, marginBottom: 20 }}>
        AI Recovery Plan
      </h3>

      {timeline.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: 16,
            paddingBottom: 18,
            marginBottom: 18,
            borderBottom:
              index !== timeline.length - 1
                ? '1px solid var(--border)'
                : 'none'
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface)',
              flexShrink: 0
            }}
          >
            <Train size={19} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {item.trainName || 'Alternative Train'}
            </div>

            <div
              className="text-muted"
              style={{ fontSize: 13, marginTop: 3 }}
            >
              {item.trainNumber || ''}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginTop: 14
              }}
            >
              <div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  From
                </div>
                <strong>{item.source || item.from || '-'}</strong>
              </div>

              <div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  To
                </div>
                <strong>{item.destination || item.to || '-'}</strong>
              </div>

              <div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Departure
                </div>
                <strong>
                  {item.departureTime || item.departure || '-'}
                </strong>
              </div>

              <div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Arrival
                </div>
                <strong>
                  {item.arrivalTime || item.arrival || '-'}
                </strong>
              </div>
            </div>

            {index === 0 && safetyScore !== undefined && (
              <div style={{ marginTop: 14 }}>
                <strong>Safety Score: {safetyScore}/100</strong>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}