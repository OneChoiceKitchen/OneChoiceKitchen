import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Package, Plus, Search, Download, RefreshCw, AlertTriangle, Edit2, Trash2, ChevronUp, ChevronDown, X, Minus, History, BarChart2, Truck, ArrowUpDown, MoreVertical, ShoppingCart, Check, Send } from 'lucide-react';

type StockStatus = 'ok' | 'low' | 'critical' | 'out';
interface HistoryEntry { date: string; action: 'add' | 'remove' | 'adjust'; qty: number; note: string; user: string; }
interface InventoryItem { id: string; sku: string; name: string; category: string; branch: string; quantity: number; unit: string; minThreshold: number; criticalThreshold: number; pricePerUnit: number; totalValue: number; supplier: string; supplierContact: string; lastRestocked: string; location: string; status: StockStatus; notes?: string; history: HistoryEntry[]; }

const BRANCHES = ['All Branches', 'MG Road - Bengaluru', 'Koramangala - Bengaluru', 'Indiranagar - Bengaluru'];
const CATS = ['All Categories', 'Grains & Flour', 'Oils & Fats', 'Dairy', 'Vegetables', 'Spices', 'Packaging', 'Beverages', 'Proteins', 'Condiments'];

const mkH = (n: number): HistoryEntry[] => Array.from({ length: n }, (_, i) => ({
  date: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0],
  action: (['add', 'remove', 'adjust'] as const)[i % 3],
  qty: [10, 5, 25, 50, 2, 15][i % 6],
  note: ['Restocked from supplier', 'Used in production', 'Manual adjustment', 'Weekly reorder'][i % 4],
  user: ['Admin', 'Manager Priya', 'Manager Ravi'][i % 3],
}));

