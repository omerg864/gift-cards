import React, { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { toastError } from '../lib/utils';
import { updateUser } from '../services/userService';
import Loading from './loading';

const ProfileTab = () => {
	const { user, updateUser: updateUserState } = useAuth();
	const [name, setName] = useState(user?.name || '');
	const [file, setFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState<string>(user?.image || '');
	const [deleteImage, setDeleteImage] = useState(false);
	const fileInputRef = React.useRef<HTMLInputElement | null>(null);

	const handleProfileUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name) {
			toast.error('Name and email are required');
			return;
		}
		setIsLoading(true);
		try {
			const data = await updateUser(name, deleteImage, file);
			console.log('deleteImage', deleteImage);
			updateUserState({ ...data.user });
			toast.success('Profile updated successfully');
		} catch (error) {
			toastError(error);
		}
		setIsLoading(false);
	};

	const changeImage = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFile(file);
			const uri = URL.createObjectURL(file);
			setImagePreview(uri);
			setDeleteImage(false);
		}
	};

	const handleDeleteImage = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setDeleteImage(true);
		setImagePreview('');
		setFile(null);
	};

	useEffect(() => {
		if (user) {
			setName(user.name || '');
			setImagePreview(user.image || '');
		}
	}, [user]);

    console.log('imagePreview', imagePreview);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
				<CardDescription>
					Update your personal information
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleProfileUpdate} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="avatar">Profile Picture</Label>
						<div className="flex items-center space-x-4">
							<Avatar className="h-12 w-12">
								<AvatarImage
									src={imagePreview}
									alt={user?.name || 'user avatar'}
								/>
								<AvatarFallback>
									{user?.name.charAt(0).toUpperCase() || '?'}
								</AvatarFallback>
							</Avatar>
							<Button
								type="button"
								onClick={changeImage}
								variant="outline"
								size="sm"
							>
								Change
							</Button>
							{imagePreview && (
								<Button
									type="button"
									onClick={handleDeleteImage}
									variant="outline"
									size="sm"
								>
									deleteImage
								</Button>
							)}
							<input
								type="file"
								accept="image/*"
								ref={fileInputRef}
								onChange={handleImageChange}
								className="hidden"
							/>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Recommended: Square image, at least 300x300px
						</p>
					</div>
					<Button type="submit">Save Changes</Button>
				</form>
			</CardContent>
		</Card>
	);
};

export default ProfileTab;
