'use client';

import { Settings } from '@shared/types/settings.types';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../components/loading';
import { Button } from '../components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useGetSettings, useUpdateSettings } from '../hooks/useSettingsQuery';
import { toastError } from '../lib/utils';

export default function SettingsPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<Partial<Settings>>({
		email1MonthNotification: true,
		email2MonthNotification: true,
		emailOnNewDevice: true,
	});

	const { data: settings, isLoading: loadingSettings } = useGetSettings();
	const updateSettingsMutation = useUpdateSettings();

	useEffect(() => {
		if (settings) {
			setData(settings);
		}
	}, [settings]);

	const handleCheckboxChange = (name: keyof Settings, checked: boolean) => {
		setData((prevData) => ({
			...prevData,
			[name]: checked,
		}));
	};

	const handleSaveSettings = async () => {
		setIsLoading(true);
		try {
			await updateSettingsMutation.mutateAsync(data);
			toast.success('Settings saved successfully');
		} catch (error) {
			console.error('Error saving settings:', error);
			toastError(error);
		}
		setIsLoading(false);
	};

	if (isLoading || loadingSettings) {
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

				<Card>
					<CardHeader>
						<CardTitle>New Device Email Notification</CardTitle>
						<CardDescription>
							Notify me when a new device is used to log in
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Bell className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="device-notifications">
									Notifications
								</Label>
							</div>
							<Switch
								id="device-notifications"
								checked={data.email2MonthNotification}
								onCheckedChange={(checked) =>
									handleCheckboxChange(
										'emailOnNewDevice',
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
