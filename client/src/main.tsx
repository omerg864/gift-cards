import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import { EncryptionProvider } from './context/EncryptionContext.tsx';
import { SupplierProvider } from './context/SupplierContext.tsx';
import { GiftCardProvider } from './context/GiftCardContext.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AuthProvider>
			<EncryptionProvider>
				<SupplierProvider>
					<GiftCardProvider>
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
					</GiftCardProvider>
				</SupplierProvider>
			</EncryptionProvider>
		</AuthProvider>
	</StrictMode>
);