const MOCK: InventoryItem[] = [
  { id:'i01', sku:'GRN-001', name:'Basmati Rice (Premium)', category:'Grains & Flour', branch:'MG Road - Bengaluru', quantity:85, unit:'kg', minThreshold:50, criticalThreshold:20, pricePerUnit:120, totalValue:10200, supplier:'India Gate Foods', supplierContact:'+91 98765 43210', lastRestocked:'2026-07-08', location:'Store A - Shelf 3', status:'ok', history:mkH(6) },
  { id:'i02', sku:'GRN-002', name:'Whole Wheat Flour', category:'Grains & Flour', branch:'Koramangala - Bengaluru', quantity:12, unit:'kg', minThreshold:25, criticalThreshold:10, pricePerUnit:45, totalValue:540, supplier:'Aashirvaad', supplierContact:'+91 98234 56789', lastRestocked:'2026-07-01', location:'Store B - Shelf 1', status:'low', history:mkH(5) },
  { id:'i03', sku:'OIL-001', name:'Refined Sunflower Oil', category:'Oils & Fats', branch:'MG Road - Bengaluru', quantity:22, unit:'ltr', minThreshold:15, criticalThreshold:5, pricePerUnit:180, totalValue:3960, supplier:'Fortune Foods', supplierContact:'+91 88111 22334', lastRestocked:'2026-07-05', location:'Store A - Shelf 6', status:'ok', history:mkH(4) },
  { id:'i04', sku:'OIL-002', name:'Cold Press Coconut Oil', category:'Oils & Fats', branch:'Indiranagar - Bengaluru', quantity:4, unit:'ltr', minThreshold:10, criticalThreshold:3, pricePerUnit:350, totalValue:1400, supplier:'KLF Nirmal', supplierContact:'+91 90011 23456', lastRestocked:'2026-06-28', location:'Store C - Shelf 2', status:'critical', history:mkH(7) },
  { id:'i05', sku:'DAI-001', name:'Full Cream Milk', category:'Dairy', branch:'MG Road - Bengaluru', quantity:0, unit:'ltr', minThreshold:20, criticalThreshold:5, pricePerUnit:68, totalValue:0, supplier:'Nandini Dairy', supplierContact:'+91 80000 11111', lastRestocked:'2026-07-09', location:'Cold Storage 1', status:'out', history:mkH(8) },
  { id:'i06', sku:'DAI-002', name:'Paneer (Fresh)', category:'Dairy', branch:'Koramangala - Bengaluru', quantity:8, unit:'kg', minThreshold:5, criticalThreshold:2, pricePerUnit:380, totalValue:3040, supplier:'Heritage Foods', supplierContact:'+91 92345 67890', lastRestocked:'2026-07-09', location:'Cold Storage 2', status:'ok', history:mkH(3) },
  { id:'i07', sku:'VEG-001', name:'Tomatoes', category:'Vegetables', branch:'MG Road - Bengaluru', quantity:18, unit:'kg', minThreshold:15, criticalThreshold:5, pricePerUnit:40, totalValue:720, supplier:'Local Farm Co-op', supplierContact:'+91 97111 22333', lastRestocked:'2026-07-09', location:'Fresh Produce Bay', status:'ok', history:mkH(4) },
  { id:'i08', sku:'VEG-002', name:'Onions', category:'Vegetables', branch:'Indiranagar - Bengaluru', quantity:30, unit:'kg', minThreshold:20, criticalThreshold:8, pricePerUnit:35, totalValue:1050, supplier:'Local Farm Co-op', supplierContact:'+91 97111 22333', lastRestocked:'2026-07-07', location:'Fresh Produce Bay', status:'ok', history:mkH(5) },
  { id:'i09', sku:'SPC-001', name:'Cumin Seeds (Jeera)', category:'Spices', branch:'MG Road - Bengaluru', quantity:2, unit:'kg', minThreshold:3, criticalThreshold:1, pricePerUnit:600, totalValue:1200, supplier:'Everest Masala', supplierContact:'+91 99887 65432', lastRestocked:'2026-06-20', location:'Spice Rack S1', status:'critical', history:mkH(6) },
  { id:'i10', sku:'SPC-002', name:'Turmeric Powder', category:'Spices', branch:'Koramangala - Bengaluru', quantity:5, unit:'kg', minThreshold:3, criticalThreshold:1, pricePerUnit:280, totalValue:1400, supplier:'MDH Spices', supplierContact:'+91 98765 10101', lastRestocked:'2026-07-03', location:'Spice Rack S2', status:'ok', history:mkH(4) },
  { id:'i11', sku:'PKG-001', name:'Food Containers 500ml', category:'Packaging', branch:'MG Road - Bengaluru', quantity:500, unit:'pcs', minThreshold:200, criticalThreshold:50, pricePerUnit:8, totalValue:4000, supplier:'Pack Pro India', supplierContact:'+91 80123 45678', lastRestocked:'2026-07-06', location:'Packaging Store', status:'ok', history:mkH(3) },
  { id:'i12', sku:'PKG-002', name:'Delivery Bags (Insulated)', category:'Packaging', branch:'Koramangala - Bengaluru', quantity:45, unit:'pcs', minThreshold:100, criticalThreshold:20, pricePerUnit:75, totalValue:3375, supplier:'Zipbag Solutions', supplierContact:'+91 91234 56789', lastRestocked:'2026-07-01', location:'Packaging Store', status:'low', history:mkH(5) },
  { id:'i13', sku:'BEV-001', name:'Mineral Water 500ml', category:'Beverages', branch:'Indiranagar - Bengaluru', quantity:240, unit:'btl', minThreshold:100, criticalThreshold:30, pricePerUnit:15, totalValue:3600, supplier:'Bisleri', supplierContact:'+91 87654 32109', lastRestocked:'2026-07-08', location:'Beverage Store', status:'ok', history:mkH(4) },
  { id:'i14', sku:'PRO-001', name:'Chicken Breast (Frozen)', category:'Proteins', branch:'MG Road - Bengaluru', quantity:0, unit:'kg', minThreshold:10, criticalThreshold:3, pricePerUnit:280, totalValue:0, supplier:'Suguna Foods', supplierContact:'+91 96321 54780', lastRestocked:'2026-07-08', location:'Cold Storage 3', status:'out', history:mkH(6) },
  { id:'i15', sku:'PRO-002', name:'Eggs (Farm Fresh)', category:'Proteins', branch:'Koramangala - Bengaluru', quantity:120, unit:'pcs', minThreshold:100, criticalThreshold:30, pricePerUnit:9, totalValue:1080, supplier:'Country Eggs', supplierContact:'+91 88765 43210', lastRestocked:'2026-07-09', location:'Egg Storage', status:'ok', history:mkH(4) },
  { id:'i16', sku:'CON-001', name:'Tomato Ketchup (Bulk)', category:'Condiments', branch:'Indiranagar - Bengaluru', quantity:18, unit:'ltr', minThreshold:10, criticalThreshold:4, pricePerUnit:120, totalValue:2160, supplier:'Heinz India', supplierContact:'+91 88990 01122', lastRestocked:'2026-07-04', location:'Condiment C1', status:'ok', history:mkH(3) },
  { id:'i17', sku:'GRN-003', name:'Chickpea (Chana)', category:'Grains & Flour', branch:'Indiranagar - Bengaluru', quantity:40, unit:'kg', minThreshold:20, criticalThreshold:8, pricePerUnit:90, totalValue:3600, supplier:'Patanjali', supplierContact:'+91 99400 10000', lastRestocked:'2026-07-02', location:'Store C - Shelf 4', status:'ok', history:mkH(5) },
  { id:'i18', sku:'DAI-003', name:'Curd (Dahi)', category:'Dairy', branch:'MG Road - Bengaluru', quantity:6, unit:'kg', minThreshold:8, criticalThreshold:3, pricePerUnit:60, totalValue:360, supplier:'Nandini Dairy', supplierContact:'+91 80000 11111', lastRestocked:'2026-07-09', location:'Cold Storage 1', status:'low', history:mkH(4) },
  { id:'i19', sku:'SPC-003', name:'Garam Masala', category:'Spices', branch:'Indiranagar - Bengaluru', quantity:3, unit:'kg', minThreshold:2, criticalThreshold:0.5, pricePerUnit:500, totalValue:1500, supplier:'Everest Masala', supplierContact:'+91 99887 65432', lastRestocked:'2026-07-01', location:'Spice Rack S3', status:'ok', history:mkH(4) },
  { id:'i20', sku:'BEV-002', name:'Cola Syrup (Bulk)', category:'Beverages', branch:'Indiranagar - Bengaluru', quantity:2, unit:'ltr', minThreshold:5, criticalThreshold:1, pricePerUnit:800, totalValue:1600, supplier:'Coca-Cola India', supplierContact:'+91 80007 77777', lastRestocked:'2026-06-25', location:'Beverage Store', status:'critical', history:mkH(6) },
  { id:'i21', sku:'OIL-003', name:'Ghee (A2 Cow)', category:'Oils & Fats', branch:'Koramangala - Bengaluru', quantity:10, unit:'kg', minThreshold:5, criticalThreshold:2, pricePerUnit:900, totalValue:9000, supplier:'Patanjali', supplierContact:'+91 99400 10000', lastRestocked:'2026-07-07', location:'Store B - Shelf 3', status:'ok', history:mkH(5) },
  { id:'i22', sku:'VEG-003', name:'Capsicum (Bell Pepper)', category:'Vegetables', branch:'MG Road - Bengaluru', quantity:8, unit:'kg', minThreshold:5, criticalThreshold:2, pricePerUnit:80, totalValue:640, supplier:'Local Farm Co-op', supplierContact:'+91 97111 22333', lastRestocked:'2026-07-09', location:'Fresh Produce Bay', status:'ok', history:mkH(3) },
  { id:'i23', sku:'PKG-003', name:'Paper Napkins (Pack)', category:'Packaging', branch:'MG Road - Bengaluru', quantity:200, unit:'pcs', minThreshold:100, criticalThreshold:30, pricePerUnit:5, totalValue:1000, supplier:'Clean Pack', supplierContact:'+91 78901 23456', lastRestocked:'2026-07-05', location:'Packaging Store', status:'ok', history:mkH(3) },
  { id:'i24', sku:'CON-002', name:'Mint Chutney (Bulk)', category:'Condiments', branch:'MG Road - Bengaluru', quantity:0, unit:'kg', minThreshold:3, criticalThreshold:1, pricePerUnit:250, totalValue:0, supplier:'Local Prep Kitchen', supplierContact:'+91 90000 00001', lastRestocked:'2026-07-07', location:'Condiment C2', status:'out', history:mkH(5) },
  { id:'i25', sku:'PRO-003', name:'Paneer (Amul)', category:'Proteins', branch:'Koramangala - Bengaluru', quantity:15, unit:'kg', minThreshold:8, criticalThreshold:3, pricePerUnit:350, totalValue:5250, supplier:'Amul', supplierContact:'+91 80001 23456', lastRestocked:'2026-07-09', location:'Cold Storage 2', status:'ok', history:mkH(4) },
];

