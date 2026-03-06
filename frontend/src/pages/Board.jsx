import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import './Dashboard.css'
import './Board.css'
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
  FiFilter,
  FiChevronDown,
  FiTag,
  FiX
} from 'react-icons/fi'

const BOARD_COLUMNS = [
  {
    key: 'todo',
    title: 'To Do',
    tone: 'todo'
  },
  {
    key: 'progress',
    title: 'In Progress',
    tone: 'progress'
  },
  {
    key: 'review',
    title: 'In Review',
    tone: 'review'
  },
  {
    key: 'done',
    title: 'Done',
    tone: 'done'
  }
]

const ISSUE_TYPE_ICONS = {
  bug: '🐞',
  story: '📘',
  task: '☑',
  epic: '⚡',
  spike: '🧪',
  'sub-task': '↳'
}

const STATUS_TO_COLUMN = {
  todo: 'todo',
  open: 'todo',
  backlog: 'todo',
  progress: 'progress',
  'in progress': 'progress',
  review: 'review',
  'in review': 'review',
  done: 'done',
  closed: 'done',
  completed: 'done',
  resolved: 'done'
}

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
  if (normalized === 'task') {
    return 'task'
  }
  if (normalized === 'epic') {
    return 'epic'
  }
  if (normalized === 'spike') {
    return 'spike'
  }
  if (normalized === 'sub-task' || normalized === 'subtask') {
    return 'sub-task'
  }
  return 'task'
}

function resolveColumnKey(issue) {
  const status = normalizeText(issue?.status || issue?.state)
  return STATUS_TO_COLUMN[status] || 'todo'
}

