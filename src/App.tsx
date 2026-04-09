import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { EventsPage } from './pages/EventsPage'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { WatchPage } from './pages/WatchPage'
import { WorkersPage } from './pages/WorkersPage'
import { CamerasPage } from './pages/CamerasPage'
import { ApiFeedbackModal } from './components/ApiFeedbackModal'
import { RecordingsPage } from './pages/RecordingsPage'
import { LocationsPage } from './pages/LocationsPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/cameras" element={<CamerasPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/recordings" element={<RecordingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ApiFeedbackModal />
    </>
  )
}

export default App
