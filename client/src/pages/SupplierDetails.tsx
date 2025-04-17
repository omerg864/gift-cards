'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Store, CreditCard, Smartphone, Plus } from 'lucide-react';
import { getSupplierById } from '../types/supplier';
import { GiftCardDialog } from '../components/GiftCardDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { GiftCard } from '../types/gift-card';

export default function SupplierDetailsPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [showAddDialog, setShowAddDialog] = useState(false);

	const params = useParams();

	// Get supplier information
	const supplier = getSupplierById(params.id!);

	useEffect(() => {
		// Simulate loading
		const timer = setTimeout(() => {
			setLoading(false);
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	const handleBack = () => {
		navigate(-1);
	};

	const handleAddCard = () => {
		setShowAddDialog(true);
	};

	const handleNewCardSubmit = async (data: Omit<GiftCard, '_id'>) => {
		console.log('Card data:', data);
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center h-40">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<Button variant="outline" onClick={handleBack} className="mb-6">
				<ArrowLeft className="mr-2 h-4 w-4" /> Back
			</Button>

			<div className="grid md:grid-cols-2 gap-8">
				<div>
					{/* Supplier Card */}
					<div
						className={`w-full h-64 rounded-xl p-6 flex flex-col justify-between text-white mb-6`}
						style={{
							background: `linear-gradient(135deg, ${supplier.fromColor}, ${supplier.toColor})`,
						}}
					>
						<div className="text-2xl font-bold tracking-wider">
							{supplier.name.toUpperCase()}
						</div>
						<div className="mt-auto">
							<div className="text-lg opacity-90">
								Gift Card Provider
							</div>
							<Button
								onClick={handleAddCard}
								className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
							>
								<Plus className="mr-2 h-4 w-4" /> Add to My
								Cards
							</Button>
						</div>
					</div>

					{/* Supplier Information */}
					<div className="bg-muted/30 p-6 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">
							About {supplier.name}
						</h2>
						<p className="text-muted-foreground mb-4">
							{supplier.name} gift cards can be used at various
							stores and locations. They make perfect gifts for
							any occasion.
						</p>

						<div className="flex flex-wrap gap-2 mt-4">
							<Badge
								variant="outline"
								className="flex items-center gap-1"
							>
								<CreditCard className="h-3 w-3" /> Physical
								Cards Available
							</Badge>
							<Badge
								variant="outline"
								className="flex items-center gap-1"
							>
								<Smartphone className="h-3 w-3" /> Digital Cards
								Available
							</Badge>
						</div>
					</div>
				</div>

				<div>
					{/* Supported Stores */}
					<div className="bg-muted/30 p-6 rounded-lg">
						<h2 className="text-xl font-semibold flex items-center mb-4">
							<Store className="mr-2 h-5 w-5" /> Supported Stores
						</h2>

						<div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
							{supplier.supportedStores.length > 0 ? (
								supplier.supportedStores.map((store, index) => (
									<div
										key={index}
										className="flex items-center gap-4 p-3 bg-background rounded-lg border"
									>
										<img
											src={`/placeholder.svg?height=40&width=40&text=${store.charAt(
												0
											)}`}
											alt={store}
											width={40}
											height={40}
											className="rounded-md"
										/>
										<div>
											<div className="font-medium">
												{store}
											</div>
											<div className="text-sm text-muted-foreground">
												Accepts {supplier.name} gift
												cards
											</div>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-muted-foreground">
									No stores specified for this supplier
								</div>
							)}
						</div>
					</div>

					<div className="mt-6">
						<Button
							onClick={handleAddCard}
							className="w-full bg-teal-600 hover:bg-teal-700"
						>
							<Plus className="mr-2 h-4 w-4" /> Add{' '}
							{supplier.name} Gift Card to My Collection
						</Button>
					</div>
				</div>
			</div>

			{showAddDialog && (
				<GiftCardDialog
					onSubmit={handleNewCardSubmit}
					onClose={() => setShowAddDialog(false)}
				/>
			)}
		</div>
	);
}
