import { createTransport } from 'nodemailer';

export const sendEmail = async (
	receiver: string,
	subject: string,
	text: string,
	html?: string,
): Promise<boolean> => {
	var transporter = createTransport({
		host: process.env.EMAIL_HOST,
		port: Number(process.env.EMAIL_PORT),
		secure: process.env.EMAIL_SECURE === 'true',
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	var mailOptions = {
		from: `"Gift Cards App" <${process.env.EMAIL_ADDRESS}>`,
		to: receiver,
		subject: subject,
		text: text,
		html: html,
	};
	let success = false;
	await transporter
		.sendMail(mailOptions)
		.then(() => {
			success = true;
		})
		.catch((err) => {
			console.log(err);
			success = false;
		});
	return success;
};

export const extractPublicId = (url: string): string => {
	// Remove the base URL and extract the part after /upload/
	const uploadIndex = url.indexOf('/upload/');
	if (uploadIndex === -1) {
		throw new Error('Invalid Cloudinary URL');
	}
	const parts = url.substring(uploadIndex + 8).split('/'); // +8 to skip "/upload/"
	const publicIdWithExtension = parts.slice(1).join('/'); // Skip the version part

	// Remove the file extension
	const dotIndex = publicIdWithExtension.lastIndexOf('.');
	const publicId =
		dotIndex !== -1
			? publicIdWithExtension.substring(0, dotIndex)
			: publicIdWithExtension;

	return publicId;
};
