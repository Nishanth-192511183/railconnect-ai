import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useJourney } from '../context/JourneyContext'
import SafetyScore from '../components/SafetyScore'
import DelayAlert from '../components/DelayAlert'
import RiskBadge from '../components/RiskBadge'
import Button from '../components/Button'
import AIInsight from '../components/AIInsight'

const API = 'http://localhost:5000/api'

function formatTime(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default function LiveDashboard() {
  const { journeyId, selectedRoute } = useJourney()
  const navigate = useNavigate()

  const [journey, setJourney] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [delayLoading, setDelayLoading] = useState(false)
  const [delayMinutes, setDelayMinutes] = useState(120)

  useEffect(() => {
    if (!journeyId) return

    async function loadJourney() {
      try {
        const response = await fetch(`${API}/journey/${journeyId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.message || 'Failed to load journey')
          return
        }

        setJourney(data)
      } catch (err) {
        setError('Could not connect to backend')
      } finally {
        setLoading(false)
      }
    }

    loadJourney()
  }, [journeyId])

  if (!journeyId || !selectedRoute) {
    return <Navigate to="/plan" replace />
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: 30 }}>
            Loading journey...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: 30 }}>
            <h3>Unable to load journey</h3>
            <p className="text-muted">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const currentTrain = journey.currentTrain
  const nextTrain = journey.nextTrain

  const isDelayed = journey.status === 'delayed'

  const statusText =
    journey.status === 'active'
      ? 'ON TRACK'
      : journey.status === 'delayed'
      ? 'DELAY DETECTED'
      : journey.status === 'missed'
      ? 'CONNECTION MISSED'
      : String(journey.status || '').toUpperCase()

  const statusColor =
    journey.status === 'active'
      ? 'var(--success)'
      : journey.status === 'delayed'
      ? 'var(--warning)'
      : 'var(--danger)'

  const simulateDelay = async () => {
    const delay = Number(delayMinutes)

    if (!delay || delay <= 0) {
      alert('Please enter a valid delay in minutes')
      return
    }

    try {
      setDelayLoading(true)

      const response = await fetch(
        `${API}/journey/${journeyId}/simulate-delay`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            delayMinutes: delay
          })
        }
      )

      const data = await response.json()

      console.log('Delay response:', data)

      if (!response.ok) {
        console.error('Delay error:', data)
        alert(data.message || 'Could not simulate delay')
        return
      }

      if (data.status === 'connection_missed') {
        navigate('/recovery', {
          state: {
            recoveryData: data
          }
        })
        return
      }

      const updatedResponse = await fetch(`${API}/journey/${journeyId}`)
      const updatedData = await updatedResponse.json()

      if (updatedResponse.ok) {
        setJourney(updatedData)
      }
    } catch (error) {
      console.error('Delay simulation error:', error)
      alert('Could not simulate delay')
    } finally {
      setDelayLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>

        <div
          className="card"
          style={{ padding: 24, marginBottom: 24 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 20
            }}
          >
            <div>
              <div
                className="text-muted"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 6
                }}
              >
                LIVE JOURNEY
              </div>

              <h2 style={{ fontSize: 22, marginBottom: 10 }}>
                {journey.source} → {journey.destination}
              </h2>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: statusColor
                  }}
                />

                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: statusColor
                  }}
                >
                  {statusText}
                </span>
              </div>
            </div>

            <SafetyScore
              score={journey.overallSafetyScore}
              label="Overall Reliability"
            />
          </div>
        </div>

        {isDelayed && currentTrain && (
          <div style={{ marginBottom: 24 }}>
            <DelayAlert
              trainLabel={currentTrain.train_id || 'Current Train'}
              delayBy={`${delayMinutes} minutes`}
              expectedArrival={formatTime(currentTrain.arrival_time)}
              nextDeparture={
                nextTrain
                  ? formatTime(nextTrain.departure_time)
                  : '-'
              }
              status={nextTrain ? 'AT RISK' : 'DELAYED'}
            />
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: 24
          }}
          className="dash-grid"
        >

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}
          >

            <div className="card" style={{ padding: 20 }}>
              <div
                className="text-muted"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 12
                }}
              >
                CURRENT TRAIN
              </div>

              {currentTrain ? (
                <>
                  <h4 style={{ fontSize: 16, marginBottom: 4 }}>
                    Train #{currentTrain.train_id}
                  </h4>

                  <p
                    className="text-muted"
                    style={{
                      fontSize: 14,
                      marginBottom: 14
                    }}
                  >
                    {currentTrain.source} → {currentTrain.destination}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      gap: 28,
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <div
                        className="text-muted"
                        style={{ fontSize: 12 }}
                      >
                        Scheduled Arrival
                      </div>

                      <div style={{ fontWeight: 700 }}>
                        {formatTime(currentTrain.arrival_time)}
                      </div>
                    </div>

                    <div>
                      <div
                        className="text-muted"
                        style={{ fontSize: 12 }}
                      >
                        Current Status
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          color: statusColor
                        }}
                      >
                        {statusText}
                      </div>
                    </div>

                    {journey.connectionBuffer !== null &&
                      journey.connectionBuffer !== undefined && (
                        <div>
                          <div
                            className="text-muted"
                            style={{ fontSize: 12 }}
                          >
                            Connection Buffer
                          </div>

                          <div style={{ fontWeight: 700 }}>
                            {journey.connectionBuffer} min
                          </div>
                        </div>
                      )}
                  </div>
                </>
              ) : (
                <p className="text-muted">
                  No active train information.
                </p>
              )}
            </div>

            {nextTrain && (
              <div className="card" style={{ padding: 20 }}>
                <div
                  className="text-muted"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 12
                  }}
                >
                  UPCOMING TRAIN
                </div>

                <h4 style={{ fontSize: 16, marginBottom: 4 }}>
                  Train #{nextTrain.train_id}
                </h4>

                <p
                  className="text-muted"
                  style={{ fontSize: 14 }}
                >
                  {nextTrain.source} → {nextTrain.destination}
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: 28,
                    alignItems: 'center',
                    marginTop: 12,
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div
                      className="text-muted"
                      style={{ fontSize: 12 }}
                    >
                      Departure
                    </div>

                    <div style={{ fontWeight: 700 }}>
                      {formatTime(nextTrain.departure_time)}
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-muted"
                      style={{ fontSize: 12 }}
                    >
                      Available Buffer
                    </div>

                    <div style={{ fontWeight: 700 }}>
                      {journey.connectionBuffer} min
                    </div>
                  </div>

                  {journey.risk && (
                    <div>
                      <div
                        className="text-muted"
                        style={{ fontSize: 12 }}
                      >
                        Connection Safety
                      </div>

                      <RiskBadge
                        level={String(journey.risk.level).toLowerCase()}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!nextTrain && (
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 16, marginBottom: 6 }}>
                  Direct Journey
                </h4>

                <p
                  className="text-muted"
                  style={{ fontSize: 14 }}
                >
                  This journey has no connecting train.
                </p>
              </div>
            )}

            <div
              className="card"
              style={{
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Clock size={16} color="var(--text-muted)" />

                <div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700
                    }}
                  >
                    Simulate Train Delay
                  </div>

                  <div
                    className="text-muted"
                    style={{ fontSize: 12.5 }}
                  >
                    Enter any delay to test the recovery system
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap'
                }}
              >
                <input
                  type="number"
                  min="1"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(e.target.value)}
                  disabled={delayLoading || journey.status !== 'active'}
                  placeholder="Minutes"
                  style={{
                    width: 100,
                    padding: '9px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />

                <span
                  className="text-muted"
                  style={{ fontSize: 13 }}
                >
                  minutes
                </span>

                <Button
                  variant="danger"
                  onClick={simulateDelay}
                  disabled={
                    delayLoading ||
                    journey.status !== 'active'
                  }
                >
                  {delayLoading
                    ? 'Simulating...'
                    : 'Simulate Delay'}
                </Button>
              </div>
            </div>

          </div>

          <AIInsight />

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}