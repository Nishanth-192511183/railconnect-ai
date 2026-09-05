import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Bell, Route as RouteIcon } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import Button from '../components/Button'
import API from '../api'

export default function Landing() {
  const navigate = useNavigate()
  const { search, setSearch } = useJourney()

  const handlePlan = async (e) => {
  e.preventDefault()

  try {
    const response = await fetch(`${API}/journey/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: search.from,
        destination: search.to,
        date: search.date
      })
    })

    const data = await response.json()

    console.log('Backend response:', data)

    if (!response.ok) {
      console.error(data)
      return
    }

    navigate('/results', {
      state: {
        journeyData: data
      }
    })
  } catch (error) {
    console.error('Backend connection error:', error)
  }
}

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 40, lineHeight: 1.15, marginBottom: 14 }}>
          Plan the journey.<br />We protect the connections.
        </h1>
        <p className="text-muted" style={{ fontSize: 16.5, maxWidth: 560, marginBottom: 36 }}>
          RailConnect AI plans multi-train journeys, evaluates connection risk and helps you
          recover when delays disrupt your travel.
        </p>

        <form onSubmit={handlePlan} className="card" style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 18 }} className="search-grid">
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>From</label>
              <input
                value={search.from}
                onChange={e => setSearch(s => ({ ...s, from: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>To</label>
              <input
                value={search.to}
                onChange={e => setSearch(s => ({ ...s, to: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 6 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Travel Date</label>
              <input
                type="date"
                value={search.date}
                onChange={e => setSearch(s => ({ ...s, date: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)', borderRadius: 6 }}
              />
            </div>
          </div>
          <Button type="submit" block>Plan Journey</Button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 56 }} className="value-grid">
          {[
            { icon: ShieldCheck, title: 'Connection Intelligence', text: 'Know which transfers are safe before travelling.' },
            { icon: Bell, title: 'Journey Protection', text: 'Get notified when delays threaten your connection.' },
            { icon: RouteIcon, title: 'Smart Recovery', text: 'Receive an alternative journey when a connection is missed.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon size={20} color="var(--navy-800)" style={{ marginBottom: 10 }} />
              <h4 style={{ fontSize: 15.5, marginBottom: 6 }}>{title}</h4>
              <p className="text-muted" style={{ fontSize: 14 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .search-grid { grid-template-columns: 1fr !important; }
          .value-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
