import React, { useRef, useState } from 'react';
import { supabase, LEADER_PHOTOS_BUCKET, leaderPhotoUrl } from '../../lib/supabase';
import { LeaderRow } from '../../data/types';
import { useToast } from '../components/Toast';

interface Props {
  initial: Partial<LeaderRow> | null;
  onClose: () => void;
  onSaved: () => void;
}

const empty: Partial<LeaderRow> = {
  name_en: '', name_uk: '', title_en: '', title_uk: '',
  emails: [], photo_path: null, is_published: true, sort_order: 0,
};

const LeaderForm: React.FC<Props> = ({ initial, onClose, onSaved }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<LeaderRow>>({ ...empty, ...(initial ?? {}) });
  const [emailDraft, setEmailDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const update = <K extends keyof LeaderRow>(k: K, v: LeaderRow[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addEmail = () => {
    const e = emailDraft.trim();
    if (!e) return;
    update('emails', [...(form.emails ?? []), e]);
    setEmailDraft('');
  };

  const removeEmail = (i: number) => {
    update('emails', (form.emails ?? []).filter((_, idx) => idx !== i));
  };

  const handleFile = async (file: File) => {
    if (!supabase) {
      toast('Supabase not configured', 'error');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(LEADER_PHOTOS_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    setUploading(false);
    if (error) {
      toast(`Upload failed: ${error.message}`, 'error');
      return;
    }
    update('photo_path', path);
    toast('Photo uploaded', 'success');
  };

  const removePhoto = async () => {
    if (!form.photo_path) return;
    if (!window.confirm('Remove this photo? The monogram placeholder will be shown instead.')) return;
    // Only delete from Storage if it's a Supabase-managed path (not a /images/ static asset)
    if (supabase && !form.photo_path.startsWith('/') && !form.photo_path.startsWith('http')) {
      const { error } = await supabase.storage
        .from(LEADER_PHOTOS_BUCKET)
        .remove([form.photo_path]);
      if (error) {
        toast(`Storage delete failed: ${error.message}`, 'error');
        return;
      }
    }
    update('photo_path', null);
    toast('Photo removed', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!form.name_en || !form.name_uk || !form.title_en || !form.title_uk) {
      toast('Fill all required fields', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      name_en: form.name_en,
      name_uk: form.name_uk,
      title_en: form.title_en,
      title_uk: form.title_uk,
      emails: form.emails ?? [],
      photo_path: form.photo_path ?? null,
      is_published: form.is_published ?? true,
      sort_order: form.sort_order ?? 0,
    };
    let res;
    if (initial?.id) {
      res = await supabase.from('leaders').update(payload).eq('id', initial.id);
    } else {
      res = await supabase.from('leaders').insert(payload);
    }
    setSaving(false);
    if (res.error) {
      toast(`Save failed: ${res.error.message}`, 'error');
      return;
    }
    toast('Saved', 'success');
    onSaved();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{initial?.id ? 'Edit leader' : 'Add leader'}</h3>

        <div className="admin-row">
          <div className="admin-field">
            <label>Name (English) *</label>
            <input value={form.name_en ?? ''} onChange={(e) => update('name_en', e.target.value)} required />
          </div>
          <div className="admin-field">
            <label>Name (Ukrainian) *</label>
            <input value={form.name_uk ?? ''} onChange={(e) => update('name_uk', e.target.value)} required />
          </div>
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label>Title (English) *</label>
            <input value={form.title_en ?? ''} onChange={(e) => update('title_en', e.target.value)} required />
          </div>
          <div className="admin-field">
            <label>Title (Ukrainian) *</label>
            <input value={form.title_uk ?? ''} onChange={(e) => update('title_uk', e.target.value)} required />
          </div>
        </div>

        <div className="admin-field">
          <label>Emails</label>
          <div className="chip-input">
            {(form.emails ?? []).map((e, i) => (
              <span className="chip" key={i}>
                {e}
                <button type="button" onClick={() => removeEmail(i)}>×</button>
              </span>
            ))}
            <input
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addEmail();
                }
              }}
              onBlur={addEmail}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="admin-field">
          <label>Photo</label>
          <div
            className="upload-area"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            {form.photo_path ? (
              <img src={leaderPhotoUrl(form.photo_path)} alt="" />
            ) : (
              <p>Click or drop a photo here</p>
            )}
            {uploading && <p style={{ marginTop: 8 }}>Uploading…</p>}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
          {form.photo_path && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="admin-btn secondary"
                onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}
              >
                Replace photo
              </button>
              <button
                type="button"
                className="admin-btn danger"
                onClick={(e) => { e.stopPropagation(); removePhoto(); }}
              >
                Remove photo
              </button>
            </div>
          )}
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label>Sort order</label>
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => update('sort_order', parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="admin-field">
            <label>Published</label>
            <select
              value={String(form.is_published ?? true)}
              onChange={(e) => update('is_published', e.target.value === 'true')}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaderForm;
