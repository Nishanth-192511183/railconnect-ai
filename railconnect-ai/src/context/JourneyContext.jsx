import { createContext, useContext, useState, useCallback } from 'react'

const JourneyContext = createContext(null)

const API = 'http://localhost:5000/api'

const RECOVERY_PLAN = {
  originalConnection: {
    at: 'Secunderabad Jn',
    missedTrain: 'Falaknuma Express · 12704',
    departed: '12:30 PM'
  },

  timeline: [
    { time: '12:45 PM', label: 'Arrive Secunderabad Jn (delayed)' },
    { time: '3:15 PM', label: 'Alternative train — Secunderabad → Nagpur' },
    { time: '11:00 PM', label: 'Arrive Nagpur Jn' },
    { time: '12:15 AM', label: 'Nagpur → Delhi departs' },
    { time: '4:30 PM', label: 'Arrive New Delhi' }
  ],

  costs: [
    { label: 'Alternative Train', amount: 450 },
    { label: 'Accommodation', amount: 650 },
    { label: 'Food', amount: 180 },
    { label: 'Local Transport', amount: 100 }
  ],

  waitingHours: '4h 10m',
  waitingLocation: 'Secunderabad Jn'
}

export function JourneyProvider({ children }) {
  const [search, setSearch] = useState({
    from: 'Chennai',
    to: 'Delhi',
    date: '2026-09-20'
  })

  const [selectedRoute, setSelectedRoute] = useState(null)
  const [journeyId, setJourneyId] = useState(null)

  const [journeyStatus, setJourneyStatus] = useState('on_track')

  const selectRoute = useCallback(async (route) => {
    try {
      const response = await fetch(`${API}/journey/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: search.from,
          destination: search.to,
          date: search.date,
          route: route
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(data)
        return false
      }

      setSelectedRoute(route)
      setJourneyId(data.journeyId)
      setJourneyStatus('on_track')

      console.log('Selected journey:', data)

      return true
    } catch (error) {
      console.error('Journey selection error:', error)
      return false
    }
  }, [search])

  const simulateDelay = useCallback(() => {
    setJourneyStatus('delayed')

    setTimeout(() => {
      setJourneyStatus('missed')
    }, 1400)
  }, [])

  const acceptRecovery = useCallback(() => {
    setJourneyStatus('recovered')
  }, [])

  const resetJourney = useCallback(() => {
    setJourneyStatus('on_track')
  }, [])

  const value = {
    search,
    setSearch,

    selectedRoute,
    journeyId,
    selectRoute,

    journeyStatus,
    simulateDelay,
    acceptRecovery,
    resetJourney,

    recoveryPlan: RECOVERY_PLAN
  }

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  )
}

export function useJourney() {
  const ctx = useContext(JourneyContext)

  if (!ctx) {
    throw new Error('useJourney must be used within JourneyProvider')
  }

  return ctx
}