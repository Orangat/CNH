import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase?.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <h1>Church admin</h1>
          <nav>
            <NavLink to="/admin/leaders" className={({ isActive }) => (isActive ? 'active' : '')}>Leaders</NavLink>
            <NavLink to="/admin/texts" className={({ isActive }) => (isActive ? 'active' : '')}>Texts</NavLink>
            <NavLink to="/admin/contact" className={({ isActive }) => (isActive ? 'active' : '')}>Contact info</NavLink>
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
