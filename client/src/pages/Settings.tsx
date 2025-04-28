'use client';

import { useState } from 'react';
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
import { Check, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
	const navigate = useNavigate();
	const [success, setSuccess] = useState('');

	// Settings state
	const [email1MonthNotifications, setEmail1MonthNotifications] =
		useState(true);
	const [email2MonthNotifications, setEmail2MonthNotifications] =
		useState(true);

	const handleSaveSettings = () => {
		// In a real app, this would save settings to the backend
		setSuccess('Settings saved successfully');
		setTimeout(() => setSuccess(''), 3000);
	};

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
						<CardTitle>1 Month Email Notification</CardTitle>
						<CardDescription>
							Notify me one month before my cards expires
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Bell className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="email1-notifications">
									Notifications
								</Label>
							</div>
							<Switch
								id="email1-notifications"
								checked={email1MonthNotifications}
								onCheckedChange={setEmail1MonthNotifications}
							/>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>2 Month Email Notification</CardTitle>
						<CardDescription>
							Notify me two month before my cards expires
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Bell className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="email2-notifications">
									Notifications
								</Label>
							</div>
							<Switch
								id="email2-notifications"
								checked={email2MonthNotifications}
								onCheckedChange={setEmail2MonthNotifications}
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
