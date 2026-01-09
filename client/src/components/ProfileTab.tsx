import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useUpdateProfile } from '../hooks/useUserQuery';
import { getCloudinaryUrl, toastError } from '../lib/utils';
import { useAuthStore } from '../stores/useAuthStore';
import Loading from './loading';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

const ProfileTab = () => {
	const { user, updateUser: updateUserState } = useAuthStore();
	const [name, setName] = useState(user?.name || '');
	const [file, setFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>(getCloudinaryUrl(user?.image) || '');
	const [deleteImage, setDeleteImage] = useState(false);
	const fileInputRef = React.useRef<HTMLInputElement | null>(null);

	const { mutateAsync: updateProfile, isPending: isLoading } = useUpdateProfile();

	const handleProfileUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name) {
			toast.error('Name and email are required');
			return;
		}
		try {
            if (!user?.id) return;
            const formData = new FormData();
            formData.append('name', name);
            if (deleteImage) {
                formData.append('deleteImage', 'true');
            }
            if (file) {
                formData.append('image', file);
            }

			const data = await updateProfile({ id: user.id, data: formData });
			if (data) {
				updateUserState({ ...data.user });
				toast.success('Profile updated successfully');
			}
		} catch (error) {
			toastError(error);
		}
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
			setImagePreview(getCloudinaryUrl(user.image) || '');
		}
	}, [user]);

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
