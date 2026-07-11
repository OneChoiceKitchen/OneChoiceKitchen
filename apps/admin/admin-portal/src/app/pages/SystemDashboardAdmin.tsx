import React, { useState, useEffect } from 'react';
import {
  Server, Shield, Activity, HardDrive, Cpu, AlertTriangle,
  CheckCircle, XCircle, Clock
} from 'lucide-react';

const mockTasks = [
  { id: 'TSK-101', title: 'Database Index Optimization', priority: 'High', status: 'In Progress', time: 'Started 2h ago', assignedTo: 'DevOps Team' },
  { id: 'TSK-102', title: 'Security Audit Log Review', priority: 'Critical', status: 'Pending', time: 'Due Today', assignedTo: 'Security Team' },
  { id: 'TSK-103', title: 'Daily Backup Verification', priority: 'Medium', status: 'Completed', time: 'Finished 5h ago', assignedTo: 'System Automations' },
  { id: 'TSK-104', title: 'Stripe API Webhook Sync', priority: 'High', status: 'Failed', time: 'Failed 1h ago', assignedTo: 'Backend Team' },
];

export default function SystemDashboardAdmin() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API load
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, sub, alert }: any) => (
    <div className="apple-card kpi-card" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: alert ? `1px solid ${color}` : '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
          <h3 style={{ color: '#0f172a', fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{loading ? '—' : value}</h3>
          {sub && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.3rem 0 0' }}>{sub}</p>}
        </div>
        <div style={{ background: color + '18', padding: '0.75rem', borderRadius: '12px', color }}><Icon size={22} /></div>
      </div>
      {alert && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: color, fontSize: '0.85rem', fontWeight: 600 }}>
          <AlertTriangle size={16} />
          {alert}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>System & Operations</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Monitor server health, security audits, and operational tasks.</p>
      </div>
      
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Overall Server Uptime" value="99.98%" icon={Server} color="#10b981" sub="Last 30 Days" />
        <StatCard title="Open Support Tickets" value="24" icon={Activity} color="#f59e0b" sub="4 Critical Priority" alert="SLA breached on 2 tickets" />
        <StatCard title="Failed Security Audits" value="0" icon={Shield} color="#3b82f6" sub="All systems secure" />
        <StatCard title="Pending System Tasks" value="12" icon={Clock} color="#8b5cf6" sub="3 High Priority" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* System Resources */}
        <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Resource Utilization</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={16} color="#64748b" /><span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>CPU Usage (Cluster A)</span></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>42%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HardDrive size={16} color="#64748b" /><span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Memory Utilization</span></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>84%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '84%', height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={16} color="#64748b" /><span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Storage (EBS Volumes)</span></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>28%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '28%', height: '100%', background: '#10b981', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Tasks Table */}
        <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', gridColumn: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Active System Tasks</h3>
            <button style={{ color: '#3b82f6', background: 'transparent', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mockTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{task.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>{task.assignedTo}</span>
                    <span>•</span>
                    <span>{task.time}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span style={{ 
                    background: task.priority === 'Critical' ? '#DC262615' : task.priority === 'High' ? '#f59e0b15' : '#3b82f615',
                    color: task.priority === 'Critical' ? '#DC2626' : task.priority === 'High' ? '#f59e0b' : '#3b82f6',
                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700
                  }}>
                    {task.priority}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: task.status === 'Failed' ? '#DC2626' : task.status === 'Completed' ? '#10b981' : '#64748b' }}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
