import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAgents } from '../context';

const SalesAgentForm = () => {
  const navigate = useNavigate();
  const { addAgent, agents } = useAgents();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      setError('Sales agent name is required.');
      return;
    }

    if (!trimmedEmail) {
      setError('Sales agent email is required.');
      return;
    }

    // Basic email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await addAgent({
        name: trimmedName,
        email: trimmedEmail,
      });

      setSuccess('Sales agent added successfully!');
      setTimeout(() => {
        navigate('/agent-view');
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to add sales agent.';

      // Friendly duplicate email message
      if (msg.includes('duplicate') || msg.includes('E11000')) {
        setError('A sales agent with this email already exists.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Top Breadcrumb */}
      <div className="mb-4">
        <Link to="/agent-view" className="text-decoration-none text-secondary small fw-semibold">
          Back to Sales Agents
        </Link>
        <h2 className="fw-bold mt-1 mb-0">Add New Sales Agent</h2>
        <p className="text-muted small">
          Register a new sales representative to assign and track leads.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Form Card */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white py-3">
              <h5 className="mb-0 fw-semibold">Agent Details</h5>
            </div>

            <div className="card-body p-4">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              {success && <div className="alert alert-success py-2">{success}</div>}

              <form onSubmit={handleSubmit}>
                {/* Agent Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="e.g. Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">The representative's full legal or display name.</div>
                </div>

                {/* Agent Email */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="e.g. jane.doe@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">Must be a unique email address across all agents.</div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={() => navigate('/agent-view')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      'Add Sales Agent'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Existing Agents Sidebar */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold small text-secondary text-uppercase">
                Active Team Members ({agents.length})
              </h5>
            </div>
            <div
              className="card-body p-3 d-flex flex-column gap-2"
              style={{ maxHeight: '380px', overflowY: 'auto' }}
            >
              {agents.length === 0 ? (
                <p className="text-muted small text-center py-4 mb-0">
                  No sales agents registered yet. Add your first agent using the form!
                </p>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent._id}
                    className="p-2 px-3 bg-light rounded border d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold text-dark small">{agent.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {agent.email}
                      </div>
                    </div>
                    <span className="badge bg-success bg-opacity-25 text-success small">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAgentForm;
