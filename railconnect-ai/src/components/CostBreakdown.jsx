export default function CostBreakdown({ costs }) {
  if (!costs) return null

  const train = Number(costs.train || 0)
  const hotel = Number(costs.hotel || 0)
  const food = Number(costs.food || 0)
  const transport = Number(costs.transport || 0)

  const total =
    costs.total !== undefined
      ? Number(costs.total)
      : train + hotel + food + transport

  const rows = [
    ['Alternative Train', train],
    ['Hotel', hotel],
    ['Food', food],
    ['Transport', transport],
  ]

  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: 18, marginBottom: 18 }}>
        Additional Cost
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(([name, amount]) => (
          <div
            key={name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 15,
            }}
          >
            <span className="text-muted">{name}</span>
            <span style={{ fontWeight: 600 }}>₹{amount}</span>
          </div>
        ))}

        <div
          style={{
            borderTop: '1px solid var(--border)',
            marginTop: 8,
            paddingTop: 14,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <span>Total Additional Cost</span>
          <span>₹{total}</span>
        </div>
      </div>
    </div>
  )
}