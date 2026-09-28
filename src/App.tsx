import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import WeBelieve from './pages/WeBelieve';
import Leadership from './pages/Leadership';
import Give from './pages/Give';
import Events from './pages/Events';
import Visit from './pages/Visit';
import Sermons from './pages/Sermons';
import Ministries from './pages/Ministries';
import MinistryDetail from './pages/MinistryDetail';
import Prayer from './pages/Prayer';
import Forms from './pages/Forms';

const AdminApp = lazy(() => import('./admin/AdminApp'));

// Only /en/... and /uk/... are pages. Anything else in the language slot is a path that
// is missing its language (e.g. /visit), so send it to the English version of that path.
function LanguageGate() {
	const { lang } = useParams();
	const { pathname, search, hash } = useLocation();
	if (lang === 'en' || lang === 'uk') return <Outlet />;
	return <Navigate to={`/en${pathname}${search}${hash}`} replace />;
}

function PublicSite() {
	return (
		<>
			<Header />
			<Routes>
				<Route path="/:lang" element={<LanguageGate />}>
					<Route index element={<Home />} />
					<Route path="we-believe" element={<WeBelieve />} />
					<Route path="leadership" element={<Leadership />} />
					<Route path="visit" element={<Visit />} />
					<Route path="sermons" element={<Sermons />} />
					<Route path="ministries" element={<Ministries />} />
					<Route path="ministries/:slug" element={<MinistryDetail />} />
					<Route path="prayer" element={<Prayer />} />
					<Route path="give" element={<Give />} />
					<Route path="events" element={<Events />} />
					<Route path="forms" element={<Forms />} />
				</Route>
				<Route path="*" element={<Navigate to="/en" replace />} />
			</Routes>
			<Footer />
		</>
	);
}

// The redesign used to live under /v2 — send old links to the same page at the root.
// (Netlify also 301-redirects these in public/_redirects; this covers local dev.)
function StripV2Prefix() {
	const { pathname, search, hash } = useLocation();
	const target = pathname.replace(/^\/v2(?=\/|$)/, '') || '/';
	return <Navigate to={`${target}${search}${hash}`} replace />;
}

function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
}

function App() {
	const { pathname } = useLocation();
	const isOldV2Link = /^\/v2(\/|$)/.test(pathname);
	const isAdmin = /^\/admin(\/|$)/.test(pathname);

	return (
		<div className="App">
			<ScrollToTop />
			{isOldV2Link ? (
				<StripV2Prefix />
			) : isAdmin ? (
				<Suspense fallback={<div style={{ padding: 40 }}>Loading admin…</div>}>
					<Routes>
						<Route path="/admin/*" element={<AdminApp />} />
					</Routes>
				</Suspense>
			) : (
				<PublicSite />
			)}
		</div>
	);
}

export default App;
