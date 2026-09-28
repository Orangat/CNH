import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate('/admin/leaders', { replace: true });
  };

  // Emails a reset link. It opens the Site URL (Supabase → Auth → URL Configuration), and
  // lib/authRedirect.ts forwards it to the set-password page — no Redirect URLs entry needed.
  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
      return;
    }
    if (!email) {
      setError('Enter your email above, then click “Forgot password?” again.');
      return;
    }
    setSending(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setSending(false);
    if (err) {
      setError(err.message);
      return;
    }
    setNotice(`If ${email} has an admin account, we've sent it a link to set a new password.`);
  };

  return (
    <div className="admin-root">
      <div className="admin-login-wrap">
        <form className="admin-login" onSubmit={handleSubmit}>
          <h1>Church of New Hope</h1>
          <p className="sub">Sign in to manage your church site</p>
          <div className="admin-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          {notice && <div style={{ color: 'var(--ok)', fontSize: 13, marginBottom: 12 }}>{notice}</div>}
          <button className="admin-btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button type="button" className="forgot" onClick={handleForgotPassword} disabled={sending}>
            {sending ? 'Sending…' : 'Forgot password?'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
