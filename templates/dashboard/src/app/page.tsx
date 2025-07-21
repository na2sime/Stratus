import React from 'react';

export default function DashboardHomePage() {
  const metrics = [
    { label: 'Total Users', value: '1,234', change: '+12%' },
    { label: 'Revenue', value: '$45,678', change: '+8%' },
    { label: 'Orders', value: '567', change: '+15%' },
    { label: 'Growth', value: '23%', change: '+3%' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{{PROJECT_NAME_PASCAL}} Dashboard</h1>
        <p>Welcome back! Here's what's happening with your business.</p>
      </header>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <h3>{metric.label}</h3>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-change">{metric.change}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <h2>Analytics Overview</h2>
          <div className="chart-placeholder">
            <p>Chart component would go here</p>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <ul>
            <li>New user registered</li>
            <li>Order #1234 completed</li>
            <li>Payment received</li>
            <li>System backup completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}