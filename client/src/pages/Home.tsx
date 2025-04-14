import { GiftCardList } from '../components/gift-card-list';
import { SearchBar } from '../components/search-bar';
import { AddGiftCardButton } from '../components/add-gift-card-button';

export default function Home() {
	return (
		<main className="min-h-screen bg-[#0B0E14] text-white p-8">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">My Gift Cards</h1>

				<div className="flex justify-between items-center mb-8 space-x-4">
					<div className="flex-1 max-w-md">
						<SearchBar />
					</div>
					<AddGiftCardButton />
				</div>

				<GiftCardList />
			</div>
		</main>
	);
}
