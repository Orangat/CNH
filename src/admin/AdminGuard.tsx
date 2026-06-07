import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type State =
  | { kind: 'loading' }
  | { kind: 'unauthenticated' }
  | { kind: 'unauthorized'; email: string }
  | { kind: 'authorized'; email: string };

const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setState({ kind: 'unauthenticated' });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) setState({ kind: 'unauthenticated' });
        return;
      }
      const { data: row, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !row) {
        setState({ kind: 'unauthorized', email: session.user.email ?? '' });
      } else {
        setState({ kind: 'authorized', email: session.user.email ?? '' });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (state.kind === 'loading') {
    return <div className="admin-root" style={{ padding: 40 }}>Checking session…</div>;
  }
  if (state.kind === 'unauthenticated') {
    return <Navigate to="/v2/admin/login" replace />;
  }
  if (state.kind === 'unauthorized') {
    return (
      <div className="admin-root" style={{ padding: 40 }}>
        <h2>Not authorized</h2>
        <p>{state.email} is signed in but is not an admin user.</p>
        <button
          className="admin-btn"
          onClick={async () => {
            await supabase?.auth.signOut();
            window.location.href = '/v2/admin/login';
          }}
        >
          Sign out
        </button>
      </div>
    );
  }
  return <>{children}</>;
};

export default AdminGuard;
