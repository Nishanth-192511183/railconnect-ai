import { Navigate, useNavigate } from 'react-router-dom'
import { useJourney } from '../context/JourneyContext'
import SafetyScore from '../components/SafetyScore'
import TrainTimeline from '../components/TrainTimeline'
import ConnectionCard from '../components/ConnectionCard'
import Button from '../components/Button'

export default function JourneyDetails() {
 const { selectedRoute, search, journeyId } = useJourney()
  const navigate = useNavigate()

  if (!selectedRoute) return <Navigate to="/plan" replace />

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
          <div>
            <div className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>Your Journey</div>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>{search.from} → {search.to}</h2>
            <p className="text-muted" style={{ fontSize: 14 }}>20 September – 21 September</p>
          </div>
          <SafetyScore score={selectedRoute.reliability} size="lg" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }} className="jd-grid">
          <div className="card" style={{ padding: 24 }}>
            <TrainTimeline route={selectedRoute} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 14.5, marginBottom: 8 }}>Connection Safety</h4>
              {selectedRoute.connections.map((c, i) => <ConnectionCard key={i} connection={c} />)}
            </div>
            <Button
  block
  onClick={async () => {
    try {
      const response = await fetch(
        `https://railconnect-ai-production.up.railway.app/api/journey/${journeyId}/track`,
        {
          method: 'POST'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        return
      }

      navigate('/dashboard')
    } catch (error) {
      console.error('Tracking error:', error)
    }
  }}
>
  Track This Journey
</Button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .jd-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