function getIssuePriority(issue) {
  const difficulty = normalizeText(issue?.difficulty)
  if (difficulty === 'high') {
    return 'critical'
  }
  if (difficulty === 'medium') {
    return 'high'
  }
  if (difficulty === 'low') {
    return 'low'
  }
  return 'medium'
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

function cycleFilterValue(current, options) {
  const normalizedCurrent = normalizeText(current)
  const currentIndex = options.findIndex((option) => normalizeText(option) === normalizedCurrent)
  if (currentIndex < 0 || currentIndex === options.length - 1) {
    return options[0]
  }
  return options[currentIndex + 1]
}

function formatTypeLabel(type) {
  if (type === 'sub-task') {
    return 'Sub-task'
  }
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Board() {
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
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
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

  const assigneeOptions = useMemo(() => {
    const set = new Set()
    issues.forEach((issue) => {
      const assignee = String(issue?.creatorName || issue?.assignee || 'Unassigned').trim()
      if (assignee) {
        set.add(assignee)
      }
    })
    return Array.from(set)
  }, [issues])

  const typeOptions = useMemo(() => {
    const set = new Set()
    issues.forEach((issue) => {
      set.add(normalizeIssueType(issue?.issueType || issue?.type))
    })
    return Array.from(set)
  }, [issues])

  const boardColumns = useMemo(() => {
    const columns = BOARD_COLUMNS.map((column) => ({
      ...column,
      issues: []
    }))
    const map = new Map(columns.map((column) => [column.key, column]))

    issues.forEach((issue, index) => {
      const type = normalizeIssueType(issue?.issueType || issue?.type)
      const columnKey = resolveColumnKey(issue)
      const column = map.get(columnKey) || map.get('todo')
      const issueKey = buildIssueKey(issue, activeProject.id, index)
      const summary = String(issue?.summary || issue?.title || 'Untitled issue').trim()
      const difficulty = normalizeText(issue?.difficulty)
      const labels = [type]
      if (difficulty) {
        labels.push(difficulty)
      }

      const assignee = issue?.creatorName || issue?.assignee || 'Unassigned'
      if (normalizeText(assigneeFilter) !== 'all' && normalizeText(assignee) !== normalizeText(assigneeFilter)) {
        return
      }

      if (typeFilter !== 'all' && type !== typeFilter) {
        return
      }

      column.issues.push({
        id: issueKey,
        type,
        typeLabel: ISSUE_TYPE_ICONS[type] || ISSUE_TYPE_ICONS.task,
        title: summary,
        labels,
        assignee,
        points: getIssuePoints(issue),
        priority: getIssuePriority(issue)
      })
    })

    return columns
  }, [issues, activeProject.id, assigneeFilter, typeFilter])

  function handleCreateIssue() {
    navigate('/dashboard')
  }

  function handleResetFilters() {
    setAssigneeFilter('all')
    setTypeFilter('all')
  }
  const activeFilterCount =
    selectedFilters.status.length +
    selectedFilters.type.length +
    selectedFilters.priority.length +
    selectedFilters.assignee.length +
    selectedFilters.label.length
  const unreadCount = notifications.filter((item) => !item.read).length

  const allAssignees = useMemo(() => (
    [...new Set(BOARD_COLUMNS.flatMap((column) => column.issues.map((issue) => issue.assignee)))]
  ), [])
  const allTypes = useMemo(() => (
    [...new Set(BOARD_COLUMNS.flatMap((column) => column.issues.map((issue) => issue.type)))]
  ), [])

  const allLabels = useMemo(() => (
    [...new Set(BOARD_COLUMNS.flatMap((column) => column.issues.flatMap((issue) => issue.labels)))]
  ), [])

  const filteredColumns = useMemo(() => {
    const hasStatusFilter = selectedFilters.status.length > 0

    return BOARD_COLUMNS
      .filter((column) => !hasStatusFilter || selectedFilters.status.includes(column.key))
      .map((column) => ({
        ...column,
        issues: column.issues.filter((issue) => {
          const typeMatch = !selectedFilters.type.length || selectedFilters.type.includes(issue.type)
          const priorityMatch = !selectedFilters.priority.length || selectedFilters.priority.includes(issue.priority)
          const assigneeMatch = !selectedFilters.assignee.length || selectedFilters.assignee.includes(issue.assignee)
          const labelMatch = !selectedFilters.label.length || issue.labels.some((label) => selectedFilters.label.includes(label))
          return typeMatch && priorityMatch && assigneeMatch && labelMatch
        })
      }))
  }, [selectedFilters])

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target)) {
        setShowAssigneeDropdown(false)
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function toggleFilter(group, value) {
    setSelectedFilters((current) => {
      const exists = current[group].includes(value)
      return {
        ...current,
        [group]: exists
          ? current[group].filter((item) => item !== value)
          : [...current[group], value]
      }
    })
  }

  function clearAllFilters() {
    setSelectedFilters(createEmptyFilters())
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

  function formatTypeLabel(type) {
    if (!type) return ''
    return type.charAt(0).toUpperCase() + type.slice(1)
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

            <button className={`btn btn-link me-2 bell-black ${notificationCount > 0 ? 'has-notifications' : ''}`} title="Notifications" onClick={() => navigate('/all-my-issues')}>
              <FiBell size={20} />
            </button>

            <button className="btn create-issue-medium" onClick={handleCreateIssue}>
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
              <h1>{activeProject.name} Board</h1>
            </div>
            <div className="board-title-actions">
              <button className="btn create-issue-medium" onClick={handleCreateIssue}>
                <FiPlus className="me-1" /> Create Issue
              </button>
              <button className="btn board-outline-btn" onClick={() => navigate(`/projects/${activeProject.id}/backlog`, { state: { project: activeProject } })}>View Backlog</button>
              <button className="btn board-outline-btn" onClick={handleResetFilters}><FiFilter size={15} /> Reset Filters</button>
            </div>
          </div>

          <div className="board-filter-row">
            <button
              className="board-filter-pill"
              onClick={() => setAssigneeFilter((current) => cycleFilterValue(current, ['all', ...assigneeOptions]))}
            >
              <FiUsers size={15} />
              <span>{assigneeFilter === 'all' ? 'All Assignees' : assigneeFilter}</span>
              <FiChevronDown size={15} />
            </button>
            <button
              className="board-filter-pill"
              onClick={() => setTypeFilter((current) => cycleFilterValue(current, ['all', ...typeOptions]))}
            >
              <FiTag size={15} />
              <span>{typeFilter === 'all' ? 'All Types' : formatTypeLabel(typeFilter)}</span>
              <FiChevronDown size={15} />
            </button>
          </div>

          {showFilters && (
            <div className="filters-modal-overlay" onClick={() => setShowFilters(false)}>
              <div className="filters-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="filters-modal-header d-flex align-items-start">
                  <div>
                    <h5><FiFilter className="me-2" /> Board Filters</h5>
                    <p className="muted">Refine visible cards by status, type, assignee, priority, and labels.</p>
                  </div>
                  <button className="btn modal-close" onClick={() => setShowFilters(false)} aria-label="Close">
                    <FiX size={18} />
                  </button>
                </div>

                <div className="filters-body">
                  <div className="filters-grid">
                    <div className="filters-column">
                      <div className="filter-section">
                        <h6>Status</h6>
                        <div className="filter-list">
                          <label><input type="checkbox" checked={selectedFilters.status.includes('todo')} onChange={() => toggleFilter('status', 'todo')} /> To Do</label>
                          <label><input type="checkbox" checked={selectedFilters.status.includes('progress')} onChange={() => toggleFilter('status', 'progress')} /> In Progress</label>
                          <label><input type="checkbox" checked={selectedFilters.status.includes('review')} onChange={() => toggleFilter('status', 'review')} /> In Review</label>
                          <label><input type="checkbox" checked={selectedFilters.status.includes('done')} onChange={() => toggleFilter('status', 'done')} /> Done</label>
                        </div>
                      </div>

                      <div className="filter-section">
                        <h6>Issue Type</h6>
                        <div className="filter-list">
                          <label><input type="checkbox" checked={selectedFilters.type.includes('story')} onChange={() => toggleFilter('type', 'story')} /> Story</label>
                          <label><input type="checkbox" checked={selectedFilters.type.includes('task')} onChange={() => toggleFilter('type', 'task')} /> Task</label>
                          <label><input type="checkbox" checked={selectedFilters.type.includes('bug')} onChange={() => toggleFilter('type', 'bug')} /> Bug</label>
                        </div>
                      </div>
                    </div>

                    <div className="filters-column">
                      <div className="filter-section">
                        <h6>Priority</h6>
                        <div className="filter-list priority-list">
                          <label><input type="checkbox" checked={selectedFilters.priority.includes('critical')} onChange={() => toggleFilter('priority', 'critical')} /><span className="dot dot-red" /> Critical</label>
                          <label><input type="checkbox" checked={selectedFilters.priority.includes('high')} onChange={() => toggleFilter('priority', 'high')} /><span className="dot dot-orange" /> High</label>
                          <label><input type="checkbox" checked={selectedFilters.priority.includes('medium')} onChange={() => toggleFilter('priority', 'medium')} /><span className="dot dot-yellow" /> Medium</label>
                          <label><input type="checkbox" checked={selectedFilters.priority.includes('low')} onChange={() => toggleFilter('priority', 'low')} /><span className="dot dot-green" /> Low</label>
                        </div>
                      </div>

                      <div className="filter-section">
                        <h6>Assignee</h6>
                        <div className="filter-list">
                          {allAssignees.map((assignee) => (
                            <label key={assignee}>
                              <input type="checkbox" checked={selectedFilters.assignee.includes(assignee)} onChange={() => toggleFilter('assignee', assignee)} /> {assignee}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="filter-section">
                    <h6>Labels</h6>
                    <div className="filter-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                      {allLabels.map((label) => (
                        <label key={label}>
                          <input type="checkbox" checked={selectedFilters.label.includes(label)} onChange={() => toggleFilter('label', label)} /> {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="filters-modal-footer d-flex align-items-center">
                  <button className="link-clear" onClick={clearAllFilters} type="button">Clear All Filters</button>
                  <div className="ms-auto d-flex gap-3">
                    <button className="btn btn-outline-secondary" onClick={() => setShowFilters(false)}>Close</button>
                    <button className="btn save-filter" onClick={() => setShowFilters(false)} type="button">Apply Filters</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="board-columns-scroll">
            <div className="board-columns-track">
              {boardColumns.map((column) => (
                <section key={column.key} className={`board-column board-column-${column.tone}`}>
                  <header className="board-column-head">
                    <div className="board-column-title-wrap">
                      <h2>{column.title}</h2>
                      <span className="board-column-count">{column.issues.length}</span>
                    </div>
                    <button className="board-column-add" aria-label={`Add issue to ${column.title}`} onClick={handleCreateIssue}>
                      <FiPlus size={18} />
                    </button>
                  </header>

                  <div className="board-column-body">
                    {column.issues.length === 0 ? (
                      <div className="board-column-empty">No issues in this column.</div>
                    ) : column.issues.map((issue) => (
                      <article key={issue.id} className={`board-issue-card board-priority-${issue.priority}`}>
                        <div className="board-issue-key-row">
                          <span className={`board-issue-type board-issue-${issue.type}`}>{issue.typeLabel}</span>
                          <span className="board-issue-key">{issue.id}</span>
                        </div>

                        <h3>{issue.title}</h3>

                        <div className="board-issue-labels">
                          {issue.labels.map((label) => (
                            <span key={`${issue.id}-${label}`} className="board-issue-label">{label}</span>
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
