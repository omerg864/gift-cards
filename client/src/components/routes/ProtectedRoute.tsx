import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
	children: React.ReactNode;
}
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { user } = useAuth();
	const path = window.location.pathname.slice(1);

	if (!user) {
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
