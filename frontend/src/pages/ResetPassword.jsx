import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function ResetPassword(){
  const [code,setCode] = useState(['','','','','',''])
  const [newPassword,setNewPassword] = useState('')
  const [showPassword,setShowPassword] = useState(false)
  const [error,setError] = useState('')
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
    if(newPassword.length<8) return setError('Password must be at least 8 characters')
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
        <label>New password</label>
        <div className="password-wrapper">
          <input type={showPassword? 'text' : 'password'} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
          <button type="button" className="password-toggle" onClick={()=>setShowPassword(s=>!s)} aria-label="toggle-password">{showPassword? 'Hide' : 'Show'}</button>
        </div>
        <button className="auth-btn" type="submit">Reset password</button>
      </form>
    </div>
  )
}
