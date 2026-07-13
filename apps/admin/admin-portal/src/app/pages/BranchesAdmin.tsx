import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToggleLeft, ToggleRight, Trash2, Edit2, PlusCircle, CheckCircle, XCircle, MapPin, Phone, Mail, Clock, Store, UploadCloud, Info, Settings, Download, QrCode, Search, Filter, Eye, MoreVertical, Image, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './BranchesAdmin.module.css';
import { useConfirm } from '@org/ui-design-system';
import { MOCK_BRANCHES, MOCK_RESTAURANTS } from './mockData';

interface Restaurant {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  secondaryPhone: string | null;
  email: string | null;
  secondaryEmail: string | null;
  lat: number | null;
  lng: number | null;
  mondayHours: string | null;
  tuesdayHours: string | null;
  wednesdayHours: string | null;
  thursdayHours: string | null;
  fridayHours: string | null;
  saturdayHours: string | null;
  sundayHours: string | null;
  isActive: boolean;
  isQrMenuEnabled: boolean;
  isReservationEnabled: boolean;
  isDeliveryEnabled: boolean;
  isTakeawayEnabled: boolean;
  qrCodeUrl: string | null;
  brandLogoUrl: string | null;
  faviconUrl: string | null;
  fssaiNumber: string | null;
  fssaiDocUrl: string | null;
  gstNumber: string | null;
  gstDocUrl: string | null;
  panNumber: string | null;
  panDocUrl: string | null;
  collectionTags: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  restaurant?: Restaurant;
}

// ── Safe default form — NEVER use {} as any, it crashes on .toString() ──
const EMPTY_FORM: Omit<Branch, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt' | 'restaurant'> = {
  restaurantId: '',
  name: '',
  address: '',
  city: '',
  phone: '',
  secondaryPhone: '',
  email: '',
  secondaryEmail: '',
  lat: null,
  lng: null,
  mondayHours: '09:00 - 22:00',
  tuesdayHours: '09:00 - 22:00',
  wednesdayHours: '09:00 - 22:00',
  thursdayHours: '09:00 - 22:00',
  fridayHours: '09:00 - 22:00',
  saturdayHours: '09:00 - 22:00',
  sundayHours: '09:00 - 22:00',
  isActive: true,
  isQrMenuEnabled: false,
  isReservationEnabled: false,
  isDeliveryEnabled: true,
  isTakeawayEnabled: true,
  qrCodeUrl: null,
  brandLogoUrl: null,
  faviconUrl: null,
  fssaiNumber: '',
  fssaiDocUrl: '',
  gstNumber: '',
  gstDocUrl: '',
  panNumber: '',
  panDocUrl: '',
  collectionTags: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImageUrl: '',
  twitterTitle: '',
  twitterDescription: '',
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
  youtubeUrl: '',
};

