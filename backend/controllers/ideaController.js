const { pool } = require('../config/db');

/**
 * Helper to format idea object with both database column names
 * and frontend alias keys for 100% interoperability.
 */
const formatIdea = (row, currentUserId = null) => {
  const authorName = row.authorName || row.submitterName || 'Student Innovator';
  const initials = authorName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: row.id,
    title: row.title,
    problemDescription: row.problemDescription,
    proposedSolution: row.proposedSolution,
    category: row.category,
    submitterName: row.submitterName,
    submitterEmail: row.submitterEmail,
    authorId: row.authorId,
    status: row.status,
    upvoteCount: Number(row.upvoteCount) || 0,
    commentsCount: Number(row.commentsCount) || 0,
    createdAt: row.createdAt,
    // Frontend compatibility aliases
    author: authorName,
    initials,
    votes: Number(row.upvoteCount) || 0,
    problem: row.problemDescription,
    solution: row.proposedSolution,
    hasVoted: Boolean(row.userHasVoted),
    authorDetails: row.authorId
      ? {
          id: row.authorId,
          fullName: row.authorName,
          username: row.authorUsername,
          roleBadge: row.authorRoleBadge,
        }
      : null,
  };
};

/**
 * @desc    Fetch all ideas with search, category filter, and sorting
 * @route   GET /api/ideas
 * @access  Public (Optional auth to detect if current user has voted)
 */
const getIdeas = async (req, res, next) => {
  try {
    const { search, category, sort, status } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let baseQuery = `
      SELECT 
        i.*,
        u.fullName AS authorName,
        u.username AS authorUsername,
        u.roleBadge AS authorRoleBadge
        ${currentUserId ? `, (SELECT COUNT(1) FROM idea_upvotes uv WHERE uv.ideaId = i.id AND uv.userId = ?) AS userHasVoted` : `, 0 AS userHasVoted`}
      FROM ideas i
      LEFT JOIN users u ON i.authorId = u.id
      WHERE 1=1
    `;

    const queryParams = [];
    if (currentUserId) {
      queryParams.push(currentUserId);
    }

    // 1. Status Filter: Public feed displays 'APPROVED' ideas by default
    const targetStatus = status ? status.trim().toUpperCase() : 'APPROVED';
    if (targetStatus !== 'ALL' && targetStatus !== '') {
      baseQuery += ' AND UPPER(i.status) = ?';
      queryParams.push(targetStatus);
    }

    // 2. Category Filter
    if (category && category !== 'All' && category.trim() !== '') {
      baseQuery += ' AND i.category = ?';
      queryParams.push(category.trim());
    }

    // 3. Search Term Filter
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      baseQuery += ' AND (i.title LIKE ? OR i.problemDescription LIKE ? OR i.proposedSolution LIKE ?)';
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // 4. Sorting
    if (sort === 'popular') {
      baseQuery += ' ORDER BY i.upvoteCount DESC, i.createdAt DESC';
    } else {
      // Default: newest
      baseQuery += ' ORDER BY i.createdAt DESC';
    }

    const [rows] = await pool.query(baseQuery, queryParams);
    const formattedIdeas = rows.map((row) => formatIdea(row, currentUserId));

    return res.status(200).json(formattedIdeas);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch a single idea by ID with author details & comments
 * @route   GET /api/ideas/:id
 * @access  Public
 */
const getIdeaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const query = `
      SELECT 
        i.*,
        u.fullName AS authorName,
        u.username AS authorUsername,
        u.roleBadge AS authorRoleBadge,
        u.bio AS authorBio,
        u.rankVal AS authorRank
        ${currentUserId ? `, (SELECT COUNT(1) FROM idea_upvotes uv WHERE uv.ideaId = i.id AND uv.userId = ?) AS userHasVoted` : `, 0 AS userHasVoted`}
      FROM ideas i
      LEFT JOIN users u ON i.authorId = u.id
      WHERE i.id = ?
      LIMIT 1
    `;

    const params = currentUserId ? [currentUserId, id] : [id];
    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found with the requested ID',
      });
    }

    // Fetch related discussion comments
    const [comments] = await pool.query(
      `SELECT 
         c.id, c.commentText, c.createdAt,
         u.id AS userId, u.fullName AS userName, u.username, u.roleBadge
       FROM comments c
       JOIN users u ON c.userId = u.id
       WHERE c.ideaId = ?
       ORDER BY c.createdAt ASC`,
      [id]
    );

    const idea = formatIdea(rows[0], currentUserId);
    idea.comments = comments;

    return res.status(200).json(idea);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a new idea
 * @route   POST /api/ideas
 * @access  Strictly Protected
 */
