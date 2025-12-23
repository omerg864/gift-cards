import { getCloudinaryUrl } from '@/lib/utils';
import { Edit } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Label } from './ui/label';

interface SupplierImageInputProps {
	setFile: (file: File | null) => void;
	defaultImage?: string | null;
	setDeleteImage: (deleteImage: boolean) => void;
}
const SupplierImageInput = ({
	setFile,
	defaultImage,
	setDeleteImage,
}: SupplierImageInputProps) => {
	const [image, setImage] = useState<string | null>(getCloudinaryUrl(defaultImage) || null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			setDeleteImage(false);
			setFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				setImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleDeleteImage = () => {
		setImage(null);
		setFile(null);
		setDeleteImage(true);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleEditImage = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			<Label htmlFor="">Supplier Image</Label>
			<div className="w-36 h-36 border border-gray-300 relative cursor-pointer">
				{image ? (
					<>
						<img
							src={image}
							alt="Preview"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
						<button
							onClick={handleEditImage}
							type="button"
							className="absolute top-1 right-1 bg-blue-500 text-white border-none rounded-full w-5 h-5 cursor-pointer flex items-center justify-center text-xs"
						>
							<Edit size={16} />
						</button>
						<button
							onClick={handleDeleteImage}
							type="button"
							className="absolute top-1 left-1 bg-red-500 text-white border-none rounded-full w-5 h-5 cursor-pointer flex items-center justify-center text-xs"
						>
							X
						</button>
					</>
				) : (
					<>
						<span
							onClick={handleEditImage}
							className="text-sm text-gray-500 flex items-center justify-center h-full"
						>
							Upload Image
						</span>
					</>
				)}
				<input
					type="file"
					accept="image/*"
					onChange={handleImageChange}
					style={{
						width: '100%',
						height: '100%',
						opacity: 0,
						display: 'none',
					}}
					ref={fileInputRef}
				/>
			</div>
		</>
	);
};

export default SupplierImageInput;
