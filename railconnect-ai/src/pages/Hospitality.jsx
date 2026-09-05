import { Navigate } from 'react-router-dom'
import { useJourney } from '../context/JourneyContext'
import { hotels } from '../data/hotels'
import { restaurants } from '../data/restaurants'
import HotelCard from '../components/HotelCard'
import FoodCard from '../components/FoodCard'
import TransportCard from '../components/TransportCard'

export default function Hospitality() {
  const { selectedRoute, recoveryPlan } = useJourney()

  if (!selectedRoute) {
    return <Navigate to="/plan" replace />
  }

  const waitingHours =
    recoveryPlan?.waitingHours ||
    (recoveryPlan?.waitingTime
      ? `${Math.floor(recoveryPlan.waitingTime / 60)}h ${recoveryPlan.waitingTime % 60}m`
      : 'a few hours')

  const waitingLocation =
    recoveryPlan?.waitingLocation ||
    recoveryPlan?.alternativeTrain?.departureStation ||
    'the station'

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 26, marginBottom: 10 }}>
            Hospitality Support
          </h2>

          <p style={{ fontSize: 16 }}>
            You have <strong>{waitingHours}</strong> before your next train at{' '}
            <strong>{waitingLocation}</strong>.
          </p>

          <p
            className="text-muted"
            style={{ fontSize: 14, marginTop: 6 }}
          >
            RailConnect AI recommends the following options during your
            waiting period.
          </p>
        </div>

        <h4 style={{ fontSize: 14.5, marginBottom: 12 }}>
          Places to stay
        </h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 28
          }}
          className="hosp-grid"
        >
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.name}
              hotel={hotel}
            />
          ))}
        </div>

        <h4 style={{ fontSize: 14.5, marginBottom: 12 }}>
          Food nearby
        </h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 28
          }}
          className="hosp-grid"
        >
          {restaurants.map((restaurant) => (
            <FoodCard
              key={restaurant.name}
              restaurant={restaurant}
            />
          ))}
        </div>

        <h4 style={{ fontSize: 14.5, marginBottom: 12 }}>
          Getting around
        </h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            marginBottom: 28
          }}
          className="hosp-grid-2"
        >
          <TransportCard
            from="Station"
            to="Hotel"
            cost={100}
            duration="12 min"
          />

          <div
            className="card"
            style={{
              padding: 16
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 6
              }}
            >
              Nearby Visit
            </div>

            <p
              className="text-muted"
              style={{
                fontSize: 13.5,
                marginBottom: 10
              }}
            >
              You have enough waiting time for a short city visit.
            </p>

            <strong>
              Estimated visit time: 1h 20m
            </strong>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 20,
            marginTop: 8,
            marginBottom: 30
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 6
            }}
          >
            Journey Support
          </div>

          <p
            className="text-muted"
            style={{
              fontSize: 14
            }}
          >
            These recommendations are based on your available waiting
            time after the missed connection.
          </p>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .hosp-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 620px) {
          .hosp-grid,
          .hosp-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}