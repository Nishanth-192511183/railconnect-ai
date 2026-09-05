import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,30,54,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
