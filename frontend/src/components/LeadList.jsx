import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLeads, useAgents } from '../context';

const LeadList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // From Context
  const { leads, loading, error, fetchLeads, removeLead } = useLeads();
  const { agents, tags: tagsList, SOURCES, STATUSES } = useAgents();

  // URL query parameters
  const salesAgentParam = searchParams.get('salesAgent') || '';
  const statusParam = searchParams.get('status') || '';
  const sourceParam = searchParams.get('source') || '';
  const tagsParam = searchParams.get('tags') || '';
  const sortParam = searchParams.get('sort') || 'default';

  // Fetch leads whenever URL query filters change
  useEffect(() => {
    const queryObj = {};
    if (salesAgentParam) queryObj.salesAgent = salesAgentParam;
    if (statusParam) queryObj.status = statusParam;
    if (sourceParam) queryObj.source = sourceParam;
    if (tagsParam) queryObj.tags = tagsParam;

    fetchLeads(queryObj);
  }, [salesAgentParam, statusParam, sourceParam, tagsParam, fetchLeads]);

  // Update URL search parameters when user selects a filter
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  // Delete lead handler
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead "${name}"?`)) return;
    try {
      await removeLead(id);
    } catch (err) {
      alert('Failed to delete lead: ' + (err.response?.data?.message || err.message));
    }
  };

  const sortedLeads = useMemo(() => {
    const list = [...leads];
    if (sortParam === 'timeToClose_asc') {
      return list.sort((a, b) => (a.timeToClose || 0) - (b.timeToClose || 0));
    }
    if (sortParam === 'timeToClose_desc') {
      return list.sort((a, b) => (b.timeToClose || 0) - (a.timeToClose || 0));
    }
    if (sortParam === 'priority') {
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      return list.sort((a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0));
    }
    return list;
  }, [leads, sortParam]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-primary';
      case 'Contacted':
        return 'bg-info text-dark';
      case 'Qualified':
        return 'bg-warning text-dark';
      case 'Proposal Sent':
        return 'bg-secondary';
      case 'Closed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  // Helper for priority badge color
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge bg-danger';
      case 'Medium':
        return 'badge bg-primary';
      case 'Low':
        return 'badge bg-light text-dark border';
      default:
        return 'badge bg-secondary';
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">All Leads</h2>
          <p className="text-muted mb-0">Browse, filter, and manage your pipeline leads.</p>
        </div>
      </div>

      {/* Filter and Sort Card */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-3">
          <div className="row g-3">
            {/* Sales Agent Filter */}
            <div className="col-md-3 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Sales Agent
              </label>
              <select
                className="form-select form-select-sm"
                value={salesAgentParam}
                onChange={(e) => handleFilterChange('salesAgent', e.target.value)}
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-md-3 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Lead Status
              </label>
              <select
                className="form-select form-select-sm"
                value={statusParam}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Source
              </label>
              <select
                className="form-select form-select-sm"
                value={sourceParam}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <option value="">All Sources</option>
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Tag
              </label>
              <select
                className="form-select form-select-sm"
                value={tagsParam}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
              >
                <option value="">All Tags</option>
                {tagsList.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting Option */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Sort By
              </label>
              <select
                className="form-select form-select-sm"
                value={sortParam}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="default">Default</option>
                <option value="priority">Priority (High to Low)</option>
                <option value="timeToClose_asc">Time to Close (Low to High)</option>
                <option value="timeToClose_desc">Time to Close (High to Low)</option>
              </select>
            </div>
          </div>

        
          {
            <div className="d-flex justify-content-end mt-2">
                  <button
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0"
                  onClick={handleResetFilters}
                   >
                   Reset All Filters
                  </button>
             </div>
            
          }
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading leads...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Empty State */}
      {!loading && !error && sortedLeads.length === 0 && (
        <div className="card text-center p-5 border-dashed">
          <h5 className="text-muted">No leads found matching your criteria.</h5>
          <p className="text-secondary small">
            Try clearing your filters or create a new lead to get started.
          </p>
          <div>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleResetFilters}>
              Clear Filters
            </button>
            <Link to="/leads/new" className="btn btn-sm btn-primary">
              Create Lead
            </Link>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {!loading && !error && sortedLeads.length > 0 && (
        <div className="card shadow-sm border-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col">Lead Name</th>
                  <th scope="col">Sales Agent</th>
                  <th scope="col">Source</th>
                  <th scope="col">Status</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Time to Close</th>
                  <th scope="col">Tags</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <Link
                        to={`/leads/${lead._id}`}
                        className="fw-bold text-decoration-none text-primary"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td>
                      {lead.salesAgent?.name ? (
                        <span className="badge bg-light text-dark border">
                          {lead.salesAgent.name}
                        </span>
                      ) : (
                        <span className="text-muted small">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className="small text-secondary">{lead.source}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <span className={getPriorityBadge(lead.priority)}>
                        {lead.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {lead.timeToClose} {lead.timeToClose === 1 ? 'day' : 'days'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {lead.tags && lead.tags.length > 0 ? (
                          lead.tags.map((t, idx) => (
                            <span key={idx} className="badge bg-info bg-opacity-25 text-dark small">
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/leads/${lead._id}`}
                          className="btn btn-outline-primary"
                          title="View & Edit"
                        >
                          View / Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(lead._id, lead.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer bg-white text-muted small py-2 d-flex justify-content-between align-items-center">
            <span>Showing {sortedLeads.length} leads</span>
            <span className="text-secondary">Click on a lead name to view comments and details.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;
