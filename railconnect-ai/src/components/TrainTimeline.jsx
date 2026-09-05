import { Train } from 'lucide-react'

export default function TrainTimeline({ route }) {
  const items = []

  route.legs.forEach((leg, i) => {
    const depart = leg.depart || leg.departureTime
    const from = leg.from || leg.source
    const arrive = leg.arrive || leg.arrivalTime
    const to = leg.to || leg.destination
    const train = leg.train || leg.trainNumber

    items.push({
      type: 'station',
      time: depart,
      name: from
    })

    items.push({
      type: 'train',
      label: train,
      from,
      to
    })

    items.push({
      type: 'station',
      time: arrive,
      name: to
    })

    if (route.connections && route.connections[i]) {
      const connection = route.connections[i]

      const buffer = connection.buffer
      const risk = connection.risk

      items.push({
        type: 'buffer',
        label: `Connection buffer · ${buffer}`,
        risk: risk
      })
    }
  })

  return (
    <div style={{ position: 'relative', paddingLeft: 28 }}>
      <div
        style={{
          position: 'absolute',
          left: 7,
          top: 8,
          bottom: 8,
          width: 2,
          background: 'var(--border)'
        }}
      />

      {items.map((item, i) => {
        if (item.type === 'station') {
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                padding: '10px 0'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: -28,
                  top: 15,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--navy-800)',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px var(--border-strong)'
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {item.time}
                </div>

                <div style={{ fontWeight: 600 }}>
                  {item.name}
                </div>
              </div>
            </div>
          )
        }

        if (item.type === 'train') {
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                padding: '2px 0 2px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--text-muted)',
                fontSize: 13.5
              }}
            >
              <Train size={14} />
              <span>{item.label}</span>
            </div>
          )
        }

        const riskLevel =
          typeof item.risk === 'object'
            ? item.risk?.level
            : item.risk

        return (
          <div
            key={i}
            style={{
              margin: '6px 0',
              marginLeft: 4,
              padding: '8px 12px',
              background: '#F7F8FA',
              border: '1px solid var(--border)',
              borderRadius: 6,
              display: 'inline-block',
              fontSize: 12.5,
              color:
                riskLevel === 'HIGH' || riskLevel === 'high'
                  ? 'var(--danger)'
                  : riskLevel === 'MEDIUM' || riskLevel === 'medium'
                  ? 'var(--warning)'
                  : 'var(--success)',
              fontWeight: 600
            }}
          >
            {item.label}
          </div>
        )
      })}
    </div>
  )
}