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
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

  // ===== TAB STATE =====
  const [activeTab, setActiveTab] = useState("velocity");

  // ===== SAMPLE DATA =====
  const issues = [
    { id: 1, status: "Completed", estimated: 10, logged: 8, assignee: "Sarah", sprint: "Sprint 1" },
    { id: 2, status: "In Progress", estimated: 12, logged: 6, assignee: "John", sprint: "Sprint 1" },
    { id: 3, status: "Completed", estimated: 8, logged: 8, assignee: "Sarah", sprint: "Sprint 2" },
    { id: 4, status: "To Do", estimated: 15, logged: 0, assignee: "David", sprint: "Sprint 2" },
    { id: 5, status: "Completed", estimated: 20, logged: 18, assignee: "John", sprint: "Sprint 3" },
  ];

  const totalIssues = issues.length;
  const completedIssues = issues.filter(i => i.status === "Completed").length;
  const completionRate = Math.round((completedIssues / totalIssues) * 100);
  const totalEstimated = issues.reduce((s, i) => s + i.estimated, 0);
  const totalLogged = issues.reduce((s, i) => s + i.logged, 0);

  // ===== VELOCITY DATA =====
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

  // ===== BURNDOWN DATA =====
  const burndownData = [
    { day: "Day 1", remaining: 50 },
    { day: "Day 2", remaining: 40 },
    { day: "Day 3", remaining: 30 },
    { day: "Day 4", remaining: 15 },
    { day: "Day 5", remaining: 5 },
  ];

  // ===== DISTRIBUTION DATA =====
  const distributionData = [
    { name: "To Do", value: issues.filter(i => i.status === "To Do").length },
    { name: "In Progress", value: issues.filter(i => i.status === "In Progress").length },
    { name: "Completed", value: completedIssues },
  ];

  const COLORS = ["#f4b400", "#0969da", "#2da44e"];

  return (
    <div className="dashboard-root d-flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar d-flex flex-column">
        <div className="sidebar-top">
          <div className="brand d-flex align-items-center">
            <div className="brand-logo">KP</div>
            <div className="brand-name">KavyaProMan</div>
          </div>
        </div>

        <nav className="nav flex-column mt-4">
          <NavLink to="/dashboard" className="nav-item d-flex align-items-center mb-2">
            <FiGrid className="me-3" /> Dashboard
          </NavLink>
          <NavLink to="/projects" className="nav-item d-flex align-items-center mb-2">
            <FiFolder className="me-3" /> Projects
          </NavLink>
          <NavLink to="/teams" className="nav-item d-flex align-items-center mb-2">
            <FiUsers className="me-3" /> Teams
          </NavLink>
          <NavLink to="/reports" className="nav-item d-flex align-items-center mb-2 active">
            <FiBarChart2 className="me-3" /> Reports
          </NavLink>
          <NavLink to="/subscription" className="nav-item d-flex align-items-center mb-2">
            <FiCreditCard className="me-3" /> Subscription
          </NavLink>
          <NavLink to="/settings" className="nav-item d-flex align-items-center mb-2">
            <FiSettings className="me-3" /> Settings
          </NavLink>
        </nav>

        <div className="mt-auto p-3">
          <button className="btn logout-badge mt-3">
            <FiLogOut className="me-2" /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="content flex-grow-1 p-4">

        {/* ===== TOP SEARCH BAR ===== */}
        <div className="top-search-row mb-4">
          <div className="input-group top-search-medium">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              className="form-control"
              placeholder="Search issues, projects..."
            />
          </div>

          <button className="btn btn-link me-2 bell-black">
            <FiBell size={20} />
          </button>

          <button
            className="btn create-issue-medium"
            onClick={() => navigate("/create-issue")}
          >
            <FiPlus className="me-1" /> Create Issue
          </button>
        </div>

        {/* ===== PAGE HEADER ===== */}
        <h1>Reports & Analytics</h1>
        <p className="text-muted">
          Track project progress and team performance
        </p>

        {/* ===== SUMMARY CARDS ===== */}
        <div className="reports-cards">
          <div className="report-card">
            <h4>Total Issues</h4>
            <h2>{totalIssues}</h2>
          </div>

          <div className="report-card">
            <h4>Completion Rate</h4>
            <h2>{completionRate}%</h2>
          </div>

          <div className="report-card">
            <h4>Estimated Hours</h4>
            <h2>{totalEstimated}h</h2>
          </div>

          <div className="report-card">
            <h4>Logged Hours</h4>
            <h2>{totalLogged}h</h2>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="report-tabs mt-4">
          <button
            className={activeTab === "velocity" ? "active-tab" : ""}
            onClick={() => setActiveTab("velocity")}
          >
            Velocity
          </button>

          <button
            className={activeTab === "burndown" ? "active-tab" : ""}
            onClick={() => setActiveTab("burndown")}
          >
            Burndown
          </button>

          <button
            className={activeTab === "distribution" ? "active-tab" : ""}
            onClick={() => setActiveTab("distribution")}
          >
            Distribution
          </button>
        </div>

        {/* ===== TAB CONTENT ===== */}
        <div className="reports-chart mt-4">

          {activeTab === "velocity" && (
            <>
              <h3>Sprint Velocity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="points" fill="#0969da" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}

          {activeTab === "burndown" && (
            <>
              <h3>Sprint Burndown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="remaining" stroke="#2da44e" />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {activeTab === "distribution" && (
            <>
              <h3>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={distributionData} dataKey="value" outerRadius={100} label>
                    {distributionData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}

        </div>

      </main>
    </div>
  );
};

export default Reports;