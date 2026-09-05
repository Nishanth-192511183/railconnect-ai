import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShieldCheck } from 'lucide-react'

const LINKS = [
  { to: '/plan', label: 'Plan Journey' },
  { to: '/dashboard', label: 'My Journey' },
  { to: '/recovery', label: 'Recovery' },
  { to: '/hospitality', label: 'Hospitality' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--navy-900)' }}>
          <ShieldCheck size={20} color="var(--navy-800)" />
          RailConnect AI
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-desktop">
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{
              fontSize: 14.5, fontWeight: 600,
              color: location.pathname === l.to ? 'var(--navy-900)' : 'var(--text-muted)',
            }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="nav-desktop" style={{
            width: 34, height: 34, borderRadius: '50%', background: '#EEF2F7',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--navy-800)',
          }}>N7</div>
          <button className="nav-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu" style={{ display: 'none' }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-mobile" style={{ borderTop: '1px solid var(--border)', padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {LINKS.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} style={{ padding: '10px 4px', fontWeight: 600 }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .nav-desktop { display: none !important; }
          .nav-toggle { display: flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </header>
  )
}
