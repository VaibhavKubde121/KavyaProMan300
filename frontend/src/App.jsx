
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OrganizationPage from './pages/OrganizationPage'
import AllMyIssues from './pages/AllMyIssues'
import CreateOrganization from './pages/CreateOrganization'
import CustomizeOrganization from './pages/CustomizeOrganization'
import Settings from './pages/Settings'
import Teams from "./pages/Teams";
import Project from './pages/Project'
import Board from './pages/Board'
import Backlog from './pages/Backlog'
import Reports from './pages/Reports'
import Subscription from './pages/Subscription'
import ContactSales from './pages/ContactSales'

function App() {
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/create" element={<CreateOrganization />} />
        <Route path="/customize" element={<CustomizeOrganization />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/contact-sales" element={<ContactSales />} />
        <Route path="/projects/:projectId/board" element={<Board />} />
        <Route path="/projects/:projectId/backlog" element={<Backlog />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/create-issue" element={<Dashboard initialShowCreate={true} />} />
        <Route path="/create-issue/" element={<Dashboard initialShowCreate={true} />} />
        <Route path="/all-my-issues" element={<AllMyIssues />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
