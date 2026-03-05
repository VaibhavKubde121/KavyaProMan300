import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import './Dashboard.css'
import './Board.css'
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
  FiRepeat,
  FiArrowRight,
  FiFilter,
  FiChevronDown,
  FiTag
} from 'react-icons/fi'

const BOARD_COLUMNS = [
  {
    key: 'todo',
    title: 'To Do',
    tone: 'todo',
    issues: [
      {
        id: 'KPM-4',
        type: 'bug',
        typeLabel: '🐞',
        title: 'Bug: Filter not working on board view',
        labels: ['bug', 'frontend'],
        assignee: 'Sarah Johnson',
        points: 2,
        priority: 'high'
      },
      {
        id: 'KPM-9',
        type: 'task',
        typeLabel: '☑',
        title: 'Optimize database queries',
        labels: ['backend', 'performance'],
        assignee: 'Michael Chen',
        points: 5,
        priority: 'medium'
      },
      {
        id: 'KPM-10',
        type: 'story',
        typeLabel: '📘',
        title: 'Design onboarding checklist',
        labels: ['ux', 'story'],
        assignee: 'Emily Rodriguez',
        points: 3,
        priority: 'medium'
      }
    ]
  },
  {
    key: 'progress',
    title: 'In Progress',
    tone: 'progress',
    issues: [
      {
        id: 'KPM-2',
        type: 'story',
        typeLabel: '📘',
        title: 'Implement Kanban board with drag and drop',
        labels: ['frontend', 'core'],
        assignee: 'Michael Chen',
        points: 13,
        priority: 'critical'
      },
      {
        id: 'KPM-3',
        type: 'story',
        typeLabel: '📘',
        title: 'Add sprint planning interface',
        labels: ['frontend', 'sprints'],
        assignee: 'Emily Rodriguez',
        points: 8,
        priority: 'high'
      }
    ]
  },
  {
    key: 'review',
    title: 'In Review',
    tone: 'review',
    issues: [
      {
        id: 'KPM-5',
        type: 'task',
        typeLabel: '☑',
        title: 'Setup authentication system',
        labels: ['backend', 'security'],
        assignee: 'David Kim',
        points: 8,
        priority: 'critical'
      }
    ]
  },
  {
    key: 'done',
    title: 'Done',
    tone: 'done',
    issues: [
      {
        id: 'KPM-1',
        type: 'task',
        typeLabel: '☑',
        title: 'Project repository initialization',
        labels: ['devops', 'setup'],
        assignee: 'Sarah Johnson',
        points: 3,
        priority: 'low'
      }
    ]
  }
]

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Board() {
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const [selectedOrg, setSelectedOrg] = useState(() => { try { return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('org') || 'null') : null } catch (e) { return null } })
  useEffect(() => {
    function onOrgChanged(e){ const org = e?.detail || null; setSelectedOrg(org); try { if (org) localStorage.setItem('org', JSON.stringify(org)) } catch(err){} }
    window.addEventListener('org:changed', onOrgChanged)
    return () => window.removeEventListener('org:changed', onOrgChanged)
  }, [])
  const [collapsed, setCollapsed] = useState(false)
  const projectFromState = location.state?.project
  const activeProject = projectFromState || {
    id: projectId || 'KPM',
    name: 'KavyaProMan 360'
  }

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="board-page-root dashboard-root d-flex">
      <aside className={`sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="brand d-flex align-items-center">
            <div className="brand-logo">KP</div>
            <div className="brand-name">KavyaProMan 360</div>
          </div>
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
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item d-flex align-items-center mb-2 ${isActive ? 'active' : ''}`}>
                <FiGrid className="me-3 nav-icon" /> <span className="nav-text">Dashboard</span>
              </NavLink>
              <NavLink to="/projects" className={({ isActive }) => `nav-item d-flex align-items-center mb-2 ${isActive ? 'active' : ''}`}>
                <FiFolder className="me-3 nav-icon" /> <span className="nav-text">Projects</span>
              </NavLink>
              <NavLink to="/teams" className={({ isActive }) => `nav-item d-flex align-items-center mb-2 ${isActive ? 'active' : ''}`}>
                <FiUsers className="me-3 nav-icon" /> <span className="nav-text">Teams</span>
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => `nav-item d-flex align-items-center mb-2 ${isActive ? 'active' : ''}`}>
                <FiBarChart2 className="me-3 nav-icon" /> <span className="nav-text">Reports</span>
              </NavLink>
              <NavLink to="/subscription" className={({ isActive }) => `nav-item d-flex align-items-center mb-2 ${isActive ? 'active' : ''}`}>
                <FiCreditCard className="me-3 nav-icon" /> <span className="nav-text">Subscription</span>
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `nav-item d-flex align-items-center mb-2 ${isActive ? 'active' : ''}`}>
                <FiSettings className="me-3 nav-icon" /> <span className="nav-text">Settings</span>
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

      {collapsed && (
        <div className="topbar d-flex align-items-center px-3">
          <div className="d-flex align-items-center">
            <div className="brand-logo">KP</div>
            <div className="ms-2 brand-name">KavyaProMan 360</div>
          </div>
          <div className="ms-auto">
            <button className="btn btn-sm btn-link" onClick={() => setCollapsed(false)} aria-label="Open sidebar">
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      )}

      <button className="mobile-toggle btn btn-sm" aria-label="Toggle sidebar">
        <FiMenu size={18} />
      </button>

      <main className={`content board-content flex-grow-1 p-4 ${collapsed ? 'with-topbar' : ''}`}>
        <header className="board-top-strip">
          <div className="top-search-row">
            <div className="input-group top-search-medium">
              <span className="input-group-text"><FiSearch /></span>
              <input className="form-control" placeholder="Search issues, projects..." aria-label="Search issues and projects" />
            </div>

            <button className="btn btn-link me-2 bell-black" title="Notifications">
              <FiBell size={20} />
            </button>

            <button className="btn create-issue-medium">
              <FiPlus className="me-1" /> Create Issue
            </button>
          </div>
        </header>

        <section className="board-shell">
          <div className="board-breadcrumb">
            <span>Projects</span>
            <span>/</span>
            <span>{activeProject.name}</span>
          </div>

          <div className="board-title-row">
            <div>
              <h1>Sprint 2 - Board Implementation</h1>
            </div>
            <div className="board-title-actions">
              <button className="btn create-issue-medium">
                <FiPlus className="me-1" /> Create Issue
              </button>
              <button className="btn board-outline-btn" onClick={() => navigate(`/projects/${activeProject.id}/backlog`, { state: { project: activeProject } })}>View Backlog</button>
              <button className="btn board-outline-btn"><FiFilter size={15} /> More Filters</button>
            </div>
          </div>

          <div className="board-filter-row">
            <button className="board-filter-pill">
              <FiUsers size={15} />
              <span>All Assignees</span>
              <FiChevronDown size={15} />
            </button>
            <button className="board-filter-pill">
              <FiTag size={15} />
              <span>All Types</span>
              <FiChevronDown size={15} />
            </button>
          </div>

          <div className="board-columns-scroll">
            <div className="board-columns-track">
              {BOARD_COLUMNS.map((column) => (
                <section key={column.key} className={`board-column board-column-${column.tone}`}>
                  <header className="board-column-head">
                    <div className="board-column-title-wrap">
                      <h2>{column.title}</h2>
                      <span className="board-column-count">{column.issues.length}</span>
                    </div>
                    <button className="board-column-add" aria-label={`Add issue to ${column.title}`}>
                      <FiPlus size={18} />
                    </button>
                  </header>

                  <div className="board-column-body">
                    {column.issues.map((issue) => (
                      <article key={issue.id} className={`board-issue-card board-priority-${issue.priority}`}>
                        <div className="board-issue-key-row">
                          <span className={`board-issue-type board-issue-${issue.type}`}>{issue.typeLabel}</span>
                          <span className="board-issue-key">{issue.id}</span>
                        </div>

                        <h3>{issue.title}</h3>

                        <div className="board-issue-labels">
                          {issue.labels.map((label) => (
                            <span key={label} className="board-issue-label">{label}</span>
                          ))}
                        </div>

                        <div className="board-issue-footer">
                          <span className="board-issue-avatar" title={issue.assignee}>{getInitials(issue.assignee)}</span>
                          <span className="board-issue-points">{issue.points} pts</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
