import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import './NavBar.css'

export function NavBar() {
    const { user, status, logout } = useAuth()

    return (
        <nav className="navbar">
            <div className="navbar-links">
                <NavLink to="/" end className="navbar-link">Search</NavLink>
                <NavLink to="/playlists" className="navbar-link">My Playlists</NavLink>
            </div>

            <div className="navbar-auth">
                {status === 'authenticated' && user && (
                    <>
                        {user.picture_url && (
                            <img className="navbar-avatar" src={user.picture_url} alt={user.name} />
                        )}
                        <span className="navbar-username">{user.name}</span>
                        <button className="navbar-button" onClick={logout}>Sign out</button>
                    </>
                )}
                {status === 'anonymous' && (
                    <a className="navbar-button navbar-signin" href="/api/auth/login">
                        Sign in with Google
                    </a>
                )}
            </div>
        </nav>
    )
}
