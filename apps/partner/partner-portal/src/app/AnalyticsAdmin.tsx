import React, { useState, useEffect } from 'react';
import { DashboardMetrics, SalesChart } from '@org/ui-design-system';

export default function AnalyticsAdmin() {
  const [kpiData, setKpiData] = useState({ totalOrders: 0, totalRevenue: 0, activeInventoryAlerts: 0 });
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('partner_token') || '';
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
        
        const [kpiRes, salesRes] = await Promise.all([
          fetch('/api/analytics/kpis', { headers }),
          fetch('/api/analytics/sales-trend', { headers })
        ]);
        
        if (kpiRes.ok) {
          const data = await kpiRes.json();
          setKpiData({
            totalOrders: data.totalOrders ?? 0,
            totalRevenue: data.totalRevenue ?? 0,
            activeInventoryAlerts: data.activeInventoryAlerts ?? 0
          });
        }
        
        if (salesRes.ok) {
          const data = await salesRes.json();
          setSalesTrend(data.trend || []);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.8rem' }}>Kitchen Analytics</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Track your daily revenue and order metrics.</p>
        </div>
        <select style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontWeight: 600, color: '#0f172a' }}>
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <DashboardMetrics 
          totalOrders={kpiData.totalOrders} 
          totalRevenue={kpiData.totalRevenue} 
          activeInventoryAlerts={kpiData.activeInventoryAlerts} 
          loading={loading} 
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <SalesChart data={salesTrend} loading={loading} />
      </div>
    </div>
  );
}
