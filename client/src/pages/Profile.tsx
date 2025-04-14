'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { AlertCircle, Check, User, Lock, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user, updateUser, isLoading } = useAuth();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [activeTab, setActiveTab] = useState('profile');

	useEffect(() => {
		if (!user && !isLoading) {
			navigate('/login');
			return;
		}

		if (user) {
			setName(user.name);
			setEmail(user.email);
		}
	}, [user, isLoading]);

	const handleProfileUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!name || !email) {
			setError('Name and email are required');
			return;
		}

		try {
			updateUser({ name, email });
			setSuccess('Profile updated successfully');
		} catch (err) {
			setError('Failed to update profile');
			console.error(err);
		}
	};

	const handlePasswordUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!currentPassword || !newPassword || !confirmPassword) {
			setError('All password fields are required');
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('New passwords do not match');
			return;
		}

		// In a real app, this would validate the current password and update with the new one
		setSuccess('Password updated successfully');
		setCurrentPassword('');
		setNewPassword('');
		setConfirmPassword('');
	};

	if (!user && !isLoading) {
		return null; // Will redirect to login
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Your Profile</h1>

			<div className="grid md:grid-cols-[250px_1fr] gap-8">
				<div className="space-y-6">
					<Card>
						<CardContent className="p-6">
							<div className="flex flex-col items-center space-y-4">
								<Avatar className="h-24 w-24">
									<AvatarImage
										src={user?.avatar || ''}
										alt={user?.name || ''}
									/>
									<AvatarFallback className="text-2xl">
										{user?.name.charAt(0).toUpperCase() ||
											'U'}
									</AvatarFallback>
								</Avatar>
								<div className="text-center">
									<h2 className="text-xl font-bold">
										{user?.name}
									</h2>
									<p className="text-sm text-muted-foreground">
										{user?.email}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="hidden md:block">
						<div className="space-y-2">
							<Button
								variant={
									activeTab === 'profile'
										? 'default'
										: 'ghost'
								}
								className="w-full justify-start"
								onClick={() => setActiveTab('profile')}
							>
								<User className="mr-2 h-4 w-4" />
								Profile Information
							</Button>
							<Button
								variant={
									activeTab === 'password'
										? 'default'
										: 'ghost'
								}
								className="w-full justify-start"
								onClick={() => setActiveTab('password')}
							>
								<Lock className="mr-2 h-4 w-4" />
								Change Password
							</Button>
							<Button
								variant={
									activeTab === 'cards' ? 'default' : 'ghost'
								}
								className="w-full justify-start"
								onClick={() => setActiveTab('cards')}
							>
								<CreditCard className="mr-2 h-4 w-4" />
								My Gift Cards
							</Button>
						</div>
					</div>
				</div>

				<div>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="md:hidden grid w-full grid-cols-3">
							<TabsTrigger value="profile">Profile</TabsTrigger>
							<TabsTrigger value="password">Password</TabsTrigger>
							<TabsTrigger value="cards">Cards</TabsTrigger>
						</TabsList>

						<TabsContent value="profile">
							<Card>
								<CardHeader>
									<CardTitle>Profile Information</CardTitle>
									<CardDescription>
										Update your personal information
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form
										onSubmit={handleProfileUpdate}
										className="space-y-4"
									>
										{error && (
											<Alert variant="destructive">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription>
													{error}
												</AlertDescription>
											</Alert>
										)}
										{success && (
											<Alert className="bg-green-50 text-green-800 border-green-200">
												<Check className="h-4 w-4" />
												<AlertDescription>
													{success}
												</AlertDescription>
											</Alert>
										)}
										<div className="space-y-2">
											<Label htmlFor="name">Name</Label>
											<Input
												id="name"
												value={name}
												onChange={(e) =>
													setName(e.target.value)
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												value={email}
												onChange={(e) =>
													setEmail(e.target.value)
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="avatar">
												Profile Picture
											</Label>
											<div className="flex items-center space-x-4">
												<Avatar className="h-12 w-12">
													<AvatarImage
														src={user?.avatar || ''}
														alt={user?.name || ''}
													/>
													<AvatarFallback>
														{user?.name
															.charAt(0)
															.toUpperCase() ||
															'U'}
													</AvatarFallback>
												</Avatar>
												<Button
													type="button"
													variant="outline"
													size="sm"
												>
													Change
												</Button>
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												Recommended: Square image, at
												least 300x300px
											</p>
										</div>
										<Button type="submit">
											Save Changes
										</Button>
									</form>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="password">
							<Card>
								<CardHeader>
									<CardTitle>Change Password</CardTitle>
									<CardDescription>
										Update your password
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form
										onSubmit={handlePasswordUpdate}
										className="space-y-4"
									>
										{error && (
											<Alert variant="destructive">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription>
													{error}
												</AlertDescription>
											</Alert>
										)}
										{success && (
											<Alert className="bg-green-50 text-green-800 border-green-200">
												<Check className="h-4 w-4" />
												<AlertDescription>
													{success}
												</AlertDescription>
											</Alert>
										)}
										<div className="space-y-2">
											<Label htmlFor="currentPassword">
												Current Password
											</Label>
											<Input
												id="currentPassword"
												type="password"
												value={currentPassword}
												onChange={(e) =>
													setCurrentPassword(
														e.target.value
													)
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="newPassword">
												New Password
											</Label>
											<Input
												id="newPassword"
												type="password"
												value={newPassword}
												onChange={(e) =>
													setNewPassword(
														e.target.value
													)
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="confirmPassword">
												Confirm New Password
											</Label>
											<Input
												id="confirmPassword"
												type="password"
												value={confirmPassword}
												onChange={(e) =>
													setConfirmPassword(
														e.target.value
													)
												}
												required
											/>
										</div>
										<Button type="submit">
											Update Password
										</Button>
									</form>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="cards">
							<Card>
								<CardHeader>
									<CardTitle>My Gift Cards</CardTitle>
									<CardDescription>
										Manage your gift card collection
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="text-center py-8">
										<CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
										<h3 className="text-lg font-medium mb-2">
											View your gift cards
										</h3>
										<p className="text-muted-foreground mb-4">
											Go to the home page to view and
											manage all your gift cards
										</p>
										<Button asChild>
											<a href="/">View Gift Cards</a>
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
