import { useState, useEffect, useCallback, useMemo, useRef, DragEvent } from 'react';
import axios from 'axios';
import {
  Trash2, Edit2, UserPlus, CheckCircle, XCircle, X, Search,
  RefreshCw, Users, UserCheck, Bike, Download, Upload,
  ChevronUp, ChevronDown, ChevronsUpDown, FileDown, Check,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  FileSpreadsheet, FileText, Eye, UserX, AlertTriangle,
  Building2, Truck,
} from 'lucide-react';
import { useToast, useConfirm } from '@org/ui-design-system';

// ── Types ─────────────────────────────────────────────────────────────
interface Role { id: string; name: string; }
interface User {
  id: string; name: string; email: string; mobile?: string;
  role?: Role | null;
  roles?: Role[];
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
  return dt.toLocaleString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
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
        whiteSpace: 'nowrap', lineHeight: 1, height: '28px',
        background: danger ? '#fef2f2' : 'var(--brand-blue-lt, #eff6ff)',
        color: danger ? '#DC2626' : 'var(--brand-blue, #2563EB)',
        opacity: disabled ? 0.5 : 1,
        transition: 'all .15s ease',
      }}
      onMouseEnter={e => { 
        if (!disabled) {
          e.currentTarget.style.background = danger ? '#fee2e2' : 'var(--brand-blue, #2563EB)'; 
          if (!danger) e.currentTarget.style.color = '#fff';
        }
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.background = danger ? '#fef2f2' : 'var(--brand-blue-lt, #eff6ff)'; 
        if (!danger && !disabled) e.currentTarget.style.color = 'var(--brand-blue, #2563EB)';
      }}
    >
      {icon} {label}
    </button>
  );
}


// ── System-level fallback roles (shown when /api/roles returns empty) ──────
const SYSTEM_ROLES_FALLBACK: Role[] = [
  { id: 'SUPER_ADMIN',     name: 'Super Admin' },
  { id: 'ADMIN',           name: 'Admin' },
  { id: 'IT_ADMIN',        name: 'IT Admin' },
  { id: 'HR_ADMIN',        name: 'HR Admin' },
  { id: 'MARKETING_ADMIN', name: 'Marketing Admin' },
  { id: 'SALES_MANAGER',   name: 'Sales Manager' },
  { id: 'SUPPORT_ADMIN',   name: 'Support Admin' },
  { id: 'FINANCE_ADMIN',   name: 'Finance Admin' },
  { id: 'ACCOUNTANT',      name: 'Accountant' },
  { id: 'MANAGER',         name: 'Manager' },
  { id: 'STAFF',           name: 'Staff' },
  { id: 'PARTNER',         name: 'Partner' },
  { id: 'RIDER',           name: 'Rider' },
  { id: 'CUSTOMER',        name: 'Customer' },
];

