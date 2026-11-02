import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, MessageSquare, Share2, X, Sparkles, ThumbsUp, Loader2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ideasAPI } from '../services/api';
import IdeaCard from '../components/IdeaCard';
import '../styles/Ideas.css';

const defaultIdeasFallback = [
  {
    id: 1,
    title: 'Smart Traffic Management AI',
    category: 'Technology',
    author: 'Arqam Ishaq',
    initials: 'AI',
    timeAgo: 'Recently',
    votes: 2,
    hasVoted: false,
    commentsCount: 2,
    snippet: 'Urban traffic gridlock causes billions of dollars in lost economic productivity...',
    fullDescription: 'An adaptive, real-time edge AI system utilizing computer vision cameras on traffic signals. It dynamically adjusts light durations according to real-time traffic volume and provides emergency corridors.',
    problem: 'Static traffic lights cannot adapt to dynamic congestion or emergency vehicles.',
    solution: 'Deploy edge-compute vision sensors with deep learning controllers to adaptively manage phase timings.',
  },
  {
    id: 2,
    title: 'Peer-to-Peer Skill Swap',
    category: 'Education',
    author: 'Faryal Azhar',
    initials: 'FA',
    timeAgo: 'Recently',
    votes: 1,
    hasVoted: false,
    commentsCount: 1,
    snippet: 'A decentralized micro-mentorship platform where students barter verified skills directly.',
    fullDescription: 'Students swap knowledge (e.g., 1 hour of React tuition for 1 hour of UI/UX design) without financial friction.',
    problem: 'Exorbitant course fees prevent scholars from picking up cross-disciplinary tech skills.',
    solution: 'A gamified peer barter exchange platform backed by user verified portfolio badges and reviews.',
  },
];

const IdeasPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  // Debounce tracking map to prevent rapid spam clicking (400ms cooldown)
  const [votingMap, setVotingMap] = useState({});

  const categories = ['All', 'Technology', 'Education', 'Health', 'Business', 'Social', 'Sustainability'];

  /**
   * Fetch ideas from backend with active query parameters
   */
  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (activeCategory && activeCategory !== 'All') {
        params.category = activeCategory;
      }

      if (sortBy === 'Most Popular') {
        params.sort = 'popular';
      } else {
        params.sort = 'newest';
      }

      const res = await ideasAPI.getAll(params);
      const apiData = Array.isArray(res.data) ? res.data : res.data?.ideas || [];

      if (apiData.length > 0) {
        const formatted = apiData.map((item) => {
          const authorName = item.author || item.authorName || item.submitterName || 'Student Innovator';
          const initials = (authorName || 'SI')
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          const formattedTime = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Recently';

          return {
            id: item.id,
            title: item.title,
            category: item.category || 'Technology',
            author: authorName,
            initials,
            timeAgo: formattedTime,
            votes: Number(item.upvoteCount !== undefined ? item.upvoteCount : item.votes) || 0,
            hasVoted: Boolean(item.hasVoted),
            commentsCount: Number(item.commentsCount) || 0,
            snippet: item.problemDescription || item.snippet || item.problem || 'Innovative community proposal.',
            fullDescription: item.proposedSolution || item.fullDescription || item.solution || '',
            problem: item.problemDescription || item.problem,
            solution: item.proposedSolution || item.solution,
            authorId: item.authorId,
            authorDetails: item.authorDetails || null,
          };
        });
        setIdeas(formatted);
      } else {
        setIdeas([]);
      }
    } catch {
      // Offline fallback: retain fallback ideas
      setIdeas(defaultIdeasFallback);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeCategory, sortBy]);

  // Load ideas on initial mount and when filters change
  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  /**
   * Dynamic Upvoting Handler with 400ms Anti-Spam Debounce
   */
  const handleVote = async (e, id) => {
    e.stopPropagation();

    // 400ms Debounce guard
    if (votingMap[id]) {
      return;
    }

    if (!isAuthenticated) {
      alert('Please log in to upvote ideas and participate in the community.');
      navigate('/login', { state: { from: { pathname: '/ideas' } } });
      return;
    }

    // Set debounce lock for 400ms
    setVotingMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setVotingMap((prev) => ({ ...prev, [id]: false }));
    }, 400);

    // Optimistic UI update
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === id) {
          const newVoted = !idea.hasVoted;
          return {
            ...idea,
            votes: newVoted ? idea.votes + 1 : Math.max(0, idea.votes - 1),
            hasVoted: newVoted,
          };
        }
        return idea;
      })
    );

    // Update modal if open
    if (selectedIdea && selectedIdea.id === id) {
      setSelectedIdea((prev) => {
        const newVoted = !prev.hasVoted;
        return {
          ...prev,
          votes: newVoted ? prev.votes + 1 : Math.max(0, prev.votes - 1),
          hasVoted: newVoted,
        };
      });
    }

    try {
      const res = await ideasAPI.upvote(id);
      if (res.data) {
        const { voted, upvoteCount, votes } = res.data;
        const finalCount = upvoteCount !== undefined ? upvoteCount : votes;

        setIdeas((prev) =>
          prev.map((idea) => {
            if (idea.id === id) {
              return {
                ...idea,
                votes: finalCount !== undefined ? finalCount : idea.votes,
                hasVoted: voted !== undefined ? voted : idea.hasVoted,
              };
            }
            return idea;
          })
        );

        if (selectedIdea && selectedIdea.id === id) {
          setSelectedIdea((prev) => ({
            ...prev,
            votes: finalCount !== undefined ? finalCount : prev.votes,
            hasVoted: voted !== undefined ? voted : prev.hasVoted,
          }));
        }
      }
    } catch {
      // If error, refresh feed to reflect ground truth
      fetchIdeas();
    }
  };

  /**
   * Open full idea modal with live backend details
   */
  const handleOpenModal = async (idea) => {
    setSelectedIdea(idea);
    try {
      setLoadingModal(true);
      const res = await ideasAPI.getById(idea.id);
      if (res.data) {
        const data = res.data;
        setSelectedIdea((prev) => ({
          ...prev,
          ...data,
          votes: Number(data.upvoteCount !== undefined ? data.upvoteCount : prev.votes) || 0,
          problem: data.problemDescription || prev.problem,
          solution: data.proposedSolution || prev.solution,
          comments: data.comments || [],
        }));
      }
    } catch {
      // Keep optimistic item if request fails
    } finally {
      setLoadingModal(false);
    }
  };

  /**
   * Handle real-time idea updates from IdeaCard author edit
   */
  const handleUpdateIdea = (updatedIdea) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === updatedIdea.id ? { ...i, ...updatedIdea } : i))
    );
    if (selectedIdea && selectedIdea.id === updatedIdea.id) {
      setSelectedIdea((prev) => ({ ...prev, ...updatedIdea }));
    }
  };

  /**
   * Handle real-time idea deletion from IdeaCard author action
   */
  const handleDeleteIdea = (deletedId) => {
    setIdeas((prev) => prev.filter((i) => i.id !== deletedId));
    if (selectedIdea && selectedIdea.id === deletedId) {
      setSelectedIdea(null);
    }
  };

  const handleShare = async (e, idea) => {
    e.stopPropagation();
    const ideaTitle = typeof idea === 'string' ? idea : (idea?.title || 'Idea');
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SochX: ${ideaTitle}`,
          text: `Check out this innovative idea on SochX: "${ideaTitle}"`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or native share unavailable, fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(`✅ Link to "${ideaTitle}" copied to clipboard!\n\nAap ab is link ko WhatsApp, LinkedIn, ya kahin bhi Paste (Ctrl+V) kar ke share kar sakte hain.`);
      } catch {
        alert(`Sharing: ${shareUrl}`);
      }
    } else {
      alert(`Link: ${shareUrl}`);
    }
  };

  /**
   * Post new comment to active idea
   */
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      alert('Please log in to participate in the discussion and add comments.');
      navigate('/login', { state: { from: { pathname: '/ideas' } } });
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await ideasAPI.addComment(selectedIdea.id, commentText.trim());
      if (res.data?.comment) {
        const newComment = res.data.comment;
        setSelectedIdea((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), newComment],
          commentsCount: (Number(prev.commentsCount) || 0) + 1,
        }));

        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === selectedIdea.id
              ? { ...idea, commentsCount: (Number(idea.commentsCount) || 0) + 1 }
              : idea
          )
        );

        setCommentText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="ideas-container">
      
      {/* 1. HERO HEADER BANNER */}
      <section className="ideas-hero-banner">
        <div className="ideas-hero-banner-inner">
          <h1 className="ideas-banner-title">Community Innovations</h1>
          <p className="ideas-banner-subtitle">
            Explore, vote, and collaborate on the next big breakthrough ideas submitted by our community.
          </p>
        </div>
      </section>

      {/* 2. SEARCH & FILTER BAR */}
      <section className="ideas-filter-bar">
        <div className="ideas-filter-inner">
          {/* Search Input */}
          <div className="ideas-search-input-wrap">
            <input
              type="text"
              placeholder="Search ideas by title or problem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ideas-search-input"
            />
          </div>

          {/* Category Pill Buttons */}
          <div className="ideas-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`ideas-category-pill ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ideas-sort-select"
              aria-label="Sort ideas"
            >
              <option value="Newest First">Newest First</option>
              <option value="Most Popular">Most Popular</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. IDEAS FEED */}
      <main className="ideas-feed-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '16px', color: '#6b21a8', fontWeight: 600 }}>Loading ideas from MySQL database...</p>
          </div>
        ) : ideas.length > 0 ? (
          <div className="ideas-grid">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onOpenModal={handleOpenModal}
                onVote={handleVote}
                isVoting={Boolean(votingMap[idea.id])}
                onShare={handleShare}
                onUpdateIdea={handleUpdateIdea}
                onDeleteIdea={handleDeleteIdea}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#3b0764', margin: '0 0 8px 0' }}>No Ideas Found</p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Try clearing your search query or selecting a different category filter.</p>
          </div>
        )}
      </main>

      {/* 4. EXPANDED IDEA MODAL */}
      {selectedIdea && (
        <div
          className="idea-modal-backdrop"
          onClick={() => setSelectedIdea(null)}
        >
          <div
            className="idea-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="idea-modal-close-btn"
              onClick={() => setSelectedIdea(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Author Bar */}
            <div className="idea-modal-author-bar">
              <div className="idea-author-avatar">
                {selectedIdea.initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                  {selectedIdea.author}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {selectedIdea.timeAgo} • <span style={{ color: '#6b21a8', fontWeight: 600 }}>{selectedIdea.category}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="idea-modal-title">{selectedIdea.title}</h2>

            {/* Problem Statement */}
            {selectedIdea.problem && (
              <div className="idea-modal-box">
                <div className="idea-modal-section-title">Problem Statement:</div>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  {selectedIdea.problem}
                </p>
              </div>
            )}

            {/* Proposed Solution */}
            {selectedIdea.solution && (
              <div className="idea-modal-box">
                <div className="idea-modal-section-title" style={{ color: '#059669' }}>
                  Proposed Solution:
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  {selectedIdea.solution}
                </p>
              </div>
            )}

            {/* Discussion Thread & Comment Box */}
            <div id="idea-discussion-section" className="idea-modal-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', marginTop: '16px' }}>
              <div className="idea-modal-section-title" style={{ color: '#6b21a8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Discussion & Feedback ({selectedIdea.comments?.length || 0})</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>Live Discussion</span>
              </div>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedIdea.comments && selectedIdea.comments.length > 0 ? (
                  selectedIdea.comments.map((comment) => (
                    <div key={comment.id} style={{ fontSize: '13px', padding: '10px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ color: '#1e293b' }}>{comment.userName || comment.username || 'Innovator'}</strong>
                        {comment.roleBadge && (
                          <span style={{ fontSize: '10px', background: '#f3e8ff', color: '#6b21a8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {comment.roleBadge}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#475569', lineHeight: 1.5 }}>{comment.commentText}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    No comments yet. Be the first to share your feedback or join the discussion!
                  </div>
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleAddComment} style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={isAuthenticated ? "Write a comment or feedback..." : "Log in to post a comment..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submittingComment}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#fff'
                  }}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  style={{
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: submittingComment || !commentText.trim() ? 'not-allowed' : 'pointer',
                    opacity: submittingComment || !commentText.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  <span>Post</span>
                </button>
              </form>
            </div>

            {/* Actions: [ ▲ Upvote ] and [ 💬 Comments ] */}
            <div className="idea-modal-actions">
              <button
                className={`idea-modal-action-btn-upvote ${selectedIdea.hasVoted ? 'voted' : ''}`}
                onClick={(e) => handleVote(e, selectedIdea.id)}
                disabled={Boolean(votingMap[selectedIdea.id])}
                style={{
                  cursor: votingMap[selectedIdea.id] ? 'not-allowed' : 'pointer',
                  opacity: votingMap[selectedIdea.id] ? 0.75 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                ▲ Upvote ({selectedIdea.votes})
              </button>
              <button
                className="idea-modal-action-btn-discuss"
                onClick={() => {
                  const el = document.getElementById('idea-discussion-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                💬 Comments ({selectedIdea.comments?.length || selectedIdea.commentsCount || 0})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default IdeasPage;
