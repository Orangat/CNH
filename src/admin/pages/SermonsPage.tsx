import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { SermonRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateSermons } from '../../data/useSermons';

const empty: Partial<SermonRow> = {
  title_en: '', title_uk: '', speaker: '', series: '', scripture: '',
  description_en: '', description_uk: '', youtube_id: '',
  preached_at: null, is_published: true, sort_order: 0,
};

const SermonsPage: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<SermonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SermonRow> | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('sermons').select('*')
      .order('preached_at', { ascending: false, nullsFirst: false });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setRows((data ?? []) as SermonRow[]);
    invalidateSermons();
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (row: SermonRow) => {
    if (!supabase || !window.confirm(`Delete "${row.title_en}"?`)) return;
    const { error } = await supabase.from('sermons').delete().eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deleted', 'success');
    refresh();
  };

  return (
    <>
      <h2>Sermons</h2>
      <div style={{ marginBottom: 16 }}>
        <button className="admin-btn" onClick={() => setEditing({ ...empty })}>+ Add sermon</button>
      </div>
      {loading ? <div className="admin-empty">Loading…</div> :
       rows.length === 0 ? <div className="admin-empty">No sermons yet.</div> : (
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Title</th><th>Speaker</th><th>Series</th><th>YouTube</th><th>Pub.</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.preached_at ?? '—'}</td>
                <td>{r.title_en}</td>
                <td>{r.speaker}</td>
                <td>{r.series}</td>
                <td><code style={{fontSize:12}}>{r.youtube_id}</code></td>
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
        <SermonForm initial={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); refresh(); }} />
      )}
    </>
  );
};

const SermonForm: React.FC<{ initial: Partial<SermonRow>; onClose: () => void; onSaved: () => void }> = ({ initial, onClose, onSaved }) => {
  const { toast } = useToast();
  const [f, setF] = useState<Partial<SermonRow>>(initial);
  const [saving, setSaving] = useState(false);
  const u = <K extends keyof SermonRow>(k: K, v: SermonRow[K]) => setF((s) => ({ ...s, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!f.title_en || !f.title_uk || !f.youtube_id) {
      toast('Title (both languages) and YouTube ID are required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      title_en: f.title_en, title_uk: f.title_uk,
      speaker: f.speaker ?? '', series: f.series ?? '', scripture: f.scripture ?? '',
      description_en: f.description_en ?? '', description_uk: f.description_uk ?? '',
      youtube_id: f.youtube_id, preached_at: f.preached_at || null,
      is_published: f.is_published ?? true, sort_order: f.sort_order ?? 0,
    };
    const res = initial.id
      ? await supabase.from('sermons').update(payload).eq('id', initial.id)
      : await supabase.from('sermons').insert(payload);
    setSaving(false);
    if (res.error) { toast(res.error.message, 'error'); return; }
    toast('Saved', 'success');
    onSaved();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{initial.id ? 'Edit sermon' : 'Add sermon'}</h3>
        <div className="admin-row">
          <div className="admin-field"><label>Title (EN) *</label><input value={f.title_en ?? ''} onChange={(e) => u('title_en', e.target.value)} required /></div>
          <div className="admin-field"><label>Title (UK) *</label><input value={f.title_uk ?? ''} onChange={(e) => u('title_uk', e.target.value)} required /></div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Speaker</label><input value={f.speaker ?? ''} onChange={(e) => u('speaker', e.target.value)} /></div>
          <div className="admin-field"><label>Series</label><input value={f.series ?? ''} onChange={(e) => u('series', e.target.value)} /></div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Scripture reference</label><input value={f.scripture ?? ''} onChange={(e) => u('scripture', e.target.value)} placeholder="John 3:16" /></div>
          <div className="admin-field"><label>Preached on</label><input type="date" value={f.preached_at ?? ''} onChange={(e) => u('preached_at', e.target.value)} /></div>
        </div>
        <div className="admin-field">
          <label>YouTube video ID *</label>
          <input value={f.youtube_id ?? ''} onChange={(e) => u('youtube_id', e.target.value)} placeholder="dQw4w9WgXcQ" required />
          <small style={{color:'#64748b',marginTop:4}}>The part after watch?v= in the URL</small>
        </div>
        <div className="admin-field"><label>Description (EN)</label><textarea value={f.description_en ?? ''} onChange={(e) => u('description_en', e.target.value)} /></div>
        <div className="admin-field"><label>Description (UK)</label><textarea value={f.description_uk ?? ''} onChange={(e) => u('description_uk', e.target.value)} /></div>
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

export default SermonsPage;