export default function BranchesAdmin() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recycledBranches, setRecycledBranches] = useState<Branch[]>([]);
  const [recycledRestaurants, setRecycledRestaurants] = useState<Restaurant[]>([]);
  const [viewMode, setViewMode] = useState<'active' | 'recycle'>('active');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'features' | 'compliance' | 'branding' | 'seo' | 'smo'>('basic');
  const [deleteConfirmParentId, setDeleteConfirmParentId] = useState<string | null>(null);
  const [qrModalBranch, setQrModalBranch] = useState<Branch | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [qrTargetPlatform, setQrTargetPlatform] = useState<'web' | 'mobile'>('web');
  const [qrCenterOverlay, setQrCenterOverlay] = useState<'logo' | 'favicon' | 'none'>('logo');
  const [tablesModalBranch, setTablesModalBranch] = useState<Branch | null>(null);
  const [branchTables, setBranchTables] = useState<any[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [newTableForm, setNewTableForm] = useState({ tableNumber: '', capacity: 4, section: '' });
  const confirmDialog = useConfirm();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-open "New Branch" form when navigated via Quick Create (?action=new)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        setEditId(null);
        setForm(EMPTY_FORM as any);
        setActiveTab('basic');
        setShowForm(true);
        // Clear the action param so refresh doesn't re-trigger
        window.history.replaceState(null, '', '?tab=branches');
      }
    }
  }, []);

  const getBranchQrUrl = (branch: Branch) => {
    const baseUrl = qrTargetPlatform === 'web' ? 'http://localhost:4208' : 'http://localhost:4210';
    return `${baseUrl}/branch/${branch.id}`;
  };

  const downloadBranchQR = async (branch: Branch, format: 'svg' | 'png' | 'pdf') => {
    const svgEl = document.getElementById(`qr-code-branch-${branch.id}`) as SVGElement | null;
    if (!svgEl) return;

    // Clone SVG and embed overlay image if needed
    const buildCanvas = (): Promise<HTMLCanvasElement> => new Promise((resolve) => {
      const svgClone = svgEl.cloneNode(true) as SVGElement;
      const SIZE = 260;
      svgClone.setAttribute('width', String(SIZE));
      svgClone.setAttribute('height', String(SIZE));
      const PAD = 20;
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const canvas = document.createElement('canvas');
      canvas.width = SIZE + PAD * 2;
      canvas.height = SIZE + PAD * 2;
      const ctx = canvas.getContext('2d')!;
      const bgImg = new window.Image();
      bgImg.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, PAD, PAD);

        const overlayUrl = qrCenterOverlay === 'logo'
          ? (branch.brandLogoUrl || null)
          : qrCenterOverlay === 'favicon'
          ? (branch.faviconUrl || null)
          : null;

        if (overlayUrl) {
          const logo = new window.Image();
          logo.crossOrigin = 'anonymous';
          logo.onload = () => {
            const OV = 44; // overlay box size in pixels
            const OX = (canvas.width - OV) / 2;
            const OY = (canvas.height - OV) / 2;
            // White rounded backing
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(OX - 3, OY - 3, OV + 6, OV + 6, 8);
            ctx.fill();
            ctx.drawImage(logo, OX, OY, OV, OV);
            resolve(canvas);
          };
          logo.onerror = () => resolve(canvas); // overlay failed — just use QR alone
          logo.src = overlayUrl;
        } else {
          resolve(canvas);
        }
      };
      bgImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });

    const fileName = `Branch-${branch.name}-Menu-QR`;

    if (format === 'svg') {
      // SVG download — embed overlay as <image> element if needed
      const svgClone = svgEl.cloneNode(true) as SVGElement;
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const overlayUrl = qrCenterOverlay === 'logo' ? branch.brandLogoUrl
                        : qrCenterOverlay === 'favicon' ? branch.faviconUrl : null;
      if (overlayUrl) {
        const SIZE = parseInt(svgClone.getAttribute('width') || '220');
        const OV = 44;
        const OX = (SIZE - OV) / 2;
        const OY = (SIZE - OV) / 2;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(OX - 3)); rect.setAttribute('y', String(OY - 3));
        rect.setAttribute('width', String(OV + 6)); rect.setAttribute('height', String(OV + 6));
        rect.setAttribute('rx', '8'); rect.setAttribute('fill', '#ffffff');
        svgClone.appendChild(rect);
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('href', overlayUrl); img.setAttribute('x', String(OX));
        img.setAttribute('y', String(OY)); img.setAttribute('width', String(OV)); img.setAttribute('height', String(OV));
        svgClone.appendChild(img);
      }
      const blob = new Blob([new XMLSerializer().serializeToString(svgClone)], { type: 'image/svg+xml' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${fileName}.svg`; a.click();
      return;
    }

    if (format === 'png') {
      const canvas = await buildCanvas();
      const a = document.createElement('a'); a.download = `${fileName}.png`; a.href = canvas.toDataURL('image/png'); a.click();
      return;
    }

    if (format === 'pdf') {
      const canvas = await buildCanvas();
      const imgData = canvas.toDataURL('image/png');
      const W = 210, H = 297; // A4 mm
      const qrMm = 80;
      const marginX = (W - qrMm) / 2;
      const marginY = 40;
      // Build a minimal A4 PDF with embedded PNG — no library needed
      const pdfContent = `%PDF-1.4
1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj
2 0 obj<</Type /Pages /Kids[3 0 R] /Count 1>>endobj
3 0 obj<</Type /Page /Parent 2 0 R /MediaBox[0 0 595.28 841.89] /Contents 4 0 R /Resources<</XObject<</I1 5 0 R>>>>>>endobj
`;
      // Fallback: use canvas to generate a printable window
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<!DOCTYPE html><html><head><title>${fileName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#fff;font-family:Inter,sans-serif}h2{margin-bottom:1rem;color:#0f172a;font-size:1.25rem}p{color:#64748b;font-size:.85rem;margin-top:.5rem;word-break:break-all;max-width:320px;text-align:center}@media print{button{display:none}}</style></head><body><h2>${branch.name} — Menu QR</h2><img src="${imgData}" style="width:280px;height:280px" /><p>${getBranchQrUrl(branch)}</p><br/><button onclick="window.print()">🖨️ Print / Save as PDF</button></body></html>`);
        w.document.close();
      }
    }
  };
  

  const [form, setForm] = useState({
    restaurantId: '',
    name: '',
    address: '',
    city: '',
    phone: '',
    secondaryPhone: '',
    email: '',
    secondaryEmail: '',
    lat: 25.611,
    lng: 85.144,
    mondayHours: '09:00 - 22:00',
    tuesdayHours: '09:00 - 22:00',
    wednesdayHours: '09:00 - 22:00',
    thursdayHours: '09:00 - 22:00',
    fridayHours: '09:00 - 22:00',
    saturdayHours: '09:00 - 22:00',
    sundayHours: '09:00 - 22:00',
    qrCodeUrl: '',
    brandLogoUrl: '',
    faviconUrl: '',
    fssaiNumber: '',
    fssaiDocUrl: '',
    gstNumber: '',
    gstDocUrl: '',
    panNumber: '',
    panDocUrl: '',
    isActive: true,
    isQrMenuEnabled: false,
    isReservationEnabled: false,
    isDeliveryEnabled: true,
    isTakeawayEnabled: true,
    collectionTags: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
    twitterTitle: '',
    twitterDescription: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    googleMapsUrl: '',
  });

  const isSuperAdmin = localStorage.getItem('admin_role') === 'SUPER_ADMIN';

  const authHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchesRes, restaurantsRes] = await Promise.all([
        axios.get('/api/branches', authHeaders()),
        axios.get('/api/branches/restaurants/all', authHeaders()),
      ]);

      const branchesData = branchesRes.data;
      const restaurantsData = restaurantsRes.data;

      setRestaurants(restaurantsData);

      const mappedBranches = branchesData.map((b: any) => ({
        ...b,
        restaurant: restaurantsData.find((r: any) => r.id === b.restaurantId),
      }));

      setBranches(mappedBranches);
      setError(null);
    } catch (err: any) {
      // API error — show error banner, never inject mock data
      const msg = err?.response?.data?.message || err?.message || 'Failed to load branches. Check API connection.';
      setError(msg);
      setBranches([]);
      setRestaurants([]);
      console.warn('[BranchesAdmin] API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecycledData = async () => {
    try {
      setLoading(true);
      const [branchesRes, restaurantsRes] = await Promise.all([
        axios.get('/api/branches/recycle-bin/branches', authHeaders()),
        axios.get('/api/branches/recycle-bin/restaurants', authHeaders()),
      ]);
      setRecycledBranches(branchesRes.data);
      setRecycledRestaurants(restaurantsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recycle bin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'active') {
      fetchData();
    } else {
      fetchRecycledData();
    }
  }, [viewMode]);

  const filteredBranches = branches.filter(branch => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      branch.name.toLowerCase().includes(searchLower) || 
      branch.city.toLowerCase().includes(searchLower) || 
      branch.address.toLowerCase().includes(searchLower) ||
      (branch.restaurant?.name || '').toLowerCase().includes(searchLower) ||
      (branch.email || '').toLowerCase().includes(searchLower) ||
      (branch.phone || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? branch.isActive :
      !branch.isActive;
      
    const matchesRestaurant = 
      restaurantFilter === 'all' ? true :
      branch.restaurantId === restaurantFilter;

    return matchesSearch && matchesStatus && matchesRestaurant;
  });

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = filteredBranches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, restaurantFilter]);

  const handleToggle = async (branchId: string, field: 'isQrMenuEnabled' | 'isReservationEnabled' | 'isActive', currentValue: boolean) => {
    try {
      setActionLoadingId(branchId + field);
      await axios.patch(`/api/branches/${branchId}`, { [field]: !currentValue }, authHeaders());
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update branch setting');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({ title: 'Move to Recycle Bin', message: 'Are you sure you want to move this branch to the Recycle Bin?', variant: 'warning' });
    if (!ok) return;
    try {
      setActionLoadingId(id + 'delete');
      await axios.delete(`/api/branches/${id}`, authHeaders());
      showToast('Branch moved to Recycle Bin', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete branch');
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchBranchTables = async (branchId: string) => {
    try {
      setTablesLoading(true);
      const res = await axios.get(`/api/tables?branchId=${branchId}`, authHeaders());
      setBranchTables(res.data || []);
    } catch {
      setBranchTables([]);
    } finally {
      setTablesLoading(false);
    }
  };

  const handleOpenTables = (branch: Branch) => {
    setTablesModalBranch(branch);
    setNewTableForm({ tableNumber: '', capacity: 4, section: '' });
    fetchBranchTables(branch.id);
    setOpenMenuId(null);
  };

  const handleAddTable = async () => {
    if (!tablesModalBranch || !newTableForm.tableNumber.trim()) {
      showToast('Table number is required');
      return;
    }
    try {
      await axios.post('/api/tables', {
        branchId: tablesModalBranch.id,
        tableNumber: newTableForm.tableNumber,
        capacity: newTableForm.capacity,
        section: newTableForm.section || null,
      }, authHeaders());
      showToast('Table added successfully', 'success');
      setNewTableForm({ tableNumber: '', capacity: 4, section: '' });
      fetchBranchTables(tablesModalBranch.id);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add table');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    const ok = await confirmDialog({ title: 'Delete Table', message: 'Remove this table?', variant: 'danger' });
    if (!ok || !tablesModalBranch) return;
    try {
      await axios.delete(`/api/tables/${tableId}`, authHeaders());
      showToast('Table removed', 'success');
      fetchBranchTables(tablesModalBranch.id);
    } catch {
      showToast('Failed to remove table');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditId(branch.id);
    // Pre-populate all form fields with existing branch data
    setForm({
      restaurantId: branch.restaurantId || '',
      name: branch.name || '',
      address: branch.address || '',
      city: branch.city || '',
      phone: branch.phone || '',
      secondaryPhone: branch.secondaryPhone || '',
      email: branch.email || '',
      secondaryEmail: branch.secondaryEmail || '',
      lat: branch.lat || 25.611,
      lng: branch.lng || 85.144,
      mondayHours: branch.mondayHours || '09:00 - 22:00',
      tuesdayHours: branch.tuesdayHours || '09:00 - 22:00',
      wednesdayHours: branch.wednesdayHours || '09:00 - 22:00',
      thursdayHours: branch.thursdayHours || '09:00 - 22:00',
      fridayHours: branch.fridayHours || '09:00 - 22:00',
      saturdayHours: branch.saturdayHours || '09:00 - 22:00',
      sundayHours: branch.sundayHours || '09:00 - 22:00',
      qrCodeUrl: branch.qrCodeUrl || '',
      brandLogoUrl: branch.brandLogoUrl || '',
      faviconUrl: branch.faviconUrl || '',
      fssaiNumber: branch.fssaiNumber || '',
      fssaiDocUrl: branch.fssaiDocUrl || '',
      gstNumber: branch.gstNumber || '',
      gstDocUrl: branch.gstDocUrl || '',
      panNumber: branch.panNumber || '',
      panDocUrl: branch.panDocUrl || '',
      isActive: branch.isActive ?? true,
      isQrMenuEnabled: branch.isQrMenuEnabled ?? false,
      isReservationEnabled: branch.isReservationEnabled ?? false,
      isDeliveryEnabled: branch.isDeliveryEnabled ?? true,
      isTakeawayEnabled: branch.isTakeawayEnabled ?? true,
      collectionTags: branch.collectionTags || '',
      seoTitle: branch.seoTitle || '',
      seoDescription: branch.seoDescription || '',
      seoKeywords: branch.seoKeywords || '',
      ogTitle: branch.ogTitle || '',
      ogDescription: branch.ogDescription || '',
      ogImageUrl: branch.ogImageUrl || '',
      twitterTitle: branch.twitterTitle || '',
      twitterDescription: branch.twitterDescription || '',
      facebookUrl: branch.facebookUrl || '',
      instagramUrl: branch.instagramUrl || '',
      twitterUrl: branch.twitterUrl || '',
      youtubeUrl: branch.youtubeUrl || '',
      googleMapsUrl: (branch as any).googleMapsUrl || '',
    });
    setActiveTab('basic');
    setShowForm(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        showToast('Only images and PDF files are allowed!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm(prev => ({ ...prev, brandLogoUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Field validation
    if (!form.name?.trim()) { showToast('Branch name is required'); return; }
    if (!form.phone?.trim()) { showToast('Phone number is required'); return; }
    if (!form.city?.trim()) { showToast('City is required'); return; }
    if (!form.restaurantId && restaurants.length > 0) {
      // Auto-assign to first restaurant if not set
      form.restaurantId = restaurants[0].id;
    }
    try {
      setIsSubmitting(true);
      if (editId) {
        // UPDATE existing branch
        await axios.patch(`/api/branches/${editId}`, form, authHeaders());
        showToast('Branch updated successfully!', 'success');
      } else {
        // CREATE new branch
        await axios.post('/api/branches', form, authHeaders());
        showToast('Branch created successfully!', 'success');
      }
      setShowForm(false);
      setEditId(null);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save branch';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Branches Management</h2>
          <p className={styles.subtitle} style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage all your restaurant branches</p>
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.addBtn}
            onClick={() => {
              setEditId(null);
              setForm(EMPTY_FORM as any);
              setActiveTab('basic');
              setShowForm(true);
            }}
            style={{ marginRight: '1rem' }}
          >
            <PlusCircle size={20} /> New Branch
          </button>
          <button
            className={styles.addBtn}
            onClick={() => setViewMode(viewMode === 'active' ? 'recycle' : 'active')}
            style={{ backgroundColor: viewMode === 'recycle' ? '#2563EB' : '#e2e8f0', color: viewMode === 'recycle' ? '#fff' : '#334155' }}
          >
            <Trash2 size={20} /> {viewMode === 'active' ? 'Recycle Bin' : 'Back to Active'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button 
            onClick={fetchData} 
            style={{ background: '#7f1d1d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      <div className={styles.filtersContainer}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by restaurant name, branch name, email id, contact number, city or address..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="offline">Offline</option>
        </select>
        <select 
          className={styles.filterSelect}
          value={restaurantFilter}
          onChange={(e) => setRestaurantFilter(e.target.value)}
        >
          <option value="all">All Restaurants</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button className={styles.filterIconBtn}>
          <Filter size={18} />
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>BRANCH</th>
              <th>RESTAURANT</th>
              <th>CONTACT</th>
              <th>HOURS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {viewMode === 'recycle' ? (
              recycledBranches.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Trash2 size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#334155', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Recycle Bin is empty</h3>
                    <p style={{ color: '#64748b' }}>Deleted branches will appear here.</p>
                  </td>
                </tr>
              ) : (
                recycledBranches.map(branch => (
                  <tr key={branch.id} style={{ opacity: 0.8 }}>
                    <td>
                      <div className={styles.branchCell}>
                        {branch.faviconUrl ? (
                          <div className={styles.brandLogoContainer} style={{ width: '40px', height: '40px' }}>
                            <img src={branch.faviconUrl} alt="favicon" className={styles.brandLogo} style={{ borderRadius: '50%', objectFit: 'contain' }} />
                          </div>
                        ) : branch.brandLogoUrl ? (
                          <div className={styles.brandLogoContainer} style={{ width: '40px', height: '40px' }}>
                            <img src={branch.brandLogoUrl} alt="logo" className={styles.brandLogo} />
                          </div>
                        ) : (
                          <div className={styles.brandLogoContainer} style={{ width: '40px', height: '40px' }}>
                            <Store size={20} color="#94a3b8" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'line-through' }}>{branch.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{branch.address}, {branch.city}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                        {branch.restaurant?.name || 'Unknown'}
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactCell}>
                        {branch.phone && <div className={styles.contactRow}><Phone size={14} className={styles.contactIcon} /> {branch.phone}</div>}
                        {branch.email && <div className={styles.contactRow}><Mail size={14} className={styles.contactIcon} /> {branch.email}</div>}
                      </div>
                    </td>
                    <td>
                      <div className={styles.hoursCell}>{branch.mondayHours}</div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeDeleted}`}>Deleted</span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button 
                          onClick={async () => {
                            try {
                              await axios.patch(`/api/branches/recycle-bin/branches/${branch.id}/restore`, {}, authHeaders());
                              showToast('Branch restored successfully!', 'success');
                              fetchRecycledData();
                            } catch (err: any) { showToast('Failed to restore branch'); }
                          }}
                          style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                        >Restore</button>
                        <button 
                          onClick={async () => {
                            const ok = await confirmDialog({ title: 'Permanently Delete Branch', message: 'This action cannot be undone. The branch will be permanently deleted.', variant: 'danger', confirmLabel: 'Delete Forever' });
                            if (!ok) return;
                            try {
                              await axios.delete(`/api/branches/recycle-bin/branches/${branch.id}/hard`, authHeaders());
                              showToast('Branch permanently deleted!', 'success');
                              fetchRecycledData();
                            } catch (err: any) { showToast('Failed to delete'); }
                          }}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            ) : loading && branches.length === 0 ? (
               <tr>
                 <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                   <div className={styles.spinner} style={{ borderColor: '#2563EB', borderTopColor: 'transparent', width: '2rem', height: '2rem' }}></div>
                 </td>
               </tr>
            ) : paginatedBranches.length === 0 ? (
               <tr>
                 <td colSpan={6} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Store size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#334155', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No branches found</h3>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{branches.length === 0 ? "You haven't set up any physical locations yet." : "We couldn't find any branches matching your filters."}</p>
                    <button
                      className={styles.addBtn}
                      onClick={() => {
                        if (branches.length === 0) {
                          setEditId(null);
                          setShowForm(true);
                        } else {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setRestaurantFilter('all');
                        }
                      }}
                    >
                      {branches.length === 0 ? <><PlusCircle size={20} /> Create Your First Branch</> : "Clear Filters"}
                    </button>
                 </td>
               </tr>
            ) : (
              paginatedBranches.map(branch => (
                <tr key={branch.id}>
                  <td data-label="Branch">
                    <div className={styles.branchCell}>
                      {branch.faviconUrl ? (
                        <div className={styles.brandLogoContainer} style={{ width: '40px', height: '40px' }}>
                          <img src={branch.faviconUrl} alt="favicon" className={styles.brandLogo} style={{ borderRadius: '50%', objectFit: 'contain' }} />
                        </div>
                      ) : branch.brandLogoUrl ? (
                        <div className={styles.brandLogoContainer} style={{ width: '40px', height: '40px' }}>
                          <img src={branch.brandLogoUrl} alt="logo" className={styles.brandLogo} />
                        </div>
                      ) : (
                        <div className={styles.brandLogoContainer} style={{ width: '40px', height: '40px' }}>
                          <Store size={20} color="#94a3b8" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{branch.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{branch.address}, {branch.city}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Restaurant">
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                      {branch.restaurant?.name || 'Unknown'}
                    </div>
                  </td>
                  <td data-label="Contact">
                    <div className={styles.contactCell}>
                      {branch.phone && <div className={styles.contactRow}><Phone size={14} className={styles.contactIcon} /> {branch.phone}</div>}
                      {branch.email && <div className={styles.contactRow}><Mail size={14} className={styles.contactIcon} /> {branch.email}</div>}
                    </div>
                  </td>
                  <td data-label="Hours">
                    <div className={styles.hoursCell}>{branch.mondayHours}</div>
                  </td>
                  <td data-label="Status">
                    <button
                      onClick={() => handleToggle(branch.id, 'isActive', branch.isActive)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      disabled={actionLoadingId === branch.id + 'isActive'}
                    >
                      <span className={`${styles.badge} ${branch.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                        {actionLoadingId === branch.id + 'isActive' ? (
                          <span className={styles.spinner} style={{ width: '12px', height: '12px', margin: 0, borderTopColor: 'currentColor' }}></span>
                        ) : branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button className={styles.actionBtn} onClick={() => setQrModalBranch(branch)} title="View QR">
                        <Eye size={16} />
                      </button>
                      <button className={styles.actionBtn} onClick={() => handleEdit(branch)} title="Edit Branch">
                        <Edit2 size={16} />
                      </button>
                      <div className={styles.dropdownContainer}>
                        <button 
                          className={styles.actionBtn} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === branch.id ? null : branch.id);
                          }}
                          title="More options"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === branch.id && (
                          <div className={styles.dropdownMenu}>
                            <button className={styles.dropdownItem} onClick={() => handleToggle(branch.id, 'isQrMenuEnabled', branch.isQrMenuEnabled)} disabled={actionLoadingId === branch.id + 'isQrMenuEnabled'}>
                              {branch.isQrMenuEnabled ? <ToggleRight size={16} color="#16a34a" /> : <ToggleLeft size={16} color="#94a3b8" />}
                              Toggle QR Menu
                            </button>
                            <button className={styles.dropdownItem} onClick={() => handleToggle(branch.id, 'isReservationEnabled', branch.isReservationEnabled)} disabled={actionLoadingId === branch.id + 'isReservationEnabled'}>
                              {branch.isReservationEnabled ? <ToggleRight size={16} color="#16a34a" /> : <ToggleLeft size={16} color="#94a3b8" />}
                              Toggle Reservations
                            </button>
                            {branch.isQrMenuEnabled && (
                              <button className={styles.dropdownItem} onClick={() => { setOpenMenuId(null); window.history.pushState(null, '', `?tab=menus&branchId=${branch.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }}>
                                <Settings size={16} /> Manage QR Menu
                              </button>
                            )}
                            <button className={styles.dropdownItem} onClick={() => handleOpenTables(branch)}>
                              <Settings size={16} /> Manage Tables
                            </button>
                            <div className={styles.dropdownDivider}></div>
                            <button 
                              className={`${styles.dropdownItem} ${styles.danger}`} 
                              onClick={() => { setOpenMenuId(null); handleDelete(branch.id); }}
                              disabled={actionLoadingId === branch.id + 'delete'}
                            >
                              <Trash2 size={16} /> {actionLoadingId === branch.id + 'delete' ? 'Deleting...' : 'Delete Branch'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {filteredBranches.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBranches.length)} of {filteredBranches.length} branches
          </div>
          <div className={styles.paginationControls}>
            <div className={styles.rowsPerPage}>
              Rows per page
              <select className={styles.rowsSelect} value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            {totalPages > 0 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '0.25rem 0.5rem' }}>
                  &lt;
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  if (i === 0 || i === totalPages - 1 || Math.abs(currentPage - 1 - i) <= 1) {
                    return (
                      <button key={i} className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePageBtn : ''}`} onClick={() => setCurrentPage(i + 1)} style={{ padding: '0.25rem 0.5rem', minWidth: '30px' }}>
                        {i + 1}
                      </button>
                    );
                  } else if (i === 1 || i === totalPages - 2) {
                    return <span key={i} style={{ color: '#64748b', padding: '0 0.25rem' }}>...</span>;
                  }
                  return null;
                })}
                <button className={styles.pageBtn} disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '0.25rem 0.5rem' }}>
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Viewer Modal for Branch */}
      {qrModalBranch && (
        <div className="modal-overlay" onClick={() => setQrModalBranch(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">🔲 {qrModalBranch.name} — Menu QR</span>
              <button className="modal-close" onClick={() => setQrModalBranch(null)}><XCircle size={20}/></button>
            </div>

            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Platform selector */}
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Generate QR For:</label>
                <select className="select" value={qrTargetPlatform} onChange={e => setQrTargetPlatform(e.target.value as 'web' | 'mobile')}>
                  <option value="web">Customer Web Portal (http://localhost:4208)</option>
                  <option value="mobile">Customer Mobile App (http://localhost:4210)</option>
                </select>
              </div>

              {/* Center overlay selector */}
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Center Overlay:</label>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  {(['logo','favicon','none'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setQrCenterOverlay(opt)}
                      style={{
                        flex:1, padding:'0.5rem 0.75rem', borderRadius:8,
                        border: qrCenterOverlay === opt ? '2px solid #2563EB' : '1px solid #e2e8f0',
                        background: qrCenterOverlay === opt ? '#eff6ff' : '#f8fafc',
                        color: qrCenterOverlay === opt ? '#2563EB' : '#374151',
                        fontWeight: qrCenterOverlay === opt ? 700 : 500,
                        fontSize:'0.8rem', cursor:'pointer', textTransform:'capitalize',
                      }}
                    >
                      {opt === 'logo' && '🏪 '}{opt === 'favicon' && '⭐ '}{opt === 'none' && '⊘ '}{opt}
                    </button>
                  ))}
                </div>
                {/* Preview row */}
                {qrCenterOverlay !== 'none' && (
                  <div style={{ marginTop:'0.4rem', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'#64748b' }}>
                    {qrCenterOverlay === 'logo' && qrModalBranch.brandLogoUrl && <img src={qrModalBranch.brandLogoUrl} alt="logo" style={{ width:24, height:24, borderRadius:4, objectFit:'cover', border:'1px solid #e2e8f0' }} />}
                    {qrCenterOverlay === 'favicon' && qrModalBranch.faviconUrl && <img src={qrModalBranch.faviconUrl} alt="fav" style={{ width:24, height:24, borderRadius:4, objectFit:'cover', border:'1px solid #e2e8f0' }} />}
                    <span>
                      {qrCenterOverlay === 'logo'
                        ? (qrModalBranch.brandLogoUrl ? 'Logo will appear in center' : '⚠ No logo URL set for this branch')
                        : (qrModalBranch.faviconUrl   ? 'Favicon will appear in center' : '⚠ No favicon URL set for this branch')}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code preview */}
              <div style={{ background:'#f8fafc', padding:'1.25rem', borderRadius:'var(--r-lg)', border:'1px solid var(--bdr)', display:'flex', justifyContent:'center', position:'relative' }}>
                {/* Rendered QR — overlay is drawn on download; for preview show image on top */}
                <div style={{ position:'relative', display:'inline-block' }}>
                  <QRCodeSVG
                    id={`qr-code-branch-${qrModalBranch.id}`}
                    value={getBranchQrUrl(qrModalBranch)}
                    size={220}
                    level="H"
                    includeMargin={true}
                    fgColor="#0f172a"
                  />
                  {/* Live preview overlay */}
                  {qrCenterOverlay !== 'none' && (
                    (() => {
                      const url = qrCenterOverlay === 'logo' ? qrModalBranch.brandLogoUrl : qrModalBranch.faviconUrl;
                      return url ? (
                        <div style={{
                          position:'absolute', top:'50%', left:'50%',
                          transform:'translate(-50%,-50%)',
                          width:44, height:44, borderRadius:8,
                          background:'#fff', padding:3,
                          boxShadow:'0 0 0 2px #fff, 0 2px 8px rgba(0,0,0,.12)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                          <img src={url} alt={qrCenterOverlay} style={{ width:38, height:38, objectFit:'contain', borderRadius:6 }} />
                        </div>
                      ) : null;
                    })()
                  )}
                </div>
              </div>

              {/* URL */}
              <div style={{ textAlign:'center' }}>
                <p style={{ margin:'0 0 0.25rem', fontSize:'0.75rem', color:'var(--text3)' }}>Branch Landing Page URL:</p>
                <a href={getBranchQrUrl(qrModalBranch)} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'var(--brand-blue)', wordBreak:'break-all' }}>
                  {getBranchQrUrl(qrModalBranch)}
                </a>
              </div>
            </div>

            {/* Download buttons */}
            <div className="modal-footer" style={{ flexDirection:'column', gap:'0.5rem' }}>
              <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text3)', textAlign:'center' }}>Download format:</p>
              <div style={{ display:'flex', gap:'0.5rem', width:'100%' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex:1 }}
                  onClick={() => downloadBranchQR(qrModalBranch, 'svg')}
                  title="Download as SVG vector file"
                >
                  <Download size={14}/> SVG
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex:1 }}
                  onClick={() => downloadBranchQR(qrModalBranch, 'png')}
                  title="Download as PNG image"
                >
                  <Download size={14}/> PNG
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex:1 }}
                  onClick={() => downloadBranchQR(qrModalBranch, 'pdf')}
                  title="Open printable page to save as PDF"
                >
                  <Download size={14}/> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Tables Modal ── */}
      {tablesModalBranch && (
        <div className={styles.modalOverlay} onClick={() => setTablesModalBranch(null)}>
          <div className={styles.modal} style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Settings size={22} color="#2563EB" /> Manage Tables — {tablesModalBranch.name}
              </h3>
              <button className={styles.closeBtn} onClick={() => setTablesModalBranch(null)}><XCircle size={24} /></button>
            </div>
            <div className={styles.modalBody} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Add Table Form */}
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--bdr)' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Add New Table</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Table Number <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                    <input className={styles.input} value={newTableForm.tableNumber} onChange={e => setNewTableForm({...newTableForm, tableNumber: e.target.value})} placeholder="e.g. T-01" />
                    <span className={styles.formHint}>Unique identifier shown on QR and receipts.</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Seating Capacity</label>
                    <input type="number" min={1} max={20} className={styles.input} value={newTableForm.capacity} onChange={e => setNewTableForm({...newTableForm, capacity: Number(e.target.value)})} />
                    <span className={styles.formHint}>Max guests at this table.</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Section / Floor</label>
                    <input className={styles.input} value={newTableForm.section} onChange={e => setNewTableForm({...newTableForm, section: e.target.value})} placeholder="e.g. Ground Floor" />
                    <span className={styles.formHint}>Optional section label.</span>
                  </div>
                  <button className="btn btn-primary" style={{ height: '38px', whiteSpace: 'nowrap' }} onClick={handleAddTable}>
                    <PlusCircle size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Tables List */}
              {tablesLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)' }}>Loading tables…</div>
              ) : branchTables.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)', border: '2px dashed var(--bdr)', borderRadius: 'var(--r-md)' }}>
                  No tables configured yet. Add your first table above.
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Table #</th>
                      <th>Capacity</th>
                      <th>Section</th>
                      <th>Status</th>
                      <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchTables.map((t: any) => (
                      <tr key={t.id}>
                        <td><strong>{t.tableNumber}</strong></td>
                        <td>{t.capacity} guests</td>
                        <td>{t.section || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                        <td><span className={`badge ${t.isOccupied ? 'badge-inactive' : 'badge-active'}`}>{t.isOccupied ? 'Occupied' : 'Available'}</span></td>
                        <td>
                          <button onClick={() => handleDeleteTable(t.id)} style={{ background: 'none', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', padding: '4px' }} title="Remove table">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-secondary" onClick={() => setTablesModalBranch(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Modal for Form */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          {/* ... existing modal logic stays mostly same, but I'm placing the new modal below this one */}
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editId ? <Edit2 size={24} color="#2563EB" /> : <PlusCircle size={24} color="#2563EB" />}
                {editId ? 'Edit Branch details' : 'Add a new branch'}
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div className={styles.modalContentLayout}>
              <div className={styles.sidebar}>
                <button className={`${styles.tabBtn} ${activeTab === 'basic' ? styles.active : ''}`} type="button" onClick={() => setActiveTab('basic')}>
                  <Info size={18} /> Basic Details
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'location' ? styles.active : ''}`} type="button" onClick={() => setActiveTab('location')}>
                  <MapPin size={18} /> Location & Map
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'features' ? styles.active : ''}`} type="button" onClick={() => setActiveTab('features')}>
                  <Settings size={18} /> Features & QR Menu
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'compliance' ? styles.active : ''}`} type="button" onClick={() => setActiveTab('compliance')}>
                  <CheckCircle size={18} /> Compliance
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'branding' ? styles.active : ''}`} type="button" onClick={() => setActiveTab('branding')}>
                  <Image size={18} /> Branding
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'seo' ? styles.active : ''}`} type="button" onClick={() => setActiveTab('seo')}>
                  <Search size={18} /> SEO
                </button>
                <button className={`${styles.tabBtn} ${activeTab === 'smo' ? styles.active : ''}`} type="button" onClick={() => setActiveTab('smo')}>
                  <Share2 size={18} /> SMO
                </button>
              </div>

              <div className={styles.mainContent}>
                <form id="branchForm" onSubmit={handleSubmit} className={styles.modalBody}>
                  {activeTab === 'basic' && (
                    <>
                      <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Basic Details</h4>
                        <p className={styles.sectionSubtitle}>Enter basic information about the branch.</p>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Parent Restaurant <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(Optional)</span></label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              className={styles.input}
                              style={{ flex: 1 }}
                              value={form.restaurantId}
                              onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
                              disabled={!!editId && !isSuperAdmin}
                            >
                              <option value="">Leave empty to auto-create Parent</option>
                              {restaurants.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                            {isSuperAdmin && form.restaurantId && (
                              <button
                                type="button"
                                onClick={() => { /* TODO: delete parent restaurant */ }}
                                style={{ background: '#fee2e2', border: '1px solid #DC2626', color: '#DC2626', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Delete selected Parent Restaurant"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                          <span className={styles.formHint}>Groups this branch under a parent restaurant. Leave empty to auto-create a new parent restaurant with the same name.</span>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Branch Name <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                          <input
                            type="text"
                            className={styles.input}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. MG Road - Bengaluru"
                            required
                          />
                          <span className={styles.formHint}>The display name shown to customers on QR codes, receipts, and the app. Use the area/locality for easy identification.</span>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Primary Email Address</label>
                          <input
                            type="email"
                            className={styles.input}
                            value={form.email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="branch@restaurant.com"
                          />
                          <span className={styles.formHint}>Main email for customer queries and order notifications for this branch.</span>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Secondary Email</label>
                          <input
                            type="email"
                            className={styles.input}
                            value={form.secondaryEmail || ''}
                            onChange={(e) => setForm({ ...form, secondaryEmail: e.target.value })}
                            placeholder="manager@restaurant.com"
                          />
                          <span className={styles.formHint}>Manager or backup email — receives copies of critical alerts and reports.</span>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Primary Phone Number <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                          <input
                            type="tel"
                            className={styles.input}
                            value={form.phone || ''}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            pattern="[0-9\+\-\s\(\)]+"
                            title="Valid phone number characters only"
                          />
                          <span className={styles.formHint}>Shown to customers for delivery support calls. Include country code, e.g. +91.</span>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>Secondary Phone Number</label>
                          <input
                            type="tel"
                            className={styles.input}
                            value={form.secondaryPhone || ''}
                            onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value })}
                            placeholder="+91 98765 43211"
                            pattern="[0-9\+\-\s\(\)]+"
                            title="Valid phone number characters only"
                          />
                          <span className={styles.formHint}>Alternate contact for the branch manager. Not shown publicly.</span>
                        </div>

                        <div className={styles.formGroupFull} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h5 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} /> Daily Operating Hours
                          </h5>
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            {[
                              { day: 'Monday', key: 'mondayHours' },
                              { day: 'Tuesday', key: 'tuesdayHours' },
                              { day: 'Wednesday', key: 'wednesdayHours' },
                              { day: 'Thursday', key: 'thursdayHours' },
                              { day: 'Friday', key: 'fridayHours' },
                              { day: 'Saturday', key: 'saturdayHours' },
                              { day: 'Sunday', key: 'sundayHours' }
                            ].map(({ day, key }) => (
                              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '100px', fontWeight: 600, color: '#334155' }}>{day}</div>
                                <div className={styles.inputGroup} style={{ flex: 1 }}>
                                  <input
                                    type="time"
                                    className={styles.input}
                                    value={(form[key as keyof typeof form] ?? '09:00 - 22:00').toString().split(' - ')[0] || '09:00'}
                                    onChange={(e) => {
                                      const closeTime = (form[key as keyof typeof form] ?? '09:00 - 22:00').toString().split(' - ')[1] || '22:00';
                                      setForm({ ...form, [key]: `${e.target.value} - ${closeTime}` });
                                    }}
                                  />
                                  <span className={styles.timeSeparator}>to</span>
                                  <input
                                    type="time"
                                    className={styles.input}
                                    value={(form[key as keyof typeof form] ?? '09:00 - 22:00').toString().split(' - ')[1] || '22:00'}
                                    onChange={(e) => {
                                      const openTime = (form[key as keyof typeof form] ?? '09:00 - 22:00').toString().split(' - ')[0] || '09:00';
                                      setForm({ ...form, [key]: `${openTime} - ${e.target.value}` });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'location' && (
                    <>
                      <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Location & Map</h4>
                        <p className={styles.sectionSubtitle}>Add the branch location details.</p>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroupFull}>
                          <label className={styles.label}>Street Address <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                          <input
                            type="text"
                            className={styles.input}
                            value={form.address || ''}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="e.g. 42, Brigade Road, MG Road"
                            required
                          />
                          <span className={styles.formHint}>Full street address. Used for delivery routing, Google Maps, and printed on receipts.</span>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.label}>City <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                          <input
                            type="text"
                            className={styles.input}
                            value={form.city || ''}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            placeholder="e.g. Bengaluru"
                            required
                          />
                          <span className={styles.formHint}>City name used for search, filtering, and delivery zone configuration.</span>
                        </div>

                        <div className={styles.formGroup}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className={styles.label} style={{ marginBottom: 0 }}>Coordinates (Lat, Lng)</label>
                            <button 
                              type="button"
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition((position) => {
                                    setForm({...form, lat: position.coords.latitude, lng: position.coords.longitude});
                                  }, () => {
                                    showToast("Unable to retrieve your location. Please check browser permissions.");
                                  });
                                } else {
                                  showToast("Geolocation is not supported by your browser.");
                                }
                              }}
                              style={{ fontSize: '0.8rem', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <MapPin size={14} /> Locate Me
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <input type="number" step="any" className={styles.input} value={form.lat ?? ''} onChange={(e) => setForm({...form, lat: e.target.value ? parseFloat(e.target.value) : (null as any)})} placeholder="Latitude (e.g. 12.9716)" />
                            <input type="number" step="any" className={styles.input} value={form.lng ?? ''} onChange={(e) => setForm({...form, lng: e.target.value ? parseFloat(e.target.value) : (null as any)})} placeholder="Longitude (e.g. 77.5946)" />
                          </div>
                          <span className={styles.formHint}>GPS coordinates for map pin, nearby restaurant search, and delivery routing. Click 'Locate Me' to auto-fill.</span>
                        </div>

                        <div className={styles.formGroupFull}>
                          <label className={styles.label}>Pick Location on Map</label>
                          <div className={styles.mapContainer} onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const newLng = 85.144 + (x - rect.width/2) * 0.0001;
                            const newLat = 25.611 - (y - rect.height/2) * 0.0001;
                            setForm({...form, lat: parseFloat(newLat.toFixed(6)), lng: parseFloat(newLng.toFixed(6))});
                          }}>
                            <div className={styles.mapOverlayText}>Click anywhere to drop the pin</div>
                            <MapPin size={40} className={styles.mapPin} />
                          </div>
                          <small style={{ color: '#64748b', marginTop: '0.5rem', display: 'block' }}>Map visualization placeholder - Coordinates will be updated automatically on click.</small>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'features' && (
                    <>
                      <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Features & QR Menu</h4>
                        <p className={styles.sectionSubtitle}>Manage branch status and enable features.</p>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status & Features</h4>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <label className={styles.label}>Collection Tags (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Top 10, Food on Train, Plan a Party"
                            className={styles.input}
                            value={form.collectionTags}
                            onChange={(e) => setForm({ ...form, collectionTags: e.target.value })}
                          />
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                            Tags determine which Explore Sections this branch appears in on the homepage.
                          </p>
                        </div>
                        
                        <label className={styles.switchGroup}>
                          <div className={styles.switchIconWrapper}>
                            <Store size={24} />
                          </div>
                          <div className={styles.switchLabelContainer}>
                            <span className={styles.switchLabel}>Branch is Active (Open)</span>
                            <span className={styles.switchSubtext}>Allow customers to see and interact with this branch</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            className={styles.customCheckbox}
                          />
                        </label>

                        <label className={styles.switchGroup}>
                          <div className={styles.switchIconWrapper}>
                            <Clock size={24} />
                          </div>
                          <div className={styles.switchLabelContainer}>
                            <span className={styles.switchLabel}>Accept Table Reservations</span>
                            <span className={styles.switchSubtext}>Allow customers to book tables online</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.isReservationEnabled}
                            onChange={(e) => setForm({ ...form, isReservationEnabled: e.target.checked })}
                            className={styles.customCheckbox}
                          />
                        </label>

                        <label className={styles.switchGroup}>
                          <div className={styles.switchIconWrapper}>
                            <Store size={24} />
                          </div>
                          <div className={styles.switchLabelContainer}>
                            <span className={styles.switchLabel}>Delivery Enabled</span>
                            <span className={styles.switchSubtext}>Turn on delivery for this branch</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.isDeliveryEnabled}
                            onChange={(e) => setForm({ ...form, isDeliveryEnabled: e.target.checked })}
                            className={styles.customCheckbox}
                          />
                        </label>

                        <label className={styles.switchGroup}>
                          <div className={styles.switchIconWrapper}>
                            <Store size={24} />
                          </div>
                          <div className={styles.switchLabelContainer}>
                            <span className={styles.switchLabel}>Takeaway Enabled</span>
                            <span className={styles.switchSubtext}>Turn on takeaway for this branch</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.isTakeawayEnabled}
                            onChange={(e) => setForm({ ...form, isTakeawayEnabled: e.target.checked })}
                            className={styles.customCheckbox}
                          />
                        </label>

                        <label className={styles.switchGroup}>
                          <div className={styles.switchIconWrapper}>
                            <QrCode size={24} />
                          </div>
                          <div className={styles.switchLabelContainer}>
                            <span className={styles.switchLabel}>Enable QR Digital Menu</span>
                            <span className={styles.switchSubtext}>Allow customers to scan QR for dining in</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.isQrMenuEnabled}
                            onChange={(e) => setForm({ ...form, isQrMenuEnabled: e.target.checked })}
                            className={styles.customCheckbox}
                          />
                        </label>

                        {form.isQrMenuEnabled && (
                          <div style={{ marginTop: '2rem' }}>
                            <label className={styles.label}>QR Code Menu Attachment</label>
                            <input
                              type="url"
                              className={styles.input}
                              value={form.qrCodeUrl}
                              onChange={(e) => setForm({ ...form, qrCodeUrl: e.target.value })}
                              placeholder="https://... (Enter URL or Upload File below)"
                            />
                            
                            <div className={styles.divider}>
                              <div className={styles.dividerLine}></div>
                              <span className={styles.dividerText}>OR UPLOAD FILE</span>
                              <div className={styles.dividerLine}></div>
                            </div>

                            <label className={styles.fileUploadArea}>
                              <input type="file" accept="image/*,.pdf" className={styles.fileUploadInput} onChange={handleFileUpload} />
                              <UploadCloud size={32} color="#2563EB" style={{ margin: '0 auto 0.5rem' }} />
                              <div style={{ fontWeight: 600, color: '#334155' }}>Click to upload QR Code or Menu PDF</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>PNG, JPG, PDF up to 5MB</div>
                            </label>
                            
                            {((...args: any[]) => null as any)(form.qrCodeUrl, 'QR Code / Menu')}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === 'branding' && (
                    <>
                      <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Branding</h4>
                        <p className={styles.sectionSubtitle}>Upload branding documents.</p>
                      </div>
                      <div className={styles.complianceGrid}>
                        {/* Left Column: Branding */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: '1 / -1' }}>
                          <div className={styles.formGroupFull} style={{ margin: 0 }}>
                            <label className={styles.label}>Brand Logo</label>
                            <input
                              type="url"
                              className={styles.input}
                              value={form.brandLogoUrl}
                              onChange={(e) => setForm({ ...form, brandLogoUrl: e.target.value })}
                              placeholder="https://... (Enter URL or Upload File below)"
                            />
                            
                            <div className={styles.divider}>
                              <div className={styles.dividerLine}></div>
                              <span className={styles.dividerText}>OR UPLOAD LOGO</span>
                              <div className={styles.dividerLine}></div>
                            </div>

                            <label className={styles.fileUploadArea}>
                              <input type="file" accept="image/*" className={styles.fileUploadInput} onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (!file.type.match('image.*')) return showToast('Images only');
                                  const reader = new FileReader();
                                  reader.onloadend = () => setForm({ ...form, brandLogoUrl: reader.result as string });
                                  reader.readAsDataURL(file);
                                }
                              }} />
                              <UploadCloud size={32} color="#2563EB" style={{ margin: '0 auto 0.5rem' }} />
                              <div style={{ fontWeight: 600, color: '#334155' }}>Click to upload Brand Logo</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>PNG, JPG up to 5MB</div>
                            </label>
                            
                            {((...args: any[]) => null as any)(form.brandLogoUrl, 'Brand Logo Preview')}
                          </div>

                          <div className={styles.formGroupFull} style={{ margin: 0 }}>
                            <label className={styles.label}>Favicon Attachment</label>
                            <input
                              type="url"
                              className={styles.input}
                              value={form.faviconUrl}
                              onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                              placeholder="https://... (Enter URL or Upload File below)"
                            />
                            
                            <label className={styles.fileUploadArea} style={{ padding: '1rem', marginTop: '1rem' }}>
                              <input type="file" accept="image/*" className={styles.fileUploadInput} onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (!file.type.match('image.*')) return showToast('Images only');
                                  const reader = new FileReader();
                                  reader.onloadend = () => setForm({ ...form, faviconUrl: reader.result as string });
                                  reader.readAsDataURL(file);
                                }
                              }} />
                              <UploadCloud size={24} color="#2563EB" style={{ margin: '0 auto 0.5rem' }} />
                              <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Click to upload Favicon (.ico, .png)</div>
                            </label>
                            
                            {((...args: any[]) => null as any)(form.faviconUrl, 'Favicon')}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'compliance' && (
                    <>
                      <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Compliance</h4>
                        <p className={styles.sectionSubtitle}>Upload compliance documents.</p>
                      </div>
                      <div className={styles.complianceGrid}>
                        {/* Right Column: Compliance */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: '1 / -1' }}>
                          <div className={styles.complianceRow}>
                            <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                              <label className={styles.label}>FSSAI Number</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={form.fssaiNumber}
                                onChange={(e) => setForm({ ...form, fssaiNumber: e.target.value })}
                                placeholder="Enter 14-digit FSSAI Number"
                              />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                              <label className={styles.label}>FSSAI Document Upload</label>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                  type="url"
                                  className={styles.input}
                                  value={form.fssaiDocUrl}
                                  onChange={(e) => setForm({ ...form, fssaiDocUrl: e.target.value })}
                                  placeholder="Doc URL or upload ->"
                                  style={{ flex: 1, minWidth: 0 }}
                                />
                                <label style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.65rem 1rem', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                  <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (!file.type.match('image.*') && file.type !== 'application/pdf') return showToast('Only images and PDFs allowed');
                                      const reader = new FileReader();
                                      reader.onloadend = () => setForm({ ...form, fssaiDocUrl: reader.result as string });
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                                  Change
                                </label>
                              </div>
                            </div>
                          </div>
                          {form.fssaiDocUrl && (
                            <div style={{ marginTop: '-1rem' }}>
                              {((...args: any[]) => null as any)(form.fssaiDocUrl, 'FSSAI Document Preview')}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                              <label className={styles.label}>GST Number</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={form.gstNumber}
                                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                                placeholder="e.g. 22AAAAA0000A1Z5"
                              />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                              <label className={styles.label}>GST Document Upload</label>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input type="url" className={styles.input} value={form.gstDocUrl} onChange={(e) => setForm({ ...form, gstDocUrl: e.target.value })} placeholder="Doc URL or upload ->" style={{ flex: 1, minWidth: 0 }} />
                                <label style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.65rem 1rem', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                  <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (!file.type.match('image.*') && file.type !== 'application/pdf') return showToast('Only images and PDFs allowed');
                                      const reader = new FileReader();
                                      reader.onloadend = () => setForm({ ...form, gstDocUrl: reader.result as string });
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                                  Upload
                                </label>
                              </div>
                            </div>
                          </div>
                          {form.gstDocUrl && (
                            <div style={{ marginTop: '-1rem' }}>
                              {((...args: any[]) => null as any)(form.gstDocUrl, 'GST Document Preview')}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                              <label className={styles.label}>PAN Number</label>
                              <input
                                type="text"
                                className={styles.input}
                                value={form.panNumber}
                                onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                                placeholder="e.g. ABCDE1234F"
                              />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1, margin: 0 }}>
                              <label className={styles.label}>PAN Document Upload</label>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input type="url" className={styles.input} value={form.panDocUrl} onChange={(e) => setForm({ ...form, panDocUrl: e.target.value })} placeholder="Doc URL or upload ->" style={{ flex: 1, minWidth: 0 }} />
                                <label style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.65rem 1rem', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                  <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (!file.type.match('image.*') && file.type !== 'application/pdf') return showToast('Only images and PDFs allowed');
                                      const reader = new FileReader();
                                      reader.onloadend = () => setForm({ ...form, panDocUrl: reader.result as string });
                                      reader.readAsDataURL(file);
                                    }
                                  }} />
                                  Change
                                </label>
                              </div>
                            </div>
                          </div>
                          {form.panDocUrl && (
                            <div style={{ marginTop: '-1rem' }}>
                              {((...args: any[]) => null as any)(form.panDocUrl, 'PAN Document Preview')}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'seo' && (
                    <>
                      <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>SEO Settings</h4>
                        <p className={styles.sectionSubtitle}>Manage branch-specific search engine tags.</p>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>SEO Title</label>
                          <input type="text" className={styles.input} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="e.g. Best Tiffins in City" />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Meta Description</label>
                          <textarea rows={3} className={styles.input} style={{ resize: 'vertical' }} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="Short description for search engines"></textarea>
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Meta Keywords</label>
                          <input type="text" className={styles.input} value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} placeholder="e.g. food, delivery, tiffin" />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'smo' && (
                    <>
                      <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>SMO Settings</h4>
                        <p className={styles.sectionSubtitle}>Manage branch-specific social media tags.</p>
                      </div>
                      <div className={styles.formGrid}>
                        <div className={styles.sectionHeader} style={{ gridColumn: '1 / -1', marginTop: '1.5rem', marginBottom: '1rem' }}>
                          <h4 className={styles.sectionTitle}>Social Media Optimization (SMO)</h4>
                        </div>
                        
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Open Graph (OG) Title</label>
                          <input type="text" className={styles.input} value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} placeholder="Facebook/LinkedIn Title" />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Open Graph (OG) Description</label>
                          <textarea rows={2} className={styles.input} style={{ resize: 'vertical' }} value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} placeholder="Facebook/LinkedIn Description"></textarea>
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Open Graph (OG) Image URL</label>
                          <input type="url" className={styles.input} value={form.ogImageUrl} onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })} placeholder="https://..." />
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Twitter Title</label>
                          <input type="text" className={styles.input} value={form.twitterTitle} onChange={(e) => setForm({ ...form, twitterTitle: e.target.value })} placeholder="Twitter Card Title" />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Twitter Description</label>
                          <textarea rows={2} className={styles.input} style={{ resize: 'vertical' }} value={form.twitterDescription} onChange={(e) => setForm({ ...form, twitterDescription: e.target.value })} placeholder="Twitter Card Description"></textarea>
                        </div>

                        <div className={styles.sectionHeader} style={{ gridColumn: '1 / -1', marginTop: '1.5rem', marginBottom: '1rem' }}>
                          <h4 className={styles.sectionTitle}>Social Media Links</h4>
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Facebook Profile/Page URL</label>
                          <input type="url" className={styles.input} value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Twitter (X) Profile URL</label>
                          <input type="url" className={styles.input} value={form.twitterUrl} onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })} placeholder="https://twitter.com/..." />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>Instagram Profile URL</label>
                          <input type="url" className={styles.input} value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} placeholder="https://instagram.com/..." />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                          <label className={styles.label}>YouTube Channel URL</label>
                          <input type="url" className={styles.input} value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtube.com/..." />
                        </div>
                      </div>
                    </>
                  )}
                </form>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" form="branchForm" className={styles.saveBtn} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles.spinner}></span> Saving...
                      </span>
                    ) : (
                      editId ? 'Save Changes' : 'Create Branch'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmParentId && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirmParentId(null)} style={{ zIndex: 10000 }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '1.5rem', textAlign: 'center' }}>
            <Trash2 size={48} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: 600 }}>Delete Parent Restaurant</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you absolutely sure you want to delete this parent restaurant? This action cannot be undone and will be permanently removed from the system.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteConfirmParentId(null)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { /* TODO: confirm delete action */ }}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'success' ? '#22c55e' : '#DC2626', color: 'white', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', zIndex: 100000, display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slideIn 0.3s ease-out' }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
          <span style={{ fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
