import { Utensils } from 'lucide-react'
import Button from './Button'

export default function FoodCard({ restaurant }) {
  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Utensils size={16} color="var(--navy-800)" />
        {restaurant.open && <span className="badge badge-low">OPEN NOW</span>}
      </div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{restaurant.name}</div>
      <div className="text-muted" style={{ fontSize: 13 }}>{restaurant.distance}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontWeight: 700 }}>{restaurant.priceRange}</div>
        <Button size="sm" variant="secondary">View Restaurant</Button>
      </div>
    </div>
  )
}
