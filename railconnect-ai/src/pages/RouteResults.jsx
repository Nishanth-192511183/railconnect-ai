import { useLocation, useNavigate } from 'react-router-dom'
import { useJourney } from '../context/JourneyContext'
import RouteCard from '../components/RouteCard'
import RecommendationCard from '../components/RecommendationCard'

export default function RouteResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const { search, selectRoute } = useJourney()

  const journeyData = location.state?.journeyData

  const routes = journeyData?.routes || []
  const recommendation = journeyData?.recommendation || null

  const handleSelect = async (route) => {
  const success = await selectRoute(route)

  if (success) {
    navigate('/journey')
  }
}
  return (
    <div className="page">
      <div className="container">

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, marginBottom: 6 }}>
            {search.from} → {search.to}
          </h2>

          <p className="text-muted" style={{ fontSize: 14.5 }}>
            {new Date(search.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })} · {routes.length} journeys found
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 260px',
            gap: 28
          }}
          className="results-grid"
        >

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            {routes.length > 0 ? (
              routes.map(r => (
                <RouteCard
                  key={r.id}
                  route={r}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <div className="card" style={{ padding: 24 }}>
                <h3>No routes found</h3>
                <p className="text-muted">
                  No suitable journeys were found for this search.
                </p>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>

            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 14.5, marginBottom: 14 }}>
                Filters
              </h4>

              {[
                'Departure',
                'Arrival',
                'Duration',
                'Risk Level',
                'Number of Transfers',
                'Estimated Cost'
              ].map(f => (
                <div
                  key={f}
                  style={{
                    fontSize: 13.5,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  {f}
                </div>
              ))}
            </div>

            {recommendation && (
              <RecommendationCard
                summary={recommendation.summary}
                detail={recommendation.detail}
                onSelect={() => handleSelect(recommendation.routeId)}
              />
            )}

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .results-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}