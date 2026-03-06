import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import './Dashboard.css'
import './Backlog.css'
import useNotificationCount from '../hooks/useNotificationCount'
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
  FiPlayCircle,
  FiBookOpen,
  FiAlertCircle,
  FiCheckSquare,
  FiZap
} from 'react-icons/fi'

const DONE_STATUSES = new Set(['done', 'closed', 'completed', 'resolved'])
const ACTIVE_STATUSES = new Set(['progress', 'in progress', 'review', 'in review'])

function safeJsonParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function getStoredJson(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const raw = localStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  return safeJsonParse(raw, fallback)
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeProjectKey(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10)
}

function buildStorageKey(selectedOrg) {
  const rawToken = selectedOrg?.id || selectedOrg?.username || selectedOrg?.name || 'default'
  const safeToken = String(rawToken).toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return `kpm_projects_${safeToken}`
}

function resolveProjectId(projectText, projects) {
  const normalized = normalizeText(projectText)
  if (!normalized) {
    return null
  }

  for (const project of projects) {
    const key = normalizeText(project?.id)
    const name = normalizeText(project?.name)
    if (
      normalized === key ||
      normalized === name ||
      normalized.includes(`(${key})`) ||
      normalized.startsWith(`${key}-`) ||
      normalized.includes(name)
    ) {
      return project.id
    }
  }

  return null
}

function normalizeIssueType(value) {
  const normalized = normalizeText(value)
  if (normalized === 'bug') {
    return 'bug'
  }
  if (normalized === 'story') {
    return 'story'
  }
  if (normalized === 'spike') {
    return 'spike'
  }
  return 'task'
}

function getIssuePoints(issue) {
  const difficulty = normalizeText(issue?.difficulty)
  if (difficulty === 'high') {
    return 8
  }
  if (difficulty === 'medium') {
    return 5
  }
  if (difficulty === 'low') {
    return 3
  }
  return 2
}

function buildIssueKey(issue, projectId, index) {
  const rawId = String(issue?.id || '').trim()
  if (/^[A-Z0-9]+-\d+$/i.test(rawId)) {
    return rawId.toUpperCase()
  }
  if (/^\d+$/.test(rawId)) {
    return `${projectId}-${rawId}`
  }
  return `${projectId}-${index + 1}`
}

