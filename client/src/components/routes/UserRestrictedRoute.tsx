import { Navigate, useSearchParams } from 'react-router-dom';

interface UserRestrictedRouteProps {
	children: React.ReactNode;
	isAuthenticated: boolean;
}

const UserRestrictedRoute = ({
	children,
	isAuthenticated,
}: UserRestrictedRouteProps) => {
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
