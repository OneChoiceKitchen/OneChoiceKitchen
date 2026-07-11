import { useState } from 'react';
import { DollarSign, Download, FileText, AlertOctagon, Check } from 'lucide-react';
import styles from './PayrollAdmin.module.css';
import HRModal from './HRModal';
import modalStyles from './HRModal.module.css';

const TABS = [
  { id: 'employees', label: 'Employee Salaries' },
  { id: 'riders', label: 'Rider Payouts & COD' },
  { id: 'partners', label: 'Partner Settlements' },
];

const INITIAL_EMPLOYEES = [
  { id: 'e1', name: 'Alice Smith', role: 'Head Chef', period: 'June 2026', base: 4500, deductions: 200, net: 4300, status: 'paid' },
  { id: 'e2', name: 'Charlie Brown', role: 'Packer', period: 'June 2026', base: 2500, deductions: 0, net: 2500, status: 'pending' },
];

const INITIAL_RIDERS = [
  { id: 'r1', name: 'Dave Wilson', period: 'Week 26', base: 300, surge: 50, tips: 120, codCash: 400, netPayout: 70, status: 'paid' },
  { id: 'r2', name: 'Eve Davis', period: 'Week 26', base: 250, surge: 20, tips: 40, codCash: 800, netPayout: -490, status: 'suspended' }, // Suspended because COD cash exceeds limits
];

