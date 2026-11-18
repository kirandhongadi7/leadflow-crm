import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Leads APIs
export const getLeads = async (params = {}) => {
  const res = await api.get('/leads', { params });
  return res.data;
};

export const getLeadById = async (id) => {
  const res = await api.get(`/leads/${id}`);
  return res.data;
};

export const createLead = async (leadData) => {
  const res = await api.post('/leads', leadData);
  return res.data;
};

export const updateLead = async (id, leadData) => {
  const res = await api.put(`/leads/${id}`, leadData);
  return res.data;
};

export const deleteLead = async (id) => {
  const res = await api.delete(`/leads/${id}`);
  return res.data;
};

// Comments APIs
export const getComments = async (leadId) => {
  const res = await api.get(`/leads/${leadId}/comments`);
  return res.data?.comments || [];
};

export const addComment = async (leadId, commentData) => {
  const res = await api.post(`/leads/${leadId}/comments`, commentData);
  return res.data;
};

// Sales Agents API
export const getSalesAgents = async () => {
  try {
    const res = await api.get('/agents');
    return res.data?.data || [];
  } catch (err) {
    console.error('Error fetching sales agents:', err);
    return [];
  }
};

// Tags API
export const getTags = async () => {
  try {
    const res = await api.get('/tags');
    return res.data?.data || [];
  } catch (err) {
    console.error('Error fetching tags:', err);
    return [];
  }
};

// Reports APIs
export const getReportLastWeek = async () => {
  const res = await api.get('/report/last-week');
  return res.data?.result || [];
};

export const getReportPipeline = async () => {
  const res = await api.get('/report/pipeline');
  return res.data;
};

export const getReportClosedByAgent = async () => {
  const res = await api.get('/report/closed-by-agent');
  return res.data || [];
};

export default api;
