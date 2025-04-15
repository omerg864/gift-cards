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
import ConfirmEmailPage from './pages/ConfirmEmail';
import ProtectedRoute from './components/routes/ProtectedRoute';
import UserRestrictedRoute from './components/routes/UserRestrictedRoute';

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
						<Route
							path="/"
							element={
								<ProtectedRoute>
									<Home />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/card/:id"
							element={
								<ProtectedRoute>
									<CardDetails />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/supplier/:id"
							element={
								<ProtectedRoute>
									<SupplierDetails />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/login"
							element={
								<UserRestrictedRoute>
									<LoginPage />
								</UserRestrictedRoute>
							}
						/>
						<Route path="/register" element={<RegisterPage />} />
						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<ProfilePage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/settings"
							element={
								<ProtectedRoute>
									<SettingsPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/forgot-password"
							element={
								<UserRestrictedRoute>
									<ForgotPasswordPage />
								</UserRestrictedRoute>
							}
						/>
						<Route
							path="/verify/:token"
							element={<ConfirmEmailPage />}
						/>
						<Route
							path="/verify-email"
							element={
								<UserRestrictedRoute>
									<VerifyEmailPage />
								</UserRestrictedRoute>
							}
						/>
						<Route
							path="/forgot/password/:token/:email"
							element={
								<UserRestrictedRoute>
									<ResetPasswordPage />
								</UserRestrictedRoute>
							}
						/>
					</Routes>
				</AuthProvider>
			</GoogleOAuthProvider>
		</>
	);
}

export default App;
