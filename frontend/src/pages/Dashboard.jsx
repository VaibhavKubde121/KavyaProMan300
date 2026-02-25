import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import { FiGrid, FiFolder, FiUsers, FiBarChart2, FiCreditCard, FiSettings, FiLogOut, FiMenu, FiSearch, FiBell, FiPlus, FiUser } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const selectedOrg = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('org') || 'null') : null
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    // clear user and force replace to login so back won't return to protected page
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
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
            <button className="btn btn-sm btn-outline-secondary mt-1">Switch Organization</button>
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

      <main className={`content flex-grow-1 p-4 ${collapsed ? 'with-topbar' : ''}`}>
        <header className="dash-header mb-4">
          <div>
            <div className="top-search-row mb-3">
              <div className="input-group top-search-medium">
                <span className="input-group-text"><FiSearch /></span>
                <input className="form-control" placeholder="Search issues, projects..." aria-label="Search projects and issues" />
              </div>

              <button className="btn btn-link me-2 bell-black" title="Notifications">
                <FiBell size={20} />
              </button>

              <button className="btn create-issue-medium" onClick={() => navigate('/create-issue')}>
                <FiPlus className="me-1" /> Create Issue
              </button>
            </div>

            <h1 className="mb-0">Dashboard</h1>
            <div className="text-muted">Welcome back! Here's what's happening with your projects.</div>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3">
            <div className="search-input input-group">
              <span className="input-group-text"><FiSearch /></span>
              <input className="form-control" placeholder="Search issues by title, key, description..." />
            </div>
            <button className="btn btn-outline-secondary">Filters</button>
          </div>
        </header>

        <section className="saved-filters">
          <h5>Saved Filters</h5>
          <div className="row gy-3">
            <div className="col-md-6">
              <div className="card p-3">
                <h6>High Priority Tasks</h6>
                <p className="text-muted">All high and highest priority tasks</p>
                <div className="mt-2">
                  <button className="btn btn-primary btn-sm me-2">Apply</button>
                  <button className="btn btn-outline-secondary btn-sm">Export</button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card p-3">
                <h6>My Open Issues <span className="badge bg-light text-dark ms-2">Shared</span></h6>
                <p className="text-muted">Issues assigned to me that are not completed</p>
                <div className="mt-2">
                  <button className="btn btn-primary btn-sm me-2">Apply</button>
                  <button className="btn btn-outline-secondary btn-sm">Export</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
