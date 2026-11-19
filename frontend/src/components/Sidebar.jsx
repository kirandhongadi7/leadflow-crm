import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar-crm d-flex flex-column flex-shrink-0 p-3 text-white">
      <Link
        to="/leads"
        className="d-flex align-items-center mb-4 text-white text-decoration-none px-2 brand-header"
      >
        <span className="brand-badge me-2">L</span>
        <span className="fs-5 fw-bold tracking-tight">LeadFlow CRM</span>
      </Link>

      <hr className="my-2 border-secondary opacity-25" />

      <ul className="nav nav-pills flex-column mb-auto gap-1 mt-2">
        <li className="nav-item">
          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `nav-link text-white sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            All Leads
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/agent-view"
            className={({ isActive }) =>
              `nav-link text-white sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            Sales Agents
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/status-view"
            className={({ isActive }) =>
              `nav-link text-white sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            Status Board
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `nav-link text-white sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            Reports & Analytics
          </NavLink>
        </li>
      </ul>

      <hr className="my-3 border-secondary opacity-25" />

      <div className="d-flex flex-column gap-2 px-1">
        <Link
          to="/leads/new"
          className="btn btn-accent w-100 py-2 fw-semibold text-center shadow-sm"
        >
          Create Lead
        </Link>
        <Link
          to="/sales-agent/new"
          className="btn btn-outline-light btn-sm w-100 py-2 fw-semibold text-center"
        >
          Add Sales Agent
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
