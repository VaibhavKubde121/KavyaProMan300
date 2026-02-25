
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OrganizationPage from './pages/OrganizationPage'
import CreateOrganization from './pages/CreateOrganization'
import CustomizeOrganization from './pages/CustomizeOrganization'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/organization" element={<ProtectedRoute><OrganizationPage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateOrganization /></ProtectedRoute>} />
        <Route path="/customize" element={<ProtectedRoute><CustomizeOrganization /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to={user ? '/organization' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
