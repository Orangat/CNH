import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { emailLinkFailed } from '../lib/authRedirect';

const MIN_LENGTH = 8;

/**
 * Where invite and password-reset emails lead (see lib/authRedirect.ts). The link signs the
 * person in; here they choose the password they will use on the sign-in page. A signed-in
 * admin can also open this page directly to change their password.
 */
const SetPassword: React.FC = () => {
  const navigate = useNavigate();
  // undefined while the client is still reading the session from the link
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    // getSession() resolves only after the client has processed the link in the URL.
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The passwords don't match.");
      return;
    }
    setSaving(true);
    const { error: err } = await supabase!.auth.updateUser({ password });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate('/admin/leaders', { replace: true });
  };

  let content: React.ReactNode;
  if (emailLinkFailed || session === null) {
    content = (
      <>
        <p className="sub">
          This link has expired or was already used. On the sign-in page, click “Forgot password?” to get a new one.
        </p>
        <Link to="/admin/login" className="admin-btn" style={{ width: '100%' }}>
          Go to sign in
        </Link>
      </>
    );
  } else if (session === undefined) {
    content = <p className="sub">Checking your link…</p>;
  } else {
    content = (
      <form onSubmit={handleSubmit}>
        <p className="sub">Create a password for {session.user.email}</p>
        {/* lets password managers save the new password under the right account */}
        <input type="email" autoComplete="username" value={session.user.email ?? ''} readOnly hidden />
        <div className="admin-field">
          <label>New password</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="admin-field">
          <label>Repeat password</label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button className="admin-btn" type="submit" disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Saving…' : 'Save password'}
        </button>
      </form>
    );
  }

  return (
    <div className="admin-root">
      <div className="admin-login-wrap">
        <div className="admin-login">
          <h1>Church of New Hope</h1>
          {content}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
