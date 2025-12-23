import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import { EncryptionProvider } from './context/EncryptionContext.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import './index.css';
import { persister } from './lib/persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
			<AuthProvider>
				<EncryptionProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="system"
								enableSystem
								disableTransitionOnChange
							>
								<BrowserRouter>
									<App />
								</BrowserRouter>
							</ThemeProvider>
				</EncryptionProvider>
			</AuthProvider>
		</PersistQueryClientProvider>
	</StrictMode>
);
