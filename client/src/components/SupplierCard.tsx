import { getCloudinaryUrl } from '@/lib/utils';
import { Supplier } from '@shared/types/supplier.types';

interface SupplierCardProps {
	supplier: Supplier;
	handleCardClick?: (id: string) => void;
}

export function SupplierCard({ supplier, handleCardClick }: SupplierCardProps) {
	const onClick = () => {
		if (handleCardClick) {
			handleCardClick(supplier.id);
		}
	};

	return (
		<div
			className="relative w-full  h-[200px] rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02]"
			style={{
				maxWidth: '25rem',
			}}
			onClick={onClick}
		>
			<div
				className={`absolute inset-0 rounded-xl p-6 flex flex-col justify-between`}
				style={{
					background: `linear-gradient(135deg, ${supplier.fromColor}, ${supplier.toColor})`,
				}}
			>
				{/* Card header */}
				<div>
					<h3 className="text-xl font-bold text-white">
						{supplier.name}
					</h3>
				</div>

				<div className="space-y-2">
					{handleCardClick && (
						<div className="text-sm text-white/80">
							Click to view details
						</div>
					)}
				</div>

				{/* Card chip */}
				<div className="absolute bottom-6 right-6">
					{supplier.logo ? (
						<img
							className="w-12 h-12 rounded-md"
							src={getCloudinaryUrl(supplier.logo)}
						/>
					) : (
						<div className="w-12 h-8 rounded-md bg-gradient-to-br from-yellow-100/80 to-yellow-200/80"></div>
					)}
				</div>
			</div>
		</div>
	);
}
