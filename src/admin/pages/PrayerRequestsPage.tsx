import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { PrayerRequestRow } from '../../data/types';
import { useToast } from '../components/Toast';

type Status = PrayerRequestRow['status'] | 'all';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new:      { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  praying:  { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
  answered: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  archived: { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const PrayerRequestsPage: React.FC = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<PrayerRequestRow[]>([]);
  const [allRows, setAllRows] = useState<PrayerRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>('new');

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    setAllRows((data ?? []) as PrayerRequestRow[]);
  }, [toast]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    setRows(filter === 'all' ? allRows : allRows.filter(r => r.status === filter));
  }, [filter, allRows]);

  const counts = {
    new: allRows.filter(r => r.status === 'new').length,
    praying: allRows.filter(r => r.status === 'praying').length,
    answered: allRows.filter(r => r.status === 'answered').length,
    archived: allRows.filter(r => r.status === 'archived').length,
    all: allRows.length,
  };

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
      <div className="prayer-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`prayer-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className="prayer-tab-count">{counts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="admin-empty">No requests in this view.</div>
      ) : (
        <div className="prayer-list">
          {rows.map((r) => (
            <PrayerCard
              key={r.id}
              row={r}
              onSetStatus={setStatus}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </>
  );
};

const PrayerCard: React.FC<{
  row: PrayerRequestRow;
  onSetStatus: (row: PrayerRequestRow, status: PrayerRequestRow['status']) => void;
  onDelete: (row: PrayerRequestRow) => void;
}> = ({ row, onSetStatus, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = STATUS_COLORS[row.status] || STATUS_COLORS.new;
  const isLong = row.request.length > 200;
  const displayText = isLong && !expanded ? row.request.slice(0, 200) + '…' : row.request;

  return (
    <div className="prayer-card" style={{ borderLeftColor: colors.border }}>
      <div className="prayer-card-header">
        <div className="prayer-card-meta">
          <span className="prayer-card-name">{row.name || 'Anonymous'}</span>
          {row.email && <span className="prayer-card-email">· {row.email}</span>}
          <span className="prayer-card-time">{timeAgo(row.created_at)}</span>
        </div>
        <div className="prayer-card-badges">
          {!row.share_with_team && (
            <span className="prayer-badge pastors-only">Pastors only</span>
          )}
          <span className="prayer-badge" style={{ background: colors.bg, color: colors.text }}>
            {row.status}
          </span>
        </div>
      </div>
      <p className="prayer-card-text">{displayText}</p>
      {isLong && (
        <button className="prayer-expand" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
      <div className="prayer-card-actions">
        {row.status !== 'praying' && <button className="admin-btn secondary" onClick={() => onSetStatus(row, 'praying')}>🙏 Praying</button>}
        {row.status !== 'answered' && <button className="admin-btn secondary" onClick={() => onSetStatus(row, 'answered')}>✓ Answered</button>}
        {row.status !== 'archived' && <button className="admin-btn secondary" onClick={() => onSetStatus(row, 'archived')}>Archive</button>}
        <button className="admin-btn danger" onClick={() => onDelete(row)}>Delete</button>
      </div>
    </div>
  );
};

export default PrayerRequestsPage;
