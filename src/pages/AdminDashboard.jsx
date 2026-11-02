import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Users, Lightbulb, Clock, ThumbsUp, Check, Trash2, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const { user, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ideas'); // 'ideas' | 'users'

  // Dashboard metrics state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIdeas: 0,
    pendingIdeas: 0,
    totalUpvotes: 0,
  });

  // Ideas moderation list
  const [ideas, setIdeas] = useState([]);

  // Users management list
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const activeAdmin = user || currentUser;

  /**
   * Fetch all stats, ideas, and users from backend
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, ideasRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getIdeas(),
        adminAPI.getUsers(),
      ]);

      if (statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }
      if (ideasRes.data?.ideas) {
        setIdeas(ideasRes.data.ideas);
      }
      if (usersRes.data?.users) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrator data from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Flash message helper
  const showFeedback = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  /**
   * Update status of an idea (Approve / Reject)
   */
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setActionLoading(true);
      await adminAPI.updateIdeaStatus(id, newStatus);
      showFeedback(`Idea #${id} status changed to "${newStatus}"!`);

      // Optimistically update local state
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === id ? { ...idea, status: newStatus } : idea))
      );

      // Refresh stats in background
      adminAPI.getStats().then((res) => {
        if (res.data?.stats) setStats(res.data.stats);
      });
    } catch (err) {
      showFeedback(err.message || 'Failed to update idea status', false);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete an idea
   */
  const handleDeleteIdea = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete idea: "${title}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await adminAPI.deleteIdea(id);
      showFeedback(`Idea "${title}" removed successfully.`);

      setIdeas((prev) => prev.filter((idea) => idea.id !== id));

      adminAPI.getStats().then((res) => {
        if (res.data?.stats) setStats(res.data.stats);
      });
    } catch (err) {
      showFeedback(err.message || 'Failed to delete idea', false);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete a user account
   */
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}" from the database?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await adminAPI.deleteUser(id);
      showFeedback(`User account "${name}" has been removed.`);

      setUsers((prev) => prev.filter((u) => u.id !== id));

      adminAPI.getStats().then((res) => {
        if (res.data?.stats) setStats(res.data.stats);
      });
    } catch (err) {
      showFeedback(err.message || 'Failed to delete user account', false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-container">
      
      {/* 1. TOP HERO HEADER */}
      <section className="admin-hero-banner">
        <div className="admin-hero-inner">
          <div className="admin-badge-portal">
            <Shield size={14} />
            <span>AUTHORITATIVE CONTROL CENTER</span>
          </div>

          <h1 className="admin-banner-title">SochX Control Center</h1>
          <p className="admin-banner-subtitle">
            Platform moderation, ideas review, and user management. Logged in as Administrator:{' '}
            <strong style={{ color: '#22d3ee' }}>{activeAdmin?.fullName || activeAdmin?.name || 'Super Admin'}</strong>
          </p>

          {/* Metric Cards Grid */}
          <div className="admin-metrics-grid">
            <div className="admin-metric-card">
              <div className="admin-metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8' }}>
                <Users size={24} />
              </div>
              <div>
                <p className="admin-metric-num">{stats.totalUsers}</p>
                <p className="admin-metric-label">Total Users</p>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc' }}>
                <Lightbulb size={24} />
              </div>
              <div>
                <p className="admin-metric-num">{stats.totalIdeas}</p>
                <p className="admin-metric-label">Total Ideas</p>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.25)', color: '#fbbf24' }}>
                <Clock size={24} />
              </div>
              <div>
                <p className="admin-metric-num">{stats.pendingIdeas}</p>
                <p className="admin-metric-label">Pending Review</p>
              </div>
            </div>

            <div className="admin-metric-card">
              <div className="admin-metric-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.25)', color: '#34d399' }}>
                <ThumbsUp size={24} />
              </div>
              <div>
                <p className="admin-metric-num">{stats.totalUpvotes}</p>
                <p className="admin-metric-label">Total Likes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BODY CONTENT */}
      <main className="admin-content-wrap">
        
        {/* Feedback Banners */}
        {error && (
          <div className="auth-error-banner" style={{ margin: '0 0 20px 0' }}>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="admin-tabs-nav">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`admin-tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
          >
            <Lightbulb size={16} />
            <span>Review Ideas ({ideas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={16} />
            <span>Manage Users ({users.length})</span>
          </button>

          <button
            onClick={loadDashboardData}
            className="admin-tab-btn"
            style={{ marginLeft: 'auto' }}
            title="Refresh database entries"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* TAB 1: REVIEW IDEAS */}
        {activeTab === 'ideas' && (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <div>
                <h2 className="admin-table-title">Ideas Moderation Queue</h2>
                <p className="admin-table-subtitle">
                  Approve legitimate proposals, deactivate projects from public feed, or remove inappropriate submissions.
                </p>
              </div>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Current Status</th>
                    <th>Votes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ideas.map((idea) => {
                    const normStatus = (idea.status || 'PENDING').toUpperCase();

                    const statusClass =
                      normStatus === 'APPROVED'
                        ? 'admin-status-approved'
                        : normStatus === 'INACTIVE'
                        ? 'admin-status-inactive'
                        : 'admin-status-pending';

                    return (
                      <tr key={idea.id}>
                        <td>#{idea.id}</td>
                        <td style={{ fontWeight: 700, color: '#1e1b4b', maxWidth: '260px' }}>
                          {idea.title}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#6b21a8' }}>{idea.category}</span>
                        </td>
                        <td>
                          <div>{idea.authorName || idea.submitterName || 'Innovator'}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{idea.authorEmail || ''}</div>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${statusClass}`}>
                            {normStatus}
                          </span>
                        </td>
                        <td>
                          <strong>{idea.upvoteCount || 0}</strong>
                        </td>
                        <td>
                          <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                            {/* 1. "✓ Approve" - Visible when status is PENDING or INACTIVE */}
                            {normStatus !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(idea.id, 'APPROVED')}
                                disabled={actionLoading}
                                className="admin-btn-action admin-btn-approve"
                                title="Approve idea and publish to public feed"
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* 2. "Inactive" - Visible when status is PENDING or APPROVED */}
                            {normStatus !== 'INACTIVE' && (
                              <button
                                onClick={() => handleUpdateStatus(idea.id, 'INACTIVE')}
                                disabled={actionLoading}
                                className="admin-btn-action admin-btn-inactive"
                                title="Deactivate project from public feed"
                              >
                                <span>Inactive</span>
                              </button>
                            )}

                            {/* 3. "Delete" - Always visible */}
                            <button
                              onClick={() => handleDeleteIdea(idea.id, idea.title)}
                              disabled={actionLoading}
                              className="admin-btn-action admin-btn-delete"
                              title="Delete idea permanently"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {ideas.length === 0 && !loading && (
                <div className="admin-empty-state">
                  No ideas currently stored in MySQL database.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE USERS */}
        {activeTab === 'users' && (
          <div className="admin-table-card">
            <div className="admin-table-header">
              <div>
                <h2 className="admin-table-title">Registered User Accounts</h2>
                <p className="admin-table-subtitle">
                  Inspect community accounts, verify credentials, and manage platform permissions.
                </p>
              </div>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = Number(u.id) === Number(activeAdmin?.id);
                    return (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td style={{ fontWeight: 700, color: '#1e1b4b' }}>
                          {u.fullName}
                          {isSelf && (
                            <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                              You
                            </span>
                          )}
                        </td>
                        <td>@{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={u.role === 'admin' ? 'admin-role-admin' : 'admin-role-user'}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td>
                          <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.fullName)}
                                disabled={actionLoading}
                                className="admin-btn-action admin-btn-delete"
                                title="Remove user from database"
                              >
                                <Trash2 size={14} />
                                <span>Delete User</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {users.length === 0 && !loading && (
                <div className="admin-empty-state">
                  No users currently found in database.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
