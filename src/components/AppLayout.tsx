import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="layout">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <img src="/imagens/logo-sem-fundo.png" alt="ctOS" />
          <div>
            <strong>ctOS</strong>
            <span>Centro operacional</span>
          </div>
        </Link>
        <nav className="menu">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/map">Mapa</NavLink>
          <NavLink to="/locations">Localizacoes</NavLink>
          <NavLink to="/cameras">Câmeras</NavLink>
          <NavLink to="/recordings">Gravações</NavLink>
          <NavLink to="/events">Eventos</NavLink>
          <NavLink to="/watch">Monitoramento</NavLink>
          <NavLink to="/workers">Trabalhadores</NavLink>
        </nav>
        <div className="sidebar-footer">
          <small>{user?.full_name || user?.email}</small>
          <button onClick={logout}>Sair</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

