import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSalesAgents, createSalesAgent, getTags } from '../api';

const AgentContext = createContext();

export const SOURCES = ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'];
export const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
const DEFAULT_TAGS = ['High Value', 'Follow-up', 'Urgent', 'Enterprise', 'Warm'];

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // Load Sales Agents
  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const data = await getSalesAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('AgentContext: Error loading sales agents', err);
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  // Load Tags
  const fetchTags = useCallback(async () => {
    try {
      const data = await getTags();
      if (Array.isArray(data) && data.length > 0) {
        const tagNames = data.map((t) => t.name);
        setTags(Array.from(new Set([...DEFAULT_TAGS, ...tagNames])));
      }
    } catch (err) {
      console.error('AgentContext: Error loading tags', err);
    }
  }, []);

  // Add a new Sales Agent
  const addAgent = useCallback(async (agentData) => {
    try {
      const res = await createSalesAgent(agentData);
      const newAgent = res?.data || res;
      setAgents((prev) => [...prev, newAgent]);
      return newAgent;
    } catch (err) {
      console.error('AgentContext: Error creating sales agent', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchTags();
  }, [fetchAgents, fetchTags]);

  const value = {
    agents,
    tags,
    loadingAgents,
    fetchAgents,
    fetchTags,
    addAgent,
    SOURCES,
    STATUSES,
    PRIORITIES,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};
