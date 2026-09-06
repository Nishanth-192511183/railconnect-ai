import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import RecoveryPlan from '../components/RecoveryPlan'
import CostBreakdown from '../components/CostBreakdown'

const API = 'https://railconnect-ai-production.up.railway.app/api'

export default function Recovery() {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    journeyId,
    selectedRoute,
    acceptRecovery
  } = useJourney()

  const [journey, setJourney] = useState(null)
  const [recovery, setRecovery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const delayData = location.state?.recoveryData

  useEffect(() => {
    async function loadRecovery() {
      try {
        setLoading(true)
        setError('')

        if (!journeyId) {
          setError('No active journey found.')
          return
        }

        const journeyResponse = await fetch(
          `${API}/journey/${journeyId}`
        )

        const journeyData = await journeyResponse.json()

        if (!journeyResponse.ok) {
          throw new Error(
            journeyData.message || 'Unable to load journey'
          )
        }

        setJourney(journeyData)

        const currentStation =
          journeyData.currentTrain?.destination ||
          journeyData.source ||
          'Hyderabad'

        const destination =
          journeyData.destination ||
          selectedRoute?.destination ||
          'Delhi'

        const currentTime =
          journeyData.currentTrain?.arrivalTime ||
          journeyData.currentTrain?.arrival_time ||
          new Date().toISOString()

        const recoveryResponse = await fetch(
          `${API}/recovery/generate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              journeyId,
              currentStation,
              destination,
              currentTime,
              budget: 5000
            })
          }
        )

        const recoveryData = await recoveryResponse.json()

        console.log('Recovery response:', recoveryData)

        if (!recoveryResponse.ok) {
          throw new Error(
            recoveryData.message || 'Recovery generation failed'
          )
        }

        setRecovery(recoveryData)
      } catch (err) {
        console.error('Recovery error:', err)
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    loadRecovery()
  }, [journeyId, selectedRoute])

  if (!journeyId && !selectedRoute) {
    return <Navigate to="/plan" replace />
  }

  const handleAcceptRecovery = () => {
    if (!recovery || recovery.status !== 'recovered') {
      return
    }

    if (typeof acceptRecovery === 'function') {
      acceptRecovery(recovery)
    }

    navigate('/hospitality')
  }

  if (loading) {
    return (
      <div
        className="page"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Loader2
            size={36}
            style={{
              animation: 'spin 1s linear infinite',
              marginBottom: 12
            }}
          />

          <h3>Generating Recovery Plan...</h3>

          <p className="text-muted" style={{ marginTop: 8 }}>
            RailConnect AI is finding the safest alternative journey.
          </p>
        </div>

        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div
          className="container"
          style={{ maxWidth: 900, paddingTop: 50 }}
        >
          <div
            className="card"
            style={{
              padding: 28,
              borderLeft: '4px solid #c62828'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12
              }}
            >
              <AlertTriangle size={24} />
              <h2 style={{ margin: 0 }}>
                Recovery Error
              </h2>
            </div>

            <p className="text-muted">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20,
                padding: '12px 20px',
                border: 'none',
                borderRadius: 8,
                background: '#102a43',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isRecovered =
    recovery?.status === 'recovered'

  const delayMinutes =
    delayData?.delay ||
    journey?.delay ||
    300

  return (
    <div className="page">
      <div
        className="container"
        style={{
          maxWidth: 900,
          paddingTop: 40,
          paddingBottom: 50
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 10
            }}
          >
            <AlertTriangle
              size={30}
              style={{ color: '#c62828' }}
            />

            <h1
              style={{
                margin: 0,
                fontSize: 32
              }}
            >
              Connection Missed
            </h1>
          </div>

          <p
            className="text-muted"
            style={{
              fontSize: 17,
              marginLeft: 42
            }}
          >
            RailConnect AI detected the missed connection
            and rebuilt the remaining journey.
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            marginBottom: 24,
            borderLeft: '4px solid #c62828'
          }}
        >
          <div
            className="text-muted"
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 10
            }}
          >
            DELAY EVENT
          </div>

          <h3
            style={{
              fontSize: 20,
              marginBottom: 10
            }}
          >
            Train connection missed
          </h3>

          <p
            className="text-muted"
            style={{
              fontSize: 16,
              marginBottom: 12
            }}
          >
            Your next train connection could not be
            reached due to the delay.
          </p>

          <span
            style={{
              display: 'inline-block',
              padding: '5px 12px',
              borderRadius: 20,
              background: '#fde8e8',
              color: '#c62828',
              fontWeight: 700,
              fontSize: 13
            }}
          >
            MISSED
          </span>

          <div
            style={{
              marginTop: 18,
              fontSize: 14,
              color: '#555'
            }}
          >
            Delay detected: <strong>{delayMinutes} minutes</strong>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 22,
            marginBottom: 24,
            borderLeft: '4px solid #16834b'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <CheckCircle
              size={24}
              style={{ color: '#16834b' }}
            />

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 19
                }}
              >
                AI Recovery Recommendation
              </h3>

              <p
                className="text-muted"
                style={{
                  marginTop: 5,
                  fontSize: 14
                }}
              >
                RailConnect AI has generated a safer
                alternative for the remaining journey.
              </p>
            </div>
          </div>
        </div>

        {isRecovered ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <RecoveryPlan
                timeline={recovery.newJourney}
                safetyScore={recovery.safetyScore}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <CostBreakdown
                costs={recovery.additionalCost}
              />
            </div>

            <div
              className="card"
              style={{
                padding: 22,
                marginBottom: 24
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  marginBottom: 10
                }}
              >
                Why this recovery?
              </h3>

              <p
                className="text-muted"
                style={{
                  fontSize: 15,
                  lineHeight: 1.6
                }}
              >
                {recovery.reason ||
                  'This alternative was selected based on safety, travel time and cost.'}
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18
                  }}
                >
                  Recovery Plan Ready
                </h3>

                <p
                  className="text-muted"
                  style={{
                    marginTop: 6
                  }}
                >
                  Your remaining journey has been rebuilt.
                </p>
              </div>

              <button
                onClick={handleAcceptRecovery}
                style={{
                  padding: '15px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: '#102a43',
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Accept Recovery & Continue
              </button>
            </div>
          </>
        ) : (
          <div
            className="card"
            style={{
              padding: 24,
              borderLeft: '4px solid #c62828'
            }}
          >
            <h3>
              No Alternative Found
            </h3>

            <p
              className="text-muted"
              style={{ marginTop: 8 }}
            >
              {recovery?.message ||
                'No suitable alternative journey was found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}