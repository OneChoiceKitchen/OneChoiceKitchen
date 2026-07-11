import { useState, useEffect } from 'react';
import { Users, Building2, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@org/ui-design-system';
import styles from './HRMSAdmin.module.css';

const authHeaders = () => ({ 
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`, 
  'Content-Type': 'application/json' 
});

const DUMMY_TENANTS = [
  { id: 'tnt_1', restaurantName: 'Downtown Bistro', isEmployeeModuleEnabled: true },
  { id: 'tnt_2', restaurantName: 'Uptown Cafe', isEmployeeModuleEnabled: false },
  { id: 'tnt_3', restaurantName: 'Spice Garden', isEmployeeModuleEnabled: true },
];

const DUMMY_STATS = {
  totalEmployees: 45,
  activeCheckins: 12,
  pendingLeaves: 3
};

export default function HRMSDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalEmployees: 0,
    activeCheckins: 0,
    pendingLeaves: 0,
  });
  const toast = useToast();

  const fetchTenantsAndStats = async () => {
    try {
      // Simulate API call for now to avoid 404 console errors
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTenants(DUMMY_TENANTS);
      setGlobalStats(DUMMY_STATS);
      
    } catch (err) {
      setTenants(DUMMY_TENANTS);
      setGlobalStats(DUMMY_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsAndStats();
  }, []);

  const toggleModule = async (id: string, currentStatus: boolean) => {
    try {
      // Simulate API call for now to avoid 404 console errors
      await new Promise(resolve => setTimeout(resolve, 300));
      setTenants(tenants.map(t => t.id === id ? { ...t, isEmployeeModuleEnabled: !currentStatus } : t));
      toast.success(`(Mocked) Employee Module toggled successfully`);
    } catch (err) {
      setTenants(tenants.map(t => t.id === id ? { ...t, isEmployeeModuleEnabled: !currentStatus } : t));
      toast.success(`(Mocked) Employee Module toggled successfully`);
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.iconWrapper} ${styles.blue}`}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Employees</p>
            <h3 className={styles.statValue}>{globalStats.totalEmployees}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconWrapper} ${styles.green}`}>
            <ShieldCheck size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Check-ins</p>
            <h3 className={styles.statValue}>{globalStats.activeCheckins}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconWrapper} ${styles.amber}`}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Pending Leaves</p>
            <h3 className={styles.statValue}>{globalStats.pendingLeaves}</h3>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            <Building2 size={20} color="#6366f1" />
            Tenant Module Controls
          </h2>
        </div>
        
        {loading ? (
          <div className={styles.emptyState}>Loading HRMS Dashboard...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>HRMS Module Status</th>
                  <th className={styles.right}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(tenant => (
                  <tr key={tenant.id}>
                    <td data-label="Restaurant">
                      <div className={styles.restaurantName}>{tenant.restaurantName}</div>
                    </td>
                    <td data-label="Module Status">
                      {tenant.isEmployeeModuleEnabled ? (
                        <span className={`${styles.statusBadge} ${styles.enabled}`}>
                          <CheckCircle2 size={16} /> Enabled
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.disabled}`}>
                          <XCircle size={16} /> Disabled
                        </span>
                      )}
                    </td>
                    <td data-label="Actions" className={styles.tdActions}>
                      <button
                        onClick={() => toggleModule(tenant.id, tenant.isEmployeeModuleEnabled)}
                        className={`${styles.toggleBtn} ${tenant.isEmployeeModuleEnabled ? styles.disable : styles.enable}`}
                      >
                        {tenant.isEmployeeModuleEnabled ? 'Disable Module' : 'Enable Module'}
                      </button>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={3} className={styles.emptyState}>No tenants found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
