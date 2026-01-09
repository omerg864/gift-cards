import { Laptop, LogOut, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
	useDisconnectAllDevices,
	useDisconnectDevice,
	useGetDevices,
} from '../hooks/useUserQuery';
import { DEVICE_ID } from '../lib/constants';
import { toastError } from '../lib/utils';
import { useAuthStore } from '../stores/useAuthStore';
import Loading from './loading';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';

interface Device {
	createdAt: string;
	device_id: string;
	name: string;
	type: string;
}

export function ConnectedDevicesTab() {
	const deviceId = localStorage.getItem(DEVICE_ID) || '';
	const { removeAuthenticated } = useAuthStore();
	
	const { data: devices = [], isLoading: loading } = useGetDevices();
	const disconnectDeviceMutation = useDisconnectDevice();
	const disconnectAllDevicesMutation = useDisconnectAllDevices();

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
		try {
			await disconnectDeviceMutation.mutateAsync(id);
		} catch (error) {
			toastError(error);
		}
	};

	const disconnectAllDevices = async () => {
		try {
			await disconnectAllDevicesMutation.mutateAsync();
			removeAuthenticated();
		} catch (error) {
			toastError(error);
		}
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
							devices.map((device: Device) => (
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
