import { Routes, Route } from 'react-router-dom'
import { JourneyProvider } from './context/JourneyContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import RouteResults from './pages/RouteResults'
import JourneyDetails from './pages/JourneyDetails'
import LiveDashboard from './pages/LiveDashboard'
import Recovery from './pages/Recovery'
import Hospitality from './pages/Hospitality'

export default function App() {
  return (
    <JourneyProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/plan" element={<Landing />} />
        <Route path="/results" element={<RouteResults />} />
        <Route path="/journey" element={<JourneyDetails />} />
        <Route path="/dashboard" element={<LiveDashboard />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/hospitality" element={<Hospitality />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </JourneyProvider>
  )
}
