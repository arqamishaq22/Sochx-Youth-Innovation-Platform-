import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
  const { isAuthenticated, currentUser, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin' || user?.role === 'admin';

  /**
   * Logic requirement:
   * When an unauthenticated visitor clicks "Submit Ideas", trigger a popup/modal alert:
   * "You must be logged in to submit an idea." and navigate to /login.
   */
  const handleSubmitIdeasClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert('You must be logged in to submit an idea.');
      navigate('/login', { state: { from: { pathname: '/submit-idea' } } });
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  const handleProfileClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert('You must be logged in to access your profile.');
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getNavLinkClass = ({ isActive }) =>
    `navbar-link ${isActive ? 'active-link' : ''}`;

  const getMobileLinkClass = ({ isActive }) =>
    `navbar-mobile-link ${isActive ? 'active-link' : ''}`;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-inner">
          
          {/* Left Brand: SochX with stylized purple/cyan lightbulb icon inside letter 'o' or official vector mascot */}
          <Link
            to="/"
            className="navbar-brand"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/logo.svg"
              alt="SochX Logo"
              className="navbar-logo-img"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-nav">
            <NavLink to="/" className={getNavLinkClass} end>
              Home
            </NavLink>

            <NavLink to="/about" className={getNavLinkClass}>
              About
            </NavLink>

            <NavLink to="/ideas" className={getNavLinkClass}>
              Ideas
            </NavLink>

            <NavLink
              to="/submit-idea"
              onClick={handleSubmitIdeasClick}
              className={getNavLinkClass}
            >
              Submit Ideas
            </NavLink>

            <NavLink
              to="/profile"
              onClick={handleProfileClick}
              className={getNavLinkClass}
            >
              Profile
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" className={getNavLinkClass}>
                Admin Panel
              </NavLink>
            )}

            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={getNavLinkClass}>
                  Login
                </NavLink>

                <NavLink to="/register" className={getNavLinkClass}>
                  Registration
                </NavLink>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/profile" className="navbar-user-badge">
                  <span className="navbar-pulse-dot"></span>
                  <span>{currentUser?.name || 'User'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="navbar-logout-btn"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="navbar-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            className={getMobileLinkClass}
            onClick={() => setMobileMenuOpen(false)}
            end
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={getMobileLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </NavLink>

          <NavLink
            to="/ideas"
            className={getMobileLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Ideas
          </NavLink>

          <NavLink
            to="/submit-idea"
            className={getMobileLinkClass}
            onClick={handleSubmitIdeasClick}
          >
            Submit Ideas
          </NavLink>

          <NavLink
            to="/profile"
            className={getMobileLinkClass}
            onClick={handleProfileClick}
          >
            Profile
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={getMobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Panel
            </NavLink>
          )}

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className={getMobileLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={getMobileLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Registration
              </NavLink>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#4c1d95' }}>
                {currentUser?.name || 'User'}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
