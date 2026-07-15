import React, { useState, useEffect } from 'react';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export function WebhooksManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['ORDER_CREATED']);

  const availableEvents = ['ORDER_CREATED', 'ORDER_ACCEPTED', 'ORDER_DELIVERED', 'ORDER_CANCELLED'];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/webhooks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch webhooks');
      const data = await res.json();
      setWebhooks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: newUrl,
          events: selectedEvents
        })
      });
      if (!res.ok) throw new Error('Failed to create webhook');
      setNewUrl('');
      setSelectedEvents(['ORDER_CREATED']);
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete webhook');
      fetchWebhooks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading webhooks...</div>;

  return (
    <div className="webhooks-manager">
      <h2>Webhooks Management</h2>
      {error && <div className="error" style={{ color: 'var(--brand-red)' }}>{error}</div>}

      <div className="create-webhook-form" style={{ background: 'var(--surf)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--bdr)' }}>
        <h3>Register New Webhook</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="url">Payload URL</label>
            <input 
              type="url" 
              id="url" 
              value={newUrl} 
              onChange={e => setNewUrl(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} 
              placeholder="https://example.com/webhook"
            />
          </div>
          <div>
            <label>Events</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {availableEvents.map(event => (
                <label key={event} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedEvents.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, event]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(ev => ev !== event));
                      }
                    }}
                  />
                  {event}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Add Webhook
          </button>
        </form>
      </div>

      <div className="webhooks-list" style={{ background: 'var(--surf)', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bdr)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>URL</th>
              <th style={{ padding: '1rem' }}>Events</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>No webhooks configured.</td>
              </tr>
            ) : (
              webhooks.map(webhook => (
                <tr key={webhook.id} style={{ borderBottom: '1px solid var(--bdr)' }}>
                  <td style={{ padding: '1rem' }}>{webhook.url}</td>
                  <td style={{ padding: '1rem' }}>{webhook.events.join(', ')}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.875rem',
                      background: webhook.isActive ? 'var(--brand-blue-lt)' : 'var(--brand-red-lt)',
                      color: webhook.isActive ? 'var(--brand-blue-dk)' : 'var(--brand-red-dk)'
                    }}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => handleDelete(webhook.id)}
                      style={{ background: 'var(--brand-red)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
