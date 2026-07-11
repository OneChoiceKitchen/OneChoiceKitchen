import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function CustomizationModal({ item, onClose, onAddToCart }: any) {
  // Store selected options: Record<attributeId, string[]>
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Initialize default selections
    const initialSelections: Record<string, string[]> = {};

    item.attributes?.forEach((attr: any) => {
      const defaultOptions = attr.options.filter((opt: any) => opt.isDefault).map((opt: any) => opt.id);
      
      if (defaultOptions.length > 0) {
        initialSelections[attr.id] = defaultOptions;
      } else if (attr.isRequired && attr.options.length > 0) {
        // If required but no default, select first one automatically
        initialSelections[attr.id] = [attr.options[0].id];
      } else {
        initialSelections[attr.id] = [];
      }
    });

    setSelections(initialSelections);
  }, [item]);

  const handleOptionSelect = (attrId: string, optId: string, isMulti: boolean) => {
    setSelections(prev => {
      const currentAttrSelections = prev[attrId] || [];
      const newSelections = { ...prev };

      if (isMulti) {
        if (currentAttrSelections.includes(optId)) {
          newSelections[attrId] = currentAttrSelections.filter(id => id !== optId);
        } else {
          newSelections[attrId] = [...currentAttrSelections, optId];
        }
      } else {
        // Single select
        if (!currentAttrSelections.includes(optId)) {
          newSelections[attrId] = [optId];
        }
      }

      return newSelections;
    });
  };

  // Calculate total price purely from selections
  const totalPrice = item.attributes?.reduce((acc: number, attr: any) => {
    const selectedOptIds = selections[attr.id] || [];
    const selectedOptsPrice = attr.options
      .filter((opt: any) => selectedOptIds.includes(opt.id))
      .reduce((sum: number, opt: any) => sum + opt.additionalPrice, 0);
    return acc + selectedOptsPrice;
  }, item.price) || item.price;

  const handleAddToCart = () => {
    // Collect customized details to pass to Cart
    const selectedCustomizations = item.attributes?.map((attr: any) => {
      const selectedOptIds = selections[attr.id] || [];
      const selectedOpts = attr.options.filter((opt: any) => selectedOptIds.includes(opt.id));
      return {
        attributeId: attr.id,
        attributeName: attr.name,
        options: selectedOpts.map((opt: any) => ({
          optionId: opt.id,
          name: opt.name,
          price: opt.additionalPrice
        }))
      };
    }).filter((attr: any) => attr.options.length > 0);

    onAddToCart(item, selectedCustomizations, totalPrice);
    onClose();
  };

  const canAdd = item.attributes?.every((attr: any) => {
    if (attr.isRequired) {
      return (selections[attr.id] && selections[attr.id].length > 0);
    }
    return true;
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '24px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'scaleIn 0.2s ease-out' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Customize</h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>{item.name}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} color="#475569" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', marginBottom: '16px' }}>
          {item.attributes?.map((attr: any) => (
            <div key={attr.id} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{attr.name}</h4>
                {attr.isRequired && <span style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#DC2626', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>REQUIRED</span>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attr.options.map((opt: any) => {
                  const isSelected = (selections[attr.id] || []).includes(opt.id);
                  const isMulti = attr.type === 'MULTIPLE';

                  return (
                    <div 
                      key={opt.id} 
                      onClick={() => handleOptionSelect(attr.id, opt.id, isMulti)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: `1px solid ${isSelected ? '#DC2626' : '#e2e8f0'}`, background: isSelected ? '#fef2f2' : '#fff', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: isMulti ? '4px' : '50%', border: `2px solid ${isSelected ? '#DC2626' : '#cbd5e1'}`, background: isSelected ? '#DC2626' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#991b1b' : '#334155' }}>{opt.name}</span>
                      </div>
                      {opt.additionalPrice !== 0 && (
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>
                          {opt.additionalPrice > 0 ? '+₹' + opt.additionalPrice : '-₹' + Math.abs(opt.additionalPrice)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button 
            disabled={!canAdd}
            onClick={handleAddToCart}
            style={{ width: '100%', background: canAdd ? '#DC2626' : '#f1f5f9', color: canAdd ? '#fff' : '#94a3b8', padding: '16px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 800, cursor: canAdd ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
          >
            <span>Add to Cart</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
