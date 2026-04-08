import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ContactInfoRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateContactInfo } from '../../data/useContactInfo';

const fields: Array<{ key: keyof ContactInfoRow; label: string; multiline?: boolean }> = [
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'service_time_english', label: 'Service time (English)' },
  { key: 'service_time_ukrainian', label: 'Service time (Ukrainian)' },
  { key: 'map_url', label: 'Google Maps URL' },
  { key: 'facebook_url', label: 'Facebook URL' },
  { key: 'instagram_url', label: 'Instagram URL' },
  { key: 'youtube_url', label: 'YouTube URL' },
];

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [row, setRow] = useState<ContactInfoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .maybeSingle();
      setLoading(false);
      if (error) { toast(error.message, 'error'); return; }
      setRow(data as ContactInfoRow);
    })();
  }, [toast]);

  const update = (k: keyof ContactInfoRow, v: string) =>
    setRow((r) => (r ? { ...r, [k]: v } : r));

  const save = async () => {
    if (!supabase || !row) return;
    setSaving(true);
    const { id, ...rest } = row;
    const { error } = await supabase.from('contact_info').update(rest).eq('id', id);
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    toast('Saved', 'success');
    invalidateContactInfo();
  };

  if (loading) return <div className="admin-empty">Loading…</div>;
  if (!row) return <div className="admin-empty">No contact_info row exists. Run the migration.</div>;

  return (
    <>
      <h2>Contact info</h2>
      <div className="admin-card">
        {fields.map((f) => (
          <div className="admin-field" key={f.key}>
            <label>{f.label}</label>
            <input
              value={(row[f.key] as string) ?? ''}
              onChange={(e) => update(f.key, e.target.value)}
            />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="admin-btn" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
