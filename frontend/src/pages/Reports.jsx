import React, { useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  FiGrid,
  FiFolder,
  FiUsers,
  FiBarChart2,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiBell,
  FiPlus,
  FiTrendingUp,
  FiTarget,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import "./Reports.css";
import "./Dashboard.css";

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("velocity");
  const [selectedProject, setSelectedProject] = useState("KavyaProMan 360");

  const projects = [
    "KavyaProMan 360",
    "Website Redesign",
    "Mobile App",
  ];

  // ===== SAMPLE DATA =====
  const issues = [
    { id: 1, status: "Completed", estimated: 10, logged: 8, sprint: "Sprint 1" },
    { id: 2, status: "In Progress", estimated: 12, logged: 6, sprint: "Sprint 1" },
    { id: 3, status: "Completed", estimated: 8, logged: 8, sprint: "Sprint 2" },
    { id: 4, status: "To Do", estimated: 15, logged: 0, sprint: "Sprint 2" },
    { id: 5, status: "Completed", estimated: 20, logged: 18, sprint: "Sprint 3" },
  ];

  const totalIssues = issues.length;
  const completedIssues = issues.filter(i => i.status === "Completed").length;
  const completionRate = Math.round((completedIssues / totalIssues) * 100);
  const totalEstimated = issues.reduce((s, i) => s + i.estimated, 0);
  const totalLogged = issues.reduce((s, i) => s + i.logged, 0);

  // ===== VELOCITY =====
  const velocityData = useMemo(() => {
    const sprintMap = {};
    issues.forEach(issue => {
      if (issue.status === "Completed") {
        sprintMap[issue.sprint] =
          (sprintMap[issue.sprint] || 0) + issue.estimated;
      }
    });

    return Object.keys(sprintMap).map(sprint => ({
      sprint,
      points: sprintMap[sprint],
    }));
  }, [issues]);

  const burndownData = [
    { day: "Day 1", remaining: 50 },
    { day: "Day 2", remaining: 40 },
    { day: "Day 3", remaining: 30 },
    { day: "Day 4", remaining: 15 },
    { day: "Day 5", remaining: 5 },
  ];

  const distributionData = [
    { name: "To Do", value: issues.filter(i => i.status === "To Do").length },
    { name: "In Progress", value: issues.filter(i => i.status === "In Progress").length },
    { name: "Completed", value: completedIssues },
  ];

  const COLORS = ["#f4b400", "#0969da", "#2da44e"];

  return (
    <div className="dashboard-root d-flex">

      {/* ===== SIDEBAR SAME AS BEFORE ===== */}
      <aside className="sidebar d-flex flex-column">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-logo">KP</div>
            <div className="brand-name">KavyaProMan</div>
          </div>
        </div>

        <nav className="nav flex-column mt-4">
          <NavLink to="/dashboard" className="nav-item"><FiGrid /> Dashboard</NavLink>
          <NavLink to="/projects" className="nav-item"><FiFolder /> Projects</NavLink>
          <NavLink to="/teams" className="nav-item"><FiUsers /> Teams</NavLink>
          <NavLink to="/reports" className="nav-item active"><FiBarChart2 /> Reports</NavLink>
          <NavLink to="/subscription" className="nav-item"><FiCreditCard /> Subscription</NavLink>
          <NavLink to="/settings" className="nav-item"><FiSettings /> Settings</NavLink>
        </nav>

        <div className="mt-auto p-3">
          <button className="btn logout-badge">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="content flex-grow-1 p-4">

        {/* ===== TOP SEARCH ===== */}
        <div className="top-search-row mb-4">
          <div className="input-group top-search-medium">
            <span className="input-group-text"><FiSearch /></span>
            <input className="form-control" placeholder="Search issues, projects..." />
          </div>

          <button className="btn btn-link me-2"><FiBell size={20} /></button>

          <button className="btn create-issue-medium" onClick={() => navigate("/create-issue")}>
            <FiPlus /> Create Issue
          </button>
        </div>

        {/* ===== HEADER + DROPDOWN ===== */}
        <div className="reports-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p className="text-muted">Track project progress and team performance</p>
          </div>

          <select
            className="project-dropdown"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* ===== SUMMARY CARDS WITH ICONS ===== */}
        <div className="reports-cards">

          <div className="report-card">
            <FiActivity className="card-icon blue-icon" />
            <div>
              <h4>Total Issues</h4>
              <h2>{totalIssues}</h2>
            </div>
          </div>

          <div className="report-card">
            <FiTarget className="card-icon green-icon" />
            <div>
              <h4>Completion Rate</h4>
              <h2>{completionRate}%</h2>
            </div>
          </div>

          <div className="report-card">
            <FiClock className="card-icon purple-icon" />
            <div>
              <h4>Estimated Hours</h4>
              <h2>{totalEstimated}h</h2>
            </div>
          </div>

          <div className="report-card">
            <FiTrendingUp className="card-icon orange-icon" />
            <div>
              <h4>Logged Hours</h4>
              <h2>{totalLogged}h</h2>
            </div>
          </div>

        </div>

        {/* ===== TABS ===== */}
        <div className="report-tabs mt-4">
          <button className={activeTab === "velocity" ? "active-tab" : ""} onClick={() => setActiveTab("velocity")}>Velocity</button>
          <button className={activeTab === "burndown" ? "active-tab" : ""} onClick={() => setActiveTab("burndown")}>Burndown</button>
          <button className={activeTab === "distribution" ? "active-tab" : ""} onClick={() => setActiveTab("distribution")}>Distribution</button>
        </div>

        {/* ===== TAB CONTENT ===== */}
        <div className="reports-chart mt-4">

          {activeTab === "velocity" && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#0969da" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTab === "burndown" && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="remaining" stroke="#2da44e" />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeTab === "distribution" && (
  <div className="distribution-grid">

    {/* ===== Issue Type Distribution ===== */}
    <div className="distribution-card">
      <h4>Issue Type Distribution</h4>
      <p className="text-muted">Breakdown by issue type</p>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={[
            { type: "Story", value: 6 },
            { type: "Task", value: 2 },
            { type: "Bug", value: 1 },
            { type: "Epic", value: 1 },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8250df" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* ===== Status Distribution ===== */}
    <div className="distribution-card">
      <h4>Status Distribution</h4>
      <p className="text-muted">Issues by workflow status</p>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={[
            { status: "To Do", value: 3 },
            { status: "In Progress", value: 3 },
            { status: "Done", value: 1 },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#2da44e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

  </div>
)}
         </div>  {/* reports-chart */}
      </main>
    </div>
  );
};
    

export default Reports;