// ── Custom Components ──────────────────────────────────────────────────
function MultiSelectDropdown({ label, options, selected, onChange, width = 160 }: {
  label: string; options: {value: string, label: string}[]; selected: string[]; onChange: (vals: string[]) => void; width?: number | string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  const allSelected = selected.length === 0 || selected.length === options.length;
  
  const toggle = (val: string) => {
    if (allSelected) {
      onChange([val]);
      return;
    }
    if (selected.includes(val)) {
      const next = selected.filter(x => x !== val);
      onChange(next.length === 0 ? [] : next);
    } else {
      const next = [...selected, val];
      onChange(next.length === options.length ? [] : next);
    }
  };

  const toggleAll = () => onChange([]);

  let displayLabel = label;
  if (!allSelected) {
    if (selected.length === 1) displayLabel = options.find(o => o.value === selected[0])?.label || label;
    else displayLabel = `${selected.length} Selected`;
  }

  return (
    <div ref={ref} style={{ position: 'relative', width, minWidth: width }}>
      <button onClick={() => setOpen(!open)} className="input" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', cursor: 'pointer', height: 38, textAlign: 'left', padding: '0 0.8rem' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem', fontWeight: 500, color: '#334155' }}>{displayLabel}</span>
        <ChevronDown size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '100%', marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,.1)', zIndex: 50, padding: 4, maxHeight: 300, overflowY: 'auto' }}>
          <div onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', borderRadius: 4, background: allSelected ? 'var(--brand-blue-lt)' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = allSelected ? 'var(--brand-blue-lt)' : 'transparent'}>
            <div style={{ width: 16, height: 16, border: '1.5px solid', borderColor: allSelected ? 'var(--brand-blue)' : '#cbd5e1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: allSelected ? 'var(--brand-blue)' : '#fff' }}>
              {allSelected && <Check size={12} color="#fff" />}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: allSelected ? 600 : 400, color: '#1e293b' }}>All {label.replace('All ', '')}</span>
          </div>
          <div style={{ height: 1, background: '#e2e8f0', margin: '4px 0' }} />
          {options.map(o => {
            const isSel = allSelected || selected.includes(o.value);
            return (
              <div key={o.value} onClick={() => toggle(o.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', borderRadius: 4, background: isSel && !allSelected ? 'var(--brand-blue-lt)' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = isSel && !allSelected ? 'var(--brand-blue-lt)' : 'transparent'}>
                <div style={{ width: 16, height: 16, border: '1.5px solid', borderColor: isSel ? 'var(--brand-blue)' : '#cbd5e1', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSel ? 'var(--brand-blue)' : '#fff' }}>
                  {isSel && <Check size={12} color="#fff" />}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: isSel ? 600 : 400, color: '#1e293b' }}>{o.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter]     = useState<string[]>([]);

  // Derived options for multi-selects
  const statusOpts = useMemo(() => {
    if (tab === 'users') return [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }];
    return [{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }];
  }, [tab]);
  const roleOpts = useMemo(() => {
    const combined = [...roles];
    SYSTEM_ROLES_FALLBACK.forEach(fb => { if (!combined.some(r => r.id === fb.id)) combined.push(fb); });
    return combined.map(r => ({ value: r.name, label: r.name })).sort((a,b) => a.label.localeCompare(b.label));
  }, [roles]);

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
  const [uForm, setUForm]   = useState({ name: '', email: '', mobile: '', roleIds: [] as string[], isActive: true });
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
  // Helper to safely extract arrays no matter how the backend nests the response
  const extractArray = (resData: any) => {
    if (Array.isArray(resData)) return resData;
    if (resData?.data && Array.isArray(resData.data)) return resData.data;
    if (resData?.items && Array.isArray(resData.items)) return resData.items;
    if (resData?.results && Array.isArray(resData.results)) return resData.results;
    return [];
  };

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/roles', { headers: authH() });
      const fetched = extractArray(data);
      // Use API roles if returned, otherwise fall back to system roles
      setRoles(fetched.length > 0 ? fetched : SYSTEM_ROLES_FALLBACK);
    } catch { setRoles(SYSTEM_ROLES_FALLBACK); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/users', { headers: authH() });
      setUsers(extractArray(data));
    } catch { setUsers([]); toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/partners', { headers: authH() });
      setPartners(extractArray(data));
    } catch { setPartners([]); toast.error('Failed to load partners'); }
    finally { setLoading(false); }
  }, []);

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/riders', { headers: authH() });
      setRiders(extractArray(data));
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
    setSearch(''); setPage(1); setStatusFilter([]); setRoleFilter([]);
    setSortKey('name'); setSortDir('asc');
    refresh();
  }, [tab]);

  // ── CRUD — Users ─────────────────────────────────────────────────────
  const openAddUser = () => {
    setEditId(null);
    const defaultRole = roles.find(r => r.name === 'Customer')?.id;
    setUForm({ name: '', email: '', mobile: '', roleIds: defaultRole ? [defaultRole] : [], isActive: true });
    setAddEditModal('add');
  };
  const openEditUser = (u: any) => {
    setEditId(u.id);
    const existingRoleIds = u.roles ? u.roles.map((r: any) => r.id) : (u.role?.id ? [u.role.id] : []);
    setUForm({ name: u.name, email: u.email, mobile: u.mobile || '', roleIds: existingRoleIds, isActive: u.isActive });
    setAddEditModal('edit');
  };

  const saveUser = async () => {
    if (!uForm.name.trim()) { toast.error('Full name is required'); return; }
    if (!uForm.email.trim()) { toast.error('Email is required'); return; }
    setSaving(true);
    try {
      const payload = { name: uForm.name, email: uForm.email, mobile: uForm.mobile, isActive: uForm.isActive, roleIds: uForm.roleIds.length > 0 ? uForm.roleIds : undefined };
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
      await fn('users', ['Name', 'Email', 'Phone', 'Roles', 'Status', 'Points', 'Joined'],
        filteredUsers.map((u: any) => [u.name, u.email, u.mobile || '', u.roles ? u.roles.map((r: any) => r.name).join(', ') : (u.role?.name || 'Customer'), u.isActive ? 'Active' : 'Inactive', String(u.loyaltyPoints), fmtDate(u.createdAt)]));
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
    [...users.filter(u => {
      // Include the single role and multiple roles in the searchable text array
      const searchFields = [
        u.name, 
        u.email, 
        u.mobile || '', 
        u.role?.name || 'Customer',
        ...((u as any).roles?.map((r: any) => r.name) || [])
      ];
      const sMatch = !q || searchFields.some(s => s?.toLowerCase().includes(q));
      const activeState = u.isActive ? 'ACTIVE' : 'INACTIVE';
      const stMatch = statusFilter.length === 0 || statusFilter.includes(activeState);
      const rlMatch = roleFilter.length === 0 || 
        ((u as any).roles ? (u as any).roles.some((r: any) => roleFilter.includes(r.name)) : roleFilter.includes(u.role?.name || 'Customer'));
      return sMatch && stMatch && rlMatch;
    })].sort(sortFn(sortKey, sortDir)), [users, q, statusFilter, roleFilter, sortKey, sortDir]);

  const filteredPartners = useMemo(() =>
    [...partners.filter(p =>
      (!q || [p.restaurantName, p.ownerName, p.email, p.mobile].some(s => s?.toLowerCase().includes(q))) &&
      (statusFilter.length === 0 || statusFilter.includes(p.status))
    )].sort(sortFn(sortKey, sortDir)), [partners, q, statusFilter, sortKey, sortDir]);

  const filteredRiders = useMemo(() =>
    [...riders.filter(r =>
      (!q || [r.fullName, r.mobile].some(s => s?.toLowerCase().includes(q))) &&
      (statusFilter.length === 0 || statusFilter.includes(r.status))
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
  const Th = ({ k, label, right, minW }: { k: string; label: string; right?: boolean; minW?: number }) => (
  <th onClick={() => handleSort(k)} style={{
      cursor: 'pointer', userSelect: 'none',
      textAlign: right ? 'right' : 'left', whiteSpace: 'nowrap',
      minWidth: minW
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: right ? 'flex-end' : 'flex-start' }}>
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
          <button key={t.id} onClick={() => { setTab(t.id); setStatusFilter([]); setRoleFilter([]); }} style={{
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

      {/* ── Filter Bar — perfectly aligned horizontal row ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200, maxWidth: 400 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: '2.1rem', width: '100%', height: 38 }}
            placeholder={`Search ${tab}…`} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {/* Status filter */}
        <MultiSelectDropdown 
          label="All Status" 
          options={statusOpts} 
          selected={statusFilter} 
          onChange={v => { setStatusFilter(v); setPage(1); }} 
          width={150} 
        />

        {/* Role filter — users only */}
        {tab === 'users' && (
          <MultiSelectDropdown 
            label="All Roles" 
            options={roleOpts} 
            selected={roleFilter} 
            onChange={v => { setRoleFilter(v); setPage(1); }} 
            width={180} 
          />
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
            <table className="table" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead><tr>
                <Th k="name"      label="Name" minW={180} />
                <Th k="email"     label="Email" minW={200} />
                <Th k="mobile"    label="Phone" minW={130} />
                <Th k="role"      label="Role" minW={140} />
                <Th k="status"    label="Status" minW={110} />
                <Th k="points"    label="Points" right minW={100} />
                <Th k="createdAt" label="Joined" minW={180} />
                <th style={{ textAlign: 'right', width: 240, minWidth: 240 }}>Actions</th>
              </tr></thead>
              <tbody>
                {pagedUsers.length === 0 ? <Empty cols={8} msg="No users match your filters" /> : pagedUsers.map(u => (
                  <tr key={u.id}>
                    <td data-label="Name" style={{ minWidth: 180 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name || '—'}</div>
                      {u.restaurant && <div style={{ fontSize: '0.72rem', color: 'var(--brand-blue)', marginTop: 1 }}>📍 {u.restaurant.name}</div>}
                    </td>
                    <td data-label="Email" style={{ color: '#475569', fontSize: '0.85rem', minWidth: 200 }}>{u.email}</td>
                    <td data-label="Phone" style={{ color: '#64748b', fontSize: '0.85rem', minWidth: 130 }}>{u.mobile || '—'}</td>
                    <td data-label="Role" style={{ minWidth: 140 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {((u as any).roles && (u as any).roles.length > 0) ? (
                          (u as any).roles.map((r: any) => (
                            <span key={r.id} style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: 5, fontWeight: 600 }}>
                              {r.name}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: 5, fontWeight: 600 }}>
                            {u.role?.name || 'Customer'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Status" style={{ minWidth: 110 }}>
                      <button onClick={() => toggleUserStatus(u)} title="Click to toggle status"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Badge active={u.isActive} />
                      </button>
                    </td>
                    <td data-label="Points" style={{ textAlign: 'right', color: u.loyaltyPoints > 0 ? '#b45309' : '#cbd5e1', fontWeight: u.loyaltyPoints > 0 ? 700 : 400, minWidth: 100 }}>
                      {u.loyaltyPoints > 0 ? `🏅 ${fmtNum(u.loyaltyPoints)}` : '—'}
                    </td>
                    <td data-label="Joined" style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 180 }}>{fmtDate(u.createdAt)}</td>
                    <td data-label="Actions" style={{ minWidth: 240, padding: '0.4rem 0.75rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
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
            <table className="table" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead><tr>
                <Th k="restaurantName" label="Restaurant" minW={180} />
                <Th k="ownerName"      label="Owner" minW={150} />
                <Th k="email"          label="Email" minW={200} />
                <Th k="mobile"         label="Mobile" minW={130} />
                <Th k="status"         label="Status" minW={110} />
                <Th k="createdAt"      label="Applied" minW={180} />
                <th style={{ textAlign: 'right', width: 280, minWidth: 280 }}>Actions</th>
              </tr></thead>
              <tbody>
                {pagedPartners.length === 0 ? <Empty cols={7} msg="No partner requests match filters" /> : pagedPartners.map(p => (
                  <tr key={p.id}>
                    <td data-label="Restaurant" style={{ fontWeight: 600, color: '#0f172a', minWidth: 180 }}>{p.restaurantName}</td>
                    <td data-label="Owner" style={{ color: '#334155', minWidth: 150 }}>{p.ownerName}</td>
                    <td data-label="Email" style={{ color: '#475569', fontSize: '0.85rem', minWidth: 200 }}>{p.email}</td>
                    <td data-label="Mobile" style={{ color: '#64748b', fontSize: '0.85rem', minWidth: 130 }}>{p.mobile}</td>
                    <td data-label="Status" style={{ minWidth: 110 }}><Badge status={p.status} /></td>
                    <td data-label="Applied" style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 180 }}>{fmtDate(p.createdAt)}</td>
                    <td data-label="Actions" style={{ minWidth: 280, padding: '0.4rem 0.75rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
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
            <table className="table" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead><tr>
                <Th k="fullName"    label="Name" minW={180} />
                <Th k="mobile"      label="Mobile" minW={130} />
                <Th k="vehicleType" label="Vehicle" minW={130} />
                <Th k="status"      label="Status" minW={110} />
                <Th k="createdAt"   label="Applied" minW={180} />
                <th style={{ textAlign: 'right', width: 280, minWidth: 280 }}>Actions</th>
              </tr></thead>
              <tbody>
                {pagedRiders.length === 0 ? <Empty cols={6} msg="No rider requests match filters" /> : pagedRiders.map(r => (
                  <tr key={r.id}>
                    <td data-label="Name" style={{ fontWeight: 600, color: '#0f172a', minWidth: 180 }}>{r.fullName}</td>
                    <td data-label="Mobile" style={{ color: '#475569', fontSize: '0.85rem', minWidth: 130 }}>{r.mobile}</td>
                    <td data-label="Vehicle" style={{ minWidth: 130 }}>
                      <span style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: 5, fontWeight: 600 }}>
                        {r.vehicleType === 'Bike' ? '🏍️' : r.vehicleType === 'Car' ? '🚗' : '🚲'} {r.vehicleType}
                      </span>
                    </td>
                    <td data-label="Status" style={{ minWidth: 110 }}><Badge status={r.status} /></td>
                    <td data-label="Applied" style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 180 }}>{fmtDate(r.createdAt)}</td>
                    <td data-label="Actions" style={{ minWidth: 280, padding: '0.4rem 0.75rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
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

      {/* ── Pagination: << < 1 of N [25 rows per page] > >> ─────────── */}
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', padding: '0.5rem 0', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={() => setPage(1)} disabled={safePage === 1} style={pgBtnStyle(safePage === 1)} title="First">
            <ChevronsLeft size={16} />
          </button>
          <button onClick={() => setPage(p => p - 1)} disabled={safePage === 1} style={pgBtnStyle(safePage === 1)} title="Previous">
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, padding: '0 0.4rem', whiteSpace: 'nowrap' }}>
            {safePage} of {totalPages}
          </span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0 0.6rem', background: '#fff', cursor: 'pointer', height: 32 }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} rows per page</option>)}
          </select>
          <button onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages} style={pgBtnStyle(safePage === totalPages)} title="Next">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={pgBtnStyle(safePage === totalPages)} title="Last">
            <ChevronsRight size={16} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW MODAL — Read-only details
      ══════════════════════════════════════════════════════════════ */}
      {viewModal && (
        <ModalBase title={`👁️ View Details`} onClose={() => setViewModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {Object.entries(viewModal).map(([k, v]) => {
              if (k === 'id' || k === 'password') return null; // Hide sensitive/internal fields
              
              let displayValue = v;
              if (typeof v === 'object' && v !== null) displayValue = (v as any).name || JSON.stringify(v);
              if (k === 'createdAt' || k === 'updatedAt') displayValue = fmtDate(v as string);
              if (typeof v === 'boolean') displayValue = v ? 'Yes' : 'No';
              
              return (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 2 }}>
                    {k.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#0f172a', wordBreak: 'break-word', fontWeight: 500 }}>
                    {String(displayValue || '—')}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => setViewModal(null)} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Done
            </button>
          </div>
        </ModalBase>
      )}

      {/* ══════════════════════════════════════════════════════════════
          VIEW MODAL — Read-only details
      ══════════════════════════════════════════════════════════════ */}
      {viewModal && (
        <ModalBase title={`👁️ View Details`} onClose={() => setViewModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {Object.entries(viewModal).map(([k, v]) => {
              if (k === 'id' || k === 'password') return null; // Hide sensitive/internal fields
              
              let displayValue = v;
              if (typeof v === 'object' && v !== null) displayValue = (v as any).name || JSON.stringify(v);
              if (k === 'createdAt' || k === 'updatedAt') displayValue = fmtDate(v as string);
              if (typeof v === 'boolean') displayValue = v ? 'Yes' : 'No';
              
              return (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 2 }}>
                    {k.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#0f172a', wordBreak: 'break-word', fontWeight: 500 }}>
                    {String(displayValue || '—')}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => setViewModal(null)} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Done
            </button>
          </div>
        </ModalBase>
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
                <FieldLabel>Roles / Access Levels</FieldLabel>
                <MultiSelectDropdown 
                  label="Select Roles"
                  options={roles.map(r => ({ value: r.id, label: r.name }))}
                  selected={uForm.roleIds}
                  onChange={vals => setUForm(p => ({ ...p, roleIds: vals }))}
                  width="100%"
                />
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