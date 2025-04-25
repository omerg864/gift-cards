import { Routes, Route } from 'react-router';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import CardDetails from './pages/CardDetails';
import SupplierDetails from './pages/SupplierDetails';
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
import { useAuth } from './hooks/useAuth';
import SuppliersList from './pages/SuppliersList';

function App() {
	const { isAuthenticated } = useAuth();
	return (
		<>
			<ToastContainer theme="dark" />
			<GoogleOAuthProvider
				clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
			>
				<Header />
							<Routes>
								<Route
									path="/"
									element={
										<ProtectedRoute
											isAuthenticated={isAuthenticated}
										>
											<Home />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/card/:id"
									element={
										<ProtectedRoute
											isAuthenticated={isAuthenticated}
										>
											<CardDetails />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/supplier/:id"
									element={
										<ProtectedRoute
											isAuthenticated={isAuthenticated}
										>
											<SupplierDetails />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/supplier/list"
									element={
										<ProtectedRoute
											isAuthenticated={isAuthenticated}
										>
											<SuppliersList />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/login"
									element={
										<UserRestrictedRoute
											isAuthenticated={isAuthenticated}
										>
											<LoginPage />
										</UserRestrictedRoute>
									}
								/>
								<Route
									path="/register"
									element={<RegisterPage />}
								/>
								<Route
									path="/profile"
									element={
										<ProtectedRoute
											isAuthenticated={isAuthenticated}
										>
											<ProfilePage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/settings"
									element={
										<ProtectedRoute
											isAuthenticated={isAuthenticated}
										>
											<SettingsPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/forgot-password"
									element={
										<UserRestrictedRoute
											isAuthenticated={isAuthenticated}
										>
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
										<UserRestrictedRoute
											isAuthenticated={isAuthenticated}
										>
											<VerifyEmailPage />
										</UserRestrictedRoute>
									}
								/>
								<Route
									path="/forgot/password/:token/:email"
									element={
										<UserRestrictedRoute
											isAuthenticated={isAuthenticated}
										>
											<ResetPasswordPage />
										</UserRestrictedRoute>
									}
								/>
							</Routes>
			</GoogleOAuthProvider>
		</>
	);
}

export default App;
