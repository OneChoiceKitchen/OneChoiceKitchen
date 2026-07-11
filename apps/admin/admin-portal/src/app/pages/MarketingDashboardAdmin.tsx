import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  TrendingUp, Gift, Heart, Share2, Star, Activity,
  ArrowUpRight, ArrowDownRight, Megaphone, Users
} from 'lucide-react';

// Mock Data Builders
function buildCampaignData() {
  return [
    { name: 'Summer Special', conversions: 420, clicks: 1200 },
    { name: 'Welcome Offer', conversions: 380, clicks: 950 },
    { name: 'Weekend BOGO', conversions: 510, clicks: 2100 },
    { name: 'Flash Sale', conversions: 290, clicks: 800 },
    { name: 'Referral Bonus', conversions: 650, clicks: 1500 },
  ];
}

const recentReviews = [
  { id: 1, user: 'Sarah J.', rating: 5, text: 'Absolutely love the tiffin service! Always on time.', time: '2 hours ago' },
  { id: 2, user: 'Mike T.', rating: 4, text: 'Great food, but the app was a bit slow today.', time: '5 hours ago' },
  { id: 3, user: 'Emily R.', rating: 5, text: 'The weekend BOGO offer was totally worth it.', time: '1 day ago' },
];

export default function MarketingDashboardAdmin() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API load
    setTimeout(() => {
      setChartData(buildCampaignData());
      setLoading(false);
    }, 600);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, sub }: any) => (
    <div className="apple-card kpi-card" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</p>
          <h3 style={{ color: '#0f172a', fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{loading ? '—' : value}</h3>
          {sub && <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.3rem 0 0' }}>{sub}</p>}
        </div>
        <div style={{ background: color + '18', padding: '0.75rem', borderRadius: '12px', color }}><Icon size={22} /></div>
      </div>
      {trendValue !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: trend === 'up' ? '#10b981' : '#DC2626', fontSize: '0.8rem', fontWeight: 700, background: (trend === 'up' ? '#10b981' : '#DC2626') + '15', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>vs last month</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Marketing & Loyalty</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>Track campaign performance, loyalty engagement, and customer feedback.</p>
      </div>
      
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Active Campaigns" value="8" icon={Megaphone} trend="up" trendValue="2" color="#ec4899" />
        <StatCard title="Points Issued (MTD)" value="125K" icon={Gift} trend="up" trendValue="15%" color="#8b5cf6" />
        <StatCard title="Referral Signups" value="842" icon={Share2} trend="up" trendValue="8.4%" color="#3b82f6" />
        <StatCard title="Avg Review Rating" value="4.8" icon={Star} trend="up" trendValue="0.2" color="#f59e0b" sub="Based on 1.2k reviews" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Main Chart */}
        <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>Campaign Performance</h3>
              <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Conversions vs Clicks by Active Campaigns</p>
            </div>
          </div>
          
          <div style={{ height: '350px', width: '100%' }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={32} className="animate-spin text-slate-300" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Bar yAxisId="left" dataKey="clicks" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={20} name="Total Clicks" />
                  <Bar yAxisId="left" dataKey="conversions" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Reviews & Quick Actions side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', gridColumn: '1 / -1' }}>
          
          <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Recent Reviews</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {recentReviews.map(review => (
                <div key={review.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{review.user}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{review.time}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? '#f59e0b' : '#e2e8f0'} color={i < review.rating ? '#f59e0b' : '#e2e8f0'} />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>"{review.text}"</p>
                </div>
              ))}
            </div>
            <button style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
              View All Reviews
            </button>
          </div>

          <div className="apple-card" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '1rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-bg-slate-100">
                <div style={{ background: '#ec489915', color: '#ec4899', padding: '0.5rem', borderRadius: '8px' }}><Megaphone size={20} /></div>
                Create New Campaign
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '1rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-bg-slate-100">
                <div style={{ background: '#8b5cf615', color: '#8b5cf6', padding: '0.5rem', borderRadius: '8px' }}><Gift size={20} /></div>
                Issue Global Reward
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '1rem', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-bg-slate-100">
                <div style={{ background: '#3b82f615', color: '#3b82f6', padding: '0.5rem', borderRadius: '8px' }}><Users size={20} /></div>
                Manage Influencers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
