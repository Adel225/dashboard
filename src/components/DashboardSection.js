import React from 'react';
import '../styles/Dashboard.css';
import { NavLink } from 'react-router-dom';

const DashboardSection = ({ title, data }) => {
  return (
    <div className="dashboard-section">
      <h4>{title}</h4>
      {data.map((item, index) => (
        <div key={index} className="dashboard-item">
          <span>{item.grade}</span>
          <span>{item.count} {item.type}</span>
        </div>
      ))}
    </div>
  );
};

export default DashboardSection;