export default function PayrollAdmin() {
  const [activeTab, setActiveTab] = useState('riders');
  const [cycleFilter, setCycleFilter] = useState('week26');
  
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [riders, setRiders] = useState(INITIAL_RIDERS);
  
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className={`${styles.badge} ${styles.paid}`}>Paid</span>;
      case 'pending': return <span className={`${styles.badge} ${styles.pending}`}>Pending Run</span>;
      case 'suspended': return <span className={`${styles.badge} ${styles.suspended}`}><AlertOctagon size={14}/> COD Limit Exceeded</span>;
      default: return null;
    }
  };

  const handleRunPayroll = () => {
    if (activeTab === 'employees') {
      setEmployees(employees.map(e => ({ ...e, status: 'paid' })));
    } else if (activeTab === 'riders') {
      setRiders(riders.map(r => r.status === 'pending' ? { ...r, status: 'paid' } : r));
    }
    alert(`${activeTab === 'employees' ? 'Employee' : 'Rider'} Payroll cycle run successfully.`);
  };

  const handleViewPayslip = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Payroll & Expenses</h1>
          <p className={styles.pageSubtitle}>Process salaries, calculate rider payouts, and manage COD float recovery.</p>
        </div>
        <button className={styles.primaryButton} onClick={handleRunPayroll}>
          <DollarSign size={18} />
          Run Payroll Cycle
        </button>
      </div>

      <div className={styles.tabsContainer}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <select 
          className={styles.filterSelect}
          value={cycleFilter}
          onChange={e => setCycleFilter(e.target.value)}
        >
          <option value="week26">Current Week (Week 26)</option>
          <option value="week25">Last Week (Week 25)</option>
          <option value="jun26">June 2026 (Monthly)</option>
        </select>
        <button className={styles.actionBtn} style={{ background: 'white' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              {activeTab === 'riders' ? (
                <tr>
                  <th>Rider Name</th>
                  <th>Period</th>
                  <th className={styles.right}>Earnings (Base + Surge)</th>
                  <th className={styles.right}>Tips (100%)</th>
                  <th className={styles.right}>COD Float Recovery</th>
                  <th className={styles.right}>Net Payout</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              ) : activeTab === 'employees' ? (
                <tr>
                  <th>Employee Name</th>
                  <th>Role</th>
                  <th>Period</th>
                  <th className={styles.right}>Base Salary</th>
                  <th className={styles.right}>Deductions (Taxes/Loans)</th>
                  <th className={styles.right}>Net Pay</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              ) : (
                <tr>
                  <th>Partner Name</th>
                  <th>Period</th>
                  <th className={styles.right}>Gross Revenue</th>
                  <th className={styles.right}>Platform Fees</th>
                  <th className={styles.right}>Net Settlement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'riders' && riders.map(rider => (
                <tr key={rider.id}>
                  <td><p className={styles.personName}>{rider.name}</p></td>
                  <td>{rider.period}</td>
                  <td className={styles.right}>
                    <span className={styles.currency}>${rider.base + rider.surge}</span>
                  </td>
                  <td className={`${styles.right} ${styles.positive}`}>
                    <span className={styles.currency}>+${rider.tips}</span>
                  </td>
                  <td className={`${styles.right} ${styles.negative}`}>
                    <span className={styles.currency}>-${rider.codCash}</span>
                  </td>
                  <td className={`${styles.right} ${rider.netPayout < 0 ? styles.negative : styles.positive}`}>
                    <span className={styles.currency}>
                      {rider.netPayout < 0 ? `-$${Math.abs(rider.netPayout)}` : `$${rider.netPayout}`}
                    </span>
                  </td>
                  <td>{getStatusBadge(rider.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} title="View Statement" onClick={() => handleViewPayslip(rider)}>
                        <FileText size={16} />
                      </button>
                      {rider.status === 'suspended' && (
                        <button className={styles.actionBtn} title="Mark Recovered" onClick={() => setRiders(riders.map(r => r.id === rider.id ? {...r, status: 'paid', netPayout: 0, codCash: 0} : r))}>
                          <Check size={16} color="green" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {activeTab === 'employees' && employees.map(emp => (
                <tr key={emp.id}>
                  <td><p className={styles.personName}>{emp.name}</p></td>
                  <td>{emp.role}</td>
                  <td>{emp.period}</td>
                  <td className={styles.right}><span className={styles.currency}>${emp.base}</span></td>
                  <td className={`${styles.right} ${styles.negative}`}><span className={styles.currency}>-${emp.deductions}</span></td>
                  <td className={styles.right}><span className={styles.currency}>${emp.net}</span></td>
                  <td>{getStatusBadge(emp.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} title="View Payslip" onClick={() => handleViewPayslip(emp)}>
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'partners' && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Partner Settlement logic will be connected to the Payouts engine.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payslip / Statement Modal */}
      <HRModal 
        isOpen={isModalOpen} 
        onClose={() => {setIsModalOpen(false); setSelectedRecord(null);}} 
        title={activeTab === 'riders' ? "Rider Statement" : "Payslip Details"}
      >
        {selectedRecord && (
          <div style={{ fontFamily: 'monospace', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b' }}>
            <h4 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>ONE CHOICE KITCHEN - PAYSLIP</h4>
            <p><strong>Name:</strong> {selectedRecord.name}</p>
            <p><strong>Period:</strong> {selectedRecord.period}</p>
            <p><strong>Status:</strong> {selectedRecord.status.toUpperCase()}</p>
            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1rem 0' }}></div>
            {activeTab === 'riders' ? (
              <>
                <p>Base Fare: ${selectedRecord.base}</p>
                <p>Surge Pay: ${selectedRecord.surge}</p>
                <p>Tips: ${selectedRecord.tips}</p>
                <p style={{ color: 'red' }}>COD Float Deduction: -${selectedRecord.codCash}</p>
                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1rem 0' }}></div>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Net Payout: ${selectedRecord.netPayout}</p>
              </>
            ) : (
              <>
                <p>Base Salary: ${selectedRecord.base}</p>
                <p style={{ color: 'red' }}>Deductions: -${selectedRecord.deductions}</p>
                <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1rem 0' }}></div>
                <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Net Pay: ${selectedRecord.net}</p>
              </>
            )}
            <div style={{ marginTop: '1.5rem' }}>
               <button className={modalStyles.btnCancel} style={{ width: '100%', background: 'white' }} onClick={() => window.print()}>Print / Download PDF</button>
            </div>
          </div>
        )}
      </HRModal>
    </div>
  );
}
