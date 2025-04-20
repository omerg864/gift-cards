import CryptoJS from 'crypto-js';

const VERIFY_PLAINTEXT = 'valid-global-key';
const ITERATIONS = 1000;
const SALT_LENGTH = 16;

export const deriveKey = (password: string, salt: string): string => {
	return CryptoJS.PBKDF2(password, salt, {
		keySize: 256 / 32,
		iterations: ITERATIONS,
	}).toString();
};

export const encryptData = (data: any, password: string) => {
	const salt = CryptoJS.lib.WordArray.random(SALT_LENGTH).toString();
	const key = deriveKey(password, salt);
	const encryptedData = CryptoJS.AES.encrypt(
		JSON.stringify(data),
		key
	).toString();
	return {
		encryptedData,
		salt,
	};
};

export const generateSaltAndVerifyToken = (password: string) => {
	const salt = CryptoJS.lib.WordArray.random(SALT_LENGTH).toString();
	const key = deriveKey(password, salt);
	const verifyToken = CryptoJS.AES.encrypt(VERIFY_PLAINTEXT, key).toString();
	return {
		salt,
		verifyToken,
	};
};

// Encrypt only cardNumber (partial) and cvv
export const encryptCard = (
	fields: {
		cardNumber?: string;
		cvv?: string;
	},
	password: string,
	salt: string
): {
	cardNumber?: string;
	cvv?: string;
} => {
	const key = deriveKey(password, salt);

	let encryptedCardNumber;
	let encryptedCVV;
	if (fields.cardNumber) {
		encryptedCardNumber = CryptoJS.AES.encrypt(
			fields.cardNumber,
			key
		).toString();
	}
	if (fields.cvv) {
		encryptedCVV = CryptoJS.AES.encrypt(fields.cvv, key).toString();
	}

	return {
		cardNumber: encryptedCardNumber,
		cvv: encryptedCVV,
	};
};

export const validateGlobalKey = (
	verifyToken: string,
	password: string,
	salt: string
): boolean => {
	try {
		const key = deriveKey(password, salt);
		const decrypted = CryptoJS.AES.decrypt(verifyToken, key).toString(
			CryptoJS.enc.Utf8
		);
		return decrypted === VERIFY_PLAINTEXT;
	} catch {
		return false;
	}
};

export const decryptCardFields = (
	encryptedFields: {
		cardNumber: string;
		cvv: string;
	},
	password: string,
	salt: string
): {
	cardNumber: string;
	cvv: string;
} => {
	const key = deriveKey(password, salt);
	const cardNumber = CryptoJS.AES.decrypt(
		encryptedFields.cardNumber,
		key
	).toString(CryptoJS.enc.Utf8);
	const cvv = CryptoJS.AES.decrypt(encryptedFields.cvv, key).toString(
		CryptoJS.enc.Utf8
	);
	return { cardNumber, cvv };
};
