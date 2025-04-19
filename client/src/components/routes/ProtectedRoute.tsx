import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
	children: React.ReactNode;
	isAuthenticated: boolean;
}
const ProtectedRoute = ({ children, isAuthenticated }: ProtectedRouteProps) => {
	const path = window.location.pathname.slice(1);

	if (!isAuthenticated) {
		return (
			<Navigate
				to={path ? `/login?redirect=${path}` : '/login'}
				replace
			/>
		);
	}

	return children;
};

export default ProtectedRoute;
