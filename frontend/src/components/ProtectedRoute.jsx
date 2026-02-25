import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const isBrowser = typeof window !== 'undefined'
  const user = isBrowser ? localStorage.getItem('user') : null

  if (!user) {
    // not authenticated -> redirect to login and replace history
    return <Navigate to="/login" replace />
  }

  return children
}
