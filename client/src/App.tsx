import { GoogleOAuthProvider } from '@react-oauth/google';
import { Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Header } from './components/Header';
import ProtectedRoute from './components/routes/ProtectedRoute';
import UserRestrictedRoute from './components/routes/UserRestrictedRoute';
import './globals.css';
import CardDetails from './pages/CardDetails';
import ConfirmEmailPage from './pages/ConfirmEmail';
import ForgotPasswordPage from './pages/ForgotPassword';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import ProfilePage from './pages/Profile';
import RegisterPage from './pages/Register';
import ResetPasswordPage from './pages/ResetPassword';
import SettingsPage from './pages/Settings';
import SupplierDetails from './pages/SupplierDetails';
import SuppliersList from './pages/SuppliersList';
import VerifyEmailPage from './pages/VerifyEmail';

function App() {
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
									path="/supplier/list"
									element={
										<ProtectedRoute>
											<SuppliersList />
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
								<Route
									path="/register"
									element={<RegisterPage />}
								/>
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
			</GoogleOAuthProvider>
		</>
	);
}

export default App;
