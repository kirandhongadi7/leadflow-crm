import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-crm sticky-top py-2">
      <div className="container">
        <Link to="/reports" className="navbar-brand">
          <span className="brand-badge">L</span>
          <span>LeadFlow CRM</span>
        </Link>

        <button
          className="navbar-toggler text-white border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#crmNavbar"
          aria-controls="crmNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        <div className="collapse navbar-collapse" id="crmNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <NavLink
                to="/reports"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                📊 Reports & Analytics
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/leads"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                📋 All Leads
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/status-view"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                📌 Status Board
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/agent-view"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                👥 Sales Agents
              </NavLink>
            </li>
          </ul>

          <div className="d-flex">
            <Link to="/leads/new" className="btn btn-accent px-3 py-2 d-flex align-items-center gap-1 shadow-sm">
              <span className="fw-bold">+</span> Create Lead
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
