import { useEffect, useMemo, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import './Dashboard.css'
import './Project.css'
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
  FiArchive,
  FiMoreVertical,
  FiCalendar,
  FiX,
  FiGitBranch,
  FiTag,
  FiPackage,
  FiInfo
} from 'react-icons/fi'

const DEFAULT_PROJECTS = [
  {
    id: 'KPM',
    icon: '🚀',
    name: 'KavyaProMan 360',
    description: 'Enhanced project management system with Jira-like features',
    completedIssues: 1,
    totalIssues: 10,
    teamLead: 'Sarah Johnson',
    createdOn: '15/1/2024',
    isArchived: false,
    projectType: 'Scrum',
    isPrivate: true,
    members: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'],
    initialVersion: 'v1.0.0',
    releasePlan: 'Core features and board workflow rollout'
  },
  {
    id: 'WEB',
    icon: '🌐',
    name: 'Website Redesign',
    description: 'Corporate website modernization project',
    completedIssues: 0,
    totalIssues: 0,
    teamLead: 'Michael Chen',
    createdOn: '1/2/2024',
    isArchived: false,
    projectType: 'Kanban',
    isPrivate: false,
    members: ['Michael Chen', 'David Kim'],
    initialVersion: 'v0.1.0',
    releasePlan: 'Design system and public launch'
  },
  {
    id: 'MOB',
    icon: '📱',
    name: 'Mobile App',
    description: 'Native mobile application development',
    completedIssues: 0,
    totalIssues: 0,
    teamLead: 'Emily Rodriguez',
    createdOn: '20/1/2024',
    isArchived: false,
    projectType: 'Scrum',
    isPrivate: true,
    members: ['Emily Rodriguez', 'Sarah Johnson'],
    initialVersion: 'v0.0.1',
    releasePlan: 'MVP delivery for Android and iOS'
  }
]

const CREATE_TABS = [
  { key: 'Details', icon: FiFolder },
  { key: 'Members', icon: FiUsers },
  { key: 'Workflow', icon: FiGitBranch },
  { key: 'Versions', icon: FiTag },
  { key: 'Releases', icon: FiPackage }
]

const AVAILABLE_ICONS = ['🚀', '💼', '📱', '🎨', '⚙️', '🏗️', '🔬', '📊', '🎯', '💡', '💥', '🔥']
const CLOSED_STATUSES = new Set(['done', 'closed', 'completed', 'resolved'])

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

function setStoredJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(key, JSON.stringify(value))
}

function formatCreatedOn(date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

function normalizeProjectKey(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10)
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim()
}

function normalizeBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') {
      return true
    }
    if (normalized === 'false') {
      return false
    }
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  return fallback
}

function buildStorageKey(selectedOrg) {
  const rawToken = selectedOrg?.id || selectedOrg?.username || selectedOrg?.name || 'default'
  const safeToken = String(rawToken).toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return `kpm_projects_${safeToken}`
}

function normalizeProject(project, fallbackLead) {
  return {
    id: normalizeProjectKey(project?.id || ''),
    icon: project?.icon || '🚀',
    name: (project?.name || '').trim(),
    description: (project?.description || '').trim() || 'No description provided',
    completedIssues: Number.isFinite(project?.completedIssues) ? project.completedIssues : 0,
    totalIssues: Number.isFinite(project?.totalIssues) ? project.totalIssues : 0,
    teamLead: (project?.teamLead || fallbackLead || 'Unassigned').trim(),
    createdOn: project?.createdOn || formatCreatedOn(new Date()),
    isArchived: normalizeBoolean(project?.isArchived, false),
    projectType: project?.projectType === 'Kanban' ? 'Kanban' : 'Scrum',
    isPrivate: normalizeBoolean(project?.isPrivate, true),
    members: Array.isArray(project?.members) ? project.members.filter(Boolean) : [],
    initialVersion: (project?.initialVersion || '').trim(),
    releasePlan: (project?.releasePlan || '').trim()
  }
}

