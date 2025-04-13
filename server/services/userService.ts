import User from '../models/userModel';
import { User as IUser, UserDocument } from '../types/user';

const getUserByEmail = async (email: string): Promise<UserDocument | null> => {
	const user = await User.findOne({
		email: { $regex: new RegExp(`^${email}$`, 'i') },
	});
	return user;
};

const getUserById = async (id: string): Promise<UserDocument | null> => {
	const user = await User.findById(id);
	return user;
};

const createUser = async (userData: Partial<IUser>): Promise<UserDocument> => {
	const user = await User.create(userData);
	return user;
};

const updateUserById = async (
	id: string,
	updateData: Partial<IUser>
): Promise<UserDocument | null> => {
	const updatedUser = await User.findByIdAndUpdate(id, updateData, {
		new: true,
		runValidators: true,
	});
	return updatedUser;
};

export { getUserByEmail, getUserById, createUser, updateUserById };
