import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Laptop, Smartphone, Tablet, Monitor, LogOut } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { DEVICE_ID } from '../lib/constants';
import Loading from './loading';
import {
	getConnectedDevices as getConnectedDevicesFromServer,
	disconnectDevice as disconnectDeviceServer,
	disconnectAllDevices as disconnectAllDevicesServer,
} from '../services/userService';
import { toastError } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

interface Device {
	createdAt: string;
	device_id: string;
	name: string;
	type: string;
}

export function ConnectedDevicesTab() {
	const deviceId = localStorage.getItem(DEVICE_ID) || '';
	const [devices, setDevices] = useState<Device[]>([]);
	const [loading, setLoading] = useState(true);
	const { logout } = useAuth();

	useEffect(() => {
		const getConnectedDevices = async () => {
			try {
				const devices = await getConnectedDevicesFromServer();
				setDevices(devices);
			} catch (error) {
				console.error('Error fetching connected devices:', error);
				toastError(error);
			} finally {
				setLoading(false);
			}
		};

		getConnectedDevices();
	}, []);

	const getDeviceIcon = (type: string) => {
		switch (type) {
			case 'desktop':
				return <Monitor className="h-8 w-8 text-primary" />;
			case 'mobile':
				return <Smartphone className="h-8 w-8 text-primary" />;
			case 'tablet':
				return <Tablet className="h-8 w-8 text-primary" />;
			default:
				return <Laptop className="h-8 w-8 text-primary" />;
		}
	};

	const disconnectDevice = async (id: string) => {
		setLoading(true);
		try {
			await disconnectDeviceServer(id);
			setDevices((prev) =>
				prev.filter((device) => device.device_id !== id)
			);
		} catch (error) {
			toastError(error);
		}
		setLoading(false);
	};

	const disconnectAllDevices = async () => {
		setLoading(true);
		try {
			await disconnectAllDevicesServer();
			logout();
		} catch (error) {
			toastError(error);
		}
		setLoading(false);
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Connected Devices</CardTitle>
				<CardDescription>
					Manage devices connected to your account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div className="flex flex-col gap-2 md:flex-row justify-between items-center">
						<h3 className="text-lg font-medium">Your devices</h3>
						{devices.length > 1 && (
							<Button
								variant="outline"
								size="sm"
								onClick={disconnectAllDevices}
								className="text-red-500 hover:text-red-700 hover:bg-red-50"
							>
								<LogOut className="mr-2 h-4 w-4" />
								Disconnect All Other Devices
							</Button>
						)}
					</div>

					<div className="space-y-4">
						{devices.length > 0 ? (
							devices.map((device) => (
								<div
									key={device.device_id}
									className={`flex items-center gap-4 p-4 bg-background rounded-lg border relative overflow-hidden`}
								>
									<div className="flex-shrink-0">
										{getDeviceIcon(device.type)}
									</div>

									<div className="flex-grow">
										<div className="flex justify-between items-center">
											<div>
												<h4 className="font-medium">
													{device.name}
												</h4>
												<p className="text-sm text-muted-foreground">
													Connected on{' '}
													{new Date(
														device.createdAt
													).toLocaleDateString(
														'en-GB'
													)}
												</p>
											</div>

											{device.device_id === deviceId ? (
												<Badge
													variant="outline"
													className="bg-primary/10 text-primary border-primary/20 text-center"
												>
													Current Device
												</Badge>
											) : (
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														disconnectDevice(
															device.device_id
														)
													}
													className="text-red-500 hover:text-red-700 hover:bg-red-50"
												>
													<LogOut className="mr-2 h-4 w-4" />
													Disconnect
												</Button>
											)}
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-8 text-muted-foreground">
								<Laptop className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>
									No other devices connected to your account
								</p>
							</div>
						)}
					</div>

					<div className="mt-4 text-sm text-muted-foreground">
						<p>
							Disconnecting a device will sign you out from that
							device. You'll need to sign in again to access your
							account.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
