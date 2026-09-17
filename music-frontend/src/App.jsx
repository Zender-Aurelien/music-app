import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NavBar } from './components/NavBar'
import { SearchPage } from './pages/SearchPage'
import { LibraryPage } from './pages/LibraryPage'
import { PlaylistPage } from './pages/PlaylistPage'

function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/playlists" element={<LibraryPage />} />
        <Route path="/playlists/:id" element={<PlaylistPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
