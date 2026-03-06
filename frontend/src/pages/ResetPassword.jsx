import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function ResetPassword(){
  const [code,setCode] = useState(['','','','','',''])
  const [newPassword,setNewPassword] = useState('')
  const [confirmPassword,setConfirmPassword] = useState('')
  const [showPassword,setShowPassword] = useState(false)
  const [showConfirmPassword,setShowConfirmPassword] = useState(false)
  const [error,setError] = useState('')
  const [verified,setVerified] = useState(false)
  const navigate = useNavigate()
  const userId = Number(localStorage.getItem('pendingUserId') || 0)

  function handleChange(i,v){
    if(!/^[0-9]?$/.test(v)) return
    const next=[...code]; next[i]=v; setCode(next)
    if(v && i<5){ const nextEl = document.getElementById('reset-otp-'+(i+1)); if(nextEl) nextEl.focus() }
  }

  function clearDigit(i){
    const next=[...code]; next[i]=''; setCode(next)
    const el = document.getElementById('reset-otp-'+i); if(el) el.focus()
  }

  async function submit(e){
    e.preventDefault(); setError('')
    const joined = code.join('')
    if(joined.length!==6) return setError('Enter full 6-digit code')
    if(!verified) return setError('Please verify the code before resetting password')
    if(newPassword.length<8) return setError('Password must be at least 8 characters')
    // same strength checks as registration
    const missing = []
    if (!/[A-Z]/.test(newPassword)) missing.push('one uppercase letter')
    if (!/[a-z]/.test(newPassword)) missing.push('one lowercase letter')
    if (!/\d/.test(newPassword)) missing.push('one digit')
    if (!/[^A-Za-z0-9]/.test(newPassword)) missing.push('one special character')
    if (missing.length) return setError('Password must contain at least: ' + missing.join(', '))
    if (newPassword !== confirmPassword) return setError('Passwords do not match')
    try{
      const res = await fetch('http://localhost:8080/api/auth/reset-password',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,code:joined,newPassword})
      })
      const body = await res.json()
      if(!res.ok) throw new Error(body.message||'Reset failed')
      alert('Password reset successful. Please login with your new password.')
      localStorage.removeItem('pendingUserId')
      navigate('/login')
    }catch(err){setError(err.message)}
  }

  async function verify(e){
    e && e.preventDefault()
    setError('')
    const joined = code.join('')
    if(joined.length!==6) return setError('Enter full 6-digit code')
    try{
      const res = await fetch('http://localhost:8080/api/auth/verify-otp',{
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId, code: joined })
      })
      const body = await res.json()
      if(!res.ok) throw new Error(body.message || 'Verification failed')
      setVerified(true)
    }catch(err){ setError(err.message) }
  }

  return (
    <div className="auth-root">
      <form className="auth-card" onSubmit={submit}>
        <h2>Reset password</h2>
        {error && <div className="auth-error">{error}</div>}
        <p className="muted">Enter the 6-digit code you received and your new password</p>
        <div className="otp-row">
          {code.map((c,i)=>(
            <div key={i} className="otp-box-wrap">
              <input id={'reset-otp-'+i} className="otp-box" maxLength={1} value={c} onChange={e=>handleChange(i,e.target.value)} />
              <button type="button" className="otp-clear" onClick={()=>clearDigit(i)} aria-label={`clear-${i}`}>×</button>
            </div>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}>
          <button type="button" className="auth-btn" onClick={verify} disabled={verified}>Verify code</button>
          {verified && <span className="verified-badge" style={{background:'#16a34a',color:'#fff',padding:'4px 8px',borderRadius:6}}>Verified</span>}
        </div>
        <label>New password</label>
        <div className="password-wrapper">
          <input type={showPassword? 'text' : 'password'} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required disabled={!verified} />
          <button type="button" className="password-toggle" onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? (
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-6 0-10-5.5-10-8 1.27-2.2 4.29-5 8.46-6.18" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" strokeLinecap="round" strokeLinejoin="round"></path>
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"></circle>
              </svg>
            )}
          </button>
        </div>
        <div className="pw-rules">
          {(() => {
            const checks = {
              length: newPassword.length >= 8,
              upper: /[A-Z]/.test(newPassword),
              lower: /[a-z]/.test(newPassword),
              digit: /\d/.test(newPassword),
              special: /[^A-Za-z0-9]/.test(newPassword)
            }
            return (
              <>
                <div className={`pw-rule ${checks.length ? 'valid' : 'invalid'}`}>Password is at least 8 characters</div>
                <div className={`pw-rule ${checks.upper ? 'valid' : 'invalid'}`}>Contains an uppercase letter (A-Z)</div>
                <div className={`pw-rule ${checks.lower ? 'valid' : 'invalid'}`}>Contains a lowercase letter (a-z)</div>
                <div className={`pw-rule ${checks.digit ? 'valid' : 'invalid'}`}>Contains a digit (0-9)</div>
                <div className={`pw-rule ${checks.special ? 'valid' : 'invalid'}`}>Contains a special character (e.g. !@#$%)</div>
              </>
            )
          })()}
        </div>

        <label>Confirm new password</label>
        <div className="password-wrapper">
          <input type={showConfirmPassword? 'text' : 'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required disabled={!verified} />
          <button type="button" className="password-toggle" onClick={()=>setShowConfirmPassword(s=>!s)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
            {showConfirmPassword ? (
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-6 0-10-5.5-10-8 1.27-2.2 4.29-5 8.46-6.18" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" strokeLinecap="round" strokeLinejoin="round"></path>
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"></circle>
              </svg>
            )}
          </button>
        </div>
        <button className="auth-btn" type="submit" disabled={!verified}>Reset password</button>
      </form>
    </div>
  )
}
