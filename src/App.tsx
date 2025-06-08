import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import WeBelieve from './pages/WeBelieve';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Leadership from "./pages/Leadership";

function App() {
	return (
		<div className="App">
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/we-believe" element={<WeBelieve />} />
				<Route path="/leadership" element={<Leadership />} />
			</Routes>
			<Footer />
		</div>
	);
}

export default App;
