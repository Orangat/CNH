import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Legacy (old design) imports
import LegacyHeader from './components/legacy/Header';
import LegacyFooter from './components/legacy/Footer';
import LegacyHome from './pages/legacy/Home';
import LegacyWeBelieve from './pages/legacy/WeBelieve';
import LegacyLeadership from './pages/legacy/Leadership';
import LegacyGive from './pages/legacy/Give';
import LegacyEvents from './pages/legacy/Events';

// V2 (redesign) imports
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
import Prayer from './pages/Prayer';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function LegacySite() {
	return (
		<>
			<LegacyHeader />
			<Routes>
				<Route path="/:lang" element={<LegacyHome />} />
				<Route path="/:lang/we-believe" element={<LegacyWeBelieve />} />
				<Route path="/:lang/leadership" element={<LegacyLeadership />} />
				<Route path="/:lang/give" element={<LegacyGive />} />
				<Route path="/:lang/events" element={<LegacyEvents />} />
				<Route path="*" element={<Navigate to="/en" replace />} />
			</Routes>
			<LegacyFooter />
		</>
	);
}

function V2Site() {
	return (
		<>
			<Header />
			<Routes>
				<Route path="/v2/:lang" element={<Home />} />
				<Route path="/v2/:lang/we-believe" element={<WeBelieve />} />
				<Route path="/v2/:lang/leadership" element={<Leadership />} />
				<Route path="/v2/:lang/visit" element={<Visit />} />
				<Route path="/v2/:lang/sermons" element={<Sermons />} />
				<Route path="/v2/:lang/ministries" element={<Ministries />} />
				<Route path="/v2/:lang/prayer" element={<Prayer />} />
				<Route path="/v2/:lang/give" element={<Give />} />
				<Route path="/v2/:lang/events" element={<Events />} />
				<Route path="/v2/*" element={<Navigate to="/v2/en" replace />} />
			</Routes>
			<Footer />
		</>
	);
}

function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
}

function App() {
	const location = useLocation();
	const isAdmin = location.pathname.startsWith('/v2/admin');
	const isV2 = location.pathname.startsWith('/v2');

	return (
		<div className="App">
			<ScrollToTop />
			{isAdmin ? (
				<Suspense fallback={<div style={{ padding: 40 }}>Loading admin…</div>}>
					<Routes>
						<Route path="/v2/admin/*" element={<AdminApp />} />
					</Routes>
				</Suspense>
			) : isV2 ? (
				<V2Site />
			) : (
				<LegacySite />
			)}
		</div>
	);
}

export default App;
