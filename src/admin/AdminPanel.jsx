import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Boxes, ChevronRight, CircleDollarSign, FileText, Globe2, LayoutDashboard,
  LogOut, Menu, MessageSquareText, PackageCheck, Search, Settings, ShieldCheck,
  Truck, UserRound, UsersRound, X
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { adminRequest } from './admin-api';
import { AdminPage } from './AdminPages';

const ROUTES = new Set(['dashboard', 'quotes', 'inquiries', 'customers', 'orders', 'products', 'payments', 'reports', 'settings']);

function getRoute() {
  const segment = window.location.pathname.split('/').filter(Boolean)[1] || 'dashboard';
  return ROUTES.has(segment) ? segment : 'dashboard';
}

function navigate(path, replace = false) {
  if (replace) window.history.replaceState({}, '', path);
  else window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Brand({ compact = false }) {
  return (
    <a className={`erp-brand ${compact ? 'is-compact' : ''}`} href="/" aria-label="Essa Packages website">
      <img src="/images/essa-packages-logo.png" alt="Essa Packages" />
      {!compact && <span><b>Essa Packages</b><small>Operations</small></span>}
    </a>
  );
}

function LoginScreen({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      const access = await adminRequest(data.session, 'access');
      onAuthenticated(data.session, access.profile);
      navigate('/admin/dashboard', true);
    } catch (requestError) {
      await supabase?.auth.signOut();
      setError(requestError.message === 'Invalid login credentials'
        ? 'The email or password is incorrect.'
        : requestError.message || 'Sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="erp-login-page">
      <section className="erp-login-card">
        <Brand />
        <div className="erp-login-heading">
          <span><ShieldCheck size={16} /> Secure admin workspace</span>
          <h1>Sign in</h1>
          <p>Use an approved Essa Packages team account.</p>
        </div>
        {!isSupabaseConfigured ? (
          <div className="erp-message erp-message-error" role="alert">Supabase public settings are missing. Add them to the site environment before signing in.</div>
        ) : (
          <form className="erp-form" onSubmit={signIn}>
            <label>Email address<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required autoFocus /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
            {error && <div className="erp-message erp-message-error" role="alert">{error}</div>}
            <button className="erp-button erp-button-primary" disabled={loading}>{loading ? 'Verifying access…' : 'Open admin workspace'} <ChevronRight size={17} /></button>
          </form>
        )}
        <a className="erp-back-link" href="/">← Back to public website</a>
      </section>
    </main>
  );
}

const GROUPS = [
  { label: '', items: [{ route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Sales', items: [
    { route: 'inquiries', label: 'Inquiries', icon: MessageSquareText },
    { route: 'quotes', label: 'Quotes', icon: FileText },
    { route: 'customers', label: 'Customers', icon: UsersRound }
  ] },
  { label: 'Operations', items: [
    { route: 'orders', label: 'Orders', icon: Truck },
    { route: 'orders', query: '?status=Production', label: 'Production', icon: PackageCheck, exactQuery: true }
  ] },
  { label: 'Finance', items: [{ route: 'payments', label: 'Payments / Balances', icon: CircleDollarSign }] },
  { label: 'Catalog', items: [{ route: 'products', label: 'Products', icon: Boxes }] },
  { label: 'Insights', items: [{ route: 'reports', label: 'Reports', icon: BarChart3 }] },
  { label: 'System', items: [
    { route: 'settings', query: '?tab=content', label: 'Website Content', icon: Globe2, exactQuery: true },
    { route: 'settings', label: 'Settings', icon: Settings }
  ] }
];

function Sidebar({ route, open, onClose, profile, onLogout }) {
  const query = window.location.search;
  const initials = (profile.full_name || profile.email || 'EP').split(/\s|@/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return (
    <>
      {open && <button className="erp-sidebar-scrim" onClick={onClose} aria-label="Close menu" />}
      <aside className={`erp-sidebar ${open ? 'is-open' : ''}`}>
        <div className="erp-sidebar-head"><Brand /><button onClick={onClose} aria-label="Close menu"><X size={19} /></button></div>
        <nav className="erp-navigation" aria-label="Admin navigation">
          {GROUPS.map((group, groupIndex) => (
            <section key={group.label || groupIndex}>
              {group.label && <p>{group.label}</p>}
              {group.items.map(item => {
                const Icon = item.icon;
                const active = route === item.route && (item.exactQuery ? query === item.query : !query || item.route !== 'orders');
                return <button key={`${item.label}-${item.query || ''}`} className={active ? 'active' : ''} onClick={() => { navigate(`/admin/${item.route}${item.query || ''}`); onClose(); }}><Icon size={17} /><span>{item.label}</span></button>;
              })}
            </section>
          ))}
        </nav>
        <div className="erp-sidebar-profile">
          <span className="erp-avatar">{initials}</span>
          <span><b>{profile.full_name || profile.email.split('@')[0]}</b><small>{profile.role}</small></span>
          <button onClick={onLogout} aria-label="Log out"><LogOut size={17} /></button>
        </div>
      </aside>
    </>
  );
}

function Toasts({ items, dismiss }) {
  return <div className="erp-toasts" aria-live="polite">{items.map(item => <div key={item.id} className={`erp-toast ${item.type}`}><span>{item.message}</span><button onClick={() => dismiss(item.id)} aria-label="Dismiss"><X size={15} /></button></div>)}</div>;
}

function AdminWorkspace({ session, profile, onLogout }) {
  const [route, setRoute] = useState(getRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const sync = () => { setRoute(getRoute()); setSearch(''); };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const request = useCallback((resource, options) => adminRequest(session, resource, options), [session]);
  const notify = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(current => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts(current => current.filter(item => item.id !== id)), 4200);
  }, []);
  const title = useMemo(() => ({ dashboard: 'Dashboard', inquiries: 'Inquiries', quotes: 'Quotes', customers: 'Customers', orders: 'Orders', payments: 'Payments & balances', products: 'Products', reports: 'Reports', settings: 'System settings' })[route], [route]);

  return (
    <main className="erp-shell">
      <Sidebar route={route} open={menuOpen} onClose={() => setMenuOpen(false)} profile={profile} onLogout={onLogout} />
      <section className="erp-main">
        <header className="erp-topbar">
          <button className="erp-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="erp-topbar-title"><small>Essa Packages</small><b>{title}</b></div>
          {!['dashboard', 'reports', 'settings'].includes(route) && <label className="erp-search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${route}…`} aria-label={`Search ${route}`} /></label>}
          <a className="erp-site-link" href="/" target="_blank" rel="noreferrer"><Globe2 size={16} /> Website</a>
          <span className="erp-top-avatar"><UserRound size={17} /></span>
        </header>
        <AdminPage key={`${route}-${window.location.search}`} route={route} search={search} request={request} notify={notify} profile={profile} />
      </section>
      <Toasts items={toasts} dismiss={id => setToasts(current => current.filter(item => item.id !== id))} />
    </main>
  );
}

export function AdminPanel() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);

  const acceptSession = useCallback((nextSession, nextProfile) => {
    setSession(nextSession);
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    if (window.location.hash === '#admin') navigate('/admin/dashboard', true);
    if (!window.location.pathname.startsWith('/admin')) return;
    if (!isSupabaseConfigured) { setChecking(false); return; }

    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) { setChecking(false); return; }
      try {
        const access = await adminRequest(data.session, 'access');
        if (active) acceptSession(data.session, access.profile);
      } catch {
        await supabase.auth.signOut();
      } finally {
        if (active) setChecking(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') { setSession(null); setProfile(null); }
      if (event === 'TOKEN_REFRESHED' && nextSession) setSession(nextSession);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [acceptSession]);

  useEffect(() => {
    if (checking) return;
    const onLogin = window.location.pathname === '/admin/login';
    if (!session && !onLogin) navigate('/admin/login', true);
    if (session && (onLogin || window.location.pathname === '/admin')) navigate('/admin/dashboard', true);
  }, [checking, session]);

  const logout = async () => {
    await supabase?.auth.signOut();
    navigate('/admin/login', true);
  };

  if (checking) return <main className="erp-loading"><PackageCheck size={30} /><span>Verifying secure access…</span></main>;
  if (!session || !profile) return <LoginScreen onAuthenticated={acceptSession} />;
  return <AdminWorkspace session={session} profile={profile} onLogout={logout} />;
}
