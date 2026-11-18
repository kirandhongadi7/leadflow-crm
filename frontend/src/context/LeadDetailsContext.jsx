import React, { createContext, useContext, useState, useCallback } from 'react';
import { getLeadById, updateLead, getComments, addComment } from '../api';

const LeadDetailsContext = createContext();

export const LeadDetailsProvider = ({ children }) => {
  const [currentLead, setCurrentLead] = useState(null);
  const [loadingLead, setLoadingLead] = useState(false);
  const [leadError, setLeadError] = useState(null);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch full details of a single lead
  const fetchLeadDetails = useCallback(async (id) => {
    setLoadingLead(true);
    setLeadError(null);
    try {
      const data = await getLeadById(id);
      setCurrentLead(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setLeadError(msg);
      throw err;
    } finally {
      setLoadingLead(false);
    }
  }, []);

  // Fetch comments for the lead
  const fetchLeadComments = useCallback(async (leadId) => {
    setLoadingComments(true);
    try {
      const data = await getComments(leadId);
      setComments(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('LeadDetailsContext: Error loading comments', err);
      return [];
    } finally {
      setLoadingComments(false);
    }
  }, []);

  // Update lead
  const updateCurrentLead = useCallback(async (id, leadData) => {
    try {
      const updated = await updateLead(id, leadData);
      setCurrentLead(updated);
      return updated;
    } catch (err) {
      console.error('LeadDetailsContext: Error updating lead', err);
      throw err;
    }
  }, []);

  // Add comment to lead
  const addNewComment = useCallback(async (leadId, commentPayload) => {
    try {
      const res = await addComment(leadId, commentPayload);
      const newComment = res?.data || commentPayload;
      // Re-fetch populated comments so the author object is fully populated from server
      try {
        const fresh = await getComments(leadId);
        if (Array.isArray(fresh)) {
          setComments(fresh);
          return newComment;
        }
      } catch (e) {
        // Fallback to local append if re-fetch fails
      }
      setComments((prev) => [...prev, newComment]);
      return newComment;
    } catch (err) {
      console.error('LeadDetailsContext: Error posting comment', err);
      throw err;
    }
  }, []);

  // Reset
  const clearCurrentLead = useCallback(() => {
    setCurrentLead(null);
    setComments([]);
    setLeadError(null);
  }, []);

  const value = {
    currentLead,
    loadingLead,
    leadError,
    comments,
    loadingComments,
    fetchLeadDetails,
    fetchLeadComments,
    updateCurrentLead,
    addNewComment,
    clearCurrentLead,
  };

  return (
    <LeadDetailsContext.Provider value={value}>
      {children}
    </LeadDetailsContext.Provider>
  );
};

export const useLeadDetails = () => {
  const context = useContext(LeadDetailsContext);
  if (!context) {
    throw new Error('useLeadDetails must be used within a LeadDetailsProvider');
  }
  return context;
};
