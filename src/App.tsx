import React from 'react';
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

function App() {
	const location = useLocation();
	
	// Redirect root to /en if no language prefix
	if (location.pathname === '/') {
		return <Navigate to="/en" replace />;
	}

	return (
		<div className="App">
			<Header />
			<Routes>
				<Route path="/:lang" element={<Home />} />
				<Route path="/:lang/we-believe" element={<WeBelieve />} />
				<Route path="/:lang/leadership" element={<Leadership />} />
				<Route path="/:lang/give" element={<Give />} />
				<Route path="/:lang/events" element={<Events />} />
				<Route path="*" element={<Navigate to="/en" replace />} />
			</Routes>
			<Footer />
		</div>
	);
}

export default App;
