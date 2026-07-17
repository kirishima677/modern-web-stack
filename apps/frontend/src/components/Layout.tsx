import type { ReactElement } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const navLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  isActive ? 'nav-link nav-link-active' : 'nav-link'

export const Layout = (): ReactElement => (
  <div className="layout">
    <header className="site-header">
      <Link className="site-title" to="/">
        modern-web-stack
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <NavLink className={navLinkClassName} to="/">
          Home
        </NavLink>
        <NavLink className={navLinkClassName} to="/users">
          Users
        </NavLink>
      </nav>
    </header>
    <main className="page-content">
      <Outlet />
    </main>
  </div>
)
