import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { SiteTextRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateSiteTexts } from '../../data/useSiteTexts';

const TextsPage: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<SiteTextRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { en: string; uk: string }>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('site_texts')
      .select('*')
      .order('group', { ascending: true })
      .order('key', { ascending: true });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setRows((data ?? []) as SiteTextRow[]);
    invalidateSiteTexts();
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  const grouped = useMemo(() => {
    const out: Record<string, SiteTextRow[]> = {};
    for (const r of rows) {
      if (filter && !(r.key.includes(filter) || r.value_en.toLowerCase().includes(filter.toLowerCase()) || r.value_uk.toLowerCase().includes(filter.toLowerCase()))) continue;
      (out[r.group] ??= []).push(r);
    }
    return out;
  }, [rows, filter]);

  const valueOf = (r: SiteTextRow, lang: 'en' | 'uk') =>
    edits[r.id]?.[lang] ?? (lang === 'en' ? r.value_en : r.value_uk);

  const setEdit = (r: SiteTextRow, lang: 'en' | 'uk', v: string) => {
    setEdits((e) => ({
      ...e,
      [r.id]: { en: e[r.id]?.en ?? r.value_en, uk: e[r.id]?.uk ?? r.value_uk, [lang]: v },
    }));
  };

  const save = async (r: SiteTextRow) => {
    if (!supabase) return;
    const e = edits[r.id];
    if (!e) return;
    setSavingKey(r.key);
    const { error } = await supabase
      .from('site_texts')
      .update({ value_en: e.en, value_uk: e.uk })
      .eq('id', r.id);
    setSavingKey(null);
    if (error) { toast(error.message, 'error'); return; }
    toast('Saved', 'success');
    setEdits((m) => { const c = { ...m }; delete c[r.id]; return c; });
    refresh();
  };

  return (
    <>
      <h2>Site texts</h2>
      <div className="admin-card">
        <input
          placeholder="Search by key or text…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6 }}
        />
      </div>

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="admin-empty">No texts found. Run the seed script first.</div>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div
              className="admin-group-header"
              onClick={() => setOpenGroup((g) => (g === group ? null : group))}
            >
              <span>{group} <small style={{ color: '#64748b' }}>({items.length})</small></span>
              <span>{openGroup === group ? '▲' : '▼'}</span>
            </div>
            {openGroup === group && (
              <div className="admin-group-content">
                {items.map((r) => {
                  const dirty = !!edits[r.id];
                  return (
                    <div className="admin-card" key={r.id}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#475569', marginBottom: 8 }}>{r.key}</div>
                      <div className="admin-row">
                        <div className="admin-field">
                          <label>English</label>
                          <textarea value={valueOf(r, 'en')} onChange={(e) => setEdit(r, 'en', e.target.value)} />
                        </div>
                        <div className="admin-field">
                          <label>Ukrainian</label>
                          <textarea value={valueOf(r, 'uk')} onChange={(e) => setEdit(r, 'uk', e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="admin-btn"
                          disabled={!dirty || savingKey === r.key}
                          onClick={() => save(r)}
                        >
                          {savingKey === r.key ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
};

export default TextsPage;
