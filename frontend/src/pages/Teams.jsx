import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import "./Teams.css";
import { FiGrid, FiFolder, FiUsers, FiBarChart2, FiCreditCard, FiSettings, FiLogOut, FiMenu, FiSearch, FiBell, FiPlus, FiUser, FiX, FiCheck } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'

export default function Teams() {
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest')
  const [collapsed, setCollapsed] = useState(false)

  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    avgWorkload: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("Members");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const [inviteFormData, setInviteFormData] = useState({
    name: '',
    email: '',
    role: 'Developer'
  });

  const API_BASE_URL = 'http://localhost:8080/api';

  // Fetch team members and stats on component mount
  useEffect(() => {
    fetchTeamMembers();
    fetchTeamStats();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      
      const adminCount = data.filter(m => m.role === 'Admin').length;
      const totalIssues = data.reduce((sum, m) => sum + (m.activeIssues || 0), 0);
      const avgWorkload = data.length > 0 ? Math.round(totalIssues / data.length) : 0;

      setStats({
        totalMembers: data.length,
        activeProjects: 3, // You may need to fetch this from a different endpoint
        avgWorkload: avgWorkload,
        admins: adminCount
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditingMember({ ...member });
  };

  const handleSaveEdit = async (memberId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingMember)
      });

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      const updatedMember = await response.json();
      setMembers(members.map(m => m.id === memberId ? updatedMember : m));
      setEditingId(null);
      setEditingMember(null);
      alert('Member updated successfully');
    } catch (err) {
      alert('Error updating member: ' + err.message);
      console.error('Error:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingMember(null);
  };

  const handleCardClick = (memberId) => {
    const member = members.find(m => m.id === memberId);
    alert(`Viewing ${member?.name} details`);
  };

  const handleStatClick = (statName) => {
    alert(`Viewing ${statName} details`);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteFormData.name || !inviteFormData.email || !inviteFormData.role) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to invite member');
      }

      const newMember = await response.json();
      setMembers([...members, newMember]);
      setShowInviteModal(false);
      setInviteFormData({ name: '', email: '', role: 'Developer' });
      fetchTeamStats();
      alert('Member invited successfully');
    } catch (err) {
      alert('Error inviting member: ' + err.message);
      console.error('Error:', err);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      setMembers(members.filter(m => m.id !== memberId));
      fetchTeamStats();
      alert('Member deleted successfully');
    } catch (err) {
      alert('Error deleting member: ' + err.message);
      console.error('Error:', err);
    }
  };

  // Filter members based on search and role
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All Roles' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="dashboard-root d-flex">
        <aside className="sidebar d-flex flex-column">
          <div className="sidebar-top">
            <div className="brand d-flex align-items-center">
              <div className="brand-logo">KP</div>
              <div className="brand-name">KavyaProMan</div>
            </div>
          </div>
        </aside>
        <main className="content flex-grow-1 p-4">
          <div className="team-container">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>Loading...</h2>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-root d-flex">
      {/* Sidebar */}
      <aside className={`sidebar d-flex flex-column ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="brand d-flex align-items-center">
            <div className="brand-logo">KP</div>
            <div className="brand-name">KavyaProMan</div>
          </div>
        </div>

        <div className="org-switch mt-3 d-flex align-items-center gap-2">
          <div className="org-icon">K</div>
          <div className="org-info">
            <div className="org-name">Kavya Technologies</div>
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

      {/* Mobile Toggle */}
      <button className="mobile-toggle btn btn-sm" onClick={() => setCollapsed(s => !s)} aria-label="Toggle sidebar">
        <FiMenu size={18} />
      </button>

      {/* Main Content */}
      <main className={`content flex-grow-1 p-4 ${collapsed ? 'with-topbar' : ''}`}>
        <div className="team-container">

          {/* Header */}
          <div className="team-header">
            <div>
              <h1>Team Management</h1>
              <p>Manage team members, roles, and permissions</p>
            </div>
            <button className="invite-btn" onClick={() => setShowInviteModal(true)}>
              <FiPlus className="me-1" /> Invite Member
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              Error: {error}
            </div>
          )}

          {/* Stats Cards - Now Clickable */}
          <div className="stats">
            <div 
              className="card stat-card"
              onClick={() => handleStatClick('Total Members')}
              role="button"
              tabIndex="0"
            >
              <h4>Total Members</h4>
              <h2>{stats.totalMembers}</h2>
            </div>

            <div 
              className="card stat-card"
              onClick={() => handleStatClick('Active Projects')}
              role="button"
              tabIndex="0"
            >
              <h4>Active Projects</h4>
              <h2>{stats.activeProjects}</h2>
            </div>

            <div 
              className="card stat-card"
              onClick={() => handleStatClick('Avg. Workload')}
              role="button"
              tabIndex="0"
            >
              <h4>Avg. Workload</h4>
              <h2>{stats.avgWorkload}</h2>
              <span>issues per member</span>
            </div>

            <div 
              className="card stat-card"
              onClick={() => handleStatClick('Admins')}
              role="button"
              tabIndex="0"
            >
              <h4>Admins</h4>
              <h2>{stats.admins}</h2>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="filters">
            <input 
              type="text" 
              placeholder="Search team members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option>All Roles</option>
              <option>Admin</option>
              <option>Developer</option>
              <option>Tester</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={activeTab === "Members" ? "active-tab" : ""}
              onClick={() => setActiveTab("Members")}
            >
              Members
            </button>
            <button 
              className={activeTab === "Roles & Permissions" ? "active-tab" : ""}
              onClick={() => setActiveTab("Roles & Permissions")}
            >
              Roles & Permissions
            </button>
          </div>

          {/* Member Cards */}
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div 
                key={member.id}
                className="member-card"
                onClick={() => handleCardClick(member.id)}
              >
                <div className="member-left">
                  <img
                    src={member.image || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={member.name}
                  />
                  <div>
                    {editingId === member.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                          placeholder="Name"
                        />
                        <input
                          type="email"
                          value={editingMember.email}
                          onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                          placeholder="Email"
                        />
                        <select
                          value={editingMember.role}
                          onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                        >
                          <option>Admin</option>
                          <option>Developer</option>
                          <option>Tester</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <h3>
                          {member.name} 
                          <span className={`role ${member.role.toLowerCase()}`}>
                            {member.role}
                          </span>
                        </h3>
                        <p>{member.email}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="member-right">
                  {editingId !== member.id && (
                    <>
                      <div className="member-stat">
                        <strong>{member.projects || 0}</strong>
                        <p>Projects</p>
                      </div>
                      <div className="member-stat">
                        <strong>{member.activeIssues || 0}</strong>
                        <p>Active Issues</p>
                      </div>
                    </>
                  )}
                  
                  {editingId === member.id ? (
                    <div className="edit-actions">
                      <button 
                        className="save-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(member.id);
                        }}
                        title="Save"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        title="Cancel"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(member);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No team members found</p>
            </div>
          )}

        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button 
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="invite-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter member name"
                  value={inviteFormData.name}
                  onChange={(e) => setInviteFormData({...inviteFormData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter member email"
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData({...inviteFormData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={inviteFormData.role}
                  onChange={(e) => setInviteFormData({...inviteFormData, role: e.target.value})}
                  required
                >
                  <option>Admin</option>
                  <option>Developer</option>
                  <option>Tester</option>
                </select>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-invite"
                >
                  Invite Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}