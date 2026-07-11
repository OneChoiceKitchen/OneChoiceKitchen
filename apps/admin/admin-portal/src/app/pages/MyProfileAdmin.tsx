import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Key } from 'lucide-react';

const MyProfileAdmin = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Administrator',
    email: 'admin@onechoicekitchen.com',
    phone: '+91 9876543210',
    location: 'Bangalore, India',
    role: 'Super Admin',
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            padding: '0.5rem 1.25rem',
            background: isEditing ? 'var(--ent-bg)' : 'var(--ent-primary)',
            color: isEditing ? 'var(--ent-text-main)' : 'white',
            border: isEditing ? '1px solid var(--ent-border)' : 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div style={{ background: 'var(--ent-surface)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--ent-border)', boxShadow: 'var(--ent-shadow-sm)', display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--ent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700 }}>
            {profile.name.charAt(0)}
          </div>
          <button style={{ padding: '0.35rem 1rem', background: 'transparent', border: '1px solid var(--ent-border)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--ent-text-main)' }}>
            Change Avatar
          </button>
        </div>
        
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--ent-text-muted)', marginBottom: '0.5rem' }}>
              <User size={14} /> Full Name
            </label>
            {isEditing ? (
              <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ent-border)', background: 'var(--ent-bg)', color: 'var(--ent-text-main)' }} />
            ) : (
              <div style={{ fontWeight: 500 }}>{profile.name}</div>
            )}
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--ent-text-muted)', marginBottom: '0.5rem' }}>
              <Mail size={14} /> Email Address
            </label>
            {isEditing ? (
              <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ent-border)', background: 'var(--ent-bg)', color: 'var(--ent-text-main)' }} />
            ) : (
              <div style={{ fontWeight: 500 }}>{profile.email}</div>
            )}
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--ent-text-muted)', marginBottom: '0.5rem' }}>
              <Phone size={14} /> Phone Number
            </label>
            {isEditing ? (
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ent-border)', background: 'var(--ent-bg)', color: 'var(--ent-text-main)' }} />
            ) : (
              <div style={{ fontWeight: 500 }}>{profile.phone}</div>
            )}
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--ent-text-muted)', marginBottom: '0.5rem' }}>
              <MapPin size={14} /> Location
            </label>
            {isEditing ? (
              <input type="text" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--ent-border)', background: 'var(--ent-bg)', color: 'var(--ent-text-main)' }} />
            ) : (
              <div style={{ fontWeight: 500 }}>{profile.location}</div>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '2rem' }}>Security & Roles</h3>
      <div style={{ background: 'var(--ent-surface)', borderRadius: '12px', border: '1px solid var(--ent-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--ent-border)' }}>
          <div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={16} style={{ color: 'var(--ent-primary)' }} /> Assigned Role</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--ent-text-muted)', marginTop: '0.25rem' }}>Your current access level across the platform.</div>
          </div>
          <div style={{ padding: '0.25rem 0.75rem', background: '#f1f5f9', color: '#0f172a', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
            {profile.role}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={16} style={{ color: 'var(--ent-text-muted)' }} /> Password</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--ent-text-muted)', marginTop: '0.25rem' }}>Last changed 3 months ago.</div>
          </div>
          <button style={{ padding: '0.4rem 1rem', background: 'transparent', border: '1px solid var(--ent-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: 'var(--ent-text-main)' }}>
            Update Password
          </button>
        </div>
      </div>

      {isEditing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button
            onClick={() => {
              setIsEditing(false);
              alert('Profile updated successfully!');
            }}
            style={{ padding: '0.75rem 2rem', background: 'var(--ent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProfileAdmin;
