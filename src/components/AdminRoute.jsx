import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * Route guard component strictly for Admin role access.
 * Non-logged-in users go to /login, non-admin authenticated users are bounced to home page.
 */
const AdminRoute = ({ children }) => {
  const { user, currentUser, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  const activeUser = user || currentUser;
  const userIsAdmin = isAdmin || activeUser?.role === 'admin';

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <Loader2 size={36} color="#7c3aed" className="animate-spin" />
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
          Verifying administrator permissions...
        </p>
      </div>
    );
  }

  // Not logged in -> redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but does not possess 'admin' role -> bounce to home with alert
  if (!userIsAdmin) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', marginBottom: '20px' }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b', marginBottom: '8px' }}>
          Access Denied
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', lineHeight: 1.6, marginBottom: '24px' }}>
          You do not have administrative credentials to view the SochX Control Center. Only authorized administrators are permitted.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="auth-btn-gradient"
          style={{ width: 'auto', padding: '10px 24px', display: 'inline-block' }}
        >
          Return to Community Home
        </button>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
