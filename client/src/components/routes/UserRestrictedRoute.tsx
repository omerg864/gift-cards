import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface UserRestrictedRouteProps {
	children: React.ReactNode;
}

const UserRestrictedRoute = ({ children }: UserRestrictedRouteProps) => {
	const { user } = useAuth();
	const [searchParams] = useSearchParams();

	if (user) {
		return (
			<Navigate
				to={
					searchParams.get('redirect')
						? `/${searchParams.get('redirect')}`
						: '/'
				}
				replace
			/>
		);
	}

	return children;
};

export default UserRestrictedRoute;
