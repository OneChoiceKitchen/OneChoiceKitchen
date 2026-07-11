import { useState } from 'react';
import styles from './HRMSAdmin.module.css';
import HRMSDashboard from './HRMSDashboard';

// Placeholder components for future implementation
const Placeholder = ({ title }: { title: string }) => (
  <div className={styles.emptyState}>
    <h3>{title} Module</h3>
    <p>This module is currently under construction as per the HRMS Implementation Plan.</p>
  </div>
);

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'directory', label: 'Directory & KYC' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'shifts', label: 'Shifts & Roster' },
  { id: 'leaves', label: 'Leaves & Holidays' },
  { id: 'payroll', label: 'Payroll & Expenses' },
  { id: 'assets', label: 'Assets' },
  { id: 'compliance', label: 'Compliance & Training' },
  { id: 'helpdesk', label: 'HR Helpdesk' },
  { id: 'offboarding', label: 'Offboarding' },
];

export default function HRMSAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HRMSDashboard />;
      case 'directory':
        return <Placeholder title="Directory & KYC" />;
      case 'attendance':
        return <Placeholder title="Attendance" />;
      case 'shifts':
        return <Placeholder title="Shifts & Roster" />;
      case 'leaves':
        return <Placeholder title="Leaves & Holidays" />;
      case 'payroll':
        return <Placeholder title="Payroll & Expenses" />;
      case 'assets':
        return <Placeholder title="Assets" />;
      case 'compliance':
        return <Placeholder title="Compliance & Training" />;
      case 'helpdesk':
        return <Placeholder title="HR Helpdesk" />;
      case 'offboarding':
        return <Placeholder title="Offboarding" />;
      default:
        return <HRMSDashboard />;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>HRMS & Workforce Management</h1>
        <p className={styles.pageSubtitle}>Integrated management for Employees, Riders, and Partners.</p>
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

      <div className={styles.tabContentContainer}>
        {renderActiveTab()}
      </div>
    </div>
  );
}
