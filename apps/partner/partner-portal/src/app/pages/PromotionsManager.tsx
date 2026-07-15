import React, { useState, useEffect } from 'react';
import { ApiClient } from '@libs/api-client';
import { useAuthStore } from '@libs/auth';

interface Promotion {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function PromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuthStore();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
  });

  const fetchPromotions = async () => {
    try {
      const response = await ApiClient.get('/promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiClient.post('/promotions', {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        validFrom: '',
        validUntil: '',
      });
      await fetchPromotions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create promotion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🏷️ Promotions Manager</h1>
          <p className="page-subtitle">Manage discount codes and promotional campaigns</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Create Promo
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--brand-red)', padding: '16px' }}>{error}</div>}

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>Loading campaigns...</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>CODE</th>
                <th>TYPE</th>
                <th>VALUE</th>
                <th>MIN ORDER</th>
                <th>VALID FROM</th>
                <th>VALID UNTIL</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => {
                const isExpired = new Date(promo.validUntil) < new Date();
                return (
                  <tr key={promo.id}>
                    <td><strong>{promo.code}</strong></td>
                    <td>{promo.discountType}</td>
                    <td>
                      {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                    </td>
                    <td>{promo.minOrderValue ? `₹${promo.minOrderValue}` : 'None'}</td>
                    <td>{new Date(promo.validFrom).toLocaleDateString()}</td>
                    <td>{new Date(promo.validUntil).toLocaleDateString()}</td>
                    <td>
                      {isExpired ? (
                        <span style={{ color: 'var(--brand-red)', fontWeight: 600 }}>EXPIRED</span>
                      ) : promo.isActive ? (
                        <span style={{ color: 'green', fontWeight: 600 }}>ACTIVE</span>
                      ) : (
                        <span style={{ color: 'gray', fontWeight: 600 }}>INACTIVE</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    No promotions found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surf)', padding: '32px', borderRadius: '8px',
            width: '400px', maxWidth: '90%'
          }}>
            <h2 style={{ marginTop: 0 }}>Create Promotion</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Promo Code</label>
                <input required type="text" name="code" value={formData.code} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} placeholder="e.g. SAVE20" />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label>Type</label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat Amount</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Value</label>
                  <input required type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label>Min Order Value</label>
                  <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} placeholder="Optional" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Max Discount</label>
                  <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} placeholder="Optional" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label>Valid From</label>
                  <input required type="datetime-local" name="validFrom" value={formData.validFrom} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Valid Until</label>
                  <input required type="datetime-local" name="validUntil" value={formData.validUntil} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '8px' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '8px', background: 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '4px' }}>
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
