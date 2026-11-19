import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLeads, useAgents } from '../context';

const SalesAgentView = () => {
  const { leads, loading, fetchLeads } = useLeads();
  const { agents, tags: availableTags, STATUSES } = useAgents();

  // Filters within Agent View
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' or 'status' or 'timeToClose'

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterStatus && lead.status !== filterStatus) return false;
      if (filterTag && (!lead.tags || !lead.tags.includes(filterTag))) return false;
      return true;
    });
  }, [leads, filterStatus, filterTag]);

  // Group filtered leads by Sales Agent
  const groupedByAgent = useMemo(() => {
    const map = {};

    // Initialize map with all known agents
    agents.forEach((ag) => {
      map[ag._id] = {
        agent: ag,
        leads: [],
      };
    });

    // Also account for unassigned leads or leads with non-matching agents
    const unassigned = {
      agent: { _id: 'unassigned', name: 'Unassigned', email: 'N/A' },
      leads: [],
    };

    filteredLeads.forEach((lead) => {
      const agentId = lead.salesAgent?._id || lead.salesAgent;
      if (agentId && map[agentId]) {
        map[agentId].leads.push(lead);
      } else {
        unassigned.leads.push(lead);
      }
    });

    // Sort leads inside each agent group
    const priorityWeights = { High: 3, Medium: 2, Low: 1 };
    const statusWeights = {
      New: 1,
      Contacted: 2,
      Qualified: 3,
      'Proposal Sent': 4,
      Closed: 5,
    };

    const sortFn = (a, b) => {
      if (sortBy === 'priority') {
        return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      }
      if (sortBy === 'status') {
        return (statusWeights[a.status] || 0) - (statusWeights[b.status] || 0);
      }
      if (sortBy === 'timeToClose') {
        return (a.timeToClose || 0) - (b.timeToClose || 0);
      }
      return 0;
    };

    const groups = Object.values(map);
    groups.forEach((g) => g.leads.sort(sortFn));
    if (unassigned.leads.length > 0) {
      unassigned.leads.sort(sortFn);
      groups.push(unassigned);
    }

    return groups;
  }, [agents, filteredLeads, sortBy]);

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

  return (
    <div className="container-fluid py-4 px-lg-5">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Sales Agent Workload & Performance</h2>
          <p className="text-muted mb-0">
            Monitor pipeline distribution and deals managed by individual sales agents.
          </p>
        </div>
        <Link to="/sales-agent/new" className="btn btn-primary fw-semibold px-3 py-2 shadow-sm">
          Add Sales Agent
        </Link>
      </div>

      {/* Toolbar / Filters */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Filter by Status */}
            <div className="col-md-3 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Filter by Status
              </label>
              <select
                className="form-select form-select-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort within agent */}
            <div className="col-md-3 col-sm-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Sort Leads Inside Agent
              </label>
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="priority">Priority (High to Low)</option>
                <option value="status">Status (Stage order)</option>
                <option value="timeToClose">Time to Close (Ascending)</option>
              </select>
            </div>

            {/* Clear filters */}
            <div className="col-md-3 col-sm-6 d-flex align-items-end pt-3">
              {(filterStatus || filterTag) && (
                <button
                  className="btn btn-sm btn-outline-danger w-100"
                  onClick={() => {
                    setFilterStatus('');
                    setFilterTag('');
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
          <p className="mt-2 text-muted">Loading agent performance view...</p>
        </div>
      ) : (
        /* Agent Columns */
        <div className="row g-4">
          {groupedByAgent.map(({ agent, leads: agentLeads }) => {
            const closedCount = agentLeads.filter((l) => l.status === 'Closed').length;
            const openCount = agentLeads.filter((l) => l.status !== 'Closed').length;

            return (
              <div key={agent._id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  {/* Agent Header */}
                  <div className="card-header bg-white py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h5 className="fw-bold mb-0 text-dark">{agent.name}</h5>
                      <span className="badge bg-dark rounded-pill">
                        {agentLeads.length} Total
                      </span>
                    </div>
                    {agent.email && (
                      <div className="small text-muted">{agent.email}</div>
                    )}

                    {/* Quick Stats */}
                    <div className="d-flex gap-2 mt-2 pt-2 border-top small">
                      <span className="badge bg-warning text-dark">
                        In Pipeline: {openCount}
                      </span>
                      <span className="badge bg-success">Closed: {closedCount}</span>
                    </div>
                  </div>

                  {/* List of Leads */}
                  <div
                    className="card-body p-3 d-flex flex-column gap-2"
                    style={{ maxHeight: '450px', overflowY: 'auto' }}
                  >
                    {agentLeads.length === 0 ? (
                      <p className="text-muted small text-center py-4 mb-0">
                        No assigned leads matching criteria.
                      </p>
                    ) : (
                      agentLeads.map((lead) => (
                        <div
                          key={lead._id}
                          className="p-3 bg-light rounded border lead-card"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <Link
                              to={`/leads/${lead._id}`}
                              className="fw-bold text-decoration-none text-primary"
                            >
                              {lead.name}
                            </Link>
                            <span className={getPriorityBadge(lead.priority)}>
                              {lead.priority}
                            </span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-2 small text-secondary">
                            <span className={`badge ${getStatusBadge(lead.status)}`}>
                              {lead.status}
                            </span>
                            <span>{lead.timeToClose}d</span>
                          </div>

                          {lead.tags && lead.tags.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mt-2">
                              {lead.tags.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="badge bg-white text-secondary border small"
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

export default SalesAgentView;
