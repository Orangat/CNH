import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase?.auth.signOut();
    navigate('/v2/admin/login', { replace: true });
  };

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <h1>Church admin</h1>
          <nav>
            <NavLink to="/v2/admin/leaders" className={({ isActive }) => (isActive ? 'active' : '')}>Leaders</NavLink>
            <NavLink to="/v2/admin/sermons" className={({ isActive }) => (isActive ? 'active' : '')}>Sermons</NavLink>
            <NavLink to="/v2/admin/ministries" className={({ isActive }) => (isActive ? 'active' : '')}>Ministries</NavLink>
            <NavLink to="/v2/admin/prayer" className={({ isActive }) => (isActive ? 'active' : '')}>Prayer requests</NavLink>
            <NavLink to="/v2/admin/texts" className={({ isActive }) => (isActive ? 'active' : '')}>Texts</NavLink>
            <NavLink to="/v2/admin/contact" className={({ isActive }) => (isActive ? 'active' : '')}>Contact info</NavLink>
          </nav>
          <div className="spacer" />
          <button className="signout" onClick={signOut}>Sign out</button>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
