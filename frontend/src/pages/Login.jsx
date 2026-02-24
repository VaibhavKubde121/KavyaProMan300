import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Login failed')
      localStorage.setItem('user', JSON.stringify({ id: body.userId, email: body.email }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-root">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="muted">Sign in to your account to continue</p>
        {error && <div className="auth-error">{error}</div>}
        <label>Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <div className="auth-row">
          <label className="remember"><input type="checkbox" /> Remember me</label>
          <a className="muted" href="#">Forgot password?</a>
        </div>
        <button className="auth-btn" type="submit"  onClick={() => navigate("/create")} >Sign In</button>
        <div className="divider">Or continue with</div>
        <div className="auth-socials">
          <button className="social">Google</button>
          <button className="social">GitHub</button>
        </div>
        <div className="auth-foot">Don't have an account? <a href="/register">Sign up</a></div>
      </form>
    </div>
  )
}
