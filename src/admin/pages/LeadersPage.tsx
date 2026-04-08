import React, { useEffect, useState, useCallback } from 'react';
import { supabase, leaderPhotoUrl, LEADER_PHOTOS_BUCKET } from '../../lib/supabase';
import { LeaderRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateLeaders } from '../../data/useLeaders';
import LeaderForm from './LeaderForm';

const LeadersPage: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LeaderRow | null | undefined>(undefined); // undefined = closed

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('leaders')
      .select('*')
      .order('sort_order', { ascending: true });
    setLoading(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    setRows((data ?? []) as LeaderRow[]);
    invalidateLeaders();
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  const move = async (idx: number, dir: -1 | 1) => {
    const a = rows[idx];
    const b = rows[idx + dir];
    if (!a || !b || !supabase) return;
    const { error } = await supabase.from('leaders').upsert([
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ]);
    if (error) { toast(error.message, 'error'); return; }
    refresh();
  };

  const remove = async (row: LeaderRow) => {
    if (!supabase) return;
    if (!window.confirm(`Delete ${row.name_en}?`)) return;
    if (row.photo_path && !row.photo_path.startsWith('/') && !row.photo_path.startsWith('http')) {
      await supabase.storage.from(LEADER_PHOTOS_BUCKET).remove([row.photo_path]);
    }
    const { error } = await supabase.from('leaders').delete().eq('id', row.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deleted', 'success');
    refresh();
  };

  return (
    <>
      <h2>Leaders</h2>
      <div style={{ marginBottom: 16 }}>
        <button className="admin-btn" onClick={() => setEditing(null)}>+ Add leader</button>
      </div>
      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">No leaders yet. Run the seed script or add one above.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name (EN)</th>
              <th>Title (EN)</th>
              <th>Emails</th>
              <th>Published</th>
              <th>Order</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td><img className="admin-thumb" src={leaderPhotoUrl(r.photo_path)} alt="" /></td>
                <td>{r.name_en}</td>
                <td>{r.title_en}</td>
                <td>{r.emails?.length ?? 0}</td>
                <td>{r.is_published ? 'Yes' : 'No'}</td>
                <td>
                  <button className="admin-btn secondary" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>{' '}
                  <button className="admin-btn secondary" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>↓</button>
                </td>
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
        <LeaderForm
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => { setEditing(undefined); refresh(); }}
        />
      )}
    </>
  );
};

export default LeadersPage;