const SM: Record<StockStatus,{label:string;cls:string;dot:string}> = {
  ok:      {label:'In Stock',    cls:'badge-active',   dot:'dot-green' },
  low:     {label:'Low Stock',   cls:'badge-yellow',   dot:'dot-yellow'},
  critical:{label:'Critical',    cls:'badge-orange',   dot:'dot-red'   },
  out:     {label:'Out of Stock',cls:'badge-cancelled',dot:'dot-gray'  },
};
const calcS=(q:number,min:number,c:number):StockStatus=>q===0?'out':q<=c?'critical':q<=min?'low':'ok';
const fmtI=(n:number)=>n.toLocaleString('en-IN');
const fmtD=(d:string)=>new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});

// Module-level SKU lookup tables — used by loader + reload
const SKU_META: Record<string,{category:string;unit:string;price:number}> = {
  'GRN':{category:'Grains & Flour',unit:'kg',price:90},
  'OIL':{category:'Oils & Fats',unit:'ltr',price:200},
  'DAI':{category:'Dairy',unit:'kg',price:100},
  'VEG':{category:'Vegetables',unit:'kg',price:40},
  'SPC':{category:'Spices',unit:'kg',price:400},
  'PKG':{category:'Packaging',unit:'pcs',price:8},
  'BEV':{category:'Beverages',unit:'ltr',price:50},
  'PRO':{category:'Proteins',unit:'kg',price:280},
  'CON':{category:'Condiments',unit:'kg',price:150},
  'TOM':{category:'Vegetables',unit:'kg',price:40},
};
const SKU_PRICE: Record<string,number> = {
  'GRN-001':120,'GRN-002':45,'GRN-003':60,'OIL-001':180,'OIL-002':350,
  'DAI-001':68,'DAI-002':380,'VEG-001':40,'VEG-002':35,'SPC-001':600,
  'SPC-002':280,'PRO-001':100,'BEV-001':300,'PKG-001':3,'PKG-002':12,
};
const getSKUMeta=(sku:string)=>{
  const prefix=sku.split('-')[0].toUpperCase().replace(/\d/g,'');
  return SKU_META[prefix]||{category:'General',unit:'units',price:0};
};
const mapDbItem=(item:any):InventoryItem=>{
  const meta=getSKUMeta(item.sku||'');
  const price=SKU_PRICE[item.sku]??item.pricePerUnit??meta.price;
  const qty=item.quantity??0, thresh=item.threshold??item.minThreshold??10, crit=item.criticalThreshold??Math.floor(thresh/3);
  return {id:item.id,sku:item.sku||'',name:item.name||'',category:item.category||meta.category,branch:item.warehouse||item.branch||'Main Kitchen',quantity:qty,unit:item.unit||meta.unit,minThreshold:thresh,criticalThreshold:crit,pricePerUnit:price,totalValue:qty*price,supplier:item.supplier?.name||item.supplierName||'Fresh Market Supplies',supplierContact:item.supplier?.contact||item.supplierContact||'+91 98765 00001',lastRestocked:item.updatedAt?.split('T')[0]||new Date().toISOString().split('T')[0],location:item.warehouse||'',status:calcS(qty,thresh,crit),notes:item.notes||'',history:[]};
};

function StockBar({q,min,crit}:{q:number;min:number;crit:number}) {
  const max=Math.max(min*2,q,1),pct=Math.min((q/max)*100,100);
  const color=q===0?'var(--text3)':q<=crit?'var(--brand-red)':q<=min?'#d97706':'var(--green)';
  return <div style={{width:72,height:6,background:'var(--bdr)',borderRadius:3,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:color,borderRadius:3}}/></div>;
}

