import React, { useState } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const revData = [
  { name: 'Mon', revenue: 12000, orders: 45 },
  { name: 'Tue', revenue: 15000, orders: 52 },
  { name: 'Wed', revenue: 11000, orders: 38 },
  { name: 'Thu', revenue: 18000, orders: 65 },
  { name: 'Fri', revenue: 24000, orders: 85 },
  { name: 'Sat', revenue: 32000, orders: 110 },
  { name: 'Sun', revenue: 28000, orders: 95 }
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div style={{ 
    background: 'white', padding: '1.5rem', borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    flex: '1 1 200px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>{title}</p>
        <h3 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{value}</h3>
      </div>
      <div style={{ background: `${color}15`, padding: '0.75rem', borderRadius: '12px', color: color }}>
        <Icon size={24} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
      <span style={{ color: trend === 'up' ? '#10b981' : '#DC2626', display: 'flex', alignItems: 'center' }}>
        {trend === 'up' ? '↑' : '↓'} {trendValue}
      </span>
      <span style={{ color: '#94a3b8' }}>vs last week</span>
    </div>
  </div>
);

export default function AnalyticsAdmin() {
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Revenue" value="₹1,40,000" icon={DollarSign} trend="up" trendValue="15.2%" color="#10b981" />
        <StatCard title="Orders Completed" value="490" icon={ShoppingBag} trend="up" trendValue="8.4%" color="#3b82f6" />
        <StatCard title="Avg. Order Value" value="₹285" icon={TrendingUp} trend="down" trendValue="1.2%" color="#f59e0b" />
        <StatCard title="Active Subscribers" value="124" icon={Users} trend="up" trendValue="5.0%" color="#8b5cf6" />
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>Revenue & Orders Trend</h3>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
