import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SearchBar() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [query, setQuery] = useState(searchParams.get('q') || '');

	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (query) {
				navigate(`/?q=${encodeURIComponent(query)}`);
			} else {
				navigate('/');
			}
		}, 500); // debounce delay (500ms)

		return () => clearTimeout(delayDebounce);
	}, [query, navigate]);

	const handleClear = () => {
		setQuery('');
		navigate('/');
	};

	return (
		<form className="relative w-full" onSubmit={(e) => e.preventDefault()}>
			<div className="relative">
				<input
					type="text"
					placeholder="Search for stores..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="w-full h-10 pl-4 pr-10 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
				{query && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Clear</span>
					</button>
				)}
			</div>
		</form>
	);
}
