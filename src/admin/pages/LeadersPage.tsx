import React, { useEffect, useState, useCallback } from 'react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
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
  const [preview, setPreview] = useState<LeaderRow | null>(null);

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
                onPhotoClick={() => setPreview(r)}
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

      <AnimatePresence>
        {preview && <PhotoLightbox leader={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </>
  );
};

const PhotoLightbox: React.FC<{ leader: LeaderRow; onClose: () => void }> = ({ leader, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo of ${leader.name_en}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(4px)',
        padding: 24, cursor: 'zoom-out',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', color: '#fff',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, lineHeight: 1,
        }}
      >
        ×
      </button>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '80vw', maxHeight: '80vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          cursor: 'default',
        }}
      >
        <img
          src={leaderPhotoUrl(leader.photo_path)}
          alt={leader.name_en}
          style={{
            maxWidth: '100%', maxHeight: '70vh',
            objectFit: 'contain',
            border: '4px solid rgba(255,255,255,0.1)',
          }}
        />
        <div style={{ marginTop: 16, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{leader.name_en}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: '#cbd5e1' }}>{leader.title_en}</div>
        </div>
      </motion.div>
    </motion.div>
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
  onPhotoClick: () => void;
}

const LeaderItem: React.FC<LeaderItemProps> = ({ row, index, total, onMoveUp, onMoveDown, onEdit, onDelete, onPhotoClick }) => {
  const controls = useDragControls();
  const hasPhoto = Boolean(row.photo_path);

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
        <img
          className="admin-thumb"
          src={leaderPhotoUrl(row.photo_path)}
          alt=""
          onClick={hasPhoto ? onPhotoClick : undefined}
          style={{ cursor: hasPhoto ? 'zoom-in' : 'default' }}
          title={hasPhoto ? 'Click to enlarge' : undefined}
        />
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
