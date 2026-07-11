'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Clock, Utensils, Calendar, Package } from 'lucide-react';

export default function BranchLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const branchId = params.branchId as string;
  const tableId = searchParams.get('tableId');
  
  const [branchData, setBranchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        // We will try fetching from API, if it fails we mock it for development
        const response = await fetch(`/api/branches/${branchId}`);
        if (response.ok) {
          const data = await response.json();
          setBranchData(data);
        } else {
          setBranchData({
            id: branchId,
            name: "Ramkrishna Nagar",
            address: "Ramkrishna Nagar Main Road",
            city: "Patna",
            operatingHours: "09:00 - 22:00",
            isReservationEnabled: true,
            restaurant: { name: "OneChoiceKitchen" }
          });
        }
      } catch (error) {
        setBranchData({
          id: branchId,
          name: "Ramkrishna Nagar",
          address: "Ramkrishna Nagar Main Road",
          city: "Patna",
          operatingHours: "09:00 - 22:00",
          isReservationEnabled: true,
          restaurant: { name: "OneChoiceKitchen" }
        });
      } finally {
        setLoading(false);
      }
    };
    if (branchId) fetchBranch();
  }, [branchId]);

  const handleNavigation = (path: string) => {
    let url = `/${path}?branchId=${branchId}`;
    if (tableId) {
      url += `&tableId=${tableId}`;
    }
    router.push(url);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!branchData) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Branch not found.</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '2rem' }}>
        {branchData.brandLogoUrl ? (
          <img src={branchData.brandLogoUrl} alt={branchData.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem auto', display: 'block', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        ) : (
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e2e8f0', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Utensils size={40} color="#64748b" />
          </div>
        )}
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{branchData.name}</h1>
        {branchData.restaurant?.name && <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{branchData.restaurant.name}</p>}
        <p style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', margin: '0 0 0.25rem 0' }}>
          <MapPin size={14} /> {branchData.address}, {branchData.city}
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', margin: 0 }}>
          <Clock size={14} /> {branchData.operatingHours || '09:00 - 22:00'}
        </p>
      </div>

      {tableId && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '2rem', fontWeight: 600 }}>
          You are seated at Table {tableId}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          onClick={() => handleNavigation('menu')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', background: '#2563EB', color: 'white', padding: '1.25rem', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%', marginRight: '1rem' }}>
            <Utensils size={24} color="white" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Order Food</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>Explore our digital menu and order now</div>
          </div>
        </button>

        {branchData.isReservationEnabled !== false && (
          <button 
            onClick={() => handleNavigation('reservations')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'white', color: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
          >
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '50%', marginRight: '1rem' }}>
              <Calendar size={24} color="#2563EB" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Book a Table</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Reserve your spot in advance</div>
            </div>
          </button>
        )}

        <button 
          onClick={() => handleNavigation('tiffin')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'white', color: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
        >
          <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '50%', marginRight: '1rem' }}>
            <Package size={24} color="#2563EB" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tiffin Services</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Subscribe to daily meal plans</div>
          </div>
        </button>
      </div>
    </div>
  );
}
