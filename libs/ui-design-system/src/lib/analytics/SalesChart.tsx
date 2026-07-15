import React from 'react';
import { Card } from '../card/Card';
import './SalesChart.css';

export interface SalesTrendData {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface SalesChartProps {
  data: SalesTrendData[];
  loading?: boolean;
}

export function SalesChart({ data, loading = false }: SalesChartProps) {
  if (loading) {
    return <div className="sales-chart-loading">Loading chart...</div>;
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);

  return (
    <Card>
      <div className="sales-chart-container">
        <h3 className="sales-chart-title">7-Day Sales Trend</h3>
        <div className="sales-chart-wrapper">
          {data.map((item, index) => {
            const heightPercentage = (item.revenue / maxRevenue) * 100;
            const dateObj = new Date(item.date);
            const label = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            
            return (
              <div key={index} className="sales-chart-bar-group">
                <div className="sales-chart-bar-track">
                  <div
                    className="sales-chart-bar-fill"
                    style={{ height: `${heightPercentage}%` }}
                    title={`₹${item.revenue.toFixed(2)} (${item.orderCount} orders)`}
                  ></div>
                </div>
                <div className="sales-chart-bar-label">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
