import React from 'react';
import { AgentProvider } from './AgentContext';
import { LeadProvider } from './LeadContext';
import { LeadDetailsProvider } from './LeadDetailsContext';
import { ReportProvider } from './ReportContext';

export * from './AgentContext';
export * from './LeadContext';
export * from './LeadDetailsContext';
export * from './ReportContext';

// Master Provider wrapping all feature contexts together
export const AppProviders = ({ children }) => {
  return (
    <AgentProvider>
      <LeadProvider>
        <LeadDetailsProvider>
          <ReportProvider>{children}</ReportProvider>
        </LeadDetailsProvider>
      </LeadProvider>
    </AgentProvider>
  );
};
