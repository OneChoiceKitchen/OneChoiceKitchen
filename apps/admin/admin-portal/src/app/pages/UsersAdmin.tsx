import { useState, useEffect, useCallback, useMemo, useRef, DragEvent } from 'react';
import axios from 'axios';
import {
  Trash2, Edit2, UserPlus, CheckCircle, XCircle, X, Search,
  RefreshCw, Users, UserCheck, Bike, Download, Upload,
  ChevronUp, ChevronDown, ChevronsUpDown, FileDown,
  FileSpreadsheet, FileText, Eye, UserX, AlertTriangle,
  Building2, Truck,
} from 'lucide-react';
import { useToast, useConfirm } from '@org/ui-design-system';

// ── Types ─────────────────────────────────────────────────────────────
interface Role { id: string; name: string; }
interface User {
  id: string; name: string; email: string; mobile?: string;
  role: Role | null;
  restaurant: { name: string } | null;
  isActive: boolean; loyaltyPoints: number; createdAt?: string;
}
interface Partner {
  id: string; restaurantName: string; ownerName: string;
  email: string; mobile: string; status: string; createdAt: string;
  address?: string; fssaiNumber?: string;
}
interface Rider {
  id: string; fullName: string; mobile: string;
  vehicleType: string; status: string; createdAt: string;
  licenseNumber?: string; address?: string;
}
type Tab = 'users' | 'partners' | 'riders';
type SortDir = 'asc' | 'desc';
type ExportFmt = 'csv' | 'xlsx';

