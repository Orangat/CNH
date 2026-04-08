import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { PrayerRequestRow } from '../../data/types';
import { useToast } from '../components/Toast';

type Status = PrayerRequestRow['status'] | 'all';

const PrayerRequestsPage: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<PrayerRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>('new');

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    let q = supabase.from('prayer_requests').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data, error } = await q;
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setRows((data ?? []) as PrayerRequestRow[]);
  }, [toast, filter]);

  useEffect(() => { refresh(); }, [refresh]);

  const setStatus = async (row: PrayerRequestRow, status: PrayerRequestRow['status']) => {
    if (!supabase) return;
    const { error } = await supabase.from('prayer_requests').update({ status }).eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Marked as ${status}`, 'success');
    refresh();
  };

  const remove = async (row: PrayerRequestRow) => {
    if (!supabase || !window.confirm('Delete this request? It cannot be undone.')) return;
    const { error } = await supabase.from('prayer_requests').delete().eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deleted', 'success');
    refresh();
  };

  const tabs: Array<{ key: Status; label: string }> = [
    { key: 'new', label: 'New' },
    { key: 'praying', label: 'Praying' },
    { key: 'answered', label: 'Answered' },
    { key: 'archived', label: 'Archived' },
    { key: 'all', label: 'All' },
  ];

  return (
    <>
      <h2>Prayer requests</h2>
      <div className="admin-card" style={{ display: 'flex', gap: 8 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`admin-btn ${filter === tab.key ? '' : 'secondary'}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">No requests in this view.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r) => (
            <div className="admin-card" key={r.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {r.name || 'Anonymous'}
                    {r.email && <span style={{ marginLeft: 8, fontWeight: 400, color: '#64748b' }}>· {r.email}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {new Date(r.created_at).toLocaleString()} · {r.share_with_team ? 'Shareable with prayer team' : 'Pastors only'}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background:
                      r.status === 'new' ? '#fef3c7' :
                      r.status === 'praying' ? '#dbeafe' :
                      r.status === 'answered' ? '#d1fae5' : '#e5e7eb',
                    color:
                      r.status === 'new' ? '#92400e' :
                      r.status === 'praying' ? '#1e40af' :
                      r.status === 'answered' ? '#065f46' : '#374151',
                  }}
                >
                  {r.status}
                </span>
              </div>
              <p style={{ marginTop: 12, whiteSpace: 'pre-wrap', color: '#334155' }}>{r.request}</p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {r.status !== 'praying' && <button className="admin-btn secondary" onClick={() => setStatus(r, 'praying')}>Mark praying</button>}
                {r.status !== 'answered' && <button className="admin-btn secondary" onClick={() => setStatus(r, 'answered')}>Answered</button>}
                {r.status !== 'archived' && <button className="admin-btn secondary" onClick={() => setStatus(r, 'archived')}>Archive</button>}
                <button className="admin-btn danger" onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PrayerRequestsPage;