function resolveProjectId(projectText, projects) {
  const normalized = normalizeText(projectText)
  if (!normalized) {
    return null
  }

  for (const project of projects) {
    const key = normalizeText(project.id)
    const name = normalizeText(project.name)
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

function buildIssueCountMap(issues, projects) {
  const map = {}
  issues.forEach((issue) => {
    const projectId = resolveProjectId(issue?.project, projects)
    if (!projectId) {
      return
    }

    if (!map[projectId]) {
      map[projectId] = { total: 0, completed: 0 }
    }

    map[projectId].total += 1
    const status = normalizeText(issue?.status)
    if (CLOSED_STATUSES.has(status)) {
      map[projectId].completed += 1
    }
  })
  return map
}

export default function Project() {
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8080'
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? getStoredJson('user', null) : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const selectedOrg = typeof window !== 'undefined' ? getStoredJson('org', null) : null
  const projectStorageKey = useMemo(() => buildStorageKey(selectedOrg), [selectedOrg])

  const [projects, setProjects] = useState([])
  const [issueCounts, setIssueCounts] = useState({})
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeCreateTab, setActiveCreateTab] = useState('Details')
  const [selectedProjectIcon, setSelectedProjectIcon] = useState('🚀')
  const [selectedProjectType, setSelectedProjectType] = useState('Scrum')
  const [projectName, setProjectName] = useState('')
  const [projectKey, setProjectKey] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectLead, setProjectLead] = useState(displayName)
  const [projectMembers, setProjectMembers] = useState('')
  const [initialVersion, setInitialVersion] = useState('')
  const [releasePlan, setReleasePlan] = useState('')
  const [isPrivateProject, setIsPrivateProject] = useState(true)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [openProjectMenuId, setOpenProjectMenuId] = useState(null)
  const [showArchivedProjects, setShowArchivedProjects] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formError, setFormError] = useState('')
  const notificationCount = useNotificationCount()

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const stored = getStoredJson(projectStorageKey, null)
    if (Array.isArray(stored) && stored.length > 0) {
      setProjects(stored.map((item) => normalizeProject(item, displayName)))
      return
    }

    setProjects(DEFAULT_PROJECTS.map((item) => normalizeProject(item, displayName)))
  }, [projectStorageKey, displayName])

  useEffect(() => {
    if (projects.length === 0) {
      return
    }
    setStoredJson(projectStorageKey, projects)
  }, [projectStorageKey, projects])

  useEffect(() => {
    if (!openProjectMenuId) {
      return undefined
    }

    function handleDocumentClick(event) {
      if (event.target instanceof Element && !event.target.closest('.project-card-menu')) {
        setOpenProjectMenuId(null)
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [openProjectMenuId])

  useEffect(() => {
    let cancelled = false

    async function loadIssueCounts() {
      let issues = []
      try {
        const response = await fetch(`${API_BASE}/api/issues`)
        if (!response.ok) {
          throw new Error('Failed to fetch issues')
        }
        issues = await response.json()
      } catch {
        issues = getStoredJson('myIssues', [])
      }

      if (!cancelled) {
        setIssueCounts(buildIssueCountMap(Array.isArray(issues) ? issues : [], projects))
      }
    }

    if (projects.length > 0) {
      loadIssueCounts()
    }

    return () => {
      cancelled = true
    }
  }, [API_BASE, projects])

  const activeProjects = useMemo(() => projects.filter((project) => !project.isArchived), [projects])
  const archivedProjects = useMemo(() => projects.filter((project) => project.isArchived), [projects])

  const visibleProjects = useMemo(
    () => (showArchivedProjects ? archivedProjects : activeProjects),
    [showArchivedProjects, archivedProjects, activeProjects]
  )

  const filteredProjects = useMemo(() => {
    const query = normalizeText(searchQuery)
    if (!query) {
      return visibleProjects
    }

    return visibleProjects.filter((project) => (
      normalizeText(project.name).includes(query) ||
      normalizeText(project.id).includes(query) ||
      normalizeText(project.description).includes(query) ||
      normalizeText(project.teamLead).includes(query) ||
      normalizeText(project.projectType).includes(query)
    ))
  }, [searchQuery, visibleProjects])

  const normalizedProjectKey = normalizeProjectKey(projectKey)
  const isSaveDisabled = !projectName.trim() || normalizedProjectKey.length < 2

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  function toggleSidebarForScreen() {
    if (typeof window !== 'undefined' && window.innerWidth >= 992) {
      setCollapsed((value) => !value)
    } else {
      setMobileOpen((value) => !value)
    }
  }

  function resetCreateForm() {
    setActiveCreateTab('Details')
    setSelectedProjectIcon('🚀')
    setSelectedProjectType('Scrum')
    setProjectName('')
    setProjectKey('')
    setProjectDescription('')
    setProjectLead(displayName)
    setProjectMembers('')
    setInitialVersion('')
    setReleasePlan('')
    setIsPrivateProject(true)
    setEditingProjectId(null)
    setFormError('')
  }

  function handleOpenCreateModal() {
    resetCreateForm()
    setShowCreateModal(true)
  }

  function handleCloseCreateModal() {
    setShowCreateModal(false)
    resetCreateForm()
  }

  function handleSaveProject() {
    const normalizedName = projectName.trim()
    const normalizedKeyBase = normalizeProjectKey(projectKey)
    const normalizedDescription = projectDescription.trim()
    const normalizedLead = projectLead.trim() || displayName
    const memberList = projectMembers
      .split(',')
      .map((member) => member.trim())
      .filter(Boolean)

    setFormError('')

    if (!normalizedName) {
      setFormError('Project name is required.')
      return
    }

    if (normalizedKeyBase.length < 2) {
      setFormError('Project key must be 2-10 characters using letters and numbers.')
      setActiveCreateTab('Details')
      return
    }

    setProjects((current) => {
      let uniqueKey = normalizedKeyBase
      let suffix = 1

      while (current.some((project) => project.id === uniqueKey && project.id !== editingProjectId)) {
        const suffixText = String(suffix)
        const maxBaseLength = Math.max(2, 10 - suffixText.length)
        uniqueKey = `${normalizedKeyBase.slice(0, maxBaseLength)}${suffixText}`
        suffix += 1
      }

      if (editingProjectId) {
        return current.map((project) => (
          project.id === editingProjectId
            ? {
                ...project,
                id: uniqueKey,
                icon: selectedProjectIcon,
                name: normalizedName,
                description: normalizedDescription || 'No description provided',
                teamLead: normalizedLead,
                projectType: selectedProjectType,
                isPrivate: isPrivateProject,
                members: memberList,
                initialVersion: initialVersion.trim(),
                releasePlan: releasePlan.trim()
              }
            : project
        ))
      }

      const nextProject = normalizeProject({
        id: uniqueKey,
        icon: selectedProjectIcon,
        name: normalizedName,
        description: normalizedDescription,
        completedIssues: 0,
        totalIssues: 0,
        teamLead: normalizedLead,
        createdOn: formatCreatedOn(new Date()),
        isArchived: false,
        projectType: selectedProjectType,
        isPrivate: isPrivateProject,
        members: memberList,
        initialVersion: initialVersion.trim(),
        releasePlan: releasePlan.trim()
      }, displayName)

      return [nextProject, ...current]
    })

    setShowCreateModal(false)
    resetCreateForm()
  }

  function handleEditProject(project) {
    setEditingProjectId(project.id)
    setActiveCreateTab('Details')
    setSelectedProjectIcon(project.icon || '🚀')
    setSelectedProjectType(project.projectType || 'Scrum')
    setProjectName(project.name || '')
    setProjectKey(project.id || '')
    setProjectDescription(project.description || '')
    setProjectLead(project.teamLead || displayName)
    setProjectMembers(Array.isArray(project.members) ? project.members.join(', ') : '')
    setInitialVersion(project.initialVersion || '')
    setReleasePlan(project.releasePlan || '')
    setIsPrivateProject(typeof project.isPrivate === 'boolean' ? project.isPrivate : true)
    setFormError('')
    setShowCreateModal(true)
    setOpenProjectMenuId(null)
  }

  function handleDeleteProject(projectId) {
    const project = projects.find((item) => item.id === projectId)
    const ok = window.confirm(`Delete project "${project?.name || projectId}"? This cannot be undone.`)
    if (!ok) {
      return
    }

    setProjects((current) => current.filter((item) => item.id !== projectId))
    setOpenProjectMenuId(null)
  }

  function handleToggleArchive(projectId) {
    setProjects((current) => current.map((project) => (
      project.id === projectId
        ? { ...project, isArchived: !project.isArchived }
        : project
    )))
    setOpenProjectMenuId(null)
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

  function toggleSidebarForScreen() {
    if (typeof window !== 'undefined' && window.innerWidth >= 992) {
      setCollapsed((value) => !value)
    } else {
      setMobileOpen((value) => !value)
    }
  }

  function isMobileScreen() {
    return typeof window !== 'undefined' && window.innerWidth <= 768
  }

  function renderCreateTabContent() {
    if (activeCreateTab === 'Members') {
      return (
        <>
          <div className="create-field-block">
            <label>
              Project Lead <span>*</span>
            </label>
            <input
              className="create-project-input"
              placeholder="Project lead name"
              value={projectLead}
              onChange={(event) => setProjectLead(event.target.value)}
            />
            <p className="create-input-hint">Set a lead who can guide delivery and ownership.</p>
          </div>

          <div className="create-field-block create-field-block-full">
            <div className="project-settings-card">
              <div className="project-settings-title">
                <FiUsers size={14} />
                <span>Team Members</span>
              </div>
              <textarea
                className="create-project-textarea"
                placeholder="Add members separated by commas"
                value={projectMembers}
                onChange={(event) => setProjectMembers(event.target.value)}
              />
              <p className="create-input-hint">Example: Sarah Johnson, Michael Chen, Emily Rodriguez</p>
            </div>
          </div>
        </>
      )
    }

    if (activeCreateTab === 'Workflow') {
      return (
        <>
          <div className="create-field-block">
            <label>
              Workflow Type <span>*</span>
            </label>
            <div className="project-type-grid">
              <button
                type="button"
                className={`project-type-card ${selectedProjectType === 'Scrum' ? 'selected' : ''}`}
                onClick={() => setSelectedProjectType('Scrum')}
              >
                <div className="project-type-emoji">🏃</div>
                <h4>Scrum</h4>
                <p>Sprint-based development</p>
              </button>
              <button
                type="button"
                className={`project-type-card ${selectedProjectType === 'Kanban' ? 'selected' : ''}`}
                onClick={() => setSelectedProjectType('Kanban')}
              >
                <div className="project-type-emoji">📋</div>
                <h4>Kanban</h4>
                <p>Continuous delivery flow</p>
              </button>
            </div>
          </div>

          <div className="create-field-block">
            <div className="project-settings-card">
              <div className="project-settings-title">
                <FiSettings size={14} />
                <span>Project Settings</span>
              </div>
              <div className="project-private-row">
                <div>
                  <h5>Private Project</h5>
                  <p>Only members can view</p>
                </div>
                <button
                  type="button"
                  className={`project-private-toggle ${isPrivateProject ? 'on' : ''}`}
                  onClick={() => setIsPrivateProject((value) => !value)}
                  aria-label="Toggle private project"
                >
                  <span />
                </button>
              </div>
            </div>
          </div>

          <div className="create-field-block create-field-block-full">
            <div className="project-key-note">
              <div className="project-key-note-icon">
                <FiInfo size={16} />
              </div>
              <div>
                <h5>Workflow</h5>
                <p>Choose the workflow template that best matches how your team plans work.</p>
              </div>
            </div>
          </div>
        </>
      )
    }

    if (activeCreateTab === 'Versions') {
      return (
        <>
          <div className="create-field-block create-field-block-full">
            <label>
              Initial Version
            </label>
            <input
              className="create-project-input"
              placeholder="e.g., v1.0.0"
              value={initialVersion}
              onChange={(event) => setInitialVersion(event.target.value)}
            />
            <p className="create-input-hint">Define the first version for this project.</p>
          </div>

          <div className="create-field-block create-field-block-full">
            <div className="project-key-note">
              <div className="project-key-note-icon">
                <FiInfo size={16} />
              </div>
              <div>
                <h5>Versions</h5>
                <p>Use versions to track milestones and map issues to deliverables.</p>
              </div>
            </div>
          </div>
        </>
      )
    }

    if (activeCreateTab === 'Releases') {
      return (
        <>
          <div className="create-field-block create-field-block-full">
            <label>
              Release Plan
            </label>
            <textarea
              className="create-project-textarea"
              placeholder="Outline release goals, scope, and target timeline..."
              value={releasePlan}
              onChange={(event) => setReleasePlan(event.target.value)}
            />
          </div>

          <div className="create-field-block create-field-block-full">
            <div className="project-key-note">
              <div className="project-key-note-icon">
                <FiInfo size={16} />
              </div>
              <div>
                <h5>Releases</h5>
                <p>Group versions into release cycles to communicate rollout targets clearly.</p>
              </div>
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <div className="create-field-block">
          <label>
            Project Icon
          </label>
          <div className="create-icon-grid">
            {AVAILABLE_ICONS.map((icon) => (
              <button
                type="button"
                key={icon}
                className={`create-icon-btn ${selectedProjectIcon === icon ? 'selected' : ''}`}
                onClick={() => setSelectedProjectIcon(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="create-field-block">
          <label>
            Project Type <span>*</span>
          </label>
          <div className="project-type-grid">
            <button
              type="button"
              className={`project-type-card ${selectedProjectType === 'Scrum' ? 'selected' : ''}`}
              onClick={() => setSelectedProjectType('Scrum')}
            >
              <div className="project-type-emoji">🏃</div>
              <h4>Scrum</h4>
              <p>Sprint-based development</p>
            </button>
            <button
              type="button"
              className={`project-type-card ${selectedProjectType === 'Kanban' ? 'selected' : ''}`}
              onClick={() => setSelectedProjectType('Kanban')}
            >
              <div className="project-type-emoji">📋</div>
              <h4>Kanban</h4>
              <p>Continuous delivery flow</p>
            </button>
          </div>
        </div>

        <div className="create-field-block">
          <label>
            Project Name <span>*</span>
          </label>
          <input
            className="create-project-input"
            placeholder="e.g., Mobile Application Development"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </div>

        <div className="create-field-block">
          <label>
            Project Key <span>*</span>
          </label>
          <input
            className="create-project-input"
            placeholder="e.g., MAD"
            value={projectKey}
            onChange={(event) => setProjectKey(normalizeProjectKey(event.target.value))}
            maxLength={10}
          />
          <p className="create-input-hint">Short identifier for this project (2-10 letters or numbers)</p>
        </div>

        <div className="create-field-block create-field-block-full">
          <label>
            Description
          </label>
          <textarea
            className="create-project-textarea"
            placeholder="Describe what this project is about..."
            value={projectDescription}
            onChange={(event) => setProjectDescription(event.target.value)}
          />
        </div>

        <div className="create-field-block create-field-block-full">
          <div className="project-key-note">
            <div className="project-key-note-icon">
              <FiInfo size={16} />
            </div>
            <div>
              <h5>Project Key</h5>
              <p>The project key will be used for all issues (e.g., KEY-123).</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="project-page-root dashboard-root d-flex">
      <aside className={`sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
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

      {/* mobile toggle button (delegated to global SidebarController) */}
      <button className="mobile-toggle btn btn-sm" aria-label="Toggle sidebar">
        <FiMenu size={18} />
      </button>

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

      <button className="mobile-toggle btn btn-sm" onClick={toggleSidebarForScreen} aria-label="Toggle sidebar">
        <FiMenu size={18} />
      </button>

      <div className={`mobile-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />

      <main className={`content project-content flex-grow-1 p-4 ${collapsed ? 'with-topbar' : ''}`}>
        <header className="project-top-strip">
          <div className={`top-search-row ${mobileSearchOpen ? 'mobile-search-open' : ''}`}>
            <div
              className={`input-group top-search-medium ${mobileSearchOpen ? 'mobile-open' : ''}`}
              onClick={() => {
                if (isMobileScreen() && !mobileSearchOpen) setMobileSearchOpen(true)
              }}
            >
              <span className="input-group-text"><FiSearch /></span>
              <input
                className="form-control"
                placeholder="Search projects by name, key, lead, type..."
                aria-label="Search projects"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <button className={`btn btn-link me-2 bell-black ${notificationCount > 0 ? 'has-notifications' : ''}`} title="Notifications">
              <FiBell size={20} />
            </button>

            <button className="btn create-issue-medium" onClick={() => navigate('/dashboard')}>
              <FiPlus className="me-1" /> Create Issue
            </button>
          </div>
        </header>

        <section className="projects-shell">
          <div className="projects-header">
            <div className="projects-title">
              <h1>Projects</h1>
              <p>Manage and track your team projects</p>
            </div>

            <div className="projects-actions">
              <button className="btn project-outline-btn" onClick={() => setShowArchivedProjects((value) => !value)}>
                <FiArchive className="me-2" />
                {showArchivedProjects ? `View Active (${activeProjects.length})` : `View Archived (${archivedProjects.length})`}
              </button>
              <button className="btn create-issue-medium" onClick={handleOpenCreateModal}>
                <FiPlus className="me-1" /> Create Project
              </button>
            </div>
          </div>

          <div className="projects-banner">
            <span className="projects-banner-dot" />
            <span>
              Showing {filteredProjects.length} of {visibleProjects.length} {showArchivedProjects ? 'archived' : 'active'} projects
            </span>
          </div>

          <div className="projects-grid">
            {filteredProjects.length === 0 ? (
              <div className="projects-empty-state">
                {searchQuery.trim()
                  ? 'No projects matched your search.'
                  : showArchivedProjects
                    ? 'No archived projects available right now.'
                    : 'No active projects available right now.'}
              </div>
            ) : filteredProjects.map((project) => {
              const issueSummary = issueCounts[project.id]
              const completedIssues = issueSummary ? issueSummary.completed : project.completedIssues
              const totalIssues = issueSummary ? issueSummary.total : project.totalIssues
              const progress = totalIssues > 0 ? Math.min(100, (completedIssues / totalIssues) * 100) : 0

              return (
                <article className="project-card-panel" key={project.id}>
                  <div className="project-card-head">
                    <div className="project-card-title-wrap">
                      <div className="project-emoji">{project.icon}</div>
                      <div>
                        <h3 className="project-card-title">{project.name}</h3>
                        <p className="project-card-code">{project.id}</p>
                      </div>
                    </div>

                    <div className="project-card-menu">
                      <button
                        className="project-menu-btn"
                        aria-label={`More actions for ${project.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setOpenProjectMenuId((current) => (current === project.id ? null : project.id))
                        }}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                      {openProjectMenuId === project.id ? (
                        <div className="project-menu-dropdown" role="menu" aria-label={`Actions for ${project.name}`}>
                          <button className="project-menu-item" onClick={() => handleEditProject(project)}>Edit</button>
                          <button className="project-menu-item" onClick={() => handleToggleArchive(project.id)}>
                            {project.isArchived ? 'Unarchive' : 'Archive'}
                          </button>
                          <button className="project-menu-item danger" onClick={() => handleDeleteProject(project.id)}>Delete</button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <p className="project-card-description">{project.description}</p>

                  <div className="project-progress-head">
                    <span>Progress</span>
                    <strong>{completedIssues}/{totalIssues} issues</strong>
                  </div>
                  <div className="project-progress-track">
                    <div className="project-progress-fill" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="project-meta-row">
                    <FiUsers size={15} />
                    <span>Team lead: {project.teamLead}</span>
                  </div>
                  <div className="project-meta-row">
                    <FiCalendar size={15} />
                    <span>Created {project.createdOn}</span>
                  </div>
                  <div className="project-meta-row">
                    <FiGitBranch size={15} />
                    <span>{project.projectType} • {project.isPrivate ? 'Private' : 'Public'}</span>
                  </div>

                  <div className="project-card-actions">
                    <button className="project-action-btn" onClick={() => navigate(`/projects/${project.id}/board`, { state: { project } })}>Board</button>
                    <button className="project-action-btn" onClick={() => navigate(`/projects/${project.id}/backlog`, { state: { project } })}>Backlog</button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      {showCreateModal && (
        <div className="create-project-overlay" onClick={handleCloseCreateModal}>
          <div className="create-project-modal" onClick={(event) => event.stopPropagation()}>
            <div className="create-project-header">
              <div>
                <h2>{editingProjectId ? 'Edit Project' : 'Create New Project'}</h2>
                <p>{editingProjectId ? 'Update project details and workflow settings' : 'Set up a new project with team members and workflow'}</p>
              </div>
              <button
                type="button"
                className="create-project-close"
                onClick={handleCloseCreateModal}
                aria-label="Close create project dialog"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="create-project-tabs">
              {CREATE_TABS.map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    type="button"
                    key={tab.key}
                    className={`create-tab-btn ${activeCreateTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveCreateTab(tab.key)}
                  >
                    <TabIcon size={15} />
                    <span>{tab.key}</span>
                  </button>
                )
              })}
            </div>

            <div className="create-project-body">
              {renderCreateTabContent()}
            </div>

            {formError ? (
              <div className="create-project-error" role="alert">{formError}</div>
            ) : null}

            <div className="create-project-footer">
              <button type="button" className="create-cancel-btn" onClick={handleCloseCreateModal}>Cancel</button>
              <button type="button" className="create-save-btn" onClick={handleSaveProject} disabled={isSaveDisabled}>
                {editingProjectId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