// ── Helpers ───────────────────────────────────────────────────────────
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` });
const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtNum = (n: number) => n.toLocaleString('en-IN');

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF';
  const txt = bom + [headers, ...rows]
    .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8;' }));
  a.download = filename + '.csv'; a.click();
}

async function exportExcel(filename: string, headers: string[], rows: string[][]) {
  try {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    // Style header row width
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename + '.xlsx');
  } catch {
    exportCSV(filename, headers, rows); // fallback
  }
}

async function parseUploadedFile(file: File): Promise<string[][]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') {
    const text = await file.text();
    return text.trim().split('\n').map(line =>
      line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
    );
  }
  // xlsx / xls
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
}

// ── Sample templates per tab ──────────────────────────────────────────
const TEMPLATES: Record<Tab, { headers: string[]; rows: string[][] }> = {
  users: {
    headers: ['Full Name', 'Email', 'Mobile', 'Role', 'Status'],
    rows: [
      ['Priya Sharma', 'priya@example.com', '+91 9876543210', 'Customer', 'Active'],
      ['Rahul Verma', 'rahul@example.com', '+91 9123456789', 'Customer', 'Active'],
    ],
  },
  partners: {
    headers: ['Restaurant Name', 'Owner Name', 'Email', 'Mobile', 'Address', 'FSSAI Number'],
    rows: [
      ['Spice Garden', 'Raju Sharma', 'raju@spicegarden.com', '+91 9876543210', 'MG Road, Bengaluru', 'FSSAI12345678'],
    ],
  },
  riders: {
    headers: ['Full Name', 'Mobile', 'Vehicle Type', 'License Number'],
    rows: [
      ['Suresh Kumar', '+91 9876543210', 'Bike', 'KA05AB1234'],
    ],
  },
};

// ── Style helpers ─────────────────────────────────────────────────────
const pgBtnStyle = (disabled: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
  fontWeight: 700, fontSize: '0.9rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? '#f8fafc' : '#fff',
  color: disabled ? '#cbd5e1' : '#334155',
  lineHeight: 1, flexShrink: 0, transition: 'all .12s',
});

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.875rem',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: '0.875rem', fontFamily: 'inherit',
  outline: 'none', background: '#fff', transition: 'border .15s',
};

// ── Sub-components ────────────────────────────────────────────────────
function SortIco({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={12} style={{ opacity: 0.3, marginLeft: 3, flexShrink: 0 }} />;
  return dir === 'asc'
    ? <ChevronUp size={12} style={{ color: '#2563EB', marginLeft: 3, flexShrink: 0 }} />
    : <ChevronDown size={12} style={{ color: '#2563EB', marginLeft: 3, flexShrink: 0 }} />;
}

function Badge({ status, active }: { status?: string; active?: boolean }) {
  const s = status || (active ? 'ACTIVE' : 'INACTIVE');
  const MAP: Record<string, [string, string]> = {
    ACTIVE:   ['#dcfce7', '#15803d'],
    INACTIVE: ['#fee2e2', '#DC2626'],
    PENDING:  ['#fef3c7', '#b45309'],
    APPROVED: ['#dcfce7', '#15803d'],
    REJECTED: ['#fee2e2', '#DC2626'],
    SUSPENDED:['#f1f5f9', '#64748b'],
  };
  const [bg, color] = MAP[s.toUpperCase()] ?? ['#f1f5f9', '#64748b'];
  return (
    <span style={{
      background: bg, color, padding: '0.18rem 0.55rem',
      borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
    }}>{s}</span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </label>
  );
}

function ModalBase({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%',
        maxWidth: wide ? 680 : 500,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.22)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4, borderRadius: 6 }}><X size={20} /></button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}

// ── ActBtn — icon + text inline action button ─────────────────────────
function ActBtn({ icon, label, onClick, danger, disabled, title }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  danger?: boolean; disabled?: boolean; title?: string;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title || label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '0.28rem 0.6rem', borderRadius: 6, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '0.72rem', fontWeight: 600, flexShrink: 0,
        background: danger ? '#fef2f2' : '#eff6ff',
        color: danger ? '#DC2626' : '#2563EB',
        opacity: disabled ? 0.5 : 1,
        transition: 'all .12s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? '#fee2e2' : '#dbeafe'; }}
      onMouseLeave={e => { e.currentTarget.style.background = danger ? '#fef2f2' : '#eff6ff'; }}
    >
      {icon} {label}
    </button>
  );
}


// ── System-level fallback roles (shown when /api/roles returns empty) ──────
const SYSTEM_ROLES_FALLBACK: Role[] = [
  { id: 'customer',   name: 'Customer' },
  { id: 'admin',      name: 'Admin' },
  { id: 'manager',    name: 'Manager' },
  { id: 'partner',    name: 'Partner' },
  { id: 'rider',      name: 'Rider' },
  { id: 'staff',      name: 'Staff' },
  { id: 'support',    name: 'Support Agent' },
  { id: 'accountant', name: 'Accountant' },
];

// ── Main ──────────────────────────────────────────────────────────────
export default function UsersAdmin() {
  const [tab, setTab]               = useState<Tab>('users');
  const [users, setUsers]           = useState<User[]>([]);
  const [partners, setPartners]     = useState<Partner[]>([]);
  const [riders, setRiders]         = useState<Rider[]>([]);
  const [roles, setRoles]           = useState<Role[]>([]);
  const [loading, setLoading]       = useState(true);

  // Filters
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter]     = useState('ALL');

  // Sort
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Pagination
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals
  const [addEditModal, setAddEditModal]   = useState<'add' | 'edit' | null>(null);
  const [importModal, setImportModal]     = useState(false);
  const [exportMenu, setExportMenu]       = useState(false);
  const [viewModal, setViewModal]         = useState<User | Partner | Rider | null>(null);

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uForm, setUForm]   = useState({ name: '', email: '', mobile: '', roleId: '', isActive: true });
  const [pForm, setPForm]   = useState({ restaurantName: '', ownerName: '', email: '', mobile: '', address: '', fssaiNumber: '' });
  const [rForm, setRForm]   = useState({ fullName: '', mobile: '', vehicleType: 'Bike', licenseNumber: '', address: '' });

  // Import state
  const fileRef                         = useRef<HTMLInputElement>(null);
  const [importing, setImporting]       = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; fail: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [importFile, setImportFile]     = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{ rows: number; columns: string[] } | null>(null);

  const toast   = useToast();
  const confirm = useConfirm();

  // ── Fetch ───────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/roles', { headers: authH() });
      const fetched = Array.isArray(data) ? data : (data?.data ?? []);
      // Use API roles if returned, otherwise fall back to system roles
      setRoles(fetched.length > 0 ? fetched : SYSTEM_ROLES_FALLBACK);
    } catch { setRoles(SYSTEM_ROLES_FALLBACK); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/users', { headers: authH() });
      setUsers(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { setUsers([]); toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/partners', { headers: authH() });
      setPartners(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { setPartners([]); toast.error('Failed to load partners'); }
    finally { setLoading(false); }
  }, []);

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/riders', { headers: authH() });
      setRiders(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { setRiders([]); toast.error('Failed to load riders'); }
    finally { setLoading(false); }
  }, []);

  const refresh = useCallback(() => {
    if (tab === 'users') fetchUsers();
    else if (tab === 'partners') fetchPartners();
    else fetchRiders();
  }, [tab, fetchUsers, fetchPartners, fetchRiders]);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setSearch(''); setPage(1); setStatusFilter('ALL'); setRoleFilter('ALL');
    setSortKey('name'); setSortDir('asc');
    refresh();
  }, [tab]);

  // ── CRUD — Users ─────────────────────────────────────────────────────
  const openAddUser = () => {
    setEditId(null);
    setUForm({ name: '', email: '', mobile: '', roleId: roles.find(r => r.name === 'Customer')?.id || '', isActive: true });
    setAddEditModal('add');
  };
  const openEditUser = (u: User) => {
    setEditId(u.id);
    setUForm({ name: u.name, email: u.email, mobile: u.mobile || '', roleId: u.role?.id || '', isActive: u.isActive });
    setAddEditModal('edit');
  };

  const saveUser = async () => {
    if (!uForm.name.trim()) { toast.error('Full name is required'); return; }
    if (!uForm.email.trim()) { toast.error('Email is required'); return; }
    setSaving(true);
    try {
      const payload = { name: uForm.name, email: uForm.email, mobile: uForm.mobile, isActive: uForm.isActive, roleId: uForm.roleId || undefined };
      if (editId) {
        await axios.patch(`/api/users/${editId}`, payload, { headers: authH() });
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/users', { ...payload, password: 'Welcome@123' }, { headers: authH() });
        toast.success('User created — default password: Welcome@123');
      }
      setAddEditModal(null); fetchUsers();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteUser = async (u: User) => {
    const ok = await confirm({ title: 'Delete User', message: `Delete "${u.name}"? This cannot be undone.`, variant: 'danger' });
    if (!ok) return;
    try {
      await axios.delete(`/api/users/${u.id}`, { headers: authH() });
      setUsers(p => p.filter(x => x.id !== u.id));
      toast.success('User deleted');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Delete failed'); }
  };

  const toggleUserStatus = async (u: User) => {
    try {
      await axios.patch(`/api/users/${u.id}`, { isActive: !u.isActive }, { headers: authH() });
      setUsers(p => p.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
      toast.success(`User ${!u.isActive ? 'activated' : 'deactivated'}`);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  // ── CRUD — Partners ───────────────────────────────────────────────────
  const openAddPartner = () => {
    setEditId(null);
    setPForm({ restaurantName: '', ownerName: '', email: '', mobile: '', address: '', fssaiNumber: '' });
    setAddEditModal('add');
  };
  const openEditPartner = (p: Partner) => {
    setEditId(p.id);
    setPForm({ restaurantName: p.restaurantName, ownerName: p.ownerName, email: p.email, mobile: p.mobile, address: p.address || '', fssaiNumber: p.fssaiNumber || '' });
    setAddEditModal('edit');
  };
  const savePartner = async () => {
    if (!pForm.restaurantName.trim() || !pForm.email.trim()) { toast.error('Restaurant name and email are required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await axios.patch(`/api/partners/${editId}`, pForm, { headers: authH() });
        toast.success('Partner updated');
      } else {
        await axios.post('/api/partners', pForm, { headers: authH() });
        toast.success('Partner request created');
      }
      setAddEditModal(null); fetchPartners();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const approvePartner = async (p: Partner) => {
    const ok = await confirm({ title: 'Approve Partner', message: `Approve "${p.restaurantName}"?`, confirmLabel: 'Approve' });
    if (!ok) return;
    try {
      await axios.post(`/api/partners/${p.id}/approve`, {}, { headers: authH() });
      setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'APPROVED' } : x));
      toast.success('Partner approved!');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  };
  const rejectPartner = async (p: Partner) => {
    const ok = await confirm({ title: 'Reject Partner', message: `Reject "${p.restaurantName}"?`, variant: 'danger', confirmLabel: 'Reject' });
    if (!ok) return;
    try {
      await axios.post(`/api/partners/${p.id}/reject`, {}, { headers: authH() });
      setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'REJECTED' } : x));
      toast.success('Partner rejected');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  // ── CRUD — Riders ─────────────────────────────────────────────────────
  const openAddRider = () => {
    setEditId(null);
    setRForm({ fullName: '', mobile: '', vehicleType: 'Bike', licenseNumber: '', address: '' });
    setAddEditModal('add');
  };
  const openEditRider = (r: Rider) => {
    setEditId(r.id);
    setRForm({ fullName: r.fullName, mobile: r.mobile, vehicleType: r.vehicleType, licenseNumber: r.licenseNumber || '', address: r.address || '' });
    setAddEditModal('edit');
  };
  const saveRider = async () => {
    if (!rForm.fullName.trim() || !rForm.mobile.trim()) { toast.error('Name and mobile are required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await axios.patch(`/api/riders/${editId}`, rForm, { headers: authH() });
        toast.success('Rider updated');
      } else {
        await axios.post('/api/riders', rForm, { headers: authH() });
        toast.success('Rider registered');
      }
      setAddEditModal(null); fetchRiders();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const approveRider = async (r: Rider) => {
    const ok = await confirm({ title: 'Approve Rider', message: `Approve "${r.fullName}"?`, confirmLabel: 'Approve' });
    if (!ok) return;
    try {
      await axios.post(`/api/riders/${r.id}/approve`, {}, { headers: authH() });
      setRiders(prev => prev.map(x => x.id === r.id ? { ...x, status: 'APPROVED' } : x));
      toast.success('Rider approved!');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  };
  const rejectRider = async (r: Rider) => {
    const ok = await confirm({ title: 'Reject Rider', message: `Reject "${r.fullName}"?`, variant: 'danger', confirmLabel: 'Reject' });
    if (!ok) return;
    try {
      await axios.post(`/api/riders/${r.id}/reject`, {}, { headers: authH() });
      setRiders(prev => prev.map(x => x.id === r.id ? { ...x, status: 'REJECTED' } : x));
      toast.success('Rider rejected');
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed'); }
  };

  // ── Sort ──────────────────────────────────────────────────────────────
  const handleSort = (key: string) => {
    setSortDir(d => sortKey === key ? (d === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortKey(key);
    setPage(1);
  };

  // ── Export ────────────────────────────────────────────────────────────
  const doExport = async (fmt: ExportFmt) => {
    setExportMenu(false);
    const fn = fmt === 'xlsx' ? exportExcel : exportCSV;
    if (tab === 'users') {
      await fn('users', ['Name', 'Email', 'Phone', 'Role', 'Status', 'Points', 'Joined'],
        filteredUsers.map(u => [u.name, u.email, u.mobile || '', u.role?.name || 'Customer', u.isActive ? 'Active' : 'Inactive', String(u.loyaltyPoints), fmtDate(u.createdAt)]));
    } else if (tab === 'partners') {
      await fn('partners', ['Restaurant', 'Owner', 'Email', 'Mobile', 'Status', 'Applied'],
        filteredPartners.map(p => [p.restaurantName, p.ownerName, p.email, p.mobile, p.status, fmtDate(p.createdAt)]));
    } else {
      await fn('riders', ['Name', 'Mobile', 'Vehicle', 'Status', 'Applied'],
        filteredRiders.map(r => [r.fullName, r.mobile, r.vehicleType, r.status, fmtDate(r.createdAt)]));
    }
    toast.success(`Exported as ${fmt.toUpperCase()}`);
  };

  // ── Import ────────────────────────────────────────────────────────────
  const handleImportFile = async (file: File) => {
    setImportFile(file);
    setImportResult(null);
    setImportPreview(null);
    // Parse header row to show preview info
    try {
      const rows = await parseUploadedFile(file);
      const headers = (rows[0] ?? []).map(h => String(h).trim()).filter(Boolean);
      const dataRows = rows.slice(1).filter(r => r.some(c => String(c).trim()));
      setImportPreview({ rows: dataRows.length, columns: headers });
    } catch {
      setImportPreview(null);
    }
  };

  const runImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const rows = await parseUploadedFile(importFile);
      const headers = rows[0]?.map(h => String(h).toLowerCase().trim()) ?? [];
      const data = rows.slice(1).filter(r => r.some(c => String(c).trim()));
      let success = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const get = (name: string) => String(row[headers.indexOf(name)] ?? '').trim();
        try {
          if (tab === 'users') {
            await axios.post('/api/users', {
              name: get('full name') || get('name'),
              email: get('email'),
              mobile: get('mobile'),
              isActive: get('status').toLowerCase() !== 'inactive',
              password: 'Welcome@123',
            }, { headers: authH() });
          } else if (tab === 'partners') {
            await axios.post('/api/partners', {
              restaurantName: get('restaurant name'),
              ownerName: get('owner name'),
              email: get('email'),
              mobile: get('mobile'),
              address: get('address'),
              fssaiNumber: get('fssai number'),
            }, { headers: authH() });
          } else {
            await axios.post('/api/riders', {
              fullName: get('full name'),
              mobile: get('mobile'),
              vehicleType: get('vehicle type') || 'Bike',
              licenseNumber: get('license number'),
            }, { headers: authH() });
          }
          success++;
        } catch (e: any) {
          errors.push(`Row ${i + 2}: ${e?.response?.data?.message || 'Failed'}`);
        }
      }
      setImportResult({ success, fail: data.length - success, errors });
      if (success > 0) refresh();
    } catch (e: any) {
      toast.error(e.message || 'Import failed — check file format');
    } finally {
      setImporting(false);
    }
  };

  const onDropFile = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImportFile(file);
  };

  // ── Derived data ──────────────────────────────────────────────────────
  const q = search.toLowerCase();

  const sortFn = (key: string, dir: SortDir) => (a: any, b: any) => {
    let av = a[key] ?? '', bv = b[key] ?? '';
    if (key === 'status')    { av = String(a.isActive ?? a.status ?? ''); bv = String(b.isActive ?? b.status ?? ''); }
    if (key === 'role')      { av = a.role?.name ?? ''; bv = b.role?.name ?? ''; }
    if (key === 'points')    { av = a.loyaltyPoints ?? 0; bv = b.loyaltyPoints ?? 0; }
    if (typeof av === 'number') return dir === 'asc' ? av - bv : bv - av;
    return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  };

  const filteredUsers = useMemo(() =>
    [...users.filter(u =>
      (!q || [u.name, u.email, u.mobile || ''].some(s => s.toLowerCase().includes(q))) &&
      (statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive)) &&
      (roleFilter === 'ALL' || (u.role?.name || 'Customer') === roleFilter)
    )].sort(sortFn(sortKey, sortDir)), [users, q, statusFilter, roleFilter, sortKey, sortDir]);

  const filteredPartners = useMemo(() =>
    [...partners.filter(p =>
      (!q || [p.restaurantName, p.ownerName, p.email, p.mobile].some(s => s?.toLowerCase().includes(q))) &&
      (statusFilter === 'ALL' || p.status === statusFilter)
    )].sort(sortFn(sortKey, sortDir)), [partners, q, statusFilter, sortKey, sortDir]);

  const filteredRiders = useMemo(() =>
    [...riders.filter(r =>
      (!q || [r.fullName, r.mobile].some(s => s?.toLowerCase().includes(q))) &&
      (statusFilter === 'ALL' || r.status === statusFilter)
    )].sort(sortFn(sortKey, sortDir)), [riders, q, statusFilter, sortKey, sortDir]);

  const activeList    = tab === 'users' ? filteredUsers : tab === 'partners' ? filteredPartners : filteredRiders;
  const totalList     = tab === 'users' ? users : tab === 'partners' ? partners : riders;
  const totalPages    = Math.max(1, Math.ceil(activeList.length / pageSize));
  const safePage      = Math.min(page, totalPages);
  const pageStart     = (safePage - 1) * pageSize;
  const pagedUsers    = filteredUsers.slice(pageStart, pageStart + pageSize);
  const pagedPartners = filteredPartners.slice(pageStart, pageStart + pageSize);
  const pagedRiders   = filteredRiders.slice(pageStart, pageStart + pageSize);

  const roleNames   = useMemo(() => [...new Set(users.map(u => u.role?.name || 'Customer'))].sort(), [users]);
  const pendingPart = partners.filter(p => p.status === 'PENDING').length;
  const pendingRide = riders.filter(r => r.status === 'PENDING').length;

  // ── Render helpers ────────────────────────────────────────────────────
  const Th = ({ k, label, right }: { k: string; label: string; right?: boolean }) => (
    <th onClick={() => handleSort(k)} style={{
      cursor: 'pointer', userSelect: 'none',
      textAlign: right ? 'right' : 'left', whiteSpace: 'nowrap',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {label}<SortIco active={sortKey === k} dir={sortDir} />
      </span>
    </th>
  );

  const Empty = ({ cols, msg }: { cols: number; msg: string }) => (
    <tr>
      <td colSpan={cols} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
        <div style={{ fontWeight: 600, color: '#64748b' }}>{msg}</div>
        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Try adjusting your search or filters</div>
      </td>
    </tr>
  );

  // ── Add/Edit modal content per tab ────────────────────────────────────
  const isEditing = addEditModal === 'edit';
  const modalTitle = {
    users:    isEditing ? '✏️ Edit User'    : '➕ Add New User',
    partners: isEditing ? '✏️ Edit Partner' : '🏪 Add Partner Request',
    riders:   isEditing ? '✏️ Edit Rider'   : '🛵 Register New Rider',
  }[tab];

  return (
    <div className="page-container">

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">👥 Users &amp; People</h1>
          <p className="page-subtitle">Manage customers, restaurant partners, and delivery riders</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Tab-aware Add button */}
          <button className="btn btn-primary" onClick={() => {
            if (tab === 'users') openAddUser();
            else if (tab === 'partners') openAddPartner();
            else openAddRider();
          }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <UserPlus size={15} />
            {tab === 'users' ? 'Add User' : tab === 'partners' ? 'Add Partner' : 'Add Rider'}
          </button>

          {/* Export dropdown */}
          <div style={{ position: 'relative' }}>
            <button className="btn" onClick={() => setExportMenu(v => !v)}
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Download size={14} /> Export <ChevronDown size={12} />
            </button>
            {exportMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 500, minWidth: 160, overflow: 'hidden',
              }}>
                <button onClick={() => doExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0.65rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FileText size={14} color="#2563EB" /> Export as CSV
                </button>
                <button onClick={() => doExport('xlsx')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0.65rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FileSpreadsheet size={14} color="#16a34a" /> Export as Excel
                </button>
              </div>
            )}
          </div>

          {/* Import */}
          <button className="btn" onClick={() => { setImportModal(true); setImportFile(null); setImportResult(null); setImportPreview(null); }}
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Upload size={14} /> Import
          </button>

          {/* Refresh */}
          <button className="btn" onClick={refresh}
            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: 0 }}>
        {([
          { id: 'users' as Tab,    label: 'Users',    Icon: Users,     count: users.length,    badge: 0 },
          { id: 'partners' as Tab, label: 'Partners', Icon: Building2, count: partners.length, badge: pendingPart },
          { id: 'riders' as Tab,   label: 'Riders',   Icon: Truck,     count: riders.length,   badge: pendingRide },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.1rem',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
            borderBottom: `2px solid ${tab === t.id ? '#2563EB' : 'transparent'}`,
            marginBottom: '-2px', color: tab === t.id ? '#2563EB' : '#64748b', background: 'transparent',
            transition: 'color .15s',
          }}>
            <t.Icon size={15} /> {t.label}
            {t.badge > 0
              ? <span style={{ background: '#DC2626', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: 999, padding: '0 5px', lineHeight: '17px', minWidth: 18, textAlign: 'center' }}>{t.badge}</span>
              : <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.7rem', borderRadius: 999, padding: '1px 7px' }}>{t.count}</span>
            }
          </button>
        ))}
      </div>

      {/* ── Filter Bar — ONE horizontal row ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0', flexWrap: 'nowrap', overflowX: 'auto' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: '2.1rem', width: '100%' }}
            placeholder={`Search ${tab}…`} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {/* Status filter */}
        <select className="input" style={{ flex: '0 0 auto', width: 132, minWidth: 100 }}
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="ALL">All Status</option>
          {tab === 'users' ? <>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </> : <>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </>}
        </select>

        {/* Role filter — users only */}
        {tab === 'users' && (
          <select className="input" style={{ flex: '0 0 auto', width: 148, minWidth: 100 }}
            value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="ALL">All Roles</option>
            {roleNames.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}

        {/* Record count */}
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {activeList.length} / {totalList.length} records
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
          Loading {tab}…
        </div>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>

          {/* Users table */}
          {tab === 'users' && (
            <table className="table">
              <thead><tr>
                <Th k="name"      label="Name" />
                <Th k="email"     label="Email" />
                <Th k="mobile"    label="Phone" />
                <Th k="role"      label="Role" />
                <Th k="status"    label="Status" />
                <Th k="points"    label="Points" right />
                <Th k="createdAt" label="Joined" />
                <th style={{ textAlign: 'right', width: 140, minWidth: 140 }}>Actions</th>
              </tr></thead>
              <tbody>
                {pagedUsers.length === 0 ? <Empty cols={8} msg="No users match your filters" /> : pagedUsers.map(u => (
                  <tr key={u.id}>
                    <td data-label="Name">
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name || '—'}</div>
                      {u.restaurant && <div style={{ fontSize: '0.72rem', color: 'var(--brand-blue)', marginTop: 1 }}>📍 {u.restaurant.name}</div>}
                    </td>
                    <td data-label="Email" style={{ color: '#475569', fontSize: '0.85rem' }}>{u.email}</td>
                    <td data-label="Phone" style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.mobile || '—'}</td>
                    <td data-label="Role">
                      <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: 5, fontWeight: 600 }}>
                        {u.role?.name || 'Customer'}
                      </span>
                    </td>
                    <td data-label="Status">
                      <button onClick={() => toggleUserStatus(u)} title="Click to toggle status"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Badge active={u.isActive} />
                      </button>
                    </td>
                    <td data-label="Points" style={{ textAlign: 'right', color: u.loyaltyPoints > 0 ? '#b45309' : '#cbd5e1', fontWeight: u.loyaltyPoints > 0 ? 700 : 400 }}>
                      {u.loyaltyPoints > 0 ? `🏅 ${fmtNum(u.loyaltyPoints)}` : '—'}
                    </td>
                    <td data-label="Joined" style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 110 }}>{fmtDate(u.createdAt)}</td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <ActBtn icon={<Eye size={12} />}   label="View"   onClick={() => setViewModal(u)} />
                        <ActBtn icon={<Edit2 size={12} />} label="Edit"   onClick={() => openEditUser(u)} />
                        <ActBtn icon={<Trash2 size={12} />} label="Delete" onClick={() => deleteUser(u)} danger />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Partners table */}
          {tab === 'partners' && (
            <table className="table">
              <thead><tr>
                <Th k="restaurantName" label="Restaurant" />
                <Th k="ownerName"      label="Owner" />
                <Th k="email"          label="Email" />
                <Th k="mobile"         label="Mobile" />
                <Th k="status"         label="Status" />
                <Th k="createdAt"      label="Applied" />
                <th style={{ textAlign: 'right', width: 180 }}>Actions</th>
              </tr></thead>
              <tbody>
                {pagedPartners.length === 0 ? <Empty cols={7} msg="No partner requests match filters" /> : pagedPartners.map(p => (
                  <tr key={p.id}>
                    <td data-label="Restaurant" style={{ fontWeight: 600, color: '#0f172a' }}>{p.restaurantName}</td>
                    <td data-label="Owner" style={{ color: '#334155' }}>{p.ownerName}</td>
                    <td data-label="Email" style={{ color: '#475569', fontSize: '0.85rem' }}>{p.email}</td>
                    <td data-label="Mobile" style={{ color: '#64748b', fontSize: '0.85rem' }}>{p.mobile}</td>
                    <td data-label="Status"><Badge status={p.status} /></td>
                    <td data-label="Applied" style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 110 }}>{fmtDate(p.createdAt)}</td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <ActBtn icon={<Eye size={12} />}   label="View" onClick={() => setViewModal(p)} />
                        <ActBtn icon={<Edit2 size={12} />} label="Edit" onClick={() => openEditPartner(p)} />
                        {p.status === 'PENDING' && <>
                          <ActBtn icon={<CheckCircle size={12} />} label="Approve" onClick={() => approvePartner(p)} />
                          <ActBtn icon={<XCircle size={12} />}     label="Reject"  onClick={() => rejectPartner(p)}  danger />
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Riders table */}
          {tab === 'riders' && (
            <table className="table">
              <thead><tr>
                <Th k="fullName"    label="Name" />
                <Th k="mobile"      label="Mobile" />
                <Th k="vehicleType" label="Vehicle" />
                <Th k="status"      label="Status" />
                <Th k="createdAt"   label="Applied" />
                <th style={{ textAlign: 'right', width: 180 }}>Actions</th>
              </tr></thead>
              <tbody>
                {pagedRiders.length === 0 ? <Empty cols={6} msg="No rider requests match filters" /> : pagedRiders.map(r => (
                  <tr key={r.id}>
                    <td data-label="Name" style={{ fontWeight: 600, color: '#0f172a' }}>{r.fullName}</td>
                    <td data-label="Mobile" style={{ color: '#475569', fontSize: '0.85rem' }}>{r.mobile}</td>
                    <td data-label="Vehicle">
                      <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: 5, fontWeight: 600 }}>
                        {r.vehicleType === 'Bike' ? '🏍️' : r.vehicleType === 'Car' ? '🚗' : '🚲'} {r.vehicleType}
                      </span>
                    </td>
                    <td data-label="Status"><Badge status={r.status} /></td>
                    <td data-label="Applied" style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 110 }}>{fmtDate(r.createdAt)}</td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <ActBtn icon={<Eye size={12} />}   label="View" onClick={() => setViewModal(r)} />
                        <ActBtn icon={<Edit2 size={12} />} label="Edit" onClick={() => openEditRider(r)} />
                        {r.status === 'PENDING' && <>
                          <ActBtn icon={<CheckCircle size={12} />} label="Approve" onClick={() => approveRider(r)} />
                          <ActBtn icon={<XCircle size={12} />}     label="Reject"  onClick={() => rejectRider(r)}  danger />
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Pagination: «  ‹  1 of N  [25 rows ∨]  ›  » ─────────── */}
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', padding: '0.5rem 0', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={() => setPage(1)} disabled={safePage === 1} style={pgBtnStyle(safePage === 1)} title="First">«</button>
          <button onClick={() => setPage(p => p - 1)} disabled={safePage === 1} style={pgBtnStyle(safePage === 1)} title="Previous">‹</button>
          <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, padding: '0 0.4rem', whiteSpace: 'nowrap' }}>
            {safePage} of {totalPages}
          </span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0 0.6rem', background: '#fff', cursor: 'pointer', height: 32 }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} rows per page</option>)}
          </select>
          <button onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages} style={pgBtnStyle(safePage === totalPages)} title="Next">›</button>
          <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={pgBtnStyle(safePage === totalPages)} title="Last">»</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ADD / EDIT MODAL — tab-aware, full fields for each type
      ══════════════════════════════════════════════════════════════ */}
      {addEditModal && (
        <ModalBase title={modalTitle} onClose={() => setAddEditModal(null)}>
          {/* ── User form ── */}
          {tab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>
                👤 {isEditing ? 'Editing existing customer account' : 'Creating a new customer account'}
                {!isEditing && ' — default password: Welcome@123'}
              </div>
              <div>
                <FieldLabel>Full Name *</FieldLabel>
                <input className="input" placeholder="John Doe" value={uForm.name}
                  onChange={e => setUForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Email Address *</FieldLabel>
                <input className="input" type="email" placeholder="user@example.com" value={uForm.email}
                  onChange={e => setUForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Mobile Number</FieldLabel>
                <input className="input" type="tel" placeholder="+91 9876543210" value={uForm.mobile}
                  onChange={e => setUForm(p => ({ ...p, mobile: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Role / Access Level</FieldLabel>
                <select className="input" value={uForm.roleId}
                  onChange={e => setUForm(p => ({ ...p, roleId: e.target.value }))}>
                  <option value="">— Select Role —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Account Status</FieldLabel>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => setUForm(p => ({ ...p, isActive: v }))} style={{
                      flex: 1, padding: '0.55rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      border: `2px solid ${uForm.isActive === v ? (v ? '#15803d' : '#DC2626') : '#e2e8f0'}`,
                      background: uForm.isActive === v ? (v ? '#dcfce7' : '#fee2e2') : '#f8fafc',
                      color: uForm.isActive === v ? (v ? '#15803d' : '#DC2626') : '#64748b',
                    }}>{v ? '✅ Active' : '⛔ Inactive'}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Partner form ── */}
          {tab === 'partners' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>
                🏪 {isEditing ? 'Editing partner restaurant details' : 'Submitting new partner restaurant request'}
              </div>
              {[
                { label: 'Restaurant Name *', key: 'restaurantName', ph: 'Spice Garden Restaurant' },
                { label: 'Owner / Contact Name *', key: 'ownerName', ph: 'Raju Sharma' },
                { label: 'Email Address *', key: 'email', ph: 'owner@restaurant.com' },
                { label: 'Mobile Number', key: 'mobile', ph: '+91 9876543210' },
                { label: 'Address', key: 'address', ph: 'MG Road, Bengaluru, Karnataka' },
                { label: 'FSSAI License Number', key: 'fssaiNumber', ph: 'FSSAI12345678' },
              ].map(f => (
                <div key={f.key}>
                  <FieldLabel>{f.label}</FieldLabel>
                  <input className="input" placeholder={f.ph}
                    value={(pForm as any)[f.key]}
                    onChange={e => setPForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          )}

          {/* ── Rider form ── */}
          {tab === 'riders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>
                🛵 {isEditing ? 'Editing rider profile' : 'Registering a new delivery rider'}
              </div>
              <div>
                <FieldLabel>Full Name *</FieldLabel>
                <input className="input" placeholder="Suresh Kumar" value={rForm.fullName}
                  onChange={e => setRForm(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Mobile Number *</FieldLabel>
                <input className="input" type="tel" placeholder="+91 9876543210" value={rForm.mobile}
                  onChange={e => setRForm(p => ({ ...p, mobile: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Vehicle Type</FieldLabel>
                <select className="input" value={rForm.vehicleType}
                  onChange={e => setRForm(p => ({ ...p, vehicleType: e.target.value }))}>
                  <option value="Bike">🏍️ Bike</option>
                  <option value="Car">🚗 Car</option>
                  <option value="Bicycle">🚲 Bicycle</option>
                  <option value="Scooter">🛵 Scooter</option>
                  <option value="Auto">🛺 Auto</option>
                </select>
              </div>
              <div>
                <FieldLabel>Driving License Number</FieldLabel>
                <input className="input" placeholder="KA05AB1234" value={rForm.licenseNumber}
                  onChange={e => setRForm(p => ({ ...p, licenseNumber: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Address</FieldLabel>
                <input className="input" placeholder="Home address" value={rForm.address}
                  onChange={e => setRForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Modal footer */}
          <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
            <button onClick={() => setAddEditModal(null)} style={{
              flex: 1, padding: '0.65rem', border: '1px solid #e2e8f0', borderRadius: 8,
              background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <X size={14} /> Cancel
            </button>
            <button
              onClick={tab === 'users' ? saveUser : tab === 'partners' ? savePartner : saveRider}
              disabled={saving} className="btn btn-primary"
              style={{ flex: 2, padding: '0.65rem', opacity: saving ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? '⏳ Saving…' : isEditing ? <><CheckCircle size={15} /> Save Changes</> : <><UserPlus size={15} /> {tab === 'users' ? 'Create User' : tab === 'partners' ? 'Submit Request' : 'Register Rider'}</>}
            </button>
          </div>
        </ModalBase>
      )}

      {/* ══════════════════════════════════════════════════════════════
          IMPORT MODAL — sample preview + download + upload in one place
      ══════════════════════════════════════════════════════════════ */}
      {importModal && (
        <ModalBase
          title={`📥 Import ${tab === 'users' ? 'Users' : tab === 'partners' ? 'Partners' : 'Riders'}`}
          onClose={() => setImportModal(false)}
          wide
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Step 1: Sample template */}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                  📋 Step 1 — Sample Template
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <ActBtn icon={<FileText size={12} />} label="Download CSV"
                    onClick={() => exportCSV(`sample_${tab}_import`, TEMPLATES[tab].headers, TEMPLATES[tab].rows)} />
                  <ActBtn icon={<FileSpreadsheet size={12} />} label="Download Excel"
                    onClick={() => exportExcel(`sample_${tab}_import`, TEMPLATES[tab].headers, TEMPLATES[tab].rows)} />
                </div>
              </div>
              {/* Preview table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      {TEMPLATES[tab].headers.map(h => (
                        <th key={h} style={{ background: '#2563EB', color: '#fff', padding: '0.4rem 0.65rem', textAlign: 'left', fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEMPLATES[tab].rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        {row.map((cell, j) => (
                          <td key={j} style={{ padding: '0.35rem 0.65rem', borderBottom: '1px solid #f1f5f9', color: '#475569', whiteSpace: 'nowrap' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                ⚠️ Keep the header row exactly as shown. Accepts .csv, .xlsx, .xls formats.
              </p>
            </div>

            {/* Step 2: Upload */}
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', marginBottom: '0.6rem' }}>
                ⬆️ Step 2 — Upload Your File
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDropFile}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#2563EB' : importFile ? '#16a34a' : '#cbd5e1'}`,
                  borderRadius: 10, padding: '2rem', textAlign: 'center',
                  cursor: 'pointer', transition: 'all .2s',
                  background: dragOver ? '#eff6ff' : importFile ? '#f0fdf4' : '#fafafa',
                }}
              >
                {importFile ? (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>✅</div>
                    <div style={{ fontWeight: 700, color: '#15803d' }}>{importFile.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                      {(importFile.size / 1024).toFixed(1)} KB — click to change
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📂</div>
                    <div style={{ fontWeight: 600, color: '#334155' }}>Drag &amp; drop your file here</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>or click to browse — .csv, .xlsx, .xls</div>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }} />

              {/* ── File preview info — shown once file is selected ── */}
              {importPreview && !importResult && (
                <div style={{ borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>
                      📊 {importPreview.rows.toLocaleString('en-IN')} data row{importPreview.rows !== 1 ? 's' : ''} detected
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>·</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {importPreview.columns.length} column{importPreview.columns.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {importPreview.columns.map(col => (
                      <span key={col} style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.45rem', borderRadius: 4, fontWeight: 600 }}>
                        {col}
                      </span>
                    ))}
                  </div>
                  {importPreview.rows === 0 && (
                    <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
                      ⚠️ No data rows found. Check that you have at least one row below the header.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Import results */}
            {importResult && (
              <div style={{ borderRadius: 8, padding: '0.875rem 1rem', border: '1px solid', borderColor: importResult.fail === 0 ? '#bbf7d0' : '#fecaca', background: importResult.fail === 0 ? '#f0fdf4' : '#fef2f2' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: importResult.fail === 0 ? '#15803d' : '#DC2626' }}>
                  {importResult.fail === 0
                    ? `✅ All ${importResult.success} records imported successfully!`
                    : `⚠️ ${importResult.success} imported, ${importResult.fail} failed`
                  }
                </div>
                {importResult.errors.slice(0, 5).map((e, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 2 }}>• {e}</div>
                ))}
                {importResult.errors.length > 5 && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>…and {importResult.errors.length - 5} more errors</div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setImportModal(false)} style={{
                flex: 1, padding: '0.65rem', border: '1px solid #e2e8f0', borderRadius: 8,
                background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <X size={14} /> Close
              </button>
              <button onClick={runImport} disabled={!importFile || importing}
                className="btn btn-primary"
                style={{ flex: 2, padding: '0.65rem', opacity: (!importFile || importing) ? 0.6 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {importing ? '⏳ Importing…' : <><Upload size={15} /> Start Import</>}
              </button>
            </div>
          </div>
        </ModalBase>
      )}

      {/* Click outside to close export menu */}
      {exportMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setExportMenu(false)} />}
    </div>
  );
}