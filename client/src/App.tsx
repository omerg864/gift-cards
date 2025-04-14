import { Routes, Route } from 'react-router';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import CardDetails from './pages/CardDetails';
import SupplierDetails from './pages/SupplierDetails';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/Header';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPasswordPage from './pages/ForgotPassword';
import VerifyEmailPage from './pages/VerifyEmail';
import ResetPasswordPage from './pages/ResetPassword';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
	return (
		<>
			<ToastContainer theme="dark" />
			<GoogleOAuthProvider
				clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
			>
				<AuthProvider>
					<Header />
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/card/:id" element={<CardDetails />} />
						<Route
							path="/supplier/:id"
							element={<SupplierDetails />}
						/>
						<Route path="/login" element={<LoginPage />} />
						<Route path="/register" element={<RegisterPage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/settings" element={<SettingsPage />} />
						<Route
							path="/forgot-password"
							element={<ForgotPasswordPage />}
						/>
						<Route
							path="/verify-email"
							element={<VerifyEmailPage />}
						/>
						<Route
							path="/reset-password"
							element={<ResetPasswordPage />}
						/>
					</Routes>
				</AuthProvider>
			</GoogleOAuthProvider>
		</>
	);
}

export default App;
