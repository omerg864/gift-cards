'use client';

import { useEffect, useState } from 'react';
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
import { Bell } from 'lucide-react';
import { Settings } from '../types/settings';
import Loading from '../components/loading';
import { getSettings, updateSettings } from '../services/settingsService';
import { toastError } from '../lib/utils';
import { toast } from 'react-toastify';

export default function SettingsPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<Partial<Settings>>({
		email1MonthNotification: true,
		email2MonthNotification: true,
	});

	const handleCheckboxChange = (name: keyof Settings, checked: boolean) => {
		setData((prevData) => ({
			...prevData,
			[name]: checked,
		}));
	};

	const handleSaveSettings = async () => {
		setIsLoading(true);
		try {
			await updateSettings(data);
			toast.success('Settings saved successfully');
		} catch (error) {
			console.error('Error saving settings:', error);
			toastError(error);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		const fetchSettings = async () => {
			setIsLoading(true);
			try {
				const settings = await getSettings();
				setData(settings);
			} catch (error) {
				console.error('Error fetching settings:', error);
				toastError(error);
			}
			setIsLoading(false);
		};

		fetchSettings();
	}, []);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold">Settings</h1>
			</div>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>1 Month Email Notification</CardTitle>
						<CardDescription>
							Notify me one month before my cards expire
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
								checked={data.email1MonthNotification}
								onCheckedChange={(checked) =>
									handleCheckboxChange(
										'email1MonthNotification',
										checked
									)
								}
							/>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>2 Month Email Notification</CardTitle>
						<CardDescription>
							Notify me two month before my cards expire
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
								checked={data.email2MonthNotification}
								onCheckedChange={(checked) =>
									handleCheckboxChange(
										'email2MonthNotification',
										checked
									)
								}
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
