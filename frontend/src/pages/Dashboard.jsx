import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import { FiGrid, FiFolder, FiUsers, FiBarChart2, FiCreditCard, FiSettings, FiLogOut, FiMenu, FiSearch, FiBell, FiPlus, FiUser, FiShare2, FiDownload, FiTrash2, FiFilter, FiBookmark, FiClock, FiRepeat, FiArrowRight, FiUpload, FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

export default function Dashboard() {
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8080'
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const selectedOrg = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('org') || 'null') : null
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [project, setProject] = useState('KavyaProMan 360')
  const [issueType, setIssueType] = useState('Story')
  const [epicName, setEpicName] = useState('')
  const [summary, setSummary] = useState('')
  const [errors, setErrors] = useState({})
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium')
  const fileInputRef = useRef(null)
  // convert File -> data URL and store with metadata so files can be opened later
  function fileToDataUrl(file){
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = ()=> res({ name: file.name, size: file.size, type: file.type, data: reader.result })
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }
  async function handleAddFiles(files){
    const arr = Array.from(files || [])
    if(arr.length === 0) return
    try{
      const converted = await Promise.all(arr.map(f => fileToDataUrl(f)))
      setAttachments(prev => [...prev, ...converted])
    }catch(err){ console.error('file read error', err) }
    if(fileInputRef.current) fileInputRef.current.value = ''
  }
  async function downloadAttachment(file){
    try{
      // fetch data URL and trigger download with proper filename
      const res = await fetch(file.data)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name || 'download'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=> URL.revokeObjectURL(url), 1500)
    }catch(err){
      console.error('download failed', err)
      // fallback: try opening in new tab
      window.open(file.data, '_blank', 'noopener')
    }
  }
  function handleRemoveAttachment(idx){
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }
  
  function validateForm(){
    const desc = descRef.current ? descRef.current.innerText.trim() : ''
    const errs = {}
    if(!project || project.trim() === '') errs.project = 'Project is required'
    if(!issueType || issueType.trim() === '') errs.issueType = 'Issue type is required'
    if(issueType === 'Epic' && (!epicName || epicName.trim() === '')) errs.epicName = 'Epic name is required for Epics'
    if(!summary || summary.trim() === '') errs.summary = 'Summary is required'
    // optional: require at least some description or attachments
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleCreate(e){
    e?.preventDefault()
    if(!validateForm()) return
    const payload = {
      project,
      issueType,
      epicName,
      summary,
      description: descRef.current?.innerHTML || '',
      // attachments already include data URLs produced when added
      attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type, data: f.data })),
      creatorName: user?.name || '',
      creatorEmail: user?.email || '',
      attachmentsJson: JSON.stringify(attachments.map(f => ({ name: f.name, size: f.size, type: f.type, data: f.data }))),
      difficulty: selectedDifficulty,
      createdAt: new Date().toISOString()
    }
    // send to backend API; if backend fails, fallback to localStorage
    try{
      const res = await fetch(`${API_BASE}/api/issues`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      if(!res.ok) throw new Error('server error')
    }catch(err){
      console.warn('backend save failed, saving locally', err)
      try{
        const raw = localStorage.getItem('myIssues')
        const arr = raw ? JSON.parse(raw) : []
        arr.push(payload)
        localStorage.setItem('myIssues', JSON.stringify(arr))
      }catch(err2){ console.error('failed to save issue locally', err2) }
    }
    // navigate to AllMyIssues page to view created issue
    setShowCreate(false)
    setEpicName('')
    setSummary('')
    if(descRef.current) descRef.current.innerHTML = ''
    setAttachments([])
    setErrors({})
    // navigate to the AllMyIssues page
    navigate('/all-my-issues')
  }
  const descRef = useRef(null)
  const [totalIssues, setTotalIssues] = useState(0)
  const [difficultyCounts, setDifficultyCounts] = useState({ High:0, Medium:0, Low:0 })

  // load counts for dashboard summary
  useEffect(()=>{
    async function loadCounts(){
      try{
        const res = await fetch(`${API_BASE}/api/issues`)
        if(!res.ok) throw new Error('failed to fetch')
        const data = await res.json()
        const parsed = data.map(d => ({ ...d }))
        setTotalIssues(parsed.length)
        const counts = { High:0, Medium:0, Low:0 }
        parsed.forEach(it => {
          const diff = (it.difficulty || '').toString()
          if(diff.toLowerCase()==='high') counts.High++
          else if(diff.toLowerCase()==='medium') counts.Medium++
          else if(diff.toLowerCase()==='low') counts.Low++
        })
        setDifficultyCounts(counts)
      }catch(e){ console.error('load dashboard counts failed', e) }
    }
    loadCounts()
  },[])

  function handleLogout() {
    // clear user and force replace to login so back won't return to protected page
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  function toggleSidebarForScreen() {
    if (typeof window !== 'undefined' && window.innerWidth >= 992) {
      setCollapsed(s => !s)
    } else {
      setMobileOpen(s => !s)
    }
  }

  return (
    <div className="dashboard-root d-flex">
      <aside className={`sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
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

      {/* floating toggle (uses same button for large and small screens) - removed separate floating button */}

      {/* mobile toggle (visible on small/medium screens) - also toggles collapsed on large screens */}
      <button className="mobile-toggle btn btn-sm" onClick={toggleSidebarForScreen} aria-label="Toggle sidebar">
        <FiMenu size={18} />
      </button>

      <div className={`mobile-overlay ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />

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

              <button className="btn create-issue-medium" onClick={() => setShowCreate(true)}>
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
                        <label><input type="checkbox" /><span className="dot dot-red"/> High</label>
                        <label><input type="checkbox" /><span className="dot dot-orange"/> Medium</label>
                        <label><input type="checkbox" /><span className="dot dot-green"/> Low</label>
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
                  <div className="due-col mt-4">
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

        {showCreate && (
          <div className="create-issue-overlay" onClick={() => setShowCreate(false)}>
            <div className="create-issue-container" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>
              <div className="create-issue-header d-flex align-items-center">
                <h4>Create issue</h4>
                <div className="ms-auto d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary">Import issues</button>
                  <button className="btn btn-link modal-close" onClick={() => setShowCreate(false)} title="Close"><FiX size={18} /></button>
                </div>
              </div>

              <form className="create-issue-form">
                <div className="form-row select-row">
                  <label>Project*</label>
                  <div className="select-control">
                    <select
                      className={`form-control project-select ${errors.project ? 'invalid' : ''}`}
                      value={project}
                      onChange={e=>{ setProject(e.target.value); setErrors(prev=>({...prev, project:undefined})) }}
                    >
                      <option>Zapier Content (ZC)</option>
                      <option>KavyaProMan 360</option>
                      <option>Website Redesign</option>
                      <option>Mobile App</option>
                    </select>
                    {errors.project && <div className="error-text">{errors.project}</div>}
                  </div>
                </div>

                <div className="form-row two-col">
                  <div>
                    <label className='mb-2'>Issue Type*</label>
                    <select className={`form-control ${errors.issueType ? 'invalid' : ''}`} value={issueType} onChange={e=>{ setIssueType(e.target.value); setErrors(prev=>({...prev, issueType:undefined})) }}>
                      <option>Epic</option>
                      <option>Story</option>
                      <option>Task</option>
                      <option>Bug</option>
                    </select>
                    {errors.issueType && <div className="error-text">{errors.issueType}</div>}
                  </div>

                  <div>
                    <label className='mb-2'>Epic Name*</label>
                    <input className={`form-control ${errors.epicName ? 'invalid' : ''}`} placeholder="Provide a short name to identify this epic." value={epicName} onChange={e=>{ setEpicName(e.target.value); setErrors(prev=>({...prev, epicName:undefined})) }} />
                    {errors.epicName && <div className="error-text">{errors.epicName}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <label>Summary*</label>
                  <input className={`form-control summary-input ${errors.summary ? 'invalid' : ''}`} value={summary} onChange={e=>{ setSummary(e.target.value); setErrors(prev=>({...prev, summary:undefined})) }} />
                  {errors.summary && <div className="error-text">{errors.summary}</div>}
                </div>

                <div className="form-row">
                  <label>Difficulty</label>
                  <div className="difficulty-group">
                    <div className="difficulty-radio high">
                      <input id="create-diff-high" type="radio" name="create-difficulty" checked={selectedDifficulty==='High'} onChange={()=>setSelectedDifficulty('High')} />
                      <label htmlFor="create-diff-high"><span className="dot"/>High</label>
                    </div>
                    <div className="difficulty-radio medium">
                      <input id="create-diff-medium" type="radio" name="create-difficulty" checked={selectedDifficulty==='Medium'} onChange={()=>setSelectedDifficulty('Medium')} />
                      <label htmlFor="create-diff-medium"><span className="dot"/>Medium</label>
                    </div>
                    <div className="difficulty-radio low">
                      <input id="create-diff-low" type="radio" name="create-difficulty" checked={selectedDifficulty==='Low'} onChange={()=>setSelectedDifficulty('Low')} />
                      <label htmlFor="create-diff-low"><span className="dot"/>Low</label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <label>Description</label>
                  <div className="toolbar format-toolbar">
                    <button type="button" className="format-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>document.execCommand('bold')} aria-label="Bold"><strong>B</strong></button>
                    <button type="button" className="format-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>document.execCommand('italic')} aria-label="Italic"><em>I</em></button>
                    <button type="button" className="format-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>document.execCommand('underline')} aria-label="Underline"><u>U</u></button>

                    <div className="align-group">
                      <button type="button" className="format-btn align-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>document.execCommand('justifyLeft')} title="Align left"><FiAlignLeft /></button>
                      <button type="button" className="format-btn align-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>document.execCommand('justifyCenter')} title="Center"><FiAlignCenter /></button>
                      <button type="button" className="format-btn align-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>document.execCommand('justifyRight')} title="Align right"><FiAlignRight /></button>
                      <button type="button" className="format-btn align-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>document.execCommand('justifyFull')} title="Justify"><FiAlignJustify /></button>
                    </div>

                    <input type="color" className="color-input" defaultValue="#10b981" onMouseDown={e=>e.preventDefault()} onChange={(e)=>document.execCommand('foreColor', false, e.target.value)} title="Text color" />
                    <button type="button" className="format-btn upload-btn" onMouseDown={e=>e.preventDefault()} onClick={()=>fileInputRef.current?.click()} title="Attach files">
                      <FiUpload />
                    </button>
                    <input type="file" ref={fileInputRef} style={{display:'none'}} accept=".pdf,image/*,.doc,.docx" multiple onChange={(e)=>{ handleAddFiles(e.target.files) }} />
                  </div>
                  <div
                    className="form-control description-area"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    ref={descRef}
                    onInput={()=>{ setErrors(prev=>({...prev, description:undefined})) }}
                  />

                  {attachments.length > 0 && (
                    <div className="attachments">
                      {attachments.map((f, i) => (
                        <div className="attachment-item" key={i} title={f.name}>
                              {f.data ? (
                                <button type="button" className="attachment-name link-like" onClick={(e)=>{ e.preventDefault(); downloadAttachment(f) }}>{f.name}</button>
                              ) : (
                                <span className="attachment-name">{f.name}</span>
                              )}
                          <button type="button" className="remove-attachment" onMouseDown={e=>e.preventDefault()} onClick={()=>handleRemoveAttachment(i)} title="Remove">
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-row form-actions d-flex align-items-center">
                  <div className="flex-fill" />
                  <div className="action-right d-flex align-items-center gap-3">
                    {/* <label className="create-another">
                      <input type="checkbox" />
                      <span className="ms-2">Create another</span>
                    </label> */}

                    <button type="button" className="btn btn-outline-secondary cancel-btn" onClick={() => setShowCreate(false)}>Cancel</button>

                    <button type="button" className="btn btn-primary create-btn" onClick={handleCreate} disabled={Object.values(errors).some(v => v)}>Create</button>
                  </div>
                </div>
              </form>
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
                <div className="inner-content" onClick={() => navigate('/all-my-issues')} role="link" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') navigate('/all-my-issues') }}>
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
                <div className="inner-content" onClick={() => navigate('/all-my-issues')} role="link" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') navigate('/all-my-issues') }}>
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
              <h3 className="stat-title">{totalIssues}</h3>

              <div className="issues-legend">
                <div className="legend-row"><span className="dot dot-red"/> High <span className="legend-count">{difficultyCounts.High}</span></div>
                <div className="legend-row"><span className="dot dot-orange"/> Medium <span className="legend-count">{difficultyCounts.Medium}</span></div>
                <div className="legend-row"><span className="dot dot-green"/> Low <span className="legend-count">{difficultyCounts.Low}</span></div>
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
