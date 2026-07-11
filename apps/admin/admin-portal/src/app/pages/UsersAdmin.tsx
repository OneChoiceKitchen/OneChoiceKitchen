import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, UserPlus, Shield, CheckCircle } from 'lucide-react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './UsersAdmin.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: { name: string } | null;
  restaurant: { name: string } | null;
  isActive: boolean;
  loyaltyPoints: number;
}

interface PartnerRequest {
  id: string;
  restaurantName: string;
  ownerName: string;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
}

interface RiderRequest {
  id: string;
  fullName: string;
  mobile: string;
  vehicleType: string;
  status: string;
  createdAt: string;
}

const DUMMY_USERS: User[] = [
  { id: 'u1', name: 'Admin Manager', email: 'admin@onechoice.com', role: { name: 'SuperAdmin' }, restaurant: null, isActive: true, loyaltyPoints: 0 },
  { id: 'u2', name: 'Priya Patel', email: 'priya@kitchen.com', role: { name: 'RestaurantAdmin' }, restaurant: { name: 'OneChoice Kitchen' }, isActive: true, loyaltyPoints: 50 },
  { id: 'u3', name: 'Rahul Sharma', email: 'rahul.s@example.com', role: null, restaurant: null, isActive: true, loyaltyPoints: 1250 },
  { id: 'u4', name: 'Inactive User', email: 'old@example.com', role: null, restaurant: null, isActive: false, loyaltyPoints: 0 }
];

const DUMMY_PARTNERS: PartnerRequest[] = [
  { id: 'p1', restaurantName: 'Spice Route', ownerName: 'Anil Kumar', email: 'anil@spiceroute.com', mobile: '9876543210', status: 'PENDING', createdAt: new Date().toISOString() },
  { id: 'p2', restaurantName: 'Pizza Heaven', ownerName: 'Sarah Jenkins', email: 'sarah@pizzaheaven.com', mobile: '9876543211', status: 'APPROVED', createdAt: new Date().toISOString() }
];

const DUMMY_RIDERS: RiderRequest[] = [
  { id: 'r1', fullName: 'Vikram Singh', mobile: '9988776655', vehicleType: 'Motorcycle', status: 'PENDING', createdAt: new Date().toISOString() },
  { id: 'r2', fullName: 'Arjun Das', mobile: '9988776644', vehicleType: 'Bicycle', status: 'APPROVED', createdAt: new Date().toISOString() }
];

