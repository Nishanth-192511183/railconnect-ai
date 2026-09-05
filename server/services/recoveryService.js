const trainService = require('./trainService')
const hospitalityService = require('./hospitalityService')
const costService = require('./costService')
const { buildRouteFromLegs } = require('./routeService')
const { diffMinutesClock, diffMinutesISO } = require('../utils/timeUtils')

function checkMissedConnection({ actualArrival, nextDeparture }) {
  const diff = diffMinutesISO(nextDeparture, actualArrival)
  const missed = diff > 0

  return {
    missed,
    message: missed
      ? 'The next connection has been missed.'
      : 'The connection is still achievable.',
    recoveryAvailable: missed,
    minutesPastDeparture: missed ? diff : 0
  }
}

function normalizeToClock(timeInput) {
  if (!timeInput) return '00:00'

  const value = String(timeInput)

  if (/^\d{2}:\d{2}$/.test(value)) {
    return value
  }

  const d = new Date(value.replace(' ', 'T'))

  if (Number.isNaN(d.getTime())) {
    return value.substring(0, 5)
  }

  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function normalizeCity(value) {
  return String(value || '')
    .toLowerCase()
    .replace('central', '')
    .replace('junction', '')
    .replace('station', '')
    .replace('railway', '')
    .replace('deccan', '')
    .replace('terminal', '')
    .trim()
}

function sameCity(a, b) {
  return normalizeCity(a) === normalizeCity(b)
}

function compositeScore(route) {
  return route.safetyScore * 1.0 -
    route.estimatedCost * 0.02 -
    route.durationMinutes * 0.03
}

async function findAlternativeCandidates(currentStation, destination, afterClockTime) {
  const [allTrains, stations] = await Promise.all([
    trainService.getAllTrains(),
    trainService.getAllStations()
  ])

  const stationByCity = Object.fromEntries(
    stations.map((s) => [s.city, s])
  )

  const fromCurrent = allTrains.filter((t) => {
    const correctSource = sameCity(t.source, currentStation)
    const afterCurrentTime =
      diffMinutesClock(afterClockTime, t.departure_time) > 0

    return correctSource && afterCurrentTime
  })

  const candidates = []

  for (const train of fromCurrent) {
    if (sameCity(train.destination, destination)) {
      candidates.push([train])
    }
  }

  for (const first of fromCurrent) {
    const station = stations.find((s) => sameCity(s.city, first.destination))

    if (!station) continue

    const secondLegOptions = allTrains.filter((t) => {
      return (
        sameCity(t.source, first.destination) &&
        sameCity(t.destination, destination)
      )
    })

    for (const second of secondLegOptions) {
      const buffer = diffMinutesClock(
        first.arrival_time,
        second.departure_time
      )

      if (buffer >= Number(station.average_transfer_time || 30)) {
        candidates.push([first, second])
      }
    }
  }

  return candidates.map((legs) =>
    buildRouteFromLegs(legs, stationByCity)
  )
}

async function generateRecoveryPlan({
  currentStation,
  destination,
  currentTime,
  budget,
  originalEstimatedCost = 0
}) {
  const afterClock = normalizeToClock(currentTime)

  console.log(
    `[RECOVERY_SEARCH] ${currentStation} -> ${destination} after ${afterClock}`
  )

  const candidates = await findAlternativeCandidates(
    currentStation,
    destination,
    afterClock
  )

  console.log(`[RECOVERY_SEARCH] ${candidates.length} candidate(s) found`)

  if (!candidates.length) {
    return {
      status: 'no_alternative_found',
      message: `No alternative trains found from ${currentStation} to ${destination} after ${afterClock}.`
    }
  }

  candidates.sort(
    (a, b) => compositeScore(b) - compositeScore(a)
  )

  const best = candidates[0]
  const alternativeFirstLeg = best.legs[0]

  const waitingMinutes = Math.max(
    0,
    diffMinutesClock(
      afterClock,
      alternativeFirstLeg.departureTime
    )
  )

  const hospitality =
    await hospitalityService.getHospitalityRecommendations(
      currentStation,
      waitingMinutes,
      budget
    )

  const hotelCost =
    Number(hospitality?.hotels?.[0]?.price || 0)

  const foodCost =
    Number(hospitality?.restaurants?.[0]?.price || 0)

  const transportCost =
    Number(hospitality?.transport?.[0]?.price || 0)

  const trainCost = Number(best.estimatedCost || 0)

  const additionalCost =
    costService.calculateJourneyCost({
      trainCost,
      hotelCost,
      foodCost,
      transportCost
    })

  return {
    status: 'recovered',

    alternativeTrain: {
      trainNumber: alternativeFirstLeg.trainNumber,
      trainName: alternativeFirstLeg.trainName,
      departure: alternativeFirstLeg.departureTime,
      arrival:
        best.legs[best.legs.length - 1].arrivalTime
    },

    newJourney: best.legs,

    connections: best.connections,

    safetyScore: best.safetyScore,

    riskLevel: best.riskLevel,

    waitingTime: hospitality?.waitingTime || waitingMinutes,

    hospitality: {
      hotel: hospitality?.hotels?.[0] || null,
      food: hospitality?.restaurants?.[0] || null,
      transport: hospitality?.transport?.[0] || null
    },

    additionalCost,

    updatedEstimatedCost:
      costService.calculateUpdatedCost(
        originalEstimatedCost,
        additionalCost.total
      ),

    reason:
      `${alternativeFirstLeg.trainName} (${alternativeFirstLeg.trainNumber}) ` +
      `offers the best recovery option with a safety score of ` +
      `${best.safetyScore}/100.`
  }
}

module.exports = {
  checkMissedConnection,
  generateRecoveryPlan,
  findAlternativeCandidates
}