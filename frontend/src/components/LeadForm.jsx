import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads, useAgents } from '../context';

const LeadForm = () => {
  const navigate = useNavigate();
  const { addLead } = useLeads();
  const { agents, tags, SOURCES, STATUSES, PRIORITIES } = useAgents();

  const [formData, setFormData] = useState({
    name: '',
    source: 'Website',
    salesAgent: '',
    status: 'New',
    tags: [],
    timeToClose: 30,
    priority: 'Medium',
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync available tags and default agent from AgentContext
  useEffect(() => {
    if (tags && tags.length > 0) {
      setAvailableTags(tags);
    }
    if (agents && agents.length > 0 && !formData.salesAgent) {
      setFormData((prev) => ({ ...prev, salesAgent: agents[0]._id }));
    }
  }, [agents, tags]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'timeToClose' ? Number(value) : value,
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setCustomTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide a Lead Name.');
      return;
    }
    if (!formData.salesAgent) {
      setError('Please select an assigned sales agent.');
      return;
    }
    if (formData.timeToClose <= 0) {
      setError('Time to close must be a positive number.');
      return;
    }

    setLoading(true);
    try {
      await addLead(formData);
      navigate('/leads');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError('Error creating lead: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white py-3">
              <h4 className="mb-0">Create New Lead</h4>
            </div>

            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Lead Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Lead Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="e.g. Acme Corp or John Smith"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  {/* Lead Source */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Lead Source <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      required
                    >
                      {SOURCES.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned Sales Agent */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Assigned Sales Agent <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="salesAgent"
                      value={formData.salesAgent}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Sales Agent --</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                    {agents.length === 0 && (
                      <small className="text-muted">
                        No sales agents found. Please add sales agents first.
                      </small>
                    )}
                  </div>
                </div>

                <div className="row">
                  {/* Lead Status */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold">
                      Lead Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time to Close */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold">
                      Time to Close (Days) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      name="timeToClose"
                      value={formData.timeToClose}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Priority */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold">
                      Priority <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      {PRIORITIES.map((pr) => (
                        <option key={pr} value={pr}>
                          {pr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags (Multi-Select) */}
                <div className="mb-4">
                  <label className="form-label fw-semibold d-block">
                    Tags (Select multiple to categorize)
                  </label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {availableTags.map((tag) => {
                      const isSelected = formData.tags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`btn btn-sm ${
                            isSelected ? 'btn-success text-white' : 'btn-outline-secondary'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom tag input */}
                  <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add another tag..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      onClick={handleAddCustomTag}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={() => navigate('/leads')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
