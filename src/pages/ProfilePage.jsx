import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit3, Key, LogOut, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import '../styles/Profile.css';

const ProfilePage = () => {
  const { user, currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'My Ideas' | 'Settings'
  const [profileData, setProfileData] = useState(null);
  const [userIdeas, setUserIdeas] = useState([]);
  const [stats, setStats] = useState({ totalIdeas: 0, totalLikes: 0, rank: 4 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password change form state
  const [passwordModal, setPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBadge, setEditBadge] = useState('');

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch live profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const res = await userAPI.getProfile();
        if (res.data) {
          const { user: apiUser, ideas: apiIdeas, stats: apiStats } = res.data;
          setProfileData(apiUser);
          setUserIdeas(apiIdeas || []);
          setStats(apiStats || { totalIdeas: apiIdeas?.length || 0, totalLikes: 0, rank: apiUser?.rankVal || 4 });

          setEditName(apiUser.fullName || apiUser.name || '');
          setEditBio(apiUser.bio || '');
          setEditBadge(apiUser.roleBadge || 'Full Stack Developer');
        }
      } catch (err) {
        // Fallback to active user context state
        const fallbackUser = user || currentUser;
        if (fallbackUser) {
          setProfileData(fallbackUser);
          setEditName(fallbackUser.fullName || fallbackUser.name || 'SochX Innovator');
          setEditBio(fallbackUser.bio || 'Turning coffee into code and ideas into innovation at SochX.');
          setEditBadge(fallbackUser.roleBadge || 'Full Stack Developer');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile({
        fullName: editName,
        bio: editBio,
        roleBadge: editBadge,
      });

      if (res.data?.user) {
        setProfileData(res.data.user);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', type: '' });

    if (!oldPassword || !newPassword) {
      setPwdMsg({ text: 'Please fill both password fields.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPwdMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    try {
      setPwdLoading(true);
      const res = await userAPI.changePassword({ oldPassword, newPassword });
      setPwdMsg({ text: res.data?.message || 'Password updated successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordModal(false), 2000);
    } catch (err) {
      setPwdMsg({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const activeUser = profileData || user || currentUser;
  const fullName = activeUser?.fullName || activeUser?.name || 'SochX Innovator';
  const roleBadge = activeUser?.roleBadge || (activeUser?.role === 'admin' ? 'Founder & Lead Architect' : 'Full Stack Developer');
  const bio = activeUser?.bio || 'Turning coffee into code and ideas into innovation at SochX.';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-container">
      
      {/* 1. PROFILE HEADER BANNER */}
      <section className="profile-header-banner">
        <div className="profile-header-inner">
          
          {/* Left: Avatar with cyan glowing ring border, Full Name, Role badge, Bio, and Edit Profile button */}
          <div className="profile-user-left">
            <div className="profile-avatar-ring">
              <div className="profile-avatar-inner">
                {initials}
              </div>
            </div>

            <div className="profile-user-meta">
              <div className="profile-user-name-row">
                <h1 className="profile-full-name">{fullName}</h1>
                <span className="profile-role-badge">{roleBadge}</span>
              </div>
              <p className="profile-bio-statement">{bio}</p>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="profile-edit-btn"
              >
                <Edit3 size={14} />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Right: 3 Stats Badges: [IDEAS], [LIKES], [RANK] */}
          <div className="profile-stats-grid">
            <div className="profile-stat-badge">
              <p className="profile-stat-number">{stats.totalIdeas}</p>
              <p className="profile-stat-label">IDEAS</p>
            </div>
            <div className="profile-stat-badge">
              <p className="profile-stat-number">{stats.totalLikes}</p>
              <p className="profile-stat-label">LIKES</p>
            </div>
            <div className="profile-stat-badge">
              <p className="profile-stat-number">#{stats.rank}</p>
              <p className="profile-stat-label">RANK</p>
            </div>
          </div>

        </div>
      </section>

      {/* Edit Profile inline card if activated */}
      {isEditing && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 24px', padding: '0 24px' }}>
          <form onSubmit={handleSaveProfile} className="auth-card" style={{ maxWidth: '100%', margin: '0', padding: '28px 32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#3b0764', marginBottom: '16px' }}>
              Edit Profile Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="auth-field-group">
                <label className="auth-label">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <div className="auth-field-group">
                <label className="auth-label">Role Badge</label>
                <input
                  type="text"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>
            <div className="auth-field-group" style={{ marginTop: '16px' }}>
              <label className="auth-label">Bio Statement</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="submit-textarea"
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 26px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '11px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. PROFILE TABS */}
      <main className="profile-body-wrap">
        <div className="profile-tabs-nav">
          {['Overview', 'My Ideas', 'Settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`profile-tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'Overview' && (
          <div className="profile-accent-card-cyan">
            <h2 className="profile-section-title">About Me</h2>
            <p className="profile-section-desc">
              Your registered platform account details and professional credentials stored in MySQL.
            </p>

            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <strong>Username</strong>
                @{activeUser?.username || 'innovator'}
              </div>
              <div className="profile-detail-item">
                <strong>Email Address</strong>
                {activeUser?.email || 'user@sochx.com'}
              </div>
              <div className="profile-detail-item">
                <strong>Account Role</strong>
                <span style={{ textTransform: 'capitalize' }}>{activeUser?.role || 'user'}</span>
              </div>
              <div className="profile-detail-item">
                <strong>Platform Status</strong>
                Verified SochX Creator
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Ideas */}
        {activeTab === 'My Ideas' && (
          <div className="profile-accent-card-cyan">
            <h2 className="profile-section-title">My Submitted Ideas ({userIdeas.length})</h2>
            <p className="profile-section-desc">
              Track the approval and community validation status of your submitted innovations in real-time.
            </p>

            {loading ? (
              <p style={{ color: '#6b21a8', padding: '20px 0' }}>Loading your ideas from database...</p>
            ) : userIdeas.length > 0 ? (
              <div>
                {userIdeas.map((idea) => (
                  <div key={idea.id} className="profile-idea-item">
                    <div>
                      <h3 className="profile-idea-title">{idea.title}</h3>
                      <p className="profile-idea-date">
                        Category: {idea.category} • {Number(idea.upvoteCount) || 0} Upvotes • {new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span
                      className={
                        idea.status === 'Approved'
                          ? 'profile-badge-approved'
                          : 'profile-badge-pending'
                      }
                    >
                      {idea.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 600, color: '#3b0764', marginBottom: '8px' }}>
                  You haven't submitted any ideas yet.
                </p>
                <button
                  onClick={() => navigate('/submit-idea')}
                  className="auth-submit-btn"
                  style={{ width: 'auto', padding: '10px 20px', display: 'inline-flex' }}
                >
                  Pitch Your First Idea
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'Settings' && (
          <div className="profile-accent-card-cyan">
            <h2 className="profile-section-title">Account Security & Settings</h2>
            <p className="profile-section-desc">
              Manage your credentials, password security, and active authentication session.
            </p>

            <div className="profile-settings-actions">
              {/* Change Password button: full-width outlined */}
              <button
                onClick={() => setPasswordModal(true)}
                className="profile-btn-outlined-purple"
              >
                <Key size={16} />
                <span>Change Password</span>
              </button>

              {/* Logout button: red outline */}
              <button
                onClick={handleLogout}
                className="profile-btn-outlined-red"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Change Password Modal */}
      {passwordModal && (
        <div className="idea-modal-backdrop" onClick={() => setPasswordModal(false)}>
          <div className="idea-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h2 className="idea-modal-title" style={{ marginBottom: '16px' }}>Change Password</h2>

            {pwdMsg.text && (
              <div
                className={pwdMsg.type === 'error' ? 'auth-error-banner' : 'submit-success-card'}
                style={{ padding: '12px', marginBottom: '16px', textAlign: 'left' }}
              >
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="auth-field-group">
                <label className="auth-label">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div className="auth-field-group" style={{ marginTop: '12px' }}>
                <label className="auth-label">New Password (min 6 characters)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px 26px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: pwdLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                    opacity: pwdLoading ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordModal(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '11px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
