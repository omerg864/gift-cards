import { createContext, useContext, useState, ReactNode } from 'react';

interface EncryptionContextType {
	globalKey: string | null;
	setGlobalKey: (key: string) => void;
	clearGlobalKey: () => void;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(
	undefined
);

export const EncryptionProvider = ({ children }: { children: ReactNode }) => {
	const [globalKey, setGlobalKey] = useState<string | null>(null);

	const clearGlobalKey = () => setGlobalKey(null);

	return (
		<EncryptionContext.Provider
			value={{ globalKey, setGlobalKey, clearGlobalKey }}
		>
			{children}
		</EncryptionContext.Provider>
	);
};

export const useEncryption = (): EncryptionContextType => {
	const ctx = useContext(EncryptionContext);
	if (!ctx)
		throw new Error('useEncryption must be used within EncryptionProvider');
	return ctx;
};
