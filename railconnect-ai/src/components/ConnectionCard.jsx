import RiskBadge from './RiskBadge'

export default function ConnectionCard({ connection }) {
  const riskScore =
    connection.riskScore ?? connection.risk?.score ?? 0

  const riskLevel =
    connection.risk?.level ?? connection.risk ?? 'LOW'

  const place =
    connection.at ?? connection.station ?? 'Connection'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0'
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>
          {place}
        </div>

        <div
          className="text-muted"
          style={{ fontSize: 13 }}
        >
          Buffer {connection.buffer} min
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--navy-900)'
          }}
        >
          {riskScore}/100
        </div>

        <RiskBadge
          level={String(riskLevel).toLowerCase()}
        />
      </div>
    </div>
  )
}