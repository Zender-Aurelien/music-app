import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NavBar } from './components/NavBar'
import { SearchPage } from './pages/SearchPage'
import { LibraryPage } from './pages/LibraryPage'

function ComingSoon({ label }) {
  return <p className="status">{label} coming soon.</p>
}

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/playlists" element={<LibraryPage />} />
        <Route path="/playlists/:id" element={<ComingSoon label="This playlist page is" />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
