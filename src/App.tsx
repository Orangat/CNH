import React from 'react';
import logo from './logo.svg';
import './App.css';
import Header from "./components/Header";
import {UpcomingServices} from './components/UpcompingServices';
import AboutChurchHome from "./components/AboutChurchHome";


function App() {
	const videoUrl = './assets/bg_video.mp4';

	return (
		<div className="App">
			<Header/>
			<UpcomingServices videoUrl={videoUrl}>
				<h1 className="overlay-title">SUNDAYS</h1>
				<p>Join us for services at<br/> 9:30AM (Ukrainian) <br/> 12:00PM (English)</p>
			</UpcomingServices>
			<AboutChurchHome/>
		</div>
	);
}

export default App;
