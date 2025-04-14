'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
	CreditCard,
	LogOut,
	Settings,
	User,
	LogIn,
	UserPlus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	if (!mounted) return null;

	return (
		<header className="border-b bg-background">
			<div className="container mx-auto px-4 py-3 flex justify-between items-center">
				<Link to="/" className="flex items-center space-x-2">
					<CreditCard className="h-6 w-6 text-primary" />
					<span className="font-bold text-xl">Gift Card Manager</span>
				</Link>

				<div className="hidden md:block">
					{/* Navigation removed as requested */}
				</div>

				<div className="flex items-center space-x-4">
					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={user.avatar || ''}
											alt={user.name}
										/>
										<AvatarFallback>
											{user.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-56"
								align="end"
								forceMount
							>
								<div className="flex flex-col space-y-1 p-2">
									<p className="text-sm font-medium leading-none">
										{user.name}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user.email}
									</p>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										to="/profile"
										className="cursor-pointer flex w-full items-center"
									>
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										to="/"
										className="cursor-pointer flex w-full items-center"
									>
										<CreditCard className="mr-2 h-4 w-4" />
										<span>My Gift Cards</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										to="/settings"
										className="cursor-pointer flex w-full items-center"
									>
										<Settings className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="cursor-pointer"
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="flex items-center space-x-2">
							<Button variant="ghost" size="sm" asChild>
								<Link to="/login">
									<LogIn className="mr-2 h-4 w-4" />
									Log in
								</Link>
							</Button>
							<Button size="sm" asChild>
								<Link to="/register">
									<UserPlus className="mr-2 h-4 w-4" />
									Register
								</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
