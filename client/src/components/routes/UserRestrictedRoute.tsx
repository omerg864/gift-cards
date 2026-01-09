import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface UserRestrictedRouteProps {
	children: React.ReactNode;
}

const UserRestrictedRoute = ({
	children,
}: UserRestrictedRouteProps) => {
    const { isAuthenticated } = useAuthStore();
	const [searchParams] = useSearchParams();

	if (isAuthenticated) {
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
