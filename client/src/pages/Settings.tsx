'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Check, Bell, Moon, Sun, Globe, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
	const navigate = useNavigate();
	const { user, isLoading } = useAuth();
	const [success, setSuccess] = useState('');

	// Settings state
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [darkMode, setDarkMode] = useState(false);
	const [language, setLanguage] = useState('english');
	const [twoFactorAuth, setTwoFactorAuth] = useState(false);

	useEffect(() => {
		if (!user && !isLoading) {
			navigate('/login');
		}
	}, [user, isLoading]);

	const handleSaveSettings = () => {
		// In a real app, this would save settings to the backend
		setSuccess('Settings saved successfully');
		setTimeout(() => setSuccess(''), 3000);
	};

	if (!user && !isLoading) {
		return null; // Will redirect to login
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
				<Button onClick={() => navigate(-1)}>Back to Profile</Button>
			</div>

			<div className="space-y-6">
				{success && (
					<Alert className="bg-green-50 text-green-800 border-green-200">
						<Check className="h-4 w-4" />
						<AlertDescription>{success}</AlertDescription>
					</Alert>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>
							Manage how you receive notifications
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Bell className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="email-notifications">
									Email notifications
								</Label>
							</div>
							<Switch
								id="email-notifications"
								checked={emailNotifications}
								onCheckedChange={setEmailNotifications}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
						<CardDescription>
							Customize how the app looks
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								{darkMode ? (
									<Moon className="h-4 w-4 text-muted-foreground" />
								) : (
									<Sun className="h-4 w-4 text-muted-foreground" />
								)}
								<Label htmlFor="dark-mode">Dark mode</Label>
							</div>
							<Switch
								id="dark-mode"
								checked={darkMode}
								onCheckedChange={setDarkMode}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Language</CardTitle>
						<CardDescription>
							Choose your preferred language
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-2">
							<Globe className="h-4 w-4 text-muted-foreground" />
							<select
								value={language}
								onChange={(e) => setLanguage(e.target.value)}
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="english">English</option>
								<option value="spanish">Spanish</option>
								<option value="french">French</option>
								<option value="german">German</option>
							</select>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Security</CardTitle>
						<CardDescription>
							Manage your account security settings
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Shield className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="two-factor">
									Two-factor authentication
								</Label>
							</div>
							<Switch
								id="two-factor"
								checked={twoFactorAuth}
								onCheckedChange={setTwoFactorAuth}
							/>
						</div>
					</CardContent>
				</Card>

				<Button
					onClick={handleSaveSettings}
					className="w-full md:w-auto"
				>
					Save Settings
				</Button>
			</div>
		</div>
	);
}
