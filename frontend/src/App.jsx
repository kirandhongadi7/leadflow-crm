import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './context';
import Sidebar from './components/Sidebar';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import LeadDetails from './components/LeadDetails';
import LeadStatusView from './components/LeadStatusView';
import SalesAgentView from './components/SalesAgentView';
import SalesAgentForm from './components/SalesAgentForm';
import Reports from './components/Reports';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <div className="d-flex min-vh-100 bg-light">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-grow-1 overflow-auto" style={{ minWidth: 0, maxHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/leads" replace />} />
              <Route path="/leads" element={<LeadList />} />
              <Route path="/leads/new" element={<LeadForm />} />
              <Route path="/leads/:id" element={<LeadDetails />} />
              <Route path="/status-view" element={<LeadStatusView />} />
              <Route path="/agent-view" element={<SalesAgentView />} />
              <Route path="/sales-agent/new" element={<SalesAgentForm />} />
              <Route path="/agents/new" element={<SalesAgentForm />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/leads" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