function KPIRow({items}:{items:InventoryItem[]}) {
  const tv=items.reduce((s,i)=>s+i.totalValue,0);
  const al=items.filter(i=>i.status==='low'||i.status==='critical').length;
  const oc=items.filter(i=>i.status==='out').length;
  const branchCount=[...new Set(items.map(i=>i.branch))].length;
  const cards=[
    {label:'Total SKUs',     value:items.length, sub:`${branchCount} branch${branchCount!==1?'es':''}`, icon:'📦',clr:'var(--brand-blue)',bg:'var(--brand-blue-lt)'},
    {label:'Needs Attention',value:al+oc,         sub:`${oc} out of stock`,                               icon:'⚠️',clr:'#d97706',          bg:'#fef9c3'            },
    {label:'Out of Stock',   value:oc,            sub:'Reorder immediately',                               icon:'🚫',clr:'var(--brand-red)', bg:'var(--brand-red-lt)'},
    {label:'Stock Value',    value:`₹${fmtI(tv)}`,sub:'Inventory valuation',                               icon:'💰',clr:'var(--green)',      bg:'#dcfce7'            },
  ];
  return (
    <div className="grid grid-4">
      {cards.map((c,i)=>(
        <div key={i} className="stat-card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem'}}>
          <div><p className="stat-label">{c.label}</p><p className="stat-value" style={{fontSize:'1.6rem',color:c.clr}}>{c.value}</p><p style={{fontSize:'var(--text-xs)',color:'var(--text3)',marginTop:3}}>{c.sub}</p></div>
          <div style={{width:48,height:48,borderRadius:'var(--r-lg)',background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0}}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
}

const EMPTY={sku:'',name:'',category:'Grains & Flour',branch:'MG Road - Bengaluru',quantity:0,unit:'kg',minThreshold:10,criticalThreshold:3,pricePerUnit:0,supplier:'',supplierContact:'',location:'',notes:''};

type FErrors = Partial<Record<keyof typeof EMPTY, string>>;
function validateItem(f: typeof EMPTY): FErrors {
  const e: FErrors = {};
  if (!f.sku.trim()) e.sku = 'SKU is required';
  else if (!/^[A-Z0-9\-]{3,20}$/.test(f.sku.trim())) e.sku = 'SKU: 3-20 chars, uppercase letters, digits and hyphens only';
  if (!f.name.trim()) e.name = 'Item name is required';
  else if (f.name.trim().length < 2) e.name = 'Minimum 2 characters';
  if (f.quantity < 0) e.quantity = 'Quantity cannot be negative';
  if (f.minThreshold < 0) e.minThreshold = 'Min threshold cannot be negative';
  if (f.criticalThreshold < 0) e.criticalThreshold = 'Critical threshold cannot be negative';
  if (f.criticalThreshold > f.minThreshold) e.criticalThreshold = 'Critical must be ≤ Min threshold';
  if (f.pricePerUnit < 0) e.pricePerUnit = 'Price cannot be negative';
  if (f.supplier && f.supplier.trim().length > 0 && f.supplier.trim().length < 2) e.supplier = 'Supplier name too short';
  if (f.supplierContact && f.supplierContact.trim()) {
    if (!/^\+?[\d\s\-]{8,15}$/.test(f.supplierContact.trim())) e.supplierContact = 'Invalid phone format (e.g. +91 98765 43210)';
  }
  return e;
}

function FieldError({msg}:{msg?:string}) {
  return msg ? <p style={{color:'var(--brand-red)',fontSize:'0.72rem',marginTop:3,marginBottom:0}}>{msg}</p> : null;
}

function ItemModal({item,onClose,onSave}:{item:InventoryItem|null;onClose:()=>void;onSave:(f:typeof EMPTY)=>void}) {
  const [f,setF]=useState<typeof EMPTY>(item?{sku:item.sku,name:item.name,category:item.category,branch:item.branch,quantity:item.quantity,unit:item.unit,minThreshold:item.minThreshold,criticalThreshold:item.criticalThreshold,pricePerUnit:item.pricePerUnit,supplier:item.supplier,supplierContact:item.supplierContact,location:item.location,notes:item.notes||''}:{...EMPTY});
  const [errs,setErrs]=useState<FErrors>({});
  const s=(k:string,v:any)=>{setF(p=>({...p,[k]:v}));if(errs[k as keyof typeof EMPTY])setErrs(p=>({...p,[k]:undefined}));}
  const UNITS=['kg','ltr','pcs','btl','box','pack','g','ml'];
  const submit=()=>{const e=validateItem(f);if(Object.keys(e).length){setErrs(e);return;}onSave(f);};
  const fi=(k:keyof typeof EMPTY)=>errs[k]?'input input-error':'input';
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg animate-scale-in">
        <div className="modal-header"><span className="modal-title">{item?'Edit Inventory Item':'Add Inventory Item'}</span><button className="modal-close" onClick={onClose}><X size={18}/></button></div>
        <div className="modal-body">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input className={fi('sku')} value={f.sku} onChange={e=>s('sku',e.target.value.toUpperCase())} placeholder="e.g. GRN-001"/>
              <FieldError msg={errs.sku}/>
            </div>
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input className={fi('name')} value={f.name} onChange={e=>s('name',e.target.value)} placeholder="e.g. Basmati Rice"/>
              <FieldError msg={errs.name}/>
            </div>
            <div className="form-group"><label className="form-label">Category</label><select className="select" value={f.category} onChange={e=>s('category',e.target.value)}>{CATS.filter(c=>c!=='All Categories').map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Branch</label><select className="select" value={f.branch} onChange={e=>s('branch',e.target.value)}>{BRANCHES.filter(b=>b!=='All Branches').map(b=><option key={b}>{b}</option>)}</select></div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className={fi('quantity')} type="number" min="0" value={f.quantity} onChange={e=>s('quantity',+e.target.value)}/>
              <FieldError msg={errs.quantity}/>
            </div>
            <div className="form-group"><label className="form-label">Unit</label><select className="select" value={f.unit} onChange={e=>s('unit',e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
            <div className="form-group">
              <label className="form-label">Min Threshold</label>
              <input className={fi('minThreshold')} type="number" min="0" value={f.minThreshold} onChange={e=>s('minThreshold',+e.target.value)}/>
              <FieldError msg={errs.minThreshold}/>
            </div>
            <div className="form-group">
              <label className="form-label">Critical Threshold <span style={{fontSize:'0.72rem',color:'var(--text3)'}}>(must be ≤ min)</span></label>
              <input className={fi('criticalThreshold')} type="number" min="0" value={f.criticalThreshold} onChange={e=>s('criticalThreshold',+e.target.value)}/>
              <FieldError msg={errs.criticalThreshold}/>
            </div>
            <div className="form-group">
              <label className="form-label">Price / Unit (₹)</label>
              <input className={fi('pricePerUnit')} type="number" min="0" value={f.pricePerUnit} onChange={e=>s('pricePerUnit',+e.target.value)}/>
              <FieldError msg={errs.pricePerUnit}/>
            </div>
            <div className="form-group"><label className="form-label">Storage Location</label><input className="input" value={f.location} onChange={e=>s('location',e.target.value)} placeholder="Store A - Shelf 3"/></div>
            <div className="form-group">
              <label className="form-label">Supplier Name</label>
              <input className={fi('supplier')} value={f.supplier} onChange={e=>s('supplier',e.target.value)} placeholder="India Gate Foods"/>
              <FieldError msg={errs.supplier}/>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier Contact</label>
              <input className={fi('supplierContact')} value={f.supplierContact} onChange={e=>s('supplierContact',e.target.value)} placeholder="+91 98765 43210"/>
              <FieldError msg={errs.supplierContact}/>
            </div>
          </div>
          <div className="form-group" style={{marginTop:'1rem'}}><label className="form-label">Notes</label><textarea className="textarea" rows={2} value={f.notes} onChange={e=>s('notes',e.target.value)} placeholder="Optional notes..."/></div>
          {Object.keys(errs).length>0&&<div style={{marginTop:'0.75rem',padding:'0.625rem 0.875rem',background:'var(--brand-red-lt)',border:'1px solid #fca5a5',borderRadius:'var(--r-md)',fontSize:'0.8rem',color:'var(--brand-red)',fontWeight:500}}>⚠ Please fix the errors above before saving.</div>}
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}>{item?'Save Changes':'Add Item'}</button></div>
      </div>
    </div>
  );
}

function AdjustModal({item,onClose,onSave}:{item:InventoryItem;onClose:()=>void;onSave:(id:string,d:number,n:string)=>void}) {
  const [delta,setDelta]=useState(0);
  const [note,setNote]=useState('');
  const [adjErr,setAdjErr]=useState('');
  const nq=Math.max(0,item.quantity+delta);
  const apply=()=>{
    if(delta===0){setAdjErr('Enter a non-zero adjustment amount');return;}
    if(!note.trim()){setAdjErr('Please enter a reason for this adjustment');return;}
    setAdjErr('');
    onSave(item.id,delta,note);
  };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-sm animate-scale-in">
        <div className="modal-header"><span className="modal-title">Adjust Stock — {item.name}</span><button className="modal-close" onClick={onClose}><X size={18}/></button></div>
        <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',background:'var(--surf2)',borderRadius:'var(--r-md)',padding:'1rem'}}>
            <div><p style={{fontSize:'var(--text-xs)',color:'var(--text3)',fontWeight:700,textTransform:'uppercase'}}>Current</p><p style={{fontSize:'1.5rem',fontWeight:800}}>{item.quantity} {item.unit}</p></div>
            <div style={{textAlign:'right'}}><p style={{fontSize:'var(--text-xs)',color:'var(--text3)',fontWeight:700,textTransform:'uppercase'}}>After</p><p style={{fontSize:'1.5rem',fontWeight:800,color:nq<=item.criticalThreshold?'var(--brand-red)':'var(--green)'}}>{nq} {item.unit}</p></div>
          </div>
          <div className="form-group">
            <label className="form-label">Adjustment *</label>
            <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
              <button className="btn btn-danger btn-sm" style={{width:36,padding:0}} onClick={()=>{setDelta(d=>d-1);setAdjErr('');}}><Minus size={14}/></button>
              <input className={adjErr&&delta===0?'input input-error':'input'} type="number" value={delta} onChange={e=>{setDelta(+e.target.value);setAdjErr('');}} style={{textAlign:'center',fontWeight:700}}/>
              <button className="btn btn-success btn-sm" style={{width:36,padding:0}} onClick={()=>{setDelta(d=>d+1);setAdjErr('');}}>+</button>
            </div>
            <p className="form-hint">Positive = add stock · Negative = consume stock</p>
          </div>
          <div className="form-group">
            <label className="form-label">Reason *</label>
            <input className={adjErr&&!note.trim()?'input input-error':'input'} value={note} onChange={e=>{setNote(e.target.value);setAdjErr('');}} placeholder="Restocked, used in prep, manual correction…"/>
          </div>
          {adjErr&&<p style={{color:'var(--brand-red)',fontSize:'0.8rem',fontWeight:500,margin:0}}>⚠ {adjErr}</p>}
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={apply}>Apply Adjustment</button></div>
      </div>
    </div>
  );
}

function HistoryModal({item,onClose}:{item:InventoryItem;onClose:()=>void}) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-md animate-scale-in">
        <div className="modal-header"><span className="modal-title">Stock History — {item.name}</span><button className="modal-close" onClick={onClose}><X size={18}/></button></div>
        <div className="modal-body" style={{padding:0}}>
          <div className="table-wrapper" style={{borderRadius:0,border:'none'}}>
            <table className="table">
              <thead><tr><th>Date</th><th>Action</th><th>Qty</th><th>Note</th><th>By</th></tr></thead>
              <tbody>{item.history.map((h,i)=>(
                <tr key={i}>
                  <td>{fmtD(h.date)}</td>
                  <td><span className={`badge ${h.action==='add'?'badge-active':h.action==='remove'?'badge-cancelled':'badge-blue'}`}>{h.action}</span></td>
                  <td style={{fontWeight:700,color:h.action==='add'?'var(--green)':'var(--brand-red)'}}>{h.action==='remove'?'-':'+'}{h.qty}</td>
                  <td style={{color:'var(--text2)'}}>{h.note}</td>
                  <td style={{color:'var(--text3)'}}>{h.user}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

function ConfirmModal({title,msg,danger,confirmLabel,onConfirm,onClose}:{title:string;msg:string;danger?:boolean;confirmLabel?:string;onConfirm:()=>void;onClose:()=>void}) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-sm animate-scale-in">
        <div className="modal-header">
          <span className="modal-title" style={{color:danger?'var(--brand-red)':undefined}}>{danger&&<AlertTriangle size={16} style={{marginRight:6,verticalAlign:'middle'}}/>}{title}</span>
          <button className="modal-close" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="modal-body"><p style={{margin:0,color:'var(--text2)',lineHeight:1.6}}>{msg}</p></div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger?'btn-danger':'btn-primary'}`} onClick={()=>{onConfirm();onClose();}}>{confirmLabel||(danger?'Delete':'Confirm')}</button>
        </div>
      </div>
    </div>
  );
}

function POModal({item,onClose,onSend}:{item:InventoryItem;onClose:()=>void;onSend:(qty:number,notes:string)=>void}) {
  const [qty,setQty]=useState(Math.max(item.minThreshold*2-item.quantity,1));
  const [notes,setNotes]=useState('');
  const [qtyErr,setQtyErr]=useState('');
  const send=()=>{
    if(qty<=0){setQtyErr('Order quantity must be greater than 0');return;}
    setQtyErr('');
    onSend(qty,notes);
  };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-sm animate-scale-in">
        <div className="modal-header"><span className="modal-title"><Truck size={15} style={{marginRight:6,verticalAlign:'middle'}}/>Order from Supplier</span><button className="modal-close" onClick={onClose}><X size={18}/></button></div>
        <div className="modal-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{background:'var(--surf2)',borderRadius:'var(--r-md)',padding:'0.875rem',fontSize:'var(--text-sm)'}}>
            <p style={{margin:'0 0 4px',fontWeight:700}}>{item.name}</p>
            <p style={{margin:0,color:'var(--text3)'}}>Supplier: <strong style={{color:'var(--text)'}}>{item.supplier||'Not specified'}</strong></p>
            {item.supplierContact&&<p style={{margin:'2px 0 0',color:'var(--text3)'}}>Contact: <strong style={{color:'var(--text)'}}>{item.supplierContact}</strong></p>}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',gap:'0.5rem',background:'var(--brand-blue-lt)',borderRadius:'var(--r-md)',padding:'0.75rem 1rem'}}>
            <div><p style={{margin:0,fontSize:'var(--text-xs)',color:'var(--text3)',fontWeight:600,textTransform:'uppercase'}}>Current Stock</p><p style={{margin:0,fontWeight:700}}>{item.quantity} {item.unit}</p></div>
            <div><p style={{margin:0,fontSize:'var(--text-xs)',color:'var(--text3)',fontWeight:600,textTransform:'uppercase'}}>Min Level</p><p style={{margin:0,fontWeight:700}}>{item.minThreshold} {item.unit}</p></div>
            <div><p style={{margin:0,fontSize:'var(--text-xs)',color:'var(--text3)',fontWeight:600,textTransform:'uppercase'}}>Suggested Order</p><p style={{margin:0,fontWeight:700,color:'var(--brand-blue)'}}>{Math.max(item.minThreshold*2-item.quantity,1)} {item.unit}</p></div>
          </div>
          <div className="form-group">
            <label className="form-label">Order Quantity ({item.unit}) *</label>
            <input className={qtyErr?'input input-error':'input'} type="number" min="1" value={qty} onChange={e=>{setQty(+e.target.value);setQtyErr('');}} style={{fontWeight:700}}/>
            {qtyErr&&<p style={{color:'var(--brand-red)',fontSize:'0.75rem',marginTop:3}}>{qtyErr}</p>}
          </div>
          <div className="form-group"><label className="form-label">Notes (optional)</label><textarea className="textarea" rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Delivery instructions, urgency level…"/></div>
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={send}><Send size={13}/> Send Purchase Order</button></div>
      </div>
    </div>
  );
}

function Toast({msg,type,onDone}:{msg:string;type:'ok'|'err';onDone:()=>void}) {
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[onDone]);
  const bg=type==='ok'?'#16a34a':'var(--brand-red)';
  const icon=type==='ok'?<Check size={16}/>:<AlertTriangle size={16}/>;
  return (
    <div style={{position:'fixed',bottom:28,right:28,zIndex:9999,display:'flex',alignItems:'center',gap:10,background:bg,color:'#fff',padding:'0.75rem 1.25rem',borderRadius:'var(--r-lg)',boxShadow:'var(--shadow-lg)',fontSize:'0.875rem',fontWeight:500,animation:'slideUp .25s ease',maxWidth:380}}>
      {icon}<span>{msg}</span><button onClick={onDone} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',marginLeft:4,display:'flex',padding:0}}><X size={14}/></button>
    </div>
  );
}

type SK='name'|'sku'|'quantity'|'totalValue'|'status'|'category';

export default function InventoryAdmin() {
  const [items,setItems]=useState<InventoryItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [branch,setBranch]=useState('All Branches');
  const [cat,setCat]=useState('All Categories');
  const [statusF,setStatusF]=useState('all');
  const [sortKey,setSortKey]=useState<SK>('name');
  const [sortDir,setSortDir]=useState<'asc'|'desc'>('asc');
  const [page,setPage]=useState(1);
  const PAGE=10;
  const [editItem,setEditItem]=useState<InventoryItem|null|'new'>(null);
  const [adjItem,setAdjItem]=useState<InventoryItem|null>(null);
  const [histItem,setHistItem]=useState<InventoryItem|null>(null);
  const [menuId,setMenuId]=useState<string|null>(null);
  const [toast,setToast]=useState<{msg:string;type:'ok'|'err'}|null>(null);
  const [confirmDel,setConfirmDel]=useState<string|null>(null);
  const [poItem,setPoItem]=useState<InventoryItem|null>(null);
  const showToast=(msg:string,type:'ok'|'err'='ok')=>setToast({msg,type});

  const reloadItems=async()=>{
    setLoading(true);
    try{
      const r=await fetch('/api/inventory',{headers:{Authorization:`Bearer ${localStorage.getItem('admin_token')}`}});
      if(!r.ok) throw new Error('API error');
      const d=await r.json();
      const rows=Array.isArray(d)?d:d.data||[];
      const mapped=rows.map(mapDbItem);
      setItems(mapped.length>0?mapped:(process.env['NODE_ENV']==='development'?MOCK:[]));
    }catch(e){ setItems(process.env['NODE_ENV']==='development'?MOCK:[]); }
    finally{setLoading(false);}
  };

  // SKU-prefix lookup: maps SKU prefix → {category, unit, pricePerUnit}
  // Used to enrich DB records that only store sku/name/quantity/threshold/warehouse
  const _SKU_META_LOCAL: Record<string, {category:string;unit:string;price:number}> = {
    'GRN': {category:'Grains & Flour', unit:'kg',  price:90},
    'OIL': {category:'Oils & Fats',    unit:'ltr', price:200},
    'DAI': {category:'Dairy',          unit:'kg',  price:100},
    'VEG': {category:'Vegetables',     unit:'kg',  price:40},
    'SPC': {category:'Spices',         unit:'kg',  price:400},
    'PKG': {category:'Packaging',      unit:'pcs', price:8},
    'BEV': {category:'Beverages',      unit:'ltr', price:50},
    'PRO': {category:'Proteins',       unit:'kg',  price:280},
    'CON': {category:'Condiments',     unit:'kg',  price:150},
    'TOM': {category:'Vegetables',     unit:'kg',  price:40},
  };
  const getSKUMeta=(sku:string)=>{
    const prefix=sku.split('-')[0].toUpperCase().replace(/\d/g,'');
    return _SKU_META_LOCAL[prefix]||{category:'General',unit:'units',price:0};
  };
  // Per-SKU price overrides for known items
  const _SKU_PRICE_LOCAL: Record<string, number> = {
    'GRN-001':120,'GRN-002':45,'GRN-003':60,'OIL-001':180,'OIL-002':350,
    'DAI-001':68,'DAI-002':380,'VEG-001':40,'VEG-002':35,'SPC-001':600,
    'SPC-002':280,'PRO-001':100,'BEV-001':300,'PKG-001':3,'PKG-002':12,
  };

  useEffect(()=>{
    const load=async()=>{
      try{
        const r=await fetch('/api/inventory',{headers:{Authorization:`Bearer ${localStorage.getItem('admin_token')}`}});
        if(!r.ok) throw new Error(`API ${r.status}: ${r.statusText}`);
        const d=await r.json();
        const rows=Array.isArray(d)?d:d.data||[];
        const mapped=rows.map(mapDbItem);
        setItems(mapped.length>0?mapped:(process.env['NODE_ENV']==='development'?MOCK:[]));
      }catch(e){
        console.warn('[InventoryAdmin] API error:', e);
        setItems(process.env['NODE_ENV']==='development'?MOCK:[]);
      }
      finally{setLoading(false);}
    };
    load();
  },[]);

  const toggleSort=(k:SK)=>{if(sortKey===k)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortKey(k);setSortDir('asc');}};

  const filtered=useMemo(()=>{
    let r=[...items];
    if(branch!=='All Branches') r=r.filter(i=>i.branch===branch);
    if(cat!=='All Categories')  r=r.filter(i=>i.category===cat);
    if(statusF!=='all')         r=r.filter(i=>i.status===statusF);
    if(search.trim()){const q=search.toLowerCase();r=r.filter(i=>i.name.toLowerCase().includes(q)||i.sku.toLowerCase().includes(q)||i.supplier.toLowerCase().includes(q));}
    r.sort((a,b)=>{let va:any=a[sortKey],vb:any=b[sortKey];if(typeof va==='string'){va=va.toLowerCase();vb=(vb as string).toLowerCase();}return sortDir==='asc'?(va<vb?-1:va>vb?1:0):(va>vb?-1:va<vb?1:0);});
    return r;
  },[items,branch,cat,statusF,search,sortKey,sortDir]);

  useEffect(()=>setPage(1),[branch,cat,statusF,search]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE));
  const pageItems=filtered.slice((page-1)*PAGE,page*PAGE);

  const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

  const handleSave = useCallback(async (form: typeof EMPTY) => {
    const status = calcS(form.quantity, form.minThreshold, form.criticalThreshold);
    const payload = {
      name: form.name,
      sku: form.sku,
      quantity: form.quantity,
      threshold: form.minThreshold,   // DB field name
      warehouse: form.location || form.branch || 'Main Kitchen',
      // Store extra metadata in notes field if available
    };
    try {
      if (editItem && editItem !== 'new') {
        const res = await fetch(`/api/inventory/${(editItem as InventoryItem).id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authH() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        // Update local state with merged data
        setItems(p => p.map(i => i.id === (editItem as InventoryItem).id
          ? { ...i, ...form, totalValue: form.quantity * form.pricePerUnit, status } : i));
        showToast('Item updated successfully');
      } else {
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authH() },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json();
        setItems(p => [{ ...form, id: created.id, totalValue: form.quantity * form.pricePerUnit, status, lastRestocked: new Date().toISOString().split('T')[0], history: [] }, ...p]);
        showToast('New item added to inventory');
      }
    } catch (e) {
      showToast('Failed to save item', 'err');
      console.error('[InventoryAdmin] save error:', e);
    }
    setEditItem(null);
  }, [editItem]);

  const handleAdj = useCallback(async (id: string, delta: number, note: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const nq = Math.max(0, item.quantity + delta);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authH() },
        body: JSON.stringify({ quantity: nq })
      });
      if (!res.ok) throw new Error(await res.text());
      const entry: HistoryEntry = { date: new Date().toISOString().split('T')[0], action: delta > 0 ? 'add' : 'remove', qty: Math.abs(delta), note, user: 'Admin' };
      setItems(p => p.map(i => i.id !== id ? i : { ...i, quantity: nq, totalValue: nq * i.pricePerUnit, status: calcS(nq, i.minThreshold, i.criticalThreshold), history: [entry, ...i.history] }));
      showToast(`Stock adjusted: ${delta > 0 ? '+' : ''}${delta} units`);
    } catch (e) {
      showToast('Failed to adjust stock', 'err');
      console.error('[InventoryAdmin] adjust error:', e);
    }
    setAdjItem(null);
  }, [items]);

  const handleDel = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE', headers: authH() });
      if (!res.ok) throw new Error(await res.text());
      setItems(p => p.filter(i => i.id !== id));
      showToast('Item removed from inventory');
    } catch (e) {
      showToast('Failed to delete item', 'err');
      console.error('[InventoryAdmin] delete error:', e);
    }
    setConfirmDel(null);
    setMenuId(null);
  };

  const exportCSV=()=>{
    const csv=['SKU,Name,Category,Branch,Qty,Unit,MinThresh,Price,Value,Supplier,Status',
      ...filtered.map(i=>`${i.sku},"${i.name}",${i.category},"${i.branch}",${i.quantity},${i.unit},${i.minThreshold},${i.pricePerUnit},${i.totalValue},"${i.supplier}",${i.status}`)].join('\n');
    const a=document.createElement('a');a.href='data:text/csv,'+encodeURIComponent(csv);a.download=`inventory_${Date.now()}.csv`;a.click();
  };

  const SortTh=({k,label}:{k:SK;label:string})=>(
    <th onClick={()=>toggleSort(k)} style={{cursor:'pointer',userSelect:'none',whiteSpace:'nowrap'}}>
      <span style={{display:'flex',alignItems:'center',gap:4}}>{label}{sortKey===k?(sortDir==='asc'?<ChevronUp size={11}/>:<ChevronDown size={11}/>):<ArrowUpDown size={10} style={{opacity:.3}}/>}</span>
    </th>
  );

  const outCount=items.filter(i=>i.status==='out').length;
  const critCount=items.filter(i=>i.status==='critical').length;

  if(loading)return(
    <div className="page-skeleton">
      <div className="page-skeleton-header skeleton"/>
      <div className="page-skeleton-grid">{[1,2,3,4].map(i=><div key={i} className="page-skeleton-card skeleton"/>)}</div>
      <div className="page-skeleton-table skeleton"/>
    </div>
  );

  return(
    <div className="page-container" onClick={()=>setMenuId(null)}>
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">📦 Inventory Management</h1>
          <p className="page-subtitle">Track stock levels, manage suppliers and prevent shortages across all branches</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Download size={14}/> Export CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={reloadItems}><RefreshCw size={14}/> Refresh</button>
          <button className="btn btn-primary" onClick={()=>setEditItem('new')}><Plus size={15}/> Add Item</button>
        </div>
      </div>

      <KPIRow items={items}/>

      {(outCount+critCount)>0&&(
        <div style={{background:'#fefce8',border:'1px solid #fde047',borderRadius:'var(--r-lg)',padding:'.875rem 1.25rem',display:'flex',alignItems:'center',gap:'.75rem'}}>
          <AlertTriangle size={18} style={{color:'#d97706',flexShrink:0}}/>
          <div style={{flex:1}}>
            <strong style={{fontSize:'var(--text-sm)',color:'#92400e'}}>{outCount} out of stock · {critCount} critically low — reorder required</strong>
            <p style={{fontSize:'var(--text-xs)',color:'#a16207',marginTop:2}}>Place purchase orders immediately to prevent service disruption</p>
          </div>
          <button className="btn btn-sm" style={{background:'#d97706',color:'#fff',flexShrink:0}} onClick={()=>setStatusF('out')}><ShoppingCart size={13}/> View OOS</button>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-bar" style={{flex:1,maxWidth:340}}>
          <Search size={14} style={{color:'var(--text3)'}}/>
          <input placeholder="Search SKU, item, supplier…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search&&<button style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:0,display:'flex'}} onClick={()=>setSearch('')}><X size={13}/></button>}
        </div>
        <select className="select" style={{width:190}} value={branch} onChange={e=>setBranch(e.target.value)}>{BRANCHES.map(b=><option key={b}>{b}</option>)}</select>
        <select className="select" style={{width:170}} value={cat} onChange={e=>setCat(e.target.value)}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
        <select className="select" style={{width:155}} value={statusF} onChange={e=>setStatusF(e.target.value)}>
          <option value="all">All Status</option><option value="ok">In Stock</option><option value="low">Low Stock</option><option value="critical">Critical</option><option value="out">Out of Stock</option>
        </select>
        <span style={{fontSize:'var(--text-xs)',color:'var(--text3)',whiteSpace:'nowrap'}}>{filtered.length} item{filtered.length!==1?'s':''}</span>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead><tr>
            <SortTh k="sku" label="SKU"/>
            <SortTh k="name" label="Item"/>
            <SortTh k="category" label="Category"/>
            <th>Branch</th>
            <SortTh k="quantity" label="Stock"/>
            <th>Level</th>
            <th>Supplier</th>
            <SortTh k="totalValue" label="Value"/>
            <SortTh k="status" label="Status"/>
            <th>Restocked</th>
            <th style={{width:36}}></th>
          </tr></thead>
          <tbody>
            {pageItems.length===0?(
              <tr><td colSpan={11}><div className="empty-state"><div className="empty-state-icon">📦</div><p className="empty-state-title">No items found</p><p className="empty-state-desc">Adjust filters or add a new item</p><button className="btn btn-primary" onClick={()=>setEditItem('new')}><Plus size={14}/> Add Item</button></div></td></tr>
            ):pageItems.map(item=>{
              const sm=SM[item.status];
              return(
                <tr key={item.id} style={{position:'relative'}}>
                  <td><code style={{fontSize:'0.75rem',background:'var(--surf2)',padding:'2px 7px',borderRadius:4,fontFamily:'var(--font-mono)'}}>{item.sku}</code></td>
                  <td><div style={{fontWeight:600}}>{item.name}</div><div style={{fontSize:'var(--text-xs)',color:'var(--text3)'}}>{item.location}</div></td>
                  <td><span className="badge badge-gray">{item.category}</span></td>
                  <td style={{fontSize:'var(--text-xs)',color:'var(--text2)'}}>{item.branch.split(' - ')[0]}</td>
                  <td><div style={{fontWeight:700}}>{item.quantity} <span style={{fontWeight:400,fontSize:'var(--text-xs)',color:'var(--text3)'}}>{item.unit}</span></div><div style={{fontSize:'var(--text-xs)',color:'var(--text3)'}}>Min:{item.minThreshold}</div></td>
                  <td><StockBar q={item.quantity} min={item.minThreshold} crit={item.criticalThreshold}/></td>
                  <td><div style={{fontSize:'var(--text-sm)'}}>{item.supplier}</div><div style={{fontSize:'var(--text-xs)',color:'var(--text3)'}}>{item.supplierContact}</div></td>
                  <td style={{fontWeight:700}}>₹{fmtI(item.totalValue)}</td>
                  <td><span className={`badge ${sm.cls}`}><span className={`dot ${sm.dot}`} style={{marginRight:4}}/>{sm.label}</span></td>
                  <td style={{fontSize:'var(--text-xs)',color:'var(--text3)'}}>{fmtD(item.lastRestocked)}</td>
                  <td style={{position:'relative'}}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={e=>{e.stopPropagation();setMenuId(menuId===item.id?null:item.id);}}><MoreVertical size={15}/></button>
                    {menuId===item.id&&(
                      <div onClick={e=>e.stopPropagation()} style={{position:'absolute',right:0,top:'100%',background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:'var(--r-md)',boxShadow:'var(--shadow-lg)',zIndex:200,minWidth:190,padding:'4px 0'}}>
                        {[
                          {icon:<BarChart2 size={14}/>,label:'Adjust Stock',fn:()=>{setAdjItem(item);setMenuId(null);}},
                          {icon:<History size={14}/>,label:'View History',fn:()=>{setHistItem(item);setMenuId(null);}},
                          {icon:<Edit2 size={14}/>,label:'Edit Item',fn:()=>{setEditItem(item);setMenuId(null);}},
                          {icon:<Truck size={14}/>,label:'Order from Supplier',fn:()=>{setPoItem(item);setMenuId(null);}},
                          {icon:<Trash2 size={14}/>,label:'Delete',fn:()=>handleDel(item.id),danger:true},
                        ].map((a,j)=>(
                          <button key={j} onClick={a.fn} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 14px',background:'none',border:'none',cursor:'pointer',fontSize:'var(--text-sm)',color:a.danger?'var(--brand-red)':'var(--text)',textAlign:'left'}}
                            onMouseEnter={e=>(e.currentTarget.style.background='var(--surf2)')} onMouseLeave={e=>(e.currentTarget.style.background='none')}>
                            {a.icon}{a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages>1&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.75rem',flexWrap:'wrap'}}>
          <span style={{fontSize:'var(--text-xs)',color:'var(--text3)'}}>Showing {(page-1)*PAGE+1}–{Math.min(page*PAGE,filtered.length)} of {filtered.length}</span>
          <div style={{display:'flex',gap:4}}>
            <button className="btn btn-secondary btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹ Prev</button>
            {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
              <React.Fragment key={p}>
                {i>0&&arr[i-1]!==p-1&&<span style={{padding:'0 4px',color:'var(--text3)',alignSelf:'center'}}>…</span>}
                <button className={`btn btn-sm ${p===page?'btn-primary':'btn-secondary'}`} onClick={()=>setPage(p)}>{p}</button>
              </React.Fragment>
            ))}
            <button className="btn btn-secondary btn-sm" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next ›</button>
          </div>
        </div>
      )}

      {editItem!=null&&<ItemModal item={editItem==='new'?null:editItem as InventoryItem} onClose={()=>setEditItem(null)} onSave={handleSave}/>}
      {adjItem&&<AdjustModal item={adjItem} onClose={()=>setAdjItem(null)} onSave={handleAdj}/>}
      {histItem&&<HistoryModal item={histItem} onClose={()=>setHistItem(null)}/>}
      {confirmDel&&<ConfirmModal title="Delete Inventory Item" msg="This item will be permanently removed from inventory. This action cannot be undone." danger confirmLabel="Yes, Delete" onConfirm={()=>handleDel(confirmDel)} onClose={()=>setConfirmDel(null)}/>}
      {poItem&&<POModal item={poItem} onClose={()=>setPoItem(null)} onSend={(qty,notes)=>{showToast(`Purchase order sent to ${poItem.supplier} for ${qty} ${poItem.unit}`);setPoItem(null);}}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  );
}
