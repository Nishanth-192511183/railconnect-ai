export const routes = [
  {
    id: 'route-fast',
    tag: 'FASTEST',
    reliability: 68,
    totalDuration: '30h 15m',
    cost: 2950,
    legs: [
      { train: 'Charminar SF Express · 12760', from: 'Chennai Central', to: 'Secunderabad Jn', depart: '08:00', arrive: '17:15', day: 'Day 1' },
      { train: 'Telangana Express · 12723', from: 'Secunderabad Jn', to: 'Nagpur Jn', depart: '18:00', arrive: '02:30', day: 'Day 2' },
      { train: 'Tamil Nadu Express · 12622', from: 'Nagpur Jn', to: 'New Delhi', depart: '02:55', arrive: '14:15', day: 'Day 2' },
    ],
    connections: [
      { at: 'Secunderabad Jn', buffer: '0h 45m', risk: 'high', riskScore: 41 },
      { at: 'Nagpur Jn', buffer: '0h 25m', risk: 'high', riskScore: 33 },
    ],
  },
  {
    id: 'route-safe',
    tag: 'RECOMMENDED',
    reliability: 89,
    totalDuration: '32h 30m',
    cost: 3150,
    legs: [
      { train: 'Charminar SF Express · 12760', from: 'Chennai Central', to: 'Secunderabad Jn', depart: '08:00', arrive: '10:30', day: 'Day 1' },
      { train: 'Falaknuma Express · 12704', from: 'Secunderabad Jn', to: 'Nagpur Jn', depart: '12:30', arrive: '21:00', day: 'Day 1' },
      { train: 'Tamil Nadu Express · 12622', from: 'Nagpur Jn', to: 'New Delhi', depart: '22:30', arrive: '16:30', day: 'Day 2' },
    ],
    connections: [
      { at: 'Secunderabad Jn', buffer: '2h 00m', risk: 'low', riskScore: 92 },
      { at: 'Nagpur Jn', buffer: '1h 30m', risk: 'medium', riskScore: 71 },
    ],
  },
  {
    id: 'route-budget',
    tag: 'LOWEST COST',
    reliability: 76,
    totalDuration: '34h 50m',
    cost: 2450,
    legs: [
      { train: 'Charminar SF Express · 12760', from: 'Chennai Central', to: 'Secunderabad Jn', depart: '08:00', arrive: '10:30', day: 'Day 1' },
      { train: 'Telangana Express · 12723', from: 'Secunderabad Jn', to: 'Nagpur Jn', depart: '11:20', arrive: '19:45', day: 'Day 1' },
      { train: 'Tamil Nadu Express · 12622', from: 'Nagpur Jn', to: 'New Delhi', depart: '21:10', arrive: '18:50', day: 'Day 2' },
    ],
    connections: [
      { at: 'Secunderabad Jn', buffer: '0h 50m', risk: 'medium', riskScore: 64 },
      { at: 'Nagpur Jn', buffer: '1h 25m', risk: 'medium', riskScore: 69 },
    ],
  },
]

export const recommendation = {
  routeId: 'route-safe',
  summary: "This journey is 2h 15m longer than the fastest option, but provides significantly safer connections.",
  detail: "The Secunderabad connection has a 2-hour buffer, cutting the chance of a missed connection by more than half compared with the fastest route.",
}
