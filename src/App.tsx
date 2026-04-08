import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import WeBelieve from './pages/WeBelieve';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Leadership from "./pages/Leadership";
import Give from "./pages/Give";
import Events from "./pages/Events";
import Visit from "./pages/Visit";
import Sermons from "./pages/Sermons";
import Ministries from "./pages/Ministries";
import Prayer from "./pages/Prayer";

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
				<Route path="/:lang/prayer" element={<Prayer />} />
				<Route path="/:lang/give" element={<Give />} />
				<Route path="/:lang/events" element={<Events />} />
				<Route path="*" element={<Navigate to="/en" replace />} />
			</Routes>
			<Footer />
		</>
	);
}

function App() {
	const location = useLocation();
	const isAdmin = location.pathname.startsWith('/admin');

	return (
		<div className="App">
			{isAdmin ? (
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
