import React from 'react';
import { Card } from '../card/Card';
import './DashboardMetrics.css';

export interface DashboardMetricsProps {
  totalOrders: number;
  totalRevenue: number;
  activeInventoryAlerts: number;
  loading?: boolean;
}

export function DashboardMetrics({
  totalOrders,
  totalRevenue,
  activeInventoryAlerts,
  loading = false,
}: DashboardMetricsProps) {
  if (loading) {
    return <div className="dashboard-metrics-loading">Loading metrics...</div>;
  }

  return (
    <div className="dashboard-metrics-grid">
      <Card>
        <div className="metric-card-content">
          <h3 className="metric-title">Total Orders</h3>
          <p className="metric-value">{totalOrders}</p>
        </div>
      </Card>
      <Card>
        <div className="metric-card-content">
          <h3 className="metric-title">Total Revenue</h3>
          <p className="metric-value">₹{totalRevenue.toFixed(2)}</p>
        </div>
      </Card>
      <Card>
        <div className="metric-card-content">
          <h3 className="metric-title">Inventory Alerts</h3>
          <p className="metric-value alert-value">{activeInventoryAlerts}</p>
        </div>
      </Card>
    </div>
  );
}
