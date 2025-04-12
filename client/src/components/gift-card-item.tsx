'use client';
import type { GiftCard } from '../../types/gift-card';
import { getSupplierByName } from '../../types/supplier';
import { CreditCard, Smartphone } from 'lucide-react';
import { getCurrencySymbol } from '../../types/gift-card';

interface GiftCardItemProps {
	giftCard: GiftCard;
	supplierCard?: boolean;
	handleCardClick?: (id: string) => void;
}

export function GiftCardItem({
	giftCard,
	handleCardClick,
	supplierCard,
}: GiftCardItemProps) {
	const supplier = getSupplierByName(giftCard.supplier);
	const currencySymbol = getCurrencySymbol(giftCard.currency);

	console.log('GiftCardItem', giftCard);

	const onClick = () => {
		if (supplierCard && handleCardClick) {
			console.log('Supplier card clicked');
			handleCardClick(supplier.id);
		} else if (handleCardClick) {
			handleCardClick(giftCard.id);
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
					<h3 className="text-xl font-bold text-white mb-2">
						{giftCard.supplier.toUpperCase()}
					</h3>
					<div className="w-fit bg-white/20 px-2 py-1 rounded-full text-white text-xs flex items-center">
						{giftCard.isPhysical ? (
							<>
								<CreditCard className="h-3 w-3 mr-1" /> Physical
							</>
						) : (
							<>
								<Smartphone className="h-3 w-3 mr-1" /> Digital
							</>
						)}
					</div>
				</div>

				{/* Card details */}
				<div className="space-y-2">
					{giftCard.cardNumber && (
						<>
							<div className="text-sm text-white/80 uppercase tracking-wide">
								CARD NUMBER
							</div>
							<div className="text-lg font-mono tracking-widest text-white">
								{giftCard.cardNumber.substring(0, 4)} •••• ••••{' '}
								{giftCard.cardNumber.substring(
									giftCard.cardNumber.length - 4
								)}
							</div>
						</>
					)}
					{handleCardClick && (
						<div className="text-sm text-white/80">
							Click to view details
						</div>
					)}
				</div>

				{/* Card type and amount badges */}
				<div className="absolute top-6 right-6 flex flex-col items-end space-y-2">
					<div className="bg-white/20 px-3 py-1 rounded-full text-white font-bold">
						{currencySymbol}
						{giftCard.amount}
					</div>
				</div>

				{/* Card chip */}
				<div className="absolute bottom-6 right-6">
					<div className="w-12 h-8 rounded-md bg-gradient-to-br from-yellow-100/80 to-yellow-200/80"></div>
				</div>
			</div>
		</div>
	);
}