function resolveStatusBucket(issue) {
  const status = normalizeText(issue?.status || issue?.state)
  if (ACTIVE_STATUSES.has(status)) {
    return 'active'
  }
  if (DONE_STATUSES.has(status)) {
    return 'done'
  }
  return 'backlog'
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function renderIssueIcon(type) {
  if (type === 'bug') {
    return <FiAlertCircle />
  }

  if (type === 'story') {
    return <FiBookOpen />
  }

  if (type === 'spike') {
    return <FiZap />
  }

  return <FiCheckSquare />
}

export default function Backlog() {
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8080'
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams()
  const user = typeof window !== 'undefined' ? getStoredJson('user', null) : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const selectedOrg = typeof window !== 'undefined' ? getStoredJson('org', null) : null
  const projectStorageKey = useMemo(() => buildStorageKey(selectedOrg), [selectedOrg])
  const [collapsed, setCollapsed] = useState(false)
  const [projects, setProjects] = useState([])
  const [issues, setIssues] = useState([])
  const [manualActiveIssueIds, setManualActiveIssueIds] = useState([])
  const notificationCount = useNotificationCount()
  const projectFromState = location.state?.project

  useEffect(() => {
    const storedProjects = getStoredJson(projectStorageKey, [])
    setProjects(Array.isArray(storedProjects) ? storedProjects : [])
  }, [projectStorageKey])

  const activeProject = useMemo(() => {
    if (projectFromState?.id) {
      return {
        ...projectFromState,
        id: normalizeProjectKey(projectFromState.id),
        name: projectFromState.name || projectFromState.id
      }
    }

    const normalizedRouteId = normalizeProjectKey(projectId || '')
    const projectFromStorage = projects.find((project) => normalizeProjectKey(project?.id) === normalizedRouteId)

    if (projectFromStorage) {
      return {
        ...projectFromStorage,
        id: normalizeProjectKey(projectFromStorage.id),
        name: projectFromStorage.name || projectFromStorage.id
      }
    }

    return {
      id: normalizedRouteId || 'KPM',
      name: normalizedRouteId || 'Project'
    }
  }, [projectFromState, projectId, projects])

  useEffect(() => {
    let cancelled = false

    async function loadIssues() {
      let allIssues = []
      try {
        const response = await fetch(`${API_BASE}/api/issues`)
        if (!response.ok) {
          throw new Error('Failed to fetch issues')
        }
        allIssues = await response.json()
      } catch {
        allIssues = getStoredJson('myIssues', [])
      }

      const issueList = Array.isArray(allIssues) ? allIssues : []
      const filtered = issueList.filter((issue) => {
        const resolvedId = resolveProjectId(issue?.project, projects)
        if (resolvedId) {
          return normalizeProjectKey(resolvedId) === activeProject.id
        }

        const issueProject = normalizeText(issue?.project)
        return (
          issueProject === normalizeText(activeProject.id) ||
          issueProject === normalizeText(activeProject.name)
        )
      })

      if (!cancelled) {
        setIssues(filtered)
      }
    }

    if (activeProject?.id) {
      loadIssues()
    }

    return () => {
      cancelled = true
    }
  }, [API_BASE, activeProject.id, activeProject.name, projects])

  const normalizedIssues = useMemo(() => (
    issues.map((issue, index) => {
      const type = normalizeIssueType(issue?.issueType || issue?.type)
      const key = buildIssueKey(issue, activeProject.id, index)
      const summary = String(issue?.summary || issue?.title || 'Untitled issue').trim()
      const difficulty = normalizeText(issue?.difficulty)
      const labels = [type]
      if (difficulty) {
        labels.push(difficulty)
      }

      return {
        id: key,
        type,
        title: summary,
        labels,
        points: getIssuePoints(issue),
        assignee: issue?.creatorName || issue?.assignee || 'Unassigned',
        statusBucket: resolveStatusBucket(issue)
      }
    })
  ), [issues, activeProject.id])

  const activeSprintIssues = useMemo(() => {
    const explicitActive = normalizedIssues.filter((issue) => issue.statusBucket === 'active')
    if (explicitActive.length > 0) {
      return explicitActive
    }

    if (manualActiveIssueIds.length > 0) {
      const manualIds = new Set(manualActiveIssueIds)
      return normalizedIssues.filter((issue) => manualIds.has(issue.id))
    }

    return normalizedIssues.slice(0, 5)
  }, [normalizedIssues, manualActiveIssueIds])

  const upcomingBacklogIssues = useMemo(() => {
    const explicitBacklog = normalizedIssues.filter((issue) => issue.statusBucket === 'backlog')
    const activeIds = new Set(activeSprintIssues.map((issue) => issue.id))
    if (explicitBacklog.length > 0) {
      return explicitBacklog.filter((issue) => !activeIds.has(issue.id))
    }

    return normalizedIssues.filter((issue) => !activeIds.has(issue.id))
  }, [normalizedIssues, activeSprintIssues])

  function handleCreateIssue() {
    navigate('/dashboard')
  }

  function handleStartSprint() {
    if (upcomingBacklogIssues.length === 0) {
      return
    }

    setManualActiveIssueIds(upcomingBacklogIssues.slice(0, 5).map((issue) => issue.id))
  }

  function handleCompleteSprint() {
    setManualActiveIssueIds([])
  }
  const unreadCount = notifications.filter((item) => !item.read).length

  useEffect(() => {
    function handleOutsideClick(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  function toggleNotifications() {
    setShowNotifications((value) => !value)
  }

  function markNotificationRead(id) {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  function markAllNotificationsRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }

  return (
    <div className="backlog-page-root dashboard-root d-flex">
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

      <main className={`content backlog-content flex-grow-1 p-4 ${collapsed ? 'with-topbar' : ''}`}>
        <header className="backlog-top-strip">
          <div className="top-search-row">
            <div className="input-group top-search-medium">
              <span className="input-group-text"><FiSearch /></span>
              <input className="form-control" placeholder="Search issues, projects..." aria-label="Search issues and projects" />
            </div>

            <button className={`btn btn-link me-2 bell-black ${notificationCount > 0 ? 'has-notifications' : ''}`} title="Notifications" onClick={() => navigate('/all-my-issues')}>
              <FiBell size={20} />
            </button>

            <button className="btn create-issue-medium" onClick={handleCreateIssue}>
              <FiPlus className="me-1" /> Create Issue
            </button>
          </div>
        </header>

        <section className="backlog-shell">
          <div className="backlog-breadcrumb">
            <span>Projects</span>
            <span>/</span>
            <span>{activeProject.name}</span>
          </div>

          <div className="backlog-title-row">
            <h1>Backlog</h1>
            <div className="backlog-title-actions">
              <button className="btn backlog-outline-btn" onClick={() => navigate(`/projects/${activeProject.id}/board`, { state: { project: activeProject } })}>
                View Board
              </button>
              <button className="btn create-issue-medium" onClick={handleCreateIssue}>
                <FiPlus className="me-1" /> Create Issue
              </button>
            </div>
          </div>

          <article className="backlog-sprint-card">
            <div className="backlog-sprint-head">
              <div className="backlog-sprint-left">
                <span className="backlog-sprint-icon"><FiPlayCircle size={18} /></span>
                <div>
                  <div className="backlog-sprint-title-row">
                    <h2>{activeProject.name} - Current Sprint</h2>
                    <span className="backlog-active-pill">ACTIVE</span>
                  </div>
                  <p>{activeSprintIssues.length} active issues for this project.</p>
                </div>
              </div>
              <button className="btn backlog-outline-btn" onClick={handleCompleteSprint}>Complete Sprint</button>
            </div>

            <div className="backlog-issue-list">
              {activeSprintIssues.length === 0 ? (
                <div className="backlog-inline-empty">No active sprint issues yet.</div>
              ) : activeSprintIssues.map((issue) => (
                <div key={issue.id} className="backlog-issue-row">
                  <div className="backlog-issue-main">
                    <span className={`backlog-issue-type backlog-type-${issue.type}`}>
                      {renderIssueIcon(issue.type)}
                    </span>
                    <span className="backlog-issue-key">{issue.id}</span>
                    <span className="backlog-issue-title">{issue.title}</span>
                  </div>
                  <div className="backlog-issue-meta">
                    {issue.labels.map((label) => (
                      <span key={label} className="backlog-label-pill">{label}</span>
                    ))}
                    <span className="backlog-points-pill">{issue.points} pts</span>
                    <span className="backlog-avatar">{getInitials(issue.assignee)}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="backlog-next-sprint-card">
            <div className="backlog-next-sprint-head">
              <div>
                <h2>Next Sprint</h2>
                <p>Issues not in the active sprint can be planned here.</p>
              </div>
              <button className="btn backlog-outline-btn" onClick={handleStartSprint}>Start Sprint</button>
            </div>
            <div className="backlog-empty-state">
              {upcomingBacklogIssues.length === 0 ? 'No issues in next sprint' : `${upcomingBacklogIssues.length} issues available in backlog`}
            </div>
          </article>

          <article className="backlog-pool-card">
            <div className="backlog-pool-head">
              <h2>Backlog</h2>
              <p>{upcomingBacklogIssues.length} issues • Drag issues to sprints to plan your work</p>
            </div>

            <div className="backlog-issue-list backlog-pool-list">
              {upcomingBacklogIssues.length === 0 ? (
                <div className="backlog-inline-empty">No backlog issues for this project.</div>
              ) : upcomingBacklogIssues.map((issue) => (
                <div key={issue.id} className="backlog-issue-row backlog-pool-row">
                  <div className="backlog-issue-main">
                    <span className={`backlog-issue-type backlog-type-${issue.type}`}>
                      {renderIssueIcon(issue.type)}
                    </span>
                    <span className="backlog-issue-key">{issue.id}</span>
                    <span className="backlog-issue-title">{issue.title}</span>
                  </div>
                  <div className="backlog-issue-meta">
                    {issue.labels.map((label) => (
                      <span key={label} className="backlog-label-pill">{label}</span>
                    ))}
                    {issue.points ? <span className="backlog-points-pill">{issue.points} pts</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
