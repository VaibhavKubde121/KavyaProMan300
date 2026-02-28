
import React, { useState } from 'react'
import {
  FiGrid,
  FiFolder,
  FiUsers,
  FiBarChart2,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiBell,
  FiPlus,
  FiUser,
  FiShare2,
  FiDownload,
  FiTrash2,
  FiFilter,
  FiBookmark,
  FiClock,
  FiRepeat,
  FiArrowRight,
  FiUpload,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify
} from 'react-icons/fi'
import './Settings.css'
import './Dashboard.css'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Settings() {
  // basic UI state
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')

  // router helper
  const navigate = useNavigate()

  // placeholders for values that would normally come from context or props
  const selectedOrg = { name: '' }
const user = JSON.parse(localStorage.getItem('user') || 'null')
const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const handleLogout = () => {
    // TODO: wire up real logout logic
    console.log('logout clicked')
    navigate('/login')
  }

  return (
    <div className="dashboard-root d-flex">
      <aside className={`sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="brand d-flex align-items-center">
            <div className="brand-logo">KP</div>
            <div className="brand-name">KavyaProMan</div>
          </div>
          {/* <button className="btn btn-sm btn-link toggle-btn" onClick={() => setCollapsed(s => !s)} aria-label="Toggle sidebar">
            <FiMenu size={18} />
          </button> */}
        </div>

        <div className="org-switch mt-3 d-flex align-items-center gap-2">
          <div className="org-icon">{selectedOrg?.name ? selectedOrg.name.charAt(0) : 'K'}</div>
          <div className="org-info">
            <div className="org-name">{selectedOrg?.name || 'Kavya Technologies'}</div>
            <button className="switch-org-btn mt-1" onClick={() => navigate('/organization')} aria-label="Switch Organization">
              <span className="switch-left"><FiRepeat size={16} className="me-2" /></span>
              <span className="switch-text">Switch Organization</span>
              <FiArrowRight size={16} className="switch-arrow" />
            </button>
          </div>
        </div>

        <div className="sidebar-inner d-flex flex-column mt-3">
          <div className="nav-scroll">
            <nav className="nav flex-column">
              <NavLink to="/dashboard" className={({isActive})=> `nav-item d-flex align-items-center mb-2 ${isActive? 'active':''}`}>
                <FiGrid className="me-3 nav-icon"/> <span className="nav-text">Dashboard</span>
              </NavLink>
              <NavLink to="/projects" className={({isActive})=> `nav-item d-flex align-items-center mb-2 ${isActive? 'active':''}`}>
                <FiFolder className="me-3 nav-icon"/> <span className="nav-text">Projects</span>
              </NavLink>
              <NavLink to="/teams" className={({isActive})=> `nav-item d-flex align-items-center mb-2 ${isActive? 'active':''}`}>
                <FiUsers className="me-3 nav-icon"/> <span className="nav-text">Teams</span>
              </NavLink>
              <NavLink to="/reports" className={({isActive})=> `nav-item d-flex align-items-center mb-2 ${isActive? 'active':''}`}>
                <FiBarChart2 className="me-3 nav-icon"/> <span className="nav-text">Reports</span>
              </NavLink>
              <NavLink to="/subscription" className={({isActive})=> `nav-item d-flex align-items-center mb-2 ${isActive? 'active':''}`}>
                <FiCreditCard className="me-3 nav-icon"/> <span className="nav-text">Subscription</span>
              </NavLink>
              <NavLink to="/settings" className={({isActive})=> `nav-item d-flex align-items-center mb-2 ${isActive? 'active':''}`}>
                <FiSettings className="me-3 nav-icon"/> <span className="nav-text">Settings</span>
              </NavLink>
            </nav>
          </div>

          <div className="sidebar-footer mt-3 d-flex flex-column align-items-start">
            <div className="profile d-flex align-items-center w-100">
              <div className="avatar-icon"><FiUser size={20} /></div>
              <div className="ms-2 user-info">
                <div className="user-name">{displayName}</div>
                <div className="user-role">Admin</div>
              </div>
            </div>
            <button className="btn logout-badge mt-3" onClick={handleLogout} title="Logout">
              <FiLogOut size={16} className="me-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* topbar shown when sidebar is collapsed: brand left, toggle right */}
      {collapsed && (
        <div className="topbar d-flex align-items-center px-3">
          <div className="d-flex align-items-center">
            <div className="brand-logo">KP</div>
            <div className="ms-2 brand-name">KavyaProMan</div>
          </div>
          <div className="ms-auto">
            <button className="btn btn-sm btn-link" onClick={() => setCollapsed(false)} aria-label="Open sidebar">
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      )}

      {/* mobile toggle (visible on small/medium screens) */}
      <button className="mobile-toggle btn btn-sm" onClick={() => setCollapsed(s => !s)} aria-label="Toggle sidebar">
        <FiMenu size={18} />
      </button>

            {/*sidebar end  */}

      <main className={`content flex-grow-1 p-4 ${collapsed ? 'with-topbar' : ''}`}>
        <header className="dash-header mb-4">
          <h1>Settings</h1>
          <p className="text-muted">Manage your account and application preferences</p>
        </header>

        <div className="settings-tabs-container mb-4">
          <div className="settings-tabs">
            <button
              className={`tab-pill ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`tab-pill ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button
              className={`tab-pill ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              Appearance
            </button>
            <button
              className={`tab-pill ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'notifications' && <NotificationsSection />}
          {activeTab === 'appearance' && <AppearanceSection />}
          {activeTab === 'security' && <SecuritySection />}
        </div>
      </main>
    </div>
  )
}

// ============ Profile Section ============
function ProfileSection() {
  const [formData, setFormData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@kavyaproman.com',
    role: 'Admin',
    timezone: 'UTC'
  })

  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    console.log('Profile saved:', formData)
    alert('Profile changes saved successfully!')
  }

  return (
    <div className="settings-card">
      <div className="card-header">
        <h2>Profile Settings</h2>
        <p className="text-muted">Manage your personal information</p>
      </div>

      <div className="avatar-section d-flex align-items-center mb-4 pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="avatar-preview">SJ</div>
        <button className="btn btn-outline-secondary btn-sm ms-3">
          Change Avatar
        </button>
        <small className="ms-3 text-muted">JPG, PNG or GIF. Max size 2MB</small>
      </div>

      <div className="form-row">
        <div className="form-group mb-3" style={{ flex: 1, marginRight: '12px' }}>
          <label className="form-label">First Name</label>
          <input 
            type="text" 
            className="form-control" 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name" 
          />
        </div>
        <div className="form-group mb-3" style={{ flex: 1 }}>
          <label className="form-label">Last Name</label>
          <input 
            type="text" 
            className="form-control" 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name" 
          />
        </div>
      </div>

      <div className="form-group mb-3">
        <label className="form-label">Email</label>
        <input 
          type="email" 
          className="form-control" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@example.com" 
        />
      </div>

      <div className="form-row">
        <div className="form-group mb-3" style={{ flex: 1, marginRight: '12px' }}>
          <label className="form-label">Role</label>
          <select className="form-control" name="role" value={formData.role} onChange={handleChange}>
            <option>Admin</option>
            <option>Member</option>
          </select>
        </div>
        <div className="form-group mb-3" style={{ flex: 1 }}>
          <label className="form-label">Timezone</label>
          <select className="form-control" name="timezone" value={formData.timezone} onChange={handleChange}>
            <option>UTC</option>
            <option>GMT</option>
            <option>EST</option>
            <option>PST</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary btn-dark mt-2" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  )
}

// ============ Notifications Section ============
function NotificationsSection() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    issueAssignments: true,
    mentions: true,
    comments: false,
    statusChanges: true,
    weeklySummary: true
  })

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleOption = (key) => {
    return (
      <div className="notification-item" key={key}>
        <div className="d-flex align-items-center justify-content-between">
          <label className="notif-label">
            {key === 'emailNotifications' && 'Email Notifications'}
            {key === 'issueAssignments' && 'Issue Assignments'}
            {key === 'mentions' && 'Mentions'}
            {key === 'comments' && 'Comments'}
            {key === 'statusChanges' && 'Status Changes'}
            {key === 'weeklySummary' && 'Weekly Summary'}
          </label>
          <div className={`toggle-switch ${notifications[key] ? 'active' : ''}`} onClick={() => handleToggle(key)}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-card">
      <div className="card-header">
        <h2>Notification Preferences</h2>
        <p className="text-muted">Choose how you want to be notified</p>
      </div>

      <div className="notifications-list">
        {toggleOption('emailNotifications')}
        {toggleOption('issueAssignments')}
        {toggleOption('mentions')}
        {toggleOption('comments')}
        {toggleOption('statusChanges')}
        {toggleOption('weeklySummary')}
      </div>

      <button className="btn btn-primary btn-dark mt-4">
        Save Preferences
      </button>
    </div>
  )
}

// ============ Appearance Section ============
function AppearanceSection() {
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'english',
    sidebarDensity: 'comfortable',
    showProjectIcons: true
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setAppearance(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="settings-card">
      <div className="card-header">
        <h2>Appearance</h2>
        <p className="text-muted">Customize the look and feel</p>
      </div>

      <div className="form-group mb-4">
        <label className="form-label">Theme</label>
        <select 
          className="form-control" 
          name="theme"
          value={appearance.theme}
          onChange={handleChange}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="form-group mb-4">
        <label className="form-label">Language</label>
        <select 
          className="form-control" 
          name="language"
          value={appearance.language}
          onChange={handleChange}
        >
          <option value="english">English</option>
        </select>
      </div>

      <div className="form-group mb-4">
        <label className="form-label">Sidebar Density</label>
        <select 
          className="form-control" 
          name="sidebarDensity"
          value={appearance.sidebarDensity}
          onChange={handleChange}
        >
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </div>

      <div className="form-group mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <label className="form-label m-0">Display project icons in sidebar</label>
          <div className={`toggle-switch ${appearance.showProjectIcons ? 'active' : ''}`}>
            <input 
              type="checkbox" 
              className="toggle-input"
              name="showProjectIcons"
              checked={appearance.showProjectIcons}
              onChange={handleChange}
            />
            <div className="toggle-slider"></div>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-dark mt-4">
        Save Appearance
      </button>
    </div>
  )
}

// ============ Security Section ============
function SecuritySection() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordError, setPasswordError] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords(prev => ({ ...prev, [name]: value }))
    setPasswordError('')
  }

  const handleUpdatePassword = () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    console.log('Password updated')
    setPasswordError('')
    alert('Password updated successfully!')
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  return (
    <div>
      {/* Change Password Card */}
      <div className="settings-card mb-4">
        <div className="card-header">
          <h2>Change Password</h2>
          <p className="text-muted">Update your account password</p>
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Current Password</label>
          <input 
            type="password" 
            className="form-control"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter your current password"
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">New Password</label>
          <input 
            type="password" 
            className="form-control"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter your new password"
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Confirm New Password</label>
          <input 
            type="password" 
            className="form-control"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm your new password"
          />
        </div>

        {passwordError && (
          <div className="alert alert-danger mt-3 mb-3" role="alert">
            {passwordError}
          </div>
        )}

        <button 
          className="btn btn-primary btn-dark mt-2"
          onClick={handleUpdatePassword}
        >
          Update Password
        </button>
      </div>

      {/* Two-Factor Authentication Card */}
      <div className="settings-card">
        <div className="card-header">
          <h2>Two-Factor Authentication</h2>
          <p className="text-muted">Add an extra layer of security to your account</p>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-4">
          <label className="form-label m-0">Enable Two-Factor Authentication</label>
          <div className={`toggle-switch ${twoFactorEnabled ? 'active' : ''}`} onClick={handleToggle2FA}>
            <div className="toggle-slider"></div>
          </div>
        </div>

        {twoFactorEnabled && (
          <div className="qr-code-section">
            <div className="qr-placeholder">
              <div className="qr-code-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                  <rect width="120" height="120" fill="#f0f0f0" />
                  <rect x="10" y="10" width="30" height="30" fill="#333" />
                  <rect x="80" y="10" width="30" height="30" fill="#333" />
                  <rect x="10" y="80" width="30" height="30" fill="#333" />
                  <rect x="50" y="50" width="20" height="20" fill="#333" />
                </svg>
              </div>
              <p className="text-muted mt-3">Scan this QR code using Google Authenticator</p>
            </div>

            <button 
              className="btn btn-primary btn-dark mt-4"
              onClick={() => {
                alert('2FA has been enabled!')
                setTwoFactorEnabled(false)
              }}
            >
              Confirm and Enable 2FA
            </button>
          </div>
        )}

        {!twoFactorEnabled && (
          <button 
            className="btn btn-primary btn-dark"
            onClick={handleToggle2FA}
          >
            Enable 2FA
          </button>
        )}

        {twoFactorEnabled && (
          <button 
            className="btn btn-outline-danger mt-2"
            onClick={handleToggle2FA}
          >
            Disable 2FA
          </button>
        )}
      </div>
    </div>
  )
}
