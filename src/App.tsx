import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

function PublicSite() {
	return (
		<>
			<Header />
			<Routes>
				<Route path="/:lang" element={<Home />} />
				<Route path="/:lang/we-believe" element={<WeBelieve />} />
				<Route path="/:lang/leadership" element={<Leadership />} />
				<Route path="/:lang/visit" element={<Visit />} />
				<Route path="/:lang/sermons" element={<Sermons />} />
				<Route path="/:lang/ministries" element={<Ministries />} />
				<Route path="/:lang/ministries/:slug" element={<MinistryDetail />} />
				<Route path="/:lang/prayer" element={<Prayer />} />
				<Route path="/:lang/give" element={<Give />} />
				<Route path="/:lang/events" element={<Events />} />
				<Route path="/:lang/forms" element={<Forms />} />
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
