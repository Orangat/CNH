import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { MinistryRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateMinistries } from '../../data/useMinistries';

const empty: Partial<MinistryRow> = {
  slug: '', name_en: '', name_uk: '', description_en: '', description_uk: '',
  contact_email: '', meeting_info_en: '', meeting_info_uk: '',
  icon: 'users', sort_order: 0, is_published: true,
};

const MinistriesPage: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<MinistryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<MinistryRow> | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('ministries').select('*').order('sort_order');
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setRows((data ?? []) as MinistryRow[]);
    invalidateMinistries();
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (row: MinistryRow) => {
    if (!supabase || !window.confirm(`Delete "${row.name_en}"?`)) return;
    const { error } = await supabase.from('ministries').delete().eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deleted', 'success');
    refresh();
  };

  return (
    <>
      <h2>Ministries</h2>
      <div style={{ marginBottom: 16 }}>
        <button className="admin-btn" onClick={() => setEditing({ ...empty })}>+ Add ministry</button>
      </div>
      {loading ? <div className="admin-empty">Loading…</div> :
       rows.length === 0 ? <div className="admin-empty">No ministries yet.</div> : (
        <table className="admin-table">
          <thead><tr><th>Order</th><th>Name (EN)</th><th>Slug</th><th>Contact</th><th>Pub.</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.sort_order}</td>
                <td>{r.name_en}</td>
                <td><code style={{fontSize:12}}>{r.slug}</code></td>
                <td>{r.contact_email}</td>
                <td>{r.is_published ? 'Yes' : 'No'}</td>
                <td>
                  <button className="admin-btn secondary" onClick={() => setEditing(r)}>Edit</button>{' '}
                  <button className="admin-btn danger" onClick={() => remove(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing !== undefined && (
        <MinistryForm initial={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); refresh(); }} />
      )}
    </>
  );
};

const MinistryForm: React.FC<{ initial: Partial<MinistryRow>; onClose: () => void; onSaved: () => void }> = ({ initial, onClose, onSaved }) => {
  const { toast } = useToast();
  const [f, setF] = useState<Partial<MinistryRow>>(initial);
  const [saving, setSaving] = useState(false);
  const u = <K extends keyof MinistryRow>(k: K, v: MinistryRow[K]) => setF((s) => ({ ...s, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!f.slug || !f.name_en || !f.name_uk) {
      toast('Slug and name (both languages) are required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      slug: f.slug, name_en: f.name_en, name_uk: f.name_uk,
      description_en: f.description_en ?? '', description_uk: f.description_uk ?? '',
      contact_email: f.contact_email ?? '',
      meeting_info_en: f.meeting_info_en ?? '', meeting_info_uk: f.meeting_info_uk ?? '',
      icon: f.icon ?? 'users', sort_order: f.sort_order ?? 0,
      is_published: f.is_published ?? true,
    };
    const res = initial.id
      ? await supabase.from('ministries').update(payload).eq('id', initial.id)
      : await supabase.from('ministries').insert(payload);
    setSaving(false);
    if (res.error) { toast(res.error.message, 'error'); return; }
    toast('Saved', 'success');
    onSaved();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{initial.id ? 'Edit ministry' : 'Add ministry'}</h3>
        <div className="admin-field">
          <label>Slug *</label>
          <input value={f.slug ?? ''} onChange={(e) => u('slug', e.target.value)} placeholder="youth-ministry" required />
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Name (EN) *</label><input value={f.name_en ?? ''} onChange={(e) => u('name_en', e.target.value)} required /></div>
          <div className="admin-field"><label>Name (UK) *</label><input value={f.name_uk ?? ''} onChange={(e) => u('name_uk', e.target.value)} required /></div>
        </div>
        <div className="admin-field"><label>Description (EN)</label><textarea value={f.description_en ?? ''} onChange={(e) => u('description_en', e.target.value)} /></div>
        <div className="admin-field"><label>Description (UK)</label><textarea value={f.description_uk ?? ''} onChange={(e) => u('description_uk', e.target.value)} /></div>
        <div className="admin-row">
          <div className="admin-field"><label>Meeting info (EN)</label><input value={f.meeting_info_en ?? ''} onChange={(e) => u('meeting_info_en', e.target.value)} placeholder="Wednesdays 7pm" /></div>
          <div className="admin-field"><label>Meeting info (UK)</label><input value={f.meeting_info_uk ?? ''} onChange={(e) => u('meeting_info_uk', e.target.value)} /></div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Contact email</label><input type="email" value={f.contact_email ?? ''} onChange={(e) => u('contact_email', e.target.value)} /></div>
          <div className="admin-field"><label>Icon (Font Awesome)</label><input value={f.icon ?? ''} onChange={(e) => u('icon', e.target.value)} placeholder="users, music, child, hands-praying" /></div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Sort order</label><input type="number" value={f.sort_order ?? 0} onChange={(e) => u('sort_order', parseInt(e.target.value, 10) || 0)} /></div>
          <div className="admin-field">
            <label>Published</label>
            <select value={String(f.is_published ?? true)} onChange={(e) => u('is_published', e.target.value === 'true')}>
              <option value="true">Yes</option><option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default MinistriesPage;
