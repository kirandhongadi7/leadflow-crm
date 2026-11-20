import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLeads, useAgents } from '../context';

const LeadStatusView = () => {
  const { leads, loading, fetchLeads } = useLeads();
  const { agents, tags: availableTags, STATUSES: ALL_STATUSES } = useAgents();

  // Filters within status view
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter leads based on agent, tag, or active status
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Agent filter
      if (selectedAgent) {
        const agentId = lead.salesAgent?._id || lead.salesAgent;
        if (agentId !== selectedAgent) return false;
      }
      // Tag filter
      if (selectedTag) {
        if (!lead.tags || !lead.tags.includes(selectedTag)) return false;
      }
      // Status filter (if user wants to isolate one status column)
      if (selectedStatusFilter && lead.status !== selectedStatusFilter) {
        return false;
      }
      return true;
    });
  }, [leads, selectedAgent, selectedTag, selectedStatusFilter]);

  // Group filtered leads by status
  const groupedByStatus = useMemo(() => {
    const map = {};
    ALL_STATUSES.forEach((st) => {
      map[st] = [];
    });
    filteredLeads.forEach((lead) => {
      if (map[lead.status]) {
        map[lead.status].push(lead);
      } else {
        map[lead.status] = [lead];
      }
    });
    return map;
  }, [ALL_STATUSES, filteredLeads]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return '#0d6efd';
      case 'Contacted':
        return '#0dcaf0';
      case 'Qualified':
        return '#ffc107';
      case 'Proposal Sent':
        return '#6c757d';
      case 'Closed':
        return '#198754';
      default:
        return '#495057';
    }
  };

  const displayedStatuses = selectedStatusFilter
    ? [selectedStatusFilter]
    : ALL_STATUSES;

  return (
    <div className="container-fluid py-4 px-lg-5">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Lead Status Board</h2>
          <p className="text-muted mb-0">
            Pipeline overview grouped by lead stage. Filter by agent or tags within each status.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Filter by Agent */}
            <div className="col-md-3 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Filter by Sales Agent
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="">All Agents</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Tag */}
            <div className="col-md-3 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Filter by Tag
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Focus on single Status */}
            <div className="col-md-3 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Isolate Status
              </label>
              <select
                className="form-select form-select-sm"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="">Show All Statuses</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="col-md-3 col-sm-6 d-flex align-items-end pt-3">
              {(selectedAgent || selectedTag || selectedStatusFilter) && (
                <button
                  className="btn btn-sm btn-outline-danger w-100"
                  onClick={() => {
                    setSelectedAgent('');
                    setSelectedTag('');
                    setSelectedStatusFilter('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading status board...</p>
        </div>
      ) : (
        /* Status Board Columns */
        <div className="row g-3 flex-nowrap overflow-auto pb-4">
          {displayedStatuses.map((status) => {
            const columnLeads = groupedByStatus[status] || [];
            return (
              <div
                key={status}
                className="col-12 col-md-6 col-lg-4 col-xl"
                style={{ minWidth: '270px' }}
              >
                <div className="card h-100 shadow-sm border-0 bg-light">
                  {/* Column Header */}
                  <div
                    className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center"
                    style={{ borderTop: `4px solid ${getStatusColor(status)}` }}
                  >
                    <span className="fw-bold text-dark">{status}</span>
                    <span className="badge rounded-pill bg-dark text-white px-2 py-1">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="card-body p-2 d-flex flex-column gap-2" style={{ minHeight: '350px' }}>
                    {columnLeads.length === 0 ? (
                      <div className="text-center text-muted small py-4">
                        No leads in this stage.
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead._id}
                          className="card border shadow-sm p-3 bg-white lead-card"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Link
                              to={`/leads/${lead._id}`}
                              className="fw-bold text-decoration-none text-dark stretched-link"
                            >
                              {lead.name}
                            </Link>
                            <span className={getPriorityBadge(lead.priority)}>
                              {lead.priority}
                            </span>
                          </div>

                          <div className="small text-muted mb-2">
                            {lead.salesAgent?.name || 'Unassigned'}
                          </div>

                          <div className="d-flex justify-content-between align-items-center pt-2 border-top small text-secondary">
                            <span>{lead.timeToClose}d to close</span>
                            <span className="badge bg-light text-secondary border">
                              {lead.source}
                            </span>
                          </div>

                          {lead.tags && lead.tags.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mt-2">
                              {lead.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="badge bg-light text-dark border small"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeadStatusView;
