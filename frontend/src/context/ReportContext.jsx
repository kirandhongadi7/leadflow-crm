import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getReportLastWeek,
  getReportPipeline,
  getReportClosedByAgent,
  getLeads,
} from '../api';

const ReportContext = createContext();

const ALL_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];

export const ReportProvider = ({ children }) => {
  const [closedLastWeek, setClosedLastWeek] = useState([]);
  const [pipelineTotal, setPipelineTotal] = useState(0);
  const [closedByAgent, setClosedByAgent] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lastWeekData, pipelineData, agentClosedData, allLeads] = await Promise.all([
        getReportLastWeek(),
        getReportPipeline(),
        getReportClosedByAgent(),
        getLeads(),
      ]);

      setClosedLastWeek(Array.isArray(lastWeekData) ? lastWeekData : []);
      setPipelineTotal(pipelineData?.totalLeadsInPipeline || 0);
      setClosedByAgent(Array.isArray(agentClosedData) ? agentClosedData : []);

      // Calculate status breakdown
      const dist = {};
      ALL_STATUSES.forEach((st) => (dist[st] = 0));
      if (Array.isArray(allLeads)) {
        allLeads.forEach((lead) => {
          if (dist[lead.status] !== undefined) {
            dist[lead.status] += 1;
          } else {
            dist[lead.status] = 1;
          }
        });
      }
      setStatusDistribution(dist);
    } catch (err) {
      console.error('ReportContext: Error loading reports', err);
      setError('Failed to fetch reporting analytics: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    closedLastWeek,
    pipelineTotal,
    closedByAgent,
    statusDistribution,
    loading,
    error,
    fetchReports,
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
