import { useState } from 'react'
import './ContactSales.css'
import { FiX, FiUser, FiMail, FiPhone, FiEdit3, FiServer } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export default function ContactSales(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e){
    e.preventDefault()
    // For now just show a simple success state then go back to subscription
    // Real implementation would POST to backend
    alert('Thanks — your request was submitted.')
    navigate('/subscription')
  }

  return (
    <div className="contact-root">
      <div className="contact-overlay" />
      <div className="contact-card" role="dialog" aria-modal="true">
        <button className="modal-close" aria-label="Close" onClick={() => navigate(-1)}><FiX /></button>
  <div className="contact-icon"> <div className="icon-inner"><FiServer size={28} /></div> </div>
        <h2 className="contact-title">Contact Sales</h2>
        <p className="contact-sub">Get in touch with our sales team for custom solutions tailored to your business needs.</p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="field">
            <FiUser className="field-icon" />
            <input placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} required />
          </label>

          <label className="field">
            <FiMail className="field-icon" />
            <input placeholder="Email Address" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </label>

          <label className="field phone-field">
            <FiPhone className="field-icon" />
            <select className="country"> <option>+91</option><option>+1</option><option>+44</option></select>
            <input placeholder="Enter your phone number" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
          </label>

          <label className="field">
            <FiEdit3 className="field-icon" />
            <textarea placeholder="Your Message" value={message} onChange={(e)=>setMessage(e.target.value)} rows={5} />
          </label>

          <button className="submit-btn" type="submit">Submit</button>
          <div className="help-text">We'll get back to you shortly.</div>
        </form>
      </div>
    </div>
  )
}
