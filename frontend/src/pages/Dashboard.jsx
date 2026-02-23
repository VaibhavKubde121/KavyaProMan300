import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null

  function handleEnter() {
    // dummy action for entering the enterprise app
    alert('Entering Kavyapro Man Enterprise Application')
  }

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <h2>Welcome{user && user.email ? `, ${user.email}` : ''}</h2>
        <p>Enter to Kavyapro Man Enterprise Application</p>
        <div style={{display:'flex',gap:12,marginTop:18}}>
          <button className="auth-btn" onClick={handleEnter}>Enter</button>
          <button className="social" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
