import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface ProtectedRouteProps {
	children: React.ReactNode;
}
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuthStore();
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
