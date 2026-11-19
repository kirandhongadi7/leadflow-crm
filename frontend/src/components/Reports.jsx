import React, { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useReports } from '../context';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ALL_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];

const Reports = () => {
  const {
    closedLastWeek,
    pipelineTotal,
    closedByAgent,
    statusDistribution,
    loading,
    error,
    fetchReports,
  } = useReports();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // 1. Chart Data: Leads Closed Last Week
  const lastWeekChartData = {
    labels: closedLastWeek.length > 0 ? closedLastWeek.map((l) => l.name) : ['No Closed Leads'],
    datasets: [
      {
        label: 'Closed Deal (1)',
        data: closedLastWeek.length > 0 ? closedLastWeek.map(() => 1) : [0],
        backgroundColor: '#198754',
      },
    ],
  };

  // 2. Chart Data: Total Leads in Pipeline (by active status stages)
  const pipelineStages = ['New', 'Contacted', 'Qualified', 'Proposal Sent'];
  const pipelineChartData = {
    labels: pipelineStages,
    datasets: [
      {
        label: 'Leads in Pipeline',
        data: pipelineStages.map((stage) => statusDistribution[stage] || 0),
        backgroundColor: ['#0d6efd', '#0dcaf0', '#ffc107', '#6c757d'],
      },
    ],
  };

  // 3. Chart Data: Leads Closed by Sales Agent
  const closedByAgentChartData = {
    labels:
      closedByAgent.length > 0
        ? closedByAgent.map((item) => item.salesAgentName || 'Agent')
        : ['No Data'],
    datasets: [
      {
        label: 'Closed Leads Count',
        data: closedByAgent.length > 0 ? closedByAgent.map((item) => item.closedCount) : [0],
        backgroundColor: ['#183D32', '#8BAE9A', '#20c997', '#0dcaf0', '#0d6efd'],
      },
    ],
  };

  // 4. Chart Data: Lead Status Distribution (Pie Chart across all stages)
  const statusDistributionChartData = {
    labels: ALL_STATUSES,
    datasets: [
      {
        label: 'Number of Leads',
        data: ALL_STATUSES.map((st) => statusDistribution[st] || 0),
        backgroundColor: [
          '#0d6efd', // New (Blue)
          '#0dcaf0', // Contacted (Cyan)
          '#ffc107', // Qualified (Yellow)
          '#6c757d', // Proposal Sent (Gray)
          '#198754', // Closed (Green)
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Generating analytics & charts...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Reports & Analytics</h2>
        <p className="text-muted mb-0">
          Visual insights into closed deals, active pipeline distribution, and agent performance.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-primary border-4 p-3 bg-white">
            <span className="text-muted small fw-semibold">TOTAL IN PIPELINE</span>
            <h3 className="fw-bold text-primary mb-0 mt-1">{pipelineTotal}</h3>
            <span className="small text-secondary">Active leads across stages</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-success border-4 p-3 bg-white">
            <span className="text-muted small fw-semibold">CLOSED LAST 7 DAYS</span>
            <h3 className="fw-bold text-success mb-0 mt-1">{closedLastWeek.length}</h3>
            <span className="small text-secondary">Deals closed recently</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 border-start border-info border-4 p-3 bg-white">
            <span className="text-muted small fw-semibold">TOP PERFORMING AGENTS</span>
            <h3 className="fw-bold text-info mb-0 mt-1">{closedByAgent.length}</h3>
            <span className="small text-secondary">Agents with closed deals</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row g-4">
        {/* 1. Leads Closed Last Week */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Leads Closed Last Week</h5>
              <span className="badge bg-success">{closedLastWeek.length} closed</span>
            </div>
            <div className="card-body p-3" style={{ height: '320px' }}>
              {closedLastWeek.length > 0 ? (
                <Bar data={lastWeekChartData} options={chartOptions} />
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                  <p className="mb-0">No deals were closed in the last 7 days.</p>
                </div>
              )}
            </div>
            {closedLastWeek.length > 0 && (
              <div className="card-footer bg-light small py-2">
                <strong>Recent closes:</strong>{' '}
                {closedLastWeek.map((l) => `${l.name} (${l.salesAgent || 'Agent'})`).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* 2. Total Leads in Pipeline by Stage */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Total Leads in Pipeline</h5>
              <span className="badge bg-primary">{pipelineTotal} Active</span>
            </div>
            <div className="card-body p-3" style={{ height: '320px' }}>
              <Bar data={pipelineChartData} options={chartOptions} />
            </div>
            <div className="card-footer bg-light small py-2 text-muted">
              Pipeline excludes 'Closed' status deals.
            </div>
          </div>
        </div>

        {/* 3. Leads Closed by Sales Agent */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Closed Leads by Sales Agent</h5>
              <span className="badge bg-dark">Leaderboard</span>
            </div>
            <div className="card-body p-3" style={{ height: '320px' }}>
              {closedByAgent.length > 0 ? (
                <Bar data={closedByAgentChartData} options={chartOptions} />
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                  <p className="mb-0">No closed leads data available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Lead Status Distribution (Pie Chart) */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Lead Status Distribution</h5>
              <span className="badge bg-secondary">All Stages</span>
            </div>
            <div className="card-body p-3" style={{ height: '320px' }}>
              <Pie data={statusDistributionChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
