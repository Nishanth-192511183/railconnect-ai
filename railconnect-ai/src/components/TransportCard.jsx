import { Car, Clock, IndianRupee } from 'lucide-react'

export default function TransportCard({ from, to, cost, duration }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Car size={16} color="var(--navy-800)" />
        <span style={{ fontWeight: 700, fontSize: 14.5 }}>{from} → {to}</span>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13.5 }}>
          <IndianRupee size={13} /> Estimated ₹{cost}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13.5 }}>
          <Clock size={13} /> {duration}
        </div>
      </div>
    </div>
  )
}
