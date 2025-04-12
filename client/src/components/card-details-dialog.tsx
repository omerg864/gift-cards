'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
	Eye,
	EyeOff,
	Store,
	Calendar,
	CreditCard,
	DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import type { GiftCard } from '../../types/gift-card';
import { getSupplierByName } from '../../types/supplier';

interface CardDetailsDialogProps {
	giftCard: GiftCard;
	onClose: () => void;
}

export function CardDetailsDialog({
	giftCard,
	onClose,
}: CardDetailsDialogProps) {
	const [showCVV, setShowCVV] = useState(false);

	const toggleCVV = () => {
		setShowCVV(!showCVV);
	};

	// Get the supplier color based on the supplier name
	const supplier = getSupplierByName(giftCard.supplier);
	const cardColor = supplier.colorClass;

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Gift Card Details</DialogTitle>
				</DialogHeader>

				<div className="mt-4">
					{/* Card preview */}
					<div
						className={`w-full h-48 rounded-xl bg-gradient-to-br ${cardColor} p-6 flex flex-col justify-between text-white mb-6`}
					>
						<div className="flex justify-between items-start">
							<div className="w-10 h-8 bg-yellow-100/80 rounded-md"></div>
							<div className="text-lg font-bold tracking-wider">
								{giftCard.supplier.toUpperCase()}
							</div>
						</div>

						<div className="absolute top-[84px] right-8 bg-white/20 px-3 py-1 rounded-full text-white font-bold">
							${giftCard.amount}
						</div>

						{giftCard.cardNumber && (
							<div className="mt-auto">
								<div className="text-xs uppercase tracking-wider opacity-75">
									Card Number
								</div>
								<div className="text-base font-mono tracking-widest mt-1">
									{giftCard.cardNumber}
								</div>
							</div>
						)}
					</div>

					{/* Card information */}
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-muted-foreground" />
								<div>
									<div className="text-sm text-muted-foreground">
										Amount
									</div>
									<div className="font-medium">
										${giftCard.amount}
									</div>
								</div>
							</div>

							{giftCard.expirationDate && (
								<div className="flex items-center gap-2">
									<Calendar className="h-5 w-5 text-muted-foreground" />
									<div>
										<div className="text-sm text-muted-foreground">
											Expires
										</div>
										<div className="font-medium">
											{giftCard.expirationDate}
										</div>
									</div>
								</div>
							)}
						</div>

						{giftCard.cardNumber && (
							<div className="flex items-center gap-2">
								<CreditCard className="h-5 w-5 text-muted-foreground" />
								<div>
									<div className="text-sm text-muted-foreground">
										Card Number
									</div>
									<div className="font-medium font-mono">
										{giftCard.cardNumber}
									</div>
								</div>
							</div>
						)}

						{giftCard.cvv && (
							<div className="flex items-center gap-2">
								<button
									onClick={toggleCVV}
									className="h-5 w-5 text-muted-foreground"
								>
									{showCVV ? <EyeOff /> : <Eye />}
								</button>
								<div>
									<div className="text-sm text-muted-foreground">
										CVV
									</div>
									<div className="font-medium">
										{showCVV ? giftCard.cvv : '•••'}
									</div>
								</div>
							</div>
						)}

						{/* Supported stores */}
						<div className="pt-4 border-t">
							<div className="flex items-center gap-2 mb-2">
								<Store className="h-5 w-5 text-muted-foreground" />
								<div className="font-medium">
									Supported Stores
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								{giftCard.supportedStores &&
								giftCard.supportedStores.length > 0 ? (
									giftCard.supportedStores.map(
										(store, index) => (
											<Badge
												key={index}
												variant="secondary"
											>
												{store}
											</Badge>
										)
									)
								) : (
									<span className="text-sm text-muted-foreground">
										No stores specified
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={onClose}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
