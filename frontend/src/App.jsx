
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OrganizationPage from './pages/OrganizationPage'
import CreateOrganization from './pages/CreateOrganization'
import CustomizeOrganization from './pages/CustomizeOrganization'

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

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
