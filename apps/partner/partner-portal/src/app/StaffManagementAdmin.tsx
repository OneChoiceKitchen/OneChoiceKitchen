import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle, Clock, Trash, Calendar, CalendarDays, DollarSign } from 'lucide-react';
import axios from 'axios';

export default function StaffManagementAdmin() {
  const [activeTab, setActiveTab] = useState('staff');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const createDemoStaff = async () => {
    try {
      await axios.post('/api/employees', { name: 'John Doe', email: 'john@example.com', role: 'Head Chef', salary: 50000 });
      await axios.post('/api/employees', { name: 'Alice Smith', email: 'alice@example.com', role: 'Cashier', salary: 30000 });
      fetchEmployees();
    } catch (e) {
      console.error(e);
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      await axios.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="#6366f1" />
            Staff & Verifications
          </h2>
          <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Manage your kitchen staff, shifts, and business verifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {activeTab === 'staff' && employees.length === 0 && (
            <button onClick={createDemoStaff} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
              Generate Demo Staff
            </button>
          )}
          <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
            {activeTab === 'staff' ? '+ Add Staff Member' : 'Update Verification'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('staff')}
          style={{ padding: '0.5rem 0', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'staff' ? '#6366f1' : '#64748b', borderBottom: activeTab === 'staff' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>
          Staff Roles
        </button>
        <button 
          onClick={() => setActiveTab('verification')}
          style={{ padding: '0.5rem 0', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'verification' ? '#6366f1' : '#64748b', borderBottom: activeTab === 'verification' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>
          Business Verification
        </button>
        <button 
          onClick={() => setActiveTab('shifts')}
          style={{ padding: '0.5rem 0', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'shifts' ? '#6366f1' : '#64748b', borderBottom: activeTab === 'shifts' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>
          Shift Management
        </button>
        <button 
          onClick={() => setActiveTab('leaves')}
          style={{ padding: '0.5rem 0', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'leaves' ? '#6366f1' : '#64748b', borderBottom: activeTab === 'leaves' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>
          Leave Requests
        </button>
        <button 
          onClick={() => setActiveTab('payroll')}
          style={{ padding: '0.5rem 0', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: activeTab === 'payroll' ? '#6366f1' : '#64748b', borderBottom: activeTab === 'payroll' ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>
          Payroll Processing
        </button>
      </div>

      {activeTab === 'staff' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
          ) : employees.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No staff members found.</div>
          ) : (
            employees.map(employee => (
              <div key={employee.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
                    {employee.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f172a' }}>{employee.name}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ display: 'inline-block', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{employee.role}</span>
                      <span>Salary: ₹{employee.salary}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}><CheckCircle size={14} /> Active</span>
                  <button onClick={() => removeEmployee(employee.id)} style={{ border: '1px solid #fee2e2', color: '#DC2626', background: '#fef2f2', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash size={14} /> Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'verification' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="#64748b" />
              Document Verification
            </h3>
            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500, color: '#334155' }}>FSSAI License</span>
                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.875rem' }}>Verified</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>FSSAI-12345678901234</div>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500, color: '#334155' }}>GSTIN Details</span>
                <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.875rem' }}>Pending Review</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Uploaded on Oct 24, 2023</div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500, color: '#334155' }}>Owner Identity (Aadhaar/PAN)</span>
                <span style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>Action Required</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#DC2626' }}>Please upload clearer images</div>
              <button style={{ marginTop: '0.5rem', border: '1px solid #cbd5e1', background: 'white', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Re-upload Documents</button>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', background: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Verification Status</h3>
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '80px', height: '80px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#d97706' }}>
                <Clock size={40} />
              </div>
              <h4 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem', color: '#0f172a' }}>Partially Verified</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '250px', margin: '0 auto' }}>You can accept orders, but payouts will be held until all documents are verified.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
          <CalendarDays size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Shift Management</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Schedule and manage staff shifts, monitor attendance, and set geofence areas.</p>
          <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
            Create New Schedule
          </button>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
          <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Leave Requests</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Review, approve, or reject employee leave requests and track leave balances.</p>
          <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
            Review Pending Requests
          </button>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
          <DollarSign size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Payroll Processing</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Automate salary calculations, deductions, and generate payslips based on attendance.</p>
          <button style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
            Generate Payroll Run
          </button>
        </div>
      )}

    </div>
  );
}