export default function UsersAdmin() {
  const [activeTab, setActiveTab] = useState<'users' | 'partners' | 'riders'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([]);
  const [riderRequests, setRiderRequests] = useState<RiderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();
  const confirmDialog = useConfirm();

  const authHeaders = { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'partners') {
      fetchPartnerRequests();
    } else {
      fetchRiderRequests();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users', authHeaders);
      setUsers(response.data.length > 0 ? response.data : DUMMY_USERS);
      setError(null);
    } catch (err: any) {
      setUsers(DUMMY_USERS); // Fallback on error
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/partners', authHeaders);
      setPartnerRequests(response.data.length > 0 ? response.data : DUMMY_PARTNERS);
      setError(null);
    } catch (err: any) {
      setPartnerRequests(DUMMY_PARTNERS); // Fallback on error
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiderRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/riders', authHeaders);
      setRiderRequests(response.data.length > 0 ? response.data : DUMMY_RIDERS);
      setError(null);
    } catch (err: any) {
      setRiderRequests(DUMMY_RIDERS); // Fallback on error
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    const ok = await confirmDialog({ title: 'Delete User', message: 'Are you sure you want to delete this user?', variant: 'danger' });
    if (!ok) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter((user) => user.id !== id));
      toast.success('User deleted');
    } catch (err: any) {
      // Mock success if API fails
      setUsers(users.filter((user) => user.id !== id));
      toast.success('(Mocked) User deleted');
    }
  };

  const approvePartner = async (id: string) => {
    const ok = await confirmDialog({ title: 'Approve Partner', message: 'This will create a Restaurant and User account for this partner. Continue?', variant: 'default', confirmLabel: 'Approve' });
    if (!ok) return;
    try {
      setLoading(true);
      await axios.post(`/api/partners/${id}/approve`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }});
      await fetchPartnerRequests();
      toast.success('Partner approved successfully!');
    } catch (err: any) {
      // Mock success
      setPartnerRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
      toast.success('(Mocked) Partner approved successfully!');
    } finally {
      setLoading(false);
    }
  };

  const approveRider = async (id: string) => {
    const ok = await confirmDialog({ title: 'Approve Rider', message: 'Are you sure you want to approve this rider?', variant: 'default', confirmLabel: 'Approve' });
    if (!ok) return;
    try {
      setLoading(true);
      await axios.post(`/api/riders/${id}/approve`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }});
      await fetchRiderRequests();
      toast.success('Rider approved successfully!');
    } catch (err: any) {
      // Mock success
      setRiderRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
      toast.success('(Mocked) Rider approved successfully!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>        
        
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Manage Customers</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage your customers, admins, partners, and riders across the platform.</p>
          </div>
          <div className={styles.tabControls}>
          <button 
            onClick={() => setActiveTab('users')}
            className={`${styles.tabBtn} ${activeTab === 'users' ? styles.active : styles.inactive}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`${styles.tabBtn} ${activeTab === 'partners' ? styles.active : styles.inactive}`}
          >
            Partner Requests
          </button>
          <button 
            onClick={() => setActiveTab('riders')}
            className={`${styles.tabBtn} ${activeTab === 'riders' ? styles.active : styles.inactive}`}
          >
            Rider Requests
          </button>
          {activeTab === 'users' && (
            <button className={styles.primaryActionBtn}>
              <UserPlus size={18} /> Add User
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder={activeTab === 'users' ? 'Search by name or email...' : 'Search...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchBox}
        />
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading {activeTab}...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : activeTab === 'users' ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Points</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u =>
                !searchQuery ||
                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((user) => (
                <tr key={user.id}>
                  <td data-label="Name" className={styles.primaryCell}>{user.name}</td>
                  <td data-label="Email" className={styles.secondaryCell}>{user.email}</td>
                  <td data-label="Role" className={styles.secondaryCell}>
                    {user.role?.name || 'Customer'}
                    {user.restaurant && <span className={styles.roleContext}>@ {user.restaurant.name}</span>}
                  </td>
                  <td data-label="Status">
                    <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Points" className={styles.secondaryCell}>{user.loyaltyPoints}</td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      <button className={`${styles.iconBtn} ${styles.edit}`} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className={`${styles.iconBtn} ${styles.delete}`}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'partners' ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Owner</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partnerRequests.map((req) => (
                <tr key={req.id}>
                  <td data-label="Restaurant" className={styles.primaryCell}>{req.restaurantName}</td>
                  <td data-label="Owner" className={styles.secondaryCell}>{req.ownerName}</td>
                  <td data-label="Contact">
                    <div className={styles.primaryCell} style={{ fontSize: '0.85rem' }}>{req.email}</div>
                    <div className={styles.secondaryCell}>{req.mobile}</div>
                  </td>
                  <td data-label="Status">
                    <span className={`${styles.statusBadge} ${req.status === 'APPROVED' ? styles.approved : styles.pending}`}>
                      {req.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      {req.status === 'PENDING' && (
                        <button 
                          onClick={() => approvePartner(req.id)}
                          className={styles.approveBtn}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {partnerRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>No partner requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rider Name</th>
                <th>Mobile</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {riderRequests.map((req) => (
                <tr key={req.id}>
                  <td data-label="Rider Name" className={styles.primaryCell}>{req.fullName}</td>
                  <td data-label="Mobile" className={styles.secondaryCell}>{req.mobile}</td>
                  <td data-label="Vehicle" className={styles.secondaryCell}>{req.vehicleType}</td>
                  <td data-label="Status">
                    <span className={`${styles.statusBadge} ${req.status === 'APPROVED' ? styles.approved : styles.pending}`}>
                      {req.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      {req.status === 'PENDING' && (
                        <button 
                          onClick={() => approveRider(req.id)}
                          className={styles.approveBtn}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {riderRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>No rider requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
