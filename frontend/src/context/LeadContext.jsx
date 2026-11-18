import React, { createContext, useContext, useState, useCallback } from 'react';
import { getLeads, createLead, deleteLead } from '../api';

const LeadContext = createContext();

export const LeadProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all leads or leads matching filters (salesAgent, status, source, tags)
  const fetchLeads = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeads(filters);
      const list = Array.isArray(data) ? data : [];
      setLeads(list);
      return list;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError('Failed to fetch leads: ' + msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new lead
  const addLead = useCallback(async (leadData) => {
    try {
      const res = await createLead(leadData);
      const newCreated = res?.data || res;
      setLeads((prev) => [newCreated, ...prev]);
      return newCreated;
    } catch (err) {
      console.error('LeadContext: Error creating lead', err);
      throw err;
    }
  }, []);

  // Delete a lead
  const removeLead = useCallback(async (id) => {
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((lead) => lead._id !== id));
    } catch (err) {
      console.error('LeadContext: Error deleting lead', err);
      throw err;
    }
  }, []);

  // Sync updated lead into the leads list
  const updateLeadInList = useCallback((updatedLead) => {
    if (!updatedLead || !updatedLead._id) return;
    setLeads((prev) =>
      prev.map((l) => (l._id === updatedLead._id ? updatedLead : l))
    );
  }, []);

  const value = {
    leads,
    loading,
    error,
    fetchLeads,
    addLead,
    removeLead,
    updateLeadInList,
  };

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
