import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLeadDetails, useAgents, useLeads } from '../context';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Contexts
  const {
    currentLead,
    loadingLead,
    leadError,
    comments,
    fetchLeadDetails,
    fetchLeadComments,
    updateCurrentLead,
    addNewComment,
    clearCurrentLead,
  } = useLeadDetails();

  const { agents, SOURCES, STATUSES, PRIORITIES } = useAgents();
  const { removeLead, updateLeadInList } = useLeads();

  // Local editing UI states
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  // New comment UI states
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Load Lead details & comments on mount / ID change
  useEffect(() => {
    fetchLeadDetails(id);
    fetchLeadComments(id);

    return () => {
      clearCurrentLead();
    };
  }, [id, fetchLeadDetails, fetchLeadComments, clearCurrentLead]);

  // Sync edit form with fetched lead
  useEffect(() => {
    if (currentLead) {
      setEditFormData({
        name: currentLead.name || '',
        source: currentLead.source || 'Website',
        salesAgent: currentLead.salesAgent?._id || currentLead.salesAgent || '',
        status: currentLead.status || 'New',
        tags: (currentLead.tags || []).join(', '),
        timeToClose: currentLead.timeToClose || 30,
        priority: currentLead.priority || 'Medium',
      });

      // Pre-select comment author to assigned agent if available
      if (currentLead.salesAgent?._id) {
        setCommentAuthor(currentLead.salesAgent._id);
      } else if (typeof currentLead.salesAgent === 'string' && currentLead.salesAgent) {
        setCommentAuthor(currentLead.salesAgent);
      }
    }
  }, [currentLead]);

  // Handle Edit input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'timeToClose' ? Number(value) : value,
    }));
  };

  // Submit Update Lead
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const payload = {
        name: editFormData.name,
        source: editFormData.source,
        salesAgent: editFormData.salesAgent,
        status: editFormData.status,
        timeToClose: Number(editFormData.timeToClose),
        priority: editFormData.priority,
        tags: editFormData.tags
          ? editFormData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const updated = await updateCurrentLead(id, payload);
      updateLeadInList(updated);
      setIsEditing(false);
      alert('Lead updated successfully!');
    } catch (err) {
      alert('Error updating lead: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Helper to get comment author's display name
  const getAuthorName = (author) => {
    if (!author) return 'Anonymous';
    if (typeof author === 'object' && author.name) return author.name;
    const match = agents.find((a) => a._id === author);
    return match ? match.name : author;
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) {
      alert('Please provide both your name and comment text.');
      return;
    }

    setCommentLoading(true);
    try {
      await addNewComment(id, {
        author: commentAuthor.trim(),
        commentText: commentText.trim(),
      });
      setCommentText('');
    } catch (err) {
      alert('Failed to add comment: ' + (err.response?.data?.message || err.message));
    } finally {
      setCommentLoading(false);
    }
  };

  // Delete lead
  const handleDeleteLead = async () => {
    if (!window.confirm(`Are you sure you want to delete lead "${currentLead?.name}"?`)) return;
    try {
      await removeLead(id);
      navigate('/leads');
    } catch (err) {
      alert('Failed to delete lead: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loadingLead) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading lead details...</p>
      </div>
    );
  }

  if (leadError || !currentLead) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{leadError || 'Lead not found.'}</div>
        <Link to="/leads" className="btn btn-outline-secondary">
          ← Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Top Breadcrumb & Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <Link to="/leads" className="text-decoration-none text-secondary small fw-semibold">
            ← Back to All Leads
          </Link>
          <h2 className="fw-bold mt-1 mb-0">{currentLead.name}</h2>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} fw-semibold`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : '✏️ Edit Lead'}
          </button>
          <button className="btn btn-outline-danger fw-semibold" onClick={handleDeleteLead}>
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Lead Info or Edit Form */}
        <div className="col-lg-7">
          {isEditing ? (
            /* Update Form */
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0">✏️ Update Lead Details</h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Lead Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Lead Source</label>
                      <select
                        className="form-select"
                        name="source"
                        value={editFormData.source}
                        onChange={handleEditChange}
                        required
                      >
                        {SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Assigned Sales Agent</label>
                      <select
                        className="form-select"
                        name="salesAgent"
                        value={editFormData.salesAgent}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">-- Select Agent --</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditChange}
                        required
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Time to Close (Days)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        name="timeToClose"
                        value={editFormData.timeToClose}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Priority</label>
                      <select
                        className="form-select"
                        name="priority"
                        value={editFormData.priority}
                        onChange={handleEditChange}
                        required
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tags"
                      placeholder="e.g. High Value, Follow-up"
                      value={editFormData.tags}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success fw-semibold"
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Saving Changes...' : 'Save Updates'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Lead Overview Card */
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Overview</h5>
                <span className="badge bg-primary px-3 py-2">{currentLead.status}</span>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="text-muted small d-block">Lead Name</label>
                    <span className="fw-semibold fs-5">{currentLead.name}</span>
                  </div>

                  <div className="col-sm-6">
                    <label className="text-muted small d-block">Assigned Sales Agent</label>
                    <span className="fw-semibold">
                      👤 {currentLead.salesAgent?.name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label className="text-muted small d-block">Source</label>
                    <span className="badge bg-secondary">{currentLead.source}</span>
                  </div>

                  <div className="col-sm-6">
                    <label className="text-muted small d-block">Priority</label>
                    <span
                      className={`badge ${
                        currentLead.priority === 'High'
                          ? 'bg-danger'
                          : currentLead.priority === 'Medium'
                          ? 'bg-primary'
                          : 'bg-secondary'
                      }`}
                    >
                      {currentLead.priority}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label className="text-muted small d-block">Estimated Time to Close</label>
                    <span className="fw-semibold">
                      ⏱️ {currentLead.timeToClose} {currentLead.timeToClose === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label className="text-muted small d-block">Created At</label>
                    <span className="text-secondary small">
                      {currentLead.createdAt
                        ? new Date(currentLead.createdAt).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="col-12 mt-3">
                    <label className="text-muted small d-block mb-1">Tags</label>
                    <div className="d-flex flex-wrap gap-1">
                      {currentLead.tags && currentLead.tags.length > 0 ? (
                        currentLead.tags.map((tag, i) => (
                          <span key={i} className="badge bg-info bg-opacity-25 text-dark">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted small">No tags added yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Comments Section */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light py-3">
              <h5 className="mb-0 fw-bold">💬 Comments & Updates</h5>
            </div>

            <div className="card-body p-4">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-4 pb-3 border-bottom">
                <div className="mb-2">
                  <select
                    className="form-select form-select-sm"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    required
                  >
                    <option value="">-- Select Author (Sales Agent) --</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        👤 {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    placeholder="Write a comment or progress update..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-sm btn-dark w-100 fw-semibold"
                  disabled={commentLoading}
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comments List */}
              <div
                className="comments-list d-flex flex-column gap-3"
                style={{ maxHeight: '420px', overflowY: 'auto' }}
              >
                {comments.length === 0 ? (
                  <p className="text-muted text-center py-4 small">
                    No comments yet. Leave a note above to track progress!
                  </p>
                ) : (
                  comments.map((c, idx) => (
                    <div key={c._id || idx} className="p-3 bg-light rounded border">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark small">
                          👤 {getAuthorName(c.author)}
                        </strong>
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString() +
                              ' ' +
                              new Date(c.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                      </div>
                      <p className="mb-0 small text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                        {c.commentText}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
