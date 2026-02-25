import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import { FiGrid, FiFolder, FiUsers, FiBarChart2, FiCreditCard, FiSettings, FiLogOut, FiMenu, FiSearch, FiBell, FiPlus, FiUser, FiShare2, FiDownload, FiTrash2, FiFilter, FiBookmark, FiClock, FiRepeat, FiArrowRight } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { FiX } from 'react-icons/fi'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const selectedOrg = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('org') || 'null') : null
  const [collapsed, setCollapsed] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

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
            <button className="btn btn-outline-secondary" onClick={() => setShowFilters(true)}>Filters</button>
          </div>
        </header>

        {showFilters && (
          <div className="filters-modal-overlay" onClick={() => setShowFilters(false)}>
            <div className="filters-modal" role="dialog" aria-modal="true" onClick={(e)=>e.stopPropagation()}>
              <div className="filters-modal-header d-flex align-items-start">
                <div>
                  <h5><FiFilter className="me-2" /> Advanced Filters</h5>
                  <p className="muted">Refine your search with multiple criteria</p>
                </div>
                <button className="btn modal-close" onClick={() => setShowFilters(false)} aria-label="Close"><FiX size={18} /></button>
              </div>

              <div className="filters-body">
                <div className="filters-grid">
                  <div className="filters-column">
                    <div className="filter-section">
                      <h6>Status</h6>
                      <div className="filter-list">
                        <label><input type="checkbox" /> To Do</label>
                        <label><input type="checkbox" /> In Progress</label>
                        <label><input type="checkbox" /> In Review</label>
                        <label><input type="checkbox" /> Done</label>
                        <label><input type="checkbox" /> Backlog</label>
                      </div>
                    </div>

                    <div className="filter-section">
                      <h6>Issue Type</h6>
                      <div className="filter-list">
                        <label><input type="checkbox" /> ⚡ Epic</label>
                        <label><input type="checkbox" /> 📘 Story</label>
                        <label><input type="checkbox" /> ✓ Task</label>
                        <label><input type="checkbox" /> 🐛 Bug</label>
                        <label><input type="checkbox" /> ↳ Sub-task</label>
                      </div>
                    </div>

                    <div className="filter-section">
                      <h6>Sprint</h6>
                      <div className="filter-list">
                        <label><input type="checkbox" /> Sprint 1 - Foundation <span className="muted">(completed)</span></label>
                        <label><input type="checkbox" /> Sprint 2 - Board Implementation <span className="muted">(active)</span></label>
                        <label><input type="checkbox" /> Sprint 3 - Advanced Features <span className="muted">(planned)</span></label>
                      </div>
                    </div>
                  </div>

                  <div className="filters-column">
                    <div className="filter-section">
                      <h6>Priority</h6>
                      <div className="filter-list priority-list">
                        <label><input type="checkbox" /><span className="dot dot-red"/> Highest</label>
                        <label><input type="checkbox" /><span className="dot dot-orange"/> High</label>
                        <label><input type="checkbox" /><span className="dot dot-yellow"/> Medium</label>
                        <label><input type="checkbox" /><span className="dot dot-blue"/> Low</label>
                        <label><input type="checkbox" /> Lowest</label>
                      </div>
                    </div>

                    <div className="filter-section">
                      <h6>Assignee</h6>
                      <div className="filter-list assignee-list">
                        <label><input type="checkbox" /> <span className="small-avatar">SJ</span> Sarah Johnson</label>
                        <label><input type="checkbox" /> <span className="small-avatar">MC</span> Michael Chen</label>
                        <label><input type="checkbox" /> <span className="small-avatar">ER</span> Emily Rodriguez</label>
                        <label><input type="checkbox" /> <span className="small-avatar">DK</span> David Kim</label>
                      </div>
                    </div>

                    <div className="filter-section">
                      <h6>Project</h6>
                      <div className="filter-list project-list">
                        <label><input type="checkbox" /> 🚀 KavyaProMan 360</label>
                        <label><input type="checkbox" /> 🌐 Website Redesign</label>
                        <label><input type="checkbox" /> 📱 Mobile App</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider" />

                <div className="due-range-row d-flex gap-3">
                  <div className="due-col">
                    <div className="muted">Due Date Range</div>
                    <label className="small-muted">From</label>
                    <input type="date" className="date-input" />
                  </div>
                  <div className="due-col">
                    <label className="small-muted">To</label>
                    <input type="date" className="date-input" />
                  </div>
                </div>
              </div>

              <div className="filters-modal-footer d-flex align-items-center">
                <button className="link-clear">Clear All Filters</button>
                <div className="ms-auto d-flex gap-3">
                  <button className="btn btn-outline-secondary" onClick={() => setShowFilters(false)}>Close</button>
                  <button className="btn save-filter">Save Filter</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="saved-filters-wrapper" style={{borderRadius:'10px'}}>
          <div className="saved-card">
            <div className="saved-filters-header">
              <div className="save-icon"><FiBookmark size={18} /></div>
              <div className="saved-filters-text">
                <h5>Saved Filters</h5>
                <p className="muted">Quickly apply your saved filter presets</p>
              </div>
            </div>

            <div className="saved-inner-grid">
              <div className="inner-filter-card">
                <div className="inner-content">
                  <div>
                    <h6>High Priority Tasks</h6>
                    <p className="filter-desc">All high and highest priority tasks</p>
                  </div>

                  <div className="filter-actions-row">
                    <button className="apply-btn"><FiFilter className="me-2" />Apply</button>
                    <div className="icons-row">
                      <button className="icon-btn" title="Share"><FiShare2 /></button>
                      <button className="icon-btn" title="Download"><FiDownload /></button>
                      <button className="icon-btn danger" title="Delete"><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inner-filter-card">
                <div className="inner-content">
                  <div>
                    <h6>My Open Issues <span className="shared-badge">Shared</span></h6>
                    <p className="filter-desc">Issues assigned to me that are not completed</p>
                  </div>

                  <div className="filter-actions-row">
                    <button className="apply-btn"><FiFilter className="me-2" />Apply</button>
                    <div className="icons-row">
                      <button className="icon-btn" title="Share"><FiShare2 /></button>
                      <button className="icon-btn" title="Download"><FiDownload /></button>
                      <button className="icon-btn danger" title="Delete"><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        

        <section className="dashboard-cards mt-4">
          <div className="stat-card">
            <div className="stat-card-body">
              <div className="stat-meta">
                <div className="muted">Active Sprint</div>
                <h3 className="stat-title">Sprint 2 - Board Implementation</h3>
              </div>

              <div className="stat-progress">
                <div className="progress-row">
                  <div className="progress-label">Progress</div>
                  <div className="progress-count">0/6</div>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{width: '0%'}}></div></div>
                <div className="time-remaining"><FiClock className="me-2" />-728 days left</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-body">
              <div className="muted">Total Issues</div>
              <h3 className="stat-title">10</h3>

              <div className="issues-legend">
                <div className="legend-row"><span className="dot dot-red"/> Highest <span className="legend-count">2</span></div>
                <div className="legend-row"><span className="dot dot-orange"/> High <span className="legend-count">3</span></div>
                <div className="legend-row"><span className="dot dot-yellow"/> Medium <span className="legend-count">3</span></div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="dashboard-cards-2 mt-4">
          <div className="task-card">
            <div className="task-card-body">
              <div className="muted">My Tasks</div>
              <h3 className="task-count">0</h3>

              <div className="task-list">
                <div className="task-row"><span>In Progress</span><span className="task-num">0</span></div>
                <div className="task-row"><span>In Review</span><span className="task-num">0</span></div>
                <div className="task-row"><span>To Do</span><span className="task-num">0</span></div>
              </div>
            </div>
          </div>

          <div className="overdue-card">
            <div className="overdue-card-body">
              <div className="muted overdue-title">Overdue Tasks</div>
              <h3 className="overdue-count">3</h3>

              <ul className="overdue-list">
                <li><span className="overdue-icon">!</span> Implement Kanban board with drag...</li>
                <li><span className="overdue-icon">!</span> Add sprint planning interface</li>
                <li><span className="overdue-icon">!</span> Bug: Filter not working on board vi...</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="recent-activity mt-4">
          <div className="recent-card">
            <div className="recent-header">
              <h5>Recent Activity</h5>
              <p className="muted">Latest updates across all projects</p>
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon-square">
                  <div className="activity-dot red" />
                </div>

                <div className="activity-body">
                  <div className="activity-meta">
                    <span className="activity-key">KPM-2</span>
                    <span className="activity-type">story</span>
                  </div>
                  <div className="activity-title">Implement Kanban board with drag and drop</div>
                  <div className="activity-sub muted">in progress &nbsp;•&nbsp; Updated 2/18/2024 &nbsp;•&nbsp; <span className="activity-user"><div className="small-avatar">MC</div> Michael Chen</span></div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon-square">
                  <div className="activity-dot orange" />
                </div>

                <div className="activity-body">
                  <div className="activity-meta">
                    <span className="activity-key">KPM-3</span>
                    <span className="activity-type">story</span>
                  </div>
                  <div className="activity-title">Add sprint planning interface</div>
                  <div className="activity-sub muted">in progress &nbsp;•&nbsp; Updated 2/17/2024 &nbsp;•&nbsp; <span className="activity-user"><div className="small-avatar">ER</div> Emily Rodriguez</span></div>
                </div>
              </div>

              <div className="activity-item highlight">
                <div className="activity-icon-square">
                  <div className="activity-dot red" />
                </div>

                <div className="activity-body">
                  <div className="activity-meta">
                    <span className="activity-key">KPM-5</span>
                    <span className="activity-type">task</span>
                  </div>
                  <div className="activity-title">Setup authentication system</div>
                  <div className="activity-sub muted">in review &nbsp;•&nbsp; Updated 2/17/2024 &nbsp;•&nbsp; <span className="activity-user"><div className="small-avatar">MC</div> Michael Chen</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="large-info-card mt-4">
          <div className="info-card">
            <h5>My Tasks</h5>
            <p className="muted">Issues assigned to you</p>
          </div>
        </section>

        <section className="active-projects mt-4">
          <div className="active-projects-card">
            <div className="active-projects-header d-flex align-items-start">
              <div>
                <h5>Active Projects</h5>
                <p className="muted">Quick overview of your projects</p>
              </div>
              <div className="ms-auto">
                <button className="view-all-btn">View All <span className="arrow">→</span></button>
              </div>
            </div>

            <div className="projects-grid mt-3">
              <div className="project-card">
                <div className="project-card-body">
                  <div className="project-top d-flex align-items-center gap-3">
                    <div className="project-icon">🚀</div>
                    <div>
                      <div className="project-title">KavyaProMan 360</div>
                      <div className="project-code muted">KPM</div>
                    </div>
                  </div>

                  <div className="project-progress-row mt-3 d-flex align-items-center">
                    <div className="muted">Progress</div>
                    <div className="progress-count ms-auto">1/10</div>
                  </div>
                  <div className="progress-track mt-2"><div className="progress-fill" style={{width: '10%'}}></div></div>
                </div>
              </div>

              <div className="project-card">
                <div className="project-card-body">
                  <div className="project-top d-flex align-items-center gap-3">
                    <div className="project-icon">🌐</div>
                    <div>
                      <div className="project-title">Website Redesign</div>
                      <div className="project-code muted">WEB</div>
                    </div>
                  </div>

                  <div className="project-progress-row mt-3 d-flex align-items-center">
                    <div className="muted">Progress</div>
                    <div className="progress-count ms-auto">0/0</div>
                  </div>
                  <div className="progress-track mt-2"><div className="progress-fill" style={{width: '0%'}}></div></div>
                </div>
              </div>

              <div className="project-card">
                <div className="project-card-body">
                  <div className="project-top d-flex align-items-center gap-3">
                    <div className="project-icon">📱</div>
                    <div>
                      <div className="project-title">Mobile App</div>
                      <div className="project-code muted">MOB</div>
                    </div>
                  </div>

                  <div className="project-progress-row mt-3 d-flex align-items-center">
                    <div className="muted">Progress</div>
                    <div className="progress-count ms-auto">0/0</div>
                  </div>
                  <div className="progress-track mt-2"><div className="progress-fill" style={{width: '0%'}}></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