const createIdea = async (req, res, next) => {
  try {
    // 1. Enforce authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: You must be logged in to submit an idea.',
      });
    }

    const {
      title,
      problemDescription,
      problem,
      proposedSolution,
      solution,
      category,
      submitterName,
      submitterEmail,
    } = req.body;

    const rawProblem = problemDescription || problem;
    const rawSolution = proposedSolution || solution;

    // 2. Strict Input Sanitization & Empty/Whitespace Check
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    const trimmedProblem = typeof rawProblem === 'string' ? rawProblem.trim() : '';
    const trimmedSolution = typeof rawSolution === 'string' ? rawSolution.trim() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';

    if (!trimmedTitle || !trimmedProblem || !trimmedSolution || !trimmedCategory) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Idea Title, Problem, Solution, and Category cannot be empty or whitespace only.',
      });
    }

    const validCategories = ['Technology', 'Education', 'Health', 'Business', 'Social', 'Sustainability'];
    if (!validCategories.includes(trimmedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const authorId = req.user.id;
    const finalSubmitterName = (req.user.fullName || req.user.name || submitterName || 'Student Innovator').trim();
    const finalSubmitterEmail = (req.user.email || submitterEmail || '').trim();
    const status = 'Pending';

    // 3. Parameterized Query execution
    const [result] = await pool.query(
      `INSERT INTO ideas (title, problemDescription, proposedSolution, category, submitterName, submitterEmail, authorId, status, upvoteCount, commentsCount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        trimmedTitle,
        trimmedProblem,
        trimmedSolution,
        trimmedCategory,
        finalSubmitterName,
        finalSubmitterEmail,
        authorId,
        status,
      ]
    );

    const insertedId = result.insertId;

    const [newIdeaRows] = await pool.query(
      `SELECT i.*, u.fullName AS authorName, u.username AS authorUsername, u.roleBadge AS authorRoleBadge
       FROM ideas i
       LEFT JOIN users u ON i.authorId = u.id
       WHERE i.id = ?`,
      [insertedId]
    );

    const createdIdea = formatIdea(newIdeaRows[0]);

    return res.status(201).json({
      success: true,
      message: 'Idea submitted successfully and queued for admin review!',
      idea: createdIdea,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle upvote on an idea (Vote or Remove Vote) with strict transaction & race-condition safety
 * @route   POST /api/ideas/:id/upvote (and /api/ideas/:id/vote)
 * @access  Private
 */
const toggleUpvote = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    await connection.beginTransaction();

    // 1. Lock idea row to serialize concurrent votes on this idea
    const [ideaRows] = await connection.query(
      'SELECT id, upvoteCount FROM ideas WHERE id = ? FOR UPDATE',
      [id]
    );

    if (ideaRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Idea not found',
      });
    }

    // 2. Lock user's upvote record for this idea
    const [voteRows] = await connection.query(
      'SELECT id FROM idea_upvotes WHERE ideaId = ? AND userId = ? LIMIT 1 FOR UPDATE',
      [id, userId]
    );

    let hasVoted = false;
    let newCount = Number(ideaRows[0].upvoteCount) || 0;

    if (voteRows.length > 0) {
      // User already voted -> REMOVE UPVOTE (Unlike)
      await connection.query(
        'DELETE FROM idea_upvotes WHERE ideaId = ? AND userId = ?',
        [id, userId]
      );
      newCount = Math.max(0, newCount - 1);
      await connection.query(
        'UPDATE ideas SET upvoteCount = ? WHERE id = ?',
        [newCount, id]
      );
      hasVoted = false;
    } else {
      // User has not voted -> ADD UPVOTE (Like)
      try {
        await connection.query(
          'INSERT INTO idea_upvotes (ideaId, userId) VALUES (?, ?)',
          [id, userId]
        );
        newCount = newCount + 1;
        await connection.query(
          'UPDATE ideas SET upvoteCount = ? WHERE id = ?',
          [newCount, id]
        );
        hasVoted = true;
      } catch (insertErr) {
        // Concurrency safeguard: If ER_DUP_ENTRY happened concurrently, toggle off safely
        if (insertErr.code === 'ER_DUP_ENTRY' || insertErr.errno === 1062) {
          await connection.query(
            'DELETE FROM idea_upvotes WHERE ideaId = ? AND userId = ?',
            [id, userId]
          );
          newCount = Math.max(0, newCount - 1);
          await connection.query(
            'UPDATE ideas SET upvoteCount = ? WHERE id = ?',
            [newCount, id]
          );
          hasVoted = false;
        } else {
          throw insertErr;
        }
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      voted: hasVoted,
      upvoteCount: newCount,
      votes: newCount,
      message: hasVoted ? 'Idea upvoted successfully' : 'Upvote removed',
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Add a comment to an idea
 * @route   POST /api/ideas/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { commentText } = req.body;

    if (!commentText || commentText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty',
      });
    }

    await connection.beginTransaction();

    // Verify idea exists
    const [ideaRows] = await connection.query('SELECT id FROM ideas WHERE id = ?', [id]);
    if (ideaRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    // Insert comment
    const [result] = await connection.query(
      'INSERT INTO comments (ideaId, userId, commentText) VALUES (?, ?, ?)',
      [id, userId, commentText.trim()]
    );

    // Increment commentsCount in ideas table
    await connection.query(
      'UPDATE ideas SET commentsCount = commentsCount + 1 WHERE id = ?',
      [id]
    );

    await connection.commit();

    // Fetch created comment with user info
    const [commentRows] = await pool.query(
      `SELECT c.id, c.commentText, c.createdAt, u.id AS userId, u.fullName AS userName, u.username, u.roleBadge
       FROM comments c
       JOIN users u ON c.userId = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      comment: commentRows[0],
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * @desc    Update an idea (Author only)
 * @route   PUT /api/ideas/:id
 * @access  Private
 */
const updateIdea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Query idea from ideas table
    const [ideaRows] = await pool.query('SELECT * FROM ideas WHERE id = ? LIMIT 1', [id]);
    if (ideaRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found with the requested ID',
      });
    }

    const currentIdea = ideaRows[0];

    // 2. Strict Security Check: Verify author
    if (Number(currentIdea.authorId) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this idea',
      });
    }

    const {
      title,
      problemDescription,
      problem,
      proposedSolution,
      solution,
      category,
    } = req.body;

    const rawProblem = problemDescription || problem;
    const rawSolution = proposedSolution || solution;

    const trimmedTitle = typeof title === 'string' && title.trim() !== '' ? title.trim() : currentIdea.title;
    const trimmedProblem = typeof rawProblem === 'string' && rawProblem.trim() !== '' ? rawProblem.trim() : currentIdea.problemDescription;
    const trimmedSolution = typeof rawSolution === 'string' && rawSolution.trim() !== '' ? rawSolution.trim() : currentIdea.proposedSolution;
    const trimmedCategory = typeof category === 'string' && category.trim() !== '' ? category.trim() : currentIdea.category;

    const validCategories = ['Technology', 'Education', 'Health', 'Business', 'Social', 'Sustainability'];
    if (!validCategories.includes(trimmedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    // 3. Parameterized Update Query
    await pool.query(
      `UPDATE ideas 
       SET title = ?, problemDescription = ?, proposedSolution = ?, category = ?
       WHERE id = ?`,
      [trimmedTitle, trimmedProblem, trimmedSolution, trimmedCategory, id]
    );

    // 4. Fetch updated idea with author details
    const [updatedRows] = await pool.query(
      `SELECT i.*, u.fullName AS authorName, u.username AS authorUsername, u.roleBadge AS authorRoleBadge
       FROM ideas i
       LEFT JOIN users u ON i.authorId = u.id
       WHERE i.id = ?`,
      [id]
    );

    const updatedIdea = formatIdea(updatedRows[0], userId);

    return res.status(200).json({
      success: true,
      message: 'Idea updated successfully',
      idea: updatedIdea,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an idea (Author or Admin)
 * @route   DELETE /api/ideas/:id
 * @access  Private
 */
const deleteIdea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1. Query idea
    const [ideaRows] = await pool.query('SELECT * FROM ideas WHERE id = ? LIMIT 1', [id]);
    if (ideaRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found with requested ID',
      });
    }

    const currentIdea = ideaRows[0];

    // 2. Strict Security Check: Author or Admin
    if (Number(currentIdea.authorId) !== Number(userId) && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this idea',
      });
    }

    // 3. Delete idea (Cascade deletes upvotes & comments via DB foreign keys)
    await pool.query('DELETE FROM ideas WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Idea deleted successfully',
      deletedId: Number(id),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  toggleUpvote,
  addComment,
};
