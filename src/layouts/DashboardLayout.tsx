import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'

export function DashboardLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-container">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>OS LAB · Laboratorio interactivo de Sistemas Operativos</span>
          <span>Aprende. Ejecuta. Experimenta.</span>
        </footer>
      </div>
    </div>
  )
}
