'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Business {
  id: string;
  name: string;
  industry: string;
}

interface MediaItem {
  id: string;
  file_url: string;
  file_type: string;
  title: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Business state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newIndustry, setNewIndustry] = useState('General');

  // Media Library state
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchMedia(selectedBusiness);
    } else {
      setMedia([]);
    }
  }, [selectedBusiness]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
    } else {
      setUser(session.user);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_archived', false);

    if (!error && data) {
      setBusinesses(data);
      if (data.length > 0 && !selectedBusiness) {
        setSelectedBusiness(data[0].id);
      }
    }
  };

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName.trim() || !user) return;

    const { data, error } = await supabase
      .from('businesses')
      .insert([{ name: newBusinessName, industry: newIndustry, user_id: user.id }])
      .select();

    if (!error && data) {
      setBusinesses([...businesses, data[0]]);
      setSelectedBusiness(data[0].id);
      setNewBusinessName('');
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (!error) {
      const updated = businesses.filter(b => b.id !== id);
      setBusinesses(updated);
      setSelectedBusiness(updated.length > 0 ? updated[0].id : '');
    }
  };

  const fetchMedia = async (businessId: string) => {
    const { data } = await supabase
      .from('media_library')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (data) setMedia(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBusiness) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${selectedBusiness}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Store record in Database
      await supabase.from('media_library').insert([{
        business_id: selectedBusiness,
        file_url: publicUrl,
        file_type: file.type.startsWith('video') ? 'video' : 'image',
        title: file.name
      }]);

      fetchMedia(selectedBusiness);
    }
    setUploading(false);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading Social Biz Pilot...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', color: '#1f2937' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', pb: '1rem', marginBottom: '2rem' }}>
        <h2>🚀 Social Biz Pilot</h2>
        <div>
          <span style={{ fontSize: '0.9rem', marginRight: '1rem', color: '#6b7280' }}>{user.email}</span>
          <button 
            onClick={handleSignOut}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Section 1: Business Switcher & Add Form */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <h3>🏢 Manage Businesses</h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 600 }}>Active Business:</label>
          <select 
            value={selectedBusiness} 
            onChange={(e) => setSelectedBusiness(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }}
          >
            {businesses.length === 0 && <option value="">No businesses yet</option>}
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.industry})</option>
            ))}
          </select>

          {selectedBusiness && (
            <button 
              onClick={() => handleDeleteBusiness(selectedBusiness)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer' }}
            >
              Delete Business
            </button>
          )}
        </div>

        {/* Add New Business Form */}
        <form onSubmit={handleAddBusiness} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="New Business Name" 
            value={newBusinessName}
            onChange={(e) => setNewBusinessName(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', flex: 1 }}
            required
          />
          <select 
            value={newIndustry} 
            onChange={(e) => setNewIndustry(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="General">General</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Retail">Retail</option>
          </select>
          <button 
            type="submit"
            style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            + Add Business
          </button>
        </form>
      </div>

      {/* Section 2: Business Creatives & Media Library */}
      {selectedBusiness && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3>📁 Creatives & Media Library</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              {uploading ? 'Uploading...' : '📤 Upload New Media'}
              <input type="file" onChange={handleFileUpload} accept="image/*,video/*" disabled={uploading} style={{ display: 'none' }} />
            </label>
          </div>

          {media.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No media uploaded for this business yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {media.map(item => (
                <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                  {item.file_type === 'image' ? (
                    <img src={item.file_url} alt={item.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  ) : (
                    <video src={item.file_url} controls style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#374151', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
