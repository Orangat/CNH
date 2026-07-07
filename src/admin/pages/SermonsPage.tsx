import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { SermonRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateSermons } from '../../data/useSermons';
import { sermonThumbnail } from '../../lib/sermonThumbnail';
import { PageHeader } from '../components/PageHeader';
import { Field } from '../components/Field';
import { Switch } from '../components/Switch';

const SERMON_THUMBS_BUCKET = 'sermon-thumbs';

type Filter = 'published' | 'unpublished' | 'all';

const SermonsPage: React.FC = () => {
  const { toast } = useToast();
  const [allRows, setAllRows] = useState<SermonRow[]>([]);
  const [rows, setRows] = useState<SermonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<SermonRow> | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>('published');
  const [syncing, setSyncing] = useState(false);
  const [preview, setPreview] = useState<SermonRow | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('sermons').select('*')
      .order('preached_at', { ascending: false, nullsFirst: false });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setAllRows((data ?? []) as SermonRow[]);
    invalidateSermons();
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (filter === 'all') setRows(allRows);
    else if (filter === 'published') setRows(allRows.filter(r => r.is_published));
    else setRows(allRows.filter(r => !r.is_published));
  }, [filter, allRows]);

  const counts = {
    published: allRows.filter(r => r.is_published).length,
    unpublished: allRows.filter(r => !r.is_published).length,
    all: allRows.length,
  };

  const syncFromYouTube = async () => {
    if (!supabase) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-sermons');
      if (error) throw error;
      const result = data as { imported: number; updated: number; skipped: number };
      toast(`Synced: ${result.imported} new, ${result.updated} updated, ${result.skipped} skipped`, 'success');
      localStorage.setItem('lastSermonSync', JSON.stringify({ at: new Date().toISOString(), ...result }));
      refresh();
    } catch (err: any) {
      toast(`Sync failed: ${err.message}`, 'error');
    }
    setSyncing(false);
  };

  const remove = async (row: SermonRow) => {
    if (!supabase || !window.confirm(`Delete "${row.title_en}"?`)) return;
    if (row.custom_thumbnail_path) {
      await supabase.storage.from(SERMON_THUMBS_BUCKET).remove([row.custom_thumbnail_path]);
    }
    const { error } = await supabase.from('sermons').delete().eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deleted', 'success');
    refresh();
  };

  const togglePublish = async (row: SermonRow) => {
    if (!supabase) return;
    const { error } = await supabase.from('sermons')
      .update({ is_published: !row.is_published }).eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    refresh();
  };

  const lastSync = (() => {
    try {
      const raw = localStorage.getItem('lastSermonSync');
      if (!raw) return null;
      return JSON.parse(raw) as { at: string; imported: number; updated: number; skipped: number };
    } catch { return null; }
  })();

  const tabs: Array<{ key: Filter; label: string }> = [
    { key: 'published', label: 'Published' },
    { key: 'unpublished', label: 'Unpublished' },
    { key: 'all', label: 'All' },
  ];

  const empty: Partial<SermonRow> = {
    title_en: '', title_uk: '', speaker: '', series: '', scripture: '',
    description_en: '', description_uk: '', youtube_id: '',
    preached_at: null, is_published: true, sort_order: 0,
    thumbnail_url: '', custom_thumbnail_path: null,
    title_edited: false, auto_imported: false,
  };

  return (
    <>
      <PageHeader
        eyebrow="Teaching"
        title="Sermons"
        subtitle="Sermons shown on the site. Sync pulls the latest videos from your YouTube channel; you can also add one by hand."
      />
      <div style={{ display: 'flex', gap: 10, margin: '18px 0 12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="admin-btn" onClick={syncFromYouTube} disabled={syncing}>
          {syncing ? '⏳ Syncing…' : '🔄 Sync from YouTube'}
        </button>
        <button className="admin-btn" onClick={() => setEditing({ ...empty })}>+ Add sermon</button>
        {lastSync && (
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Last sync: {new Date(lastSync.at).toLocaleString()} · {lastSync.imported} new
          </span>
        )}
      </div>

      <div className="prayer-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`prayer-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            {counts[tab.key] > 0 && <span className="prayer-tab-count">{counts[tab.key]}</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="admin-empty">Loading…</div> :
       rows.length === 0 ? <div className="admin-empty">No sermons in this view.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((r) => (
            <div className="admin-card" key={r.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <img
                src={sermonThumbnail(r)}
                alt=""
                style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', background: '#0f172a' }}
                onClick={() => setPreview(r)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title_en}
                  </span>
                  {r.auto_imported && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#dbeafe', color: '#1e40af' }}>Auto</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {r.speaker || '—'} · {r.preached_at || '—'} · {r.is_published ? '✓ Published' : '✗ Hidden'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="admin-btn secondary" onClick={() => togglePublish(r)}>
                  {r.is_published ? 'Hide' : 'Publish'}
                </button>
                <button className="admin-btn secondary" onClick={() => setEditing(r)}>Edit</button>
                <button className="admin-btn danger" onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <SermonForm
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => { setEditing(undefined); refresh(); }}
        />
      )}

      <AnimatePresence>
        {preview && <SermonLightbox sermon={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </>
  );
};

// ─── Sermon Edit Form ─────────────────────────────────────────
const SermonForm: React.FC<{
  initial: Partial<SermonRow>;
  onClose: () => void;
  onSaved: () => void;
}> = ({ initial, onClose, onSaved }) => {
  const { toast } = useToast();
  const [f, setF] = useState<Partial<SermonRow>>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const originalTitle = useRef(initial.title_en ?? '');

  const u = <K extends keyof SermonRow>(k: K, v: SermonRow[K]) => setF((s) => ({ ...s, [k]: v }));

  const handleTitleChange = (val: string) => {
    u('title_en', val);
    // Auto-flag title_edited if admin changed the title from original
    if (val !== originalTitle.current && initial.auto_imported) {
      u('title_edited', true);
    }
  };

  const handleFile = async (file: File) => {
    if (!supabase) return;
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('sermon-thumbs')
      .upload(path, file, { upsert: false, contentType: file.type });
    setUploading(false);
    if (error) { toast(`Upload failed: ${error.message}`, 'error'); return; }
    u('custom_thumbnail_path', path);
    toast('Thumbnail uploaded', 'success');
  };

  const removeThumbnail = async () => {
    if (!f.custom_thumbnail_path) return;
    if (!window.confirm('Remove custom thumbnail? YouTube thumbnail will be shown instead.')) return;
    if (supabase) {
      await supabase.storage.from('sermon-thumbs').remove([f.custom_thumbnail_path]);
    }
    u('custom_thumbnail_path', null);
    toast('Custom thumbnail removed', 'success');
  };

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
      thumbnail_url: f.thumbnail_url ?? '',
      custom_thumbnail_path: f.custom_thumbnail_path ?? null,
      title_edited: f.title_edited ?? false,
      auto_imported: f.auto_imported ?? false,
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

        {initial.auto_imported && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#0369a1', marginBottom: 16 }}>
            Imported from YouTube on {initial.created_at ? new Date(initial.created_at).toLocaleDateString() : '—'}.
            {!initial.title_edited
              ? ' Title will auto-update from YouTube unless you edit it.'
              : ' Title was manually edited and will not be overwritten by sync.'}
          </div>
        )}

        <div className="admin-row">
          <div className="admin-field">
            <label>Title (EN) *</label>
            <input value={f.title_en ?? ''} onChange={(e) => handleTitleChange(e.target.value)} required />
          </div>
          <div className="admin-field">
            <label>Title (UK) *</label>
            <input value={f.title_uk ?? ''} onChange={(e) => u('title_uk', e.target.value)} required />
          </div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Speaker</label><input value={f.speaker ?? ''} onChange={(e) => u('speaker', e.target.value)} /></div>
          <div className="admin-field"><label>Series</label><input value={f.series ?? ''} onChange={(e) => u('series', e.target.value)} /></div>
        </div>
        <div className="admin-row">
          <div className="admin-field"><label>Scripture</label><input value={f.scripture ?? ''} onChange={(e) => u('scripture', e.target.value)} placeholder="John 3:16" /></div>
          <div className="admin-field"><label>Preached on</label><input type="date" value={f.preached_at ?? ''} onChange={(e) => u('preached_at', e.target.value)} /></div>
        </div>
        <Field
          label="YouTube video ID"
          required
          help="Paste a YouTube link or the 11-character video ID."
          tooltip={<>The ID is the part after <b>watch?v=</b> or <b>youtu.be/</b> — e.g. <b>dQw4w9WgXcQ</b>.</>}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={f.youtube_id ?? ''} onChange={(e) => u('youtube_id', e.target.value)} placeholder="dQw4w9WgXcQ" required style={{ flex: 1 }} />
            {f.youtube_id && (
              <a href={`https://www.youtube.com/watch?v=${f.youtube_id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent-ink)', whiteSpace: 'nowrap' }}>
                Open on YouTube ↗
              </a>
            )}
          </div>
        </Field>

        <div className="admin-field">
          <label>Custom thumbnail</label>
          <div
            className="upload-area"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }}
          >
            {f.custom_thumbnail_path ? (
              <img src={sermonThumbnail({ youtube_id: f.youtube_id ?? '', custom_thumbnail_path: f.custom_thumbnail_path })} alt="" style={{ maxWidth: 320, maxHeight: 180 }} />
            ) : f.youtube_id ? (
              <div>
                <img src={`https://img.youtube.com/vi/${f.youtube_id}/hqdefault.jpg`} alt="" style={{ maxWidth: 320, maxHeight: 180, opacity: 0.6 }} />
                <p style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>Using YouTube thumbnail. Click to upload custom.</p>
              </div>
            ) : (
              <p>Enter YouTube ID first, or click to upload a custom thumbnail</p>
            )}
            {uploading && <p style={{ marginTop: 8 }}>Uploading…</p>}
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
          </div>
          {f.custom_thumbnail_path && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button type="button" className="admin-btn secondary" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>Replace</button>
              <button type="button" className="admin-btn danger" onClick={(e) => { e.stopPropagation(); removeThumbnail(); }}>Remove custom</button>
            </div>
          )}
        </div>

        <div className="admin-field"><label>Description (EN)</label><textarea value={f.description_en ?? ''} onChange={(e) => u('description_en', e.target.value)} /></div>
        <div className="admin-field"><label>Description (UK)</label><textarea value={f.description_uk ?? ''} onChange={(e) => u('description_uk', e.target.value)} /></div>
        <div className="admin-field"><label>Sort order</label><input type="number" value={f.sort_order ?? 0} onChange={(e) => u('sort_order', parseInt(e.target.value, 10) || 0)} /></div>
        <Switch
          checked={f.is_published ?? true}
          onChange={(v) => u('is_published', v)}
          title="Published — visible on the site"
          description="Turn off to hide this sermon without deleting."
        />
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

// ─── Sermon Thumbnail Lightbox ────────────────────────────────
const SermonLightbox: React.FC<{ sermon: SermonRow; onClose: () => void }> = ({ sermon, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(4px)',
        padding: 24, cursor: 'zoom-out',
      }}
    >
      <img
        src={sermonThumbnail(sermon)}
        alt={sermon.title_en}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', cursor: 'default' }}
      />
    </motion.div>
  );
};

export default SermonsPage;
