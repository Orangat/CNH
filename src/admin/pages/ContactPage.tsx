import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ContactInfoRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateContactInfo } from '../../data/useContactInfo';
import { PageHeader } from '../components/PageHeader';
import { Field } from '../components/Field';

const fields: Array<{ key: keyof ContactInfoRow; label: string; help?: string }> = [
  { key: 'address', label: 'Address', help: 'Full street address — shown on Visit and in the footer.' },
  { key: 'phone', label: 'Phone', help: 'e.g. (555) 123-4567' },
  { key: 'email', label: 'Email', help: 'Main church email address.' },
  { key: 'service_time_english', label: 'Service time (English)', help: 'e.g. Sundays 11:00 AM' },
  { key: 'service_time_ukrainian', label: 'Service time (Ukrainian)', help: 'e.g. Неділя 11:00' },
  { key: 'map_url', label: 'Google Maps URL', help: 'Full link to the church on Google Maps.' },
  { key: 'facebook_url', label: 'Facebook URL', help: 'Full URL, e.g. https://facebook.com/yourchurch' },
  { key: 'instagram_url', label: 'Instagram URL', help: 'Full URL, e.g. https://instagram.com/yourchurch' },
  { key: 'youtube_url', label: 'YouTube URL', help: 'Full YouTube channel URL.' },
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
      <PageHeader
        eyebrow="Details"
        title="Contact info"
        subtitle="Service times, address, phone, and social links shown across the site."
      />
      <div className="admin-card">
        {fields.map((f) => (
          <Field key={f.key} label={f.label} help={f.help}>
            <input
              value={(row[f.key] as string) ?? ''}
              onChange={(e) => update(f.key, e.target.value)}
            />
          </Field>
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
