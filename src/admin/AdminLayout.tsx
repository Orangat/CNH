import React, { useEffect, useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ICONS: Record<string, ReactNode> = {
  leaders: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3" /><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" /><path d="M16 4a3 3 0 0 1 0 6" /></svg>),
  sermons: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4v16l7-4 7 4V4z" /></svg>),
  ministries: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /></svg>),
  prayer: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /></svg>),
  texts: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h14v16l-7-4-7 4z" /><path d="M8 8h8M8 12h5" /></svg>),
  contact: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>),
};

const NAV = [
  { to: '/v2/admin/leaders', label: 'Leaders', icon: ICONS.leaders },
  { to: '/v2/admin/sermons', label: 'Sermons', icon: ICONS.sermons },
  { to: '/v2/admin/ministries', label: 'Ministries', icon: ICONS.ministries },
  { to: '/v2/admin/prayer', label: 'Prayer requests', icon: ICONS.prayer },
  { to: '/v2/admin/texts', label: 'Texts', icon: ICONS.texts },
  { to: '/v2/admin/contact', label: 'Contact info', icon: ICONS.contact },
];

const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  const signOut = async () => {
    await supabase?.auth.signOut();
    navigate('/v2/admin/login', { replace: true });
  };

  const initials = email ? email.slice(0, 2).toUpperCase() : '·';

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="brand">
            <div className="k">Church of<br />New Hope</div>
            <div className="s">Admin</div>
          </div>
          <nav className="nav">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.icon}
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="spacer" />
          <div className="side-foot">
            {email && (
              <div className="who"><span className="av">{initials}</span><span>{email}</span></div>
            )}
            <button className="signout" onClick={signOut}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" /></svg>
              Sign out
            </button>
          </div>
        </aside>
        <main className="admin-main"><div className="admin-content">{children}</div></main>
      </div>
    </div>
  );
};

export default AdminLayout;
