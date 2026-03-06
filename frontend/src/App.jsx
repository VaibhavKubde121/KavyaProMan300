
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyOtp from './pages/VerifyOtp'
import Dashboard from './pages/Dashboard'
import AllMyIssues from './pages/AllMyIssues'
import OrganizationPage from './pages/OrganizationPage'
import CreateOrganization from './pages/CreateOrganization'
import CustomizeOrganization from './pages/CustomizeOrganization'
import Settings from './pages/Settings'
import Teams from "./pages/Teams";
import Reports from './pages/Reports'
import Subscription from './pages/Subscription'
import ContactSales from './pages/ContactSales'
import Project from './pages/Project'
import Board from './pages/Board'
import Backlog from './pages/Backlog'
import SidebarController from './components/SidebarController'

function App() {
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  return (
    <BrowserRouter>
      <SidebarController />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/all-my-issues" element={<AllMyIssues />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/create" element={<CreateOrganization />} />
        <Route path="/customize" element={<CustomizeOrganization />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/contact-sales" element={<ContactSales />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/projects/:projectId/board" element={<Board />} />
        <Route path="/projects/:projectId/backlog" element={<Backlog />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
