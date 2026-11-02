import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, MessageSquare, Share2, Edit3, Trash2, X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ideasAPI } from '../services/api';
import '../styles/IdeaCard.css';

/**
 * IdeaCard Component
 * Features author-specific contextual menu (Edit & Delete) with strict ownership checks.
 */
const IdeaCard = ({
  idea,
  onOpenModal,
  onVote,
  isVoting = false,
  onShare,
  onUpdateIdea,
  onDeleteIdea,
}) => {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  // CRITICAL PERMISSION RULE: Only author can view & interact with contextual menu
  const isAuthor = Boolean(
    activeUser &&
    idea.authorId &&
    Number(activeUser.id) === Number(idea.authorId)
  );

  // Context Menu State
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Technology',
    problemDescription: '',
    proposedSolution: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Open Edit Modal with pre-filled fields
  const handleOpenEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setEditError('');
    setEditFormData({
      title: idea.title || '',
      category: idea.category || 'Technology',
      problemDescription: idea.problem || idea.problemDescription || idea.snippet || '',
      proposedSolution: idea.solution || idea.proposedSolution || idea.fullDescription || '',
    });
    setIsEditing(true);
  };

  // Submit Edit to Backend
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    const trimmedTitle = editFormData.title.trim();
    const trimmedProblem = editFormData.problemDescription.trim();
    const trimmedSolution = editFormData.proposedSolution.trim();
    const category = editFormData.category;

    if (!trimmedTitle || !trimmedProblem || !trimmedSolution || !category) {
      setEditError('Please fill in all fields (Title, Problem, Solution, and Category).');
      return;
    }

    try {
      setEditLoading(true);
      const res = await ideasAPI.update(idea.id, {
        title: trimmedTitle,
        category,
        problemDescription: trimmedProblem,
        proposedSolution: trimmedSolution,
      });

      const updatedIdeaData = res.data?.idea || {
        ...idea,
        title: trimmedTitle,
        category,
        problem: trimmedProblem,
        solution: trimmedSolution,
        problemDescription: trimmedProblem,
        proposedSolution: trimmedSolution,
        snippet: trimmedProblem,
        fullDescription: trimmedSolution,
      };

      if (onUpdateIdea) {
        onUpdateIdea(updatedIdeaData);
      }

      setIsEditing(false);
    } catch (err) {
      setEditError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Idea
  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);

    const confirmed = window.confirm(
      `Are you sure you want to delete this idea?\n\n"${idea.title}"\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await ideasAPI.delete(idea.id);
      if (onDeleteIdea) {
        onDeleteIdea(idea.id);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete idea. Please try again.');
    }
  };

  return (
    <>
      <div
        className="idea-card"
        onClick={() => onOpenModal && onOpenModal(idea)}
      >
        <div>
          {/* Author Row */}
          <div className="idea-author-row">
            <div className="idea-author-left">
              <div className="idea-author-avatar">
                {idea.initials || 'SI'}
              </div>
              <div className="idea-author-meta">
                <span className="idea-author-name">{idea.author}</span>
                <span className="idea-author-time">{idea.timeAgo}</span>
              </div>
            </div>

            <div className="idea-author-right">
              <span className="idea-category-tag">{idea.category}</span>

              {/* THREE-DOTS MENU: Always visible on every idea card */}
              <div className="idea-menu-wrap" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                <button
                  className={`idea-menu-trigger-btn ${menuOpen ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  title={isAuthor ? "Author options" : "Idea options"}
                  aria-label="Idea options menu"
                  aria-expanded={menuOpen}
                >
                  <MoreHorizontal size={18} />
                </button>

                {/* Context Dropdown Anchored Below Three Dots */}
                {menuOpen && (
                  <div className="idea-dropdown-menu">
                    {isAuthor ? (
                      <>
                        <button
                          className="idea-dropdown-item"
                          onClick={handleOpenEdit}
                        >
                          <Edit3 size={15} color="#7c3aed" />
                          <span>✏️ Edit Idea</span>
                        </button>

                        <div className="idea-dropdown-divider" />

                        <button
                          className="idea-dropdown-item danger"
                          onClick={handleDelete}
                        >
                          <Trash2 size={15} color="#ef4444" />
                          <span>🗑️ Delete Idea</span>
                        </button>
                      </>
                    ) : (
                      <div className="idea-dropdown-restricted">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 700, fontSize: '12px' }}>
                          <AlertCircle size={14} color="#7c3aed" />
                          <span>Author Restricted</span>
                        </div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                          Only the author (<strong>{idea.author}</strong>) has permission to edit or delete this idea.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="idea-card-title">{idea.title}</h3>

          {/* Snippet */}
          <p className="idea-card-snippet">{idea.snippet}</p>

          {/* Read Full Idea Trigger */}
          <button
            className="idea-read-more-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenModal) onOpenModal(idea);
            }}
          >
            Read full idea →
          </button>
        </div>

        {/* Card Footer */}
        <div className="idea-card-footer">
          <button
            className={`idea-upvote-btn ${idea.hasVoted ? 'voted' : ''}`}
            onClick={(e) => onVote && onVote(e, idea.id)}
            disabled={isVoting}
            style={{
              cursor: isVoting ? 'not-allowed' : 'pointer',
              opacity: isVoting ? 0.75 : 1,
              transition: 'all 0.15s ease',
            }}
            title={activeUser ? 'Click to toggle upvote' : 'Log in to upvote'}
          >
            ▲ {idea.votes}
          </button>

          <div className="idea-footer-actions">
            <span className="idea-comment-count" title="Comments">
              <MessageSquare size={16} /> {idea.commentsCount}
            </span>
            <button
              className="idea-share-btn"
              onClick={(e) => onShare && onShare(e, idea.title)}
              title="Share idea link"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ==============================================================================
          EDIT IDEA MODAL POPUP (SMOOTH SCROLLING WITH PINNED FOOTER)
          ============================================================================== */}
      {isEditing && (
        <div
          className="edit-modal-backdrop"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="edit-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="edit-modal-header">
              <div className="edit-modal-title-wrap">
                <div className="edit-modal-icon-badge">
                  <Sparkles size={18} />
                </div>
                <h2 className="edit-modal-title">Edit Your Innovation</h2>
              </div>
              <button
                className="edit-modal-close-btn"
                onClick={() => setIsEditing(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form with Flex Layout for smooth body scrolling */}
            <form className="edit-modal-form" onSubmit={handleSaveEdit}>
              <div className="edit-modal-body">
                {editError && (
                  <div className="edit-error-banner">
                    <AlertCircle size={16} />
                    <span>{editError}</span>
                  </div>
                )}

                {/* Title */}
                <div className="edit-field-group">
                  <label htmlFor="edit-title" className="edit-label">
                    Idea Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="edit-input"
                    placeholder="e.g. Smart Traffic Management AI"
                  />
                </div>

                {/* Category */}
                <div className="edit-field-group">
                  <label htmlFor="edit-category" className="edit-label">
                    Category Domain <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    id="edit-category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="edit-select"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Business">Business</option>
                    <option value="Social">Social</option>
                    <option value="Sustainability">Sustainability</option>
                  </select>
                </div>

                {/* Problem Description */}
                <div className="edit-field-group">
                  <label htmlFor="edit-problem" className="edit-label">
                    Problem Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    id="edit-problem"
                    required
                    rows={4}
                    value={editFormData.problemDescription}
                    onChange={(e) => setEditFormData({ ...editFormData, problemDescription: e.target.value })}
                    className="edit-textarea"
                    placeholder="Describe the real-world friction or problem..."
                  />
                </div>

                {/* Proposed Solution */}
                <div className="edit-field-group">
                  <label htmlFor="edit-solution" className="edit-label">
                    Proposed Solution & Architecture <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    id="edit-solution"
                    required
                    rows={4}
                    value={editFormData.proposedSolution}
                    onChange={(e) => setEditFormData({ ...editFormData, proposedSolution: e.target.value })}
                    className="edit-textarea"
                    placeholder="Explain your technical solution and impact..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="edit-modal-footer">
                <button
                  type="button"
                  className="edit-btn-cancel"
                  onClick={() => setIsEditing(false)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-btn-save"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default IdeaCard;
