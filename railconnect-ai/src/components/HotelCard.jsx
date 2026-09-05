import { Hotel, Star } from 'lucide-react'
import Button from './Button'

export default function HotelCard({ hotel }) {
  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Hotel size={16} color="var(--navy-800)" />
        <span className="badge badge-neutral">{hotel.type}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{hotel.name}</div>
      <div className="text-muted" style={{ fontSize: 13 }}>{hotel.distance}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div>
          <div style={{ fontWeight: 700 }}>₹{hotel.price} / night</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}>
            <Star size={12} fill="currentColor" /> {hotel.rating}
          </div>
        </div>
        <Button size="sm" variant="secondary">View Stay</Button>
      </div>
    </div>
  )
}
