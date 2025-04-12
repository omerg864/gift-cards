import { Routes, Route } from 'react-router';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import CardDetails from './pages/CardDetails';
import SupplierDetails from './pages/SupplierDetails';

function App() {
	return (
		<>
			<ToastContainer theme="dark" />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/card/:id" element={<CardDetails />} />
				<Route path="/supplier/:id" element={<SupplierDetails />} />
			</Routes>
		</>
	);
}

export default App;
