import React, { useEffect, useState, useCallback } from 'react';
import { supabase, MINISTRY_PHOTOS_BUCKET, ministryPhotoUrl } from '../../lib/supabase';
import { MinistryRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateMinistries } from '../../data/useMinistries';
import { PageHeader } from '../components/PageHeader';
import { Field } from '../components/Field';
import { Switch } from '../components/Switch';
import { Badge } from '../components/Badge';
import { StatusPill } from '../components/StatusPill';
import { PhotoUploader } from '../components/PhotoUploader';
import { GalleryUploader } from '../components/GalleryUploader';

const SERVE_TEAM_FORM = 'https://churchofnewhope.churchcenter.com/people/forms/922679';

const LANGUAGE_LABEL: Record<MinistryRow['language'], string> = {
  en: 'English',
  uk: 'Ukrainian',
  bilingual: 'Bilingual',
};

const empty: Partial<MinistryRow> = {
  slug: '', name_en: '', name_uk: '', description_en: '', description_uk: '',
  contact_email: '', meeting_info_en: '', meeting_info_uk: '',
  icon: 'users', sort_order: 0, is_published: true,
  photo_path: null, gallery: [], audience_en: '', audience_uk: '',
  language: 'bilingual', long_description_en: '', long_description_uk: '',
  leader_name: '', leader_role_en: '', leader_role_uk: '',
  location_en: '', location_uk: '',
  cta_url: '', cta_label_en: '', cta_label_uk: '', is_featured: false,
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
      <PageHeader
        eyebrow="Church life"
        title="Ministries"
        subtitle="Each ministry is a card on the site. Turn one off to hide it without deleting; star a few to give them their own page."
        action={<button className="admin-btn" onClick={() => setEditing({ ...empty })}>+ Add ministry</button>}
      />
      {loading ? <div className="admin-empty">Loading…</div> :
       rows.length === 0 ? <div className="admin-empty">No ministries yet. Add your first one.</div> : (
        <div style={{ marginTop: 18 }}>
        <table className="admin-table">
          <thead><tr><th>#</th><th>Photo</th><th>Ministry</th><th>Who it&rsquo;s for</th><th>Language</th><th>Meets</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="num">{r.sort_order}</td>
                <td>
                  {r.photo_path
                    ? <img className="admin-thumb" src={ministryPhotoUrl(r.photo_path)} alt="" />
                    : <span className="admin-thumb icon"><i className={`fas fa-${r.icon || 'users'}`} /></span>}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{r.is_featured && <span className="star">★ </span>}{r.name_en}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>/{r.slug}</div>
                </td>
                <td>{r.audience_en || <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                <td><Badge tone="lang">{LANGUAGE_LABEL[r.language] ?? 'Bilingual'}</Badge></td>
                <td>{r.meeting_info_en || <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                <td><StatusPill kind={r.is_published ? 'on' : 'off'}>{r.is_published ? 'Active' : 'Hidden'}</StatusPill></td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="admin-btn secondary sm" onClick={() => setEditing(r)}>Edit</button>
                    <button className="admin-btn danger sm" onClick={() => remove(r)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
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
      photo_path: f.photo_path ?? null,
      gallery: f.gallery ?? [],
      audience_en: f.audience_en ?? '', audience_uk: f.audience_uk ?? '',
      language: f.language ?? 'bilingual',
      long_description_en: f.long_description_en ?? '', long_description_uk: f.long_description_uk ?? '',
      leader_name: f.leader_name ?? '',
      leader_role_en: f.leader_role_en ?? '', leader_role_uk: f.leader_role_uk ?? '',
      location_en: f.location_en ?? '', location_uk: f.location_uk ?? '',
      cta_url: f.cta_url ?? '', cta_label_en: f.cta_label_en ?? '', cta_label_uk: f.cta_label_uk ?? '',
      is_featured: f.is_featured ?? false,
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

        {/* Basics */}
        <div className="form-sect">
          <div className="form-sect-h"><span className="lbl">Basics</span><span className="ln" /></div>
          <Field
            label="Web address (slug)" required
            help={<>Appears in the page address: <code>churchofnewhope.org/ministries/{f.slug || 'youth-ministry'}</code></>}
            tooltip={<>Short, lowercase, words joined by dashes. Change it and old links stop working.</>}
          >
            <input value={f.slug ?? ''} onChange={(e) => u('slug', e.target.value)} placeholder="youth-ministry" required />
          </Field>
          <div className="grid2">
            <Field label="Name (EN)" required><input value={f.name_en ?? ''} onChange={(e) => u('name_en', e.target.value)} required /></Field>
            <Field label="Name (UK)" required><input value={f.name_uk ?? ''} onChange={(e) => u('name_uk', e.target.value)} required /></Field>
          </div>
        </div>

        {/* On the card */}
        <div className="form-sect">
          <div className="form-sect-h"><span className="lbl">On the card</span><span className="ln" /><span className="hint">what a visitor sees in the grid</span></div>
          <div className="grid2">
            <Field label="Who it's for (EN)" help='One short line, e.g. "Kids ages 4–12".'><input value={f.audience_en ?? ''} onChange={(e) => u('audience_en', e.target.value)} placeholder="Kids ages 4–12" /></Field>
            <Field label="Who it's for (UK)" help="Коротко, напр. «Діти 4–12 років»."><input value={f.audience_uk ?? ''} onChange={(e) => u('audience_uk', e.target.value)} /></Field>
          </div>
          <div className="grid2">
            <Field
              label="Language of the group" help="What language this ministry runs in."
              tooltip={<>Shown as a badge so families can tell if a group is in <b>English</b>, <b>Ukrainian</b>, or both.</>}
            >
              <select value={f.language ?? 'bilingual'} onChange={(e) => u('language', e.target.value as MinistryRow['language'])}>
                <option value="en">English</option>
                <option value="uk">Ukrainian</option>
                <option value="bilingual">Bilingual</option>
              </select>
            </Field>
            <Field label="Meets" help='Day & time, e.g. "Sun · during service".'><input value={f.meeting_info_en ?? ''} onChange={(e) => u('meeting_info_en', e.target.value)} placeholder="Sun · during service" /></Field>
          </div>
          <div className="grid2">
            <Field label="Short description (EN)" help="One or two sentences for the card."><textarea value={f.description_en ?? ''} onChange={(e) => u('description_en', e.target.value)} /></Field>
            <Field label="Short description (UK)" help="Одне-два речення для картки."><textarea value={f.description_uk ?? ''} onChange={(e) => u('description_uk', e.target.value)} /></Field>
          </div>
        </div>

        {/* Photos */}
        <div className="form-sect">
          <div className="form-sect-h"><span className="lbl">Photos</span><span className="ln" /><span className="hint">real photos beat stock — a missing one falls back to an icon</span></div>
          <Field label="Card photo" optional help="The main image on the card and at the top of the page.">
            <PhotoUploader value={f.photo_path ?? null} bucket={MINISTRY_PHOTOS_BUCKET} onChange={(p) => u('photo_path', p)} />
          </Field>
          <Field
            label="Gallery" optional help="Add several photos at once — select multiple files or drop them together."
            tooltip={<>Gallery photos show on the ministry&rsquo;s own page. Only <b>flagship</b> ministries show a gallery.</>}
          >
            <GalleryUploader value={f.gallery ?? []} bucket={MINISTRY_PHOTOS_BUCKET} onChange={(g) => u('gallery', g)} />
          </Field>
        </div>

        {/* Flagship page */}
        <div className="form-sect">
          <div className="form-sect-h"><span className="lbl">Flagship page</span><span className="ln" /><span className="hint">only your 3–5 biggest ministries</span></div>
          <Switch
            checked={f.is_featured ?? false}
            onChange={(v) => u('is_featured', v)}
            title="Give this ministry its own page"
            description="When on, the leader, long description and gallery below show on a dedicated page. Keep this to a handful so pages don't go stale."
          />
          <div className="grid2" style={{ marginTop: 14 }}>
            <Field label="Leader — first name" optional help="First name only — friendly and private."><input value={f.leader_name ?? ''} onChange={(e) => u('leader_name', e.target.value)} /></Field>
            <Field label="Leader role (EN)" optional help={`e.g. "Children's Ministry Lead".`}><input value={f.leader_role_en ?? ''} onChange={(e) => u('leader_role_en', e.target.value)} /></Field>
          </div>
          <div className="grid2">
            <Field label="Location (EN)" optional help="Room or place, if useful."><input value={f.location_en ?? ''} onChange={(e) => u('location_en', e.target.value)} /></Field>
            <Field label="Leader role (UK)" optional><input value={f.leader_role_uk ?? ''} onChange={(e) => u('leader_role_uk', e.target.value)} /></Field>
          </div>
          <Field label="Long description (EN)" optional help="The fuller story for the ministry's page. Short is fine."><textarea value={f.long_description_en ?? ''} onChange={(e) => u('long_description_en', e.target.value)} /></Field>
          <Field label="Long description (UK)" optional><textarea value={f.long_description_uk ?? ''} onChange={(e) => u('long_description_uk', e.target.value)} /></Field>
        </div>

        {/* Call to action */}
        <div className="form-sect">
          <div className="form-sect-h"><span className="lbl">Call to action</span><span className="ln" /></div>
          <Field
            label="Button link (Church Center)" help="Where the button sends people. Defaults to your Serve Team form."
            tooltip={<>Paste a <b>Church Center</b> link — a form, a group, or the Serve Team form. Leave blank to use the Serve Team form.</>}
          >
            <input type="url" value={f.cta_url ?? ''} onChange={(e) => u('cta_url', e.target.value)} placeholder={SERVE_TEAM_FORM} />
          </Field>
          <div className="grid2">
            <Field label="Button label (EN)" optional help={'Blank = "I\'m interested".'}><input value={f.cta_label_en ?? ''} onChange={(e) => u('cta_label_en', e.target.value)} placeholder="I'm interested" /></Field>
            <Field label="Button label (UK)" optional help="Порожньо = «Мені цікаво»."><input value={f.cta_label_uk ?? ''} onChange={(e) => u('cta_label_uk', e.target.value)} placeholder="Мені цікаво" /></Field>
          </div>
        </div>

        {/* Visibility */}
        <div className="form-sect">
          <div className="form-sect-h"><span className="lbl">Visibility</span><span className="ln" /></div>
          <Switch
            checked={f.is_published ?? true}
            onChange={(v) => u('is_published', v)}
            title="Active — showing on the site"
            description="Turn off to hide this ministry from visitors without deleting it. Paused for the summer? Switch it off."
          />
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn" disabled={saving}>{saving ? 'Saving…' : 'Save ministry'}</button>
        </div>
      </form>
    </div>
  );
};

export default MinistriesPage;
