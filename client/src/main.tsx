import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import { EncryptionProvider } from './context/EncryptionContext.tsx';
import './index.css';
import { asyncStoragePersister, queryClient } from './services/client';


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister: asyncStoragePersister }}
		>
			<BrowserRouter>
				<EncryptionProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
						storageKey="vite-ui-theme"
					>
						<App />
					</ThemeProvider>
				</EncryptionProvider>
			</BrowserRouter>
		</PersistQueryClientProvider>
	</StrictMode>
);
