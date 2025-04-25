import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User, Lock, GlobeLock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ProfileTab from '../components/ProfileTab';
import PasswordTab from '../components/PasswordTab';
import EncryptionTab from '../components/EncryptionTab';
import { useSearchParams } from 'react-router-dom';

export default function ProfilePage() {
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const tab = searchParams.get('tab') || 'profile';
	const [activeTab, setActiveTab] = useState(tab);

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
										src={user?.image || ''}
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
								onClick={() => {
									setActiveTab('profile');
									setSearchParams({ tab: 'profile' });
								}}
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
								onClick={() => {
									setActiveTab('password');
									setSearchParams({ tab: 'password' });
								}}
							>
								<Lock className="mr-2 h-4 w-4" />
								Change Password
							</Button>
							<Button
								variant={
									activeTab === 'encryption'
										? 'default'
										: 'ghost'
								}
								className="w-full justify-start"
								onClick={() => {
									setActiveTab('encryption');
									setSearchParams({ tab: 'encryption' });
								}}
							>
								<GlobeLock className="mr-2 h-4 w-4" />
								Encryption Key
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
							<TabsTrigger value="encryption">
								Encryption Key
							</TabsTrigger>
						</TabsList>

						<TabsContent value="profile">
							<ProfileTab />
						</TabsContent>

						<TabsContent value="password">
							<PasswordTab />
						</TabsContent>

						<TabsContent value="encryption">
							<EncryptionTab />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
