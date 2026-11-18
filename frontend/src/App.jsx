import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './context';
import Navbar from './components/Navbar';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import LeadDetails from './components/LeadDetails';
import LeadStatusView from './components/LeadStatusView';
import SalesAgentView from './components/SalesAgentView';
import Reports from './components/Reports';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <div className="min-vh-100 bg-light d-flex flex-column">
          {/* Navigation Bar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Navigate to="/leads" replace />} />
              <Route path="/leads" element={<LeadList />} />
              <Route path="/leads/new" element={<LeadForm />} />
              <Route path="/leads/:id" element={<LeadDetails />} />
              <Route path="/status-view" element={<LeadStatusView />} />
              <Route path="/agent-view" element={<SalesAgentView />} />
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
