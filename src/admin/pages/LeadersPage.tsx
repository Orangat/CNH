import React, { useEffect, useState, useCallback } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { supabase, leaderPhotoUrl, LEADER_PHOTOS_BUCKET } from '../../lib/supabase';
import { LeaderRow } from '../../data/types';
import { useToast } from '../components/Toast';
import { invalidateLeaders } from '../../data/useLeaders';
import LeaderForm from './LeaderForm';

const LeadersPage: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LeaderRow | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('leaders')
      .select('*')
      .order('sort_order', { ascending: true });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setRows((data ?? []) as LeaderRow[]);
    invalidateLeaders();
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleReorder = async (newOrder: LeaderRow[]) => {
    setRows(newOrder);
    if (!supabase) return;
    const results = await Promise.all(
      newOrder.map((r, i) =>
        supabase!.from('leaders').update({ sort_order: (i + 1) * 10 }).eq('id', r.id)
      )
    );
    const firstError = results.find((res) => res.error)?.error;
    if (firstError) {
      toast(firstError.message, 'error');
      refresh();
      return;
    }
    invalidateLeaders();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const newRows = [...rows];
    const [item] = newRows.splice(idx, 1);
    newRows.splice(idx + dir, 0, item);
    handleReorder(newRows);
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
        <>
          <div className="leader-list-header">
            <span className="leader-col-drag"></span>
            <span className="leader-col-photo">Photo</span>
            <span className="leader-col-name">Name (EN)</span>
            <span className="leader-col-title">Title (EN)</span>
            <span className="leader-col-pub">Published</span>
            <span className="leader-col-actions"></span>
          </div>
          <Reorder.Group
            axis="y"
            values={rows}
            onReorder={handleReorder}
            as="div"
            className="leader-list"
          >
            {rows.map((r, i) => (
              <LeaderItem
                key={r.id}
                row={r}
                index={i}
                total={rows.length}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onEdit={() => setEditing(r)}
                onDelete={() => remove(r)}
              />
            ))}
          </Reorder.Group>
        </>
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

interface LeaderItemProps {
  row: LeaderRow;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const LeaderItem: React.FC<LeaderItemProps> = ({ row, index, total, onMoveUp, onMoveDown, onEdit, onDelete }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={row}
      dragListener={false}
      dragControls={controls}
      as="div"
      className="leader-row"
      whileDrag={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)', scale: 1.01, zIndex: 10 }}
    >
      <span
        className="leader-col-drag leader-drag-handle"
        onPointerDown={(e) => controls.start(e)}
        title="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </span>
      <span className="leader-col-photo">
        <img className="admin-thumb" src={leaderPhotoUrl(row.photo_path)} alt="" />
      </span>
      <span className="leader-col-name">{row.name_en}</span>
      <span className="leader-col-title">{row.title_en}</span>
      <span className="leader-col-pub">{row.is_published ? 'Yes' : 'No'}</span>
      <span className="leader-col-actions">
        <button className="admin-btn secondary" onClick={onMoveUp} disabled={index === 0} title="Move up">↑</button>
        <button className="admin-btn secondary" onClick={onMoveDown} disabled={index === total - 1} title="Move down">↓</button>
        <button className="admin-btn secondary" onClick={onEdit}>Edit</button>
        <button className="admin-btn danger" onClick={onDelete}>Delete</button>
      </span>
    </Reorder.Item>
  );
};

export default LeadersPage;
