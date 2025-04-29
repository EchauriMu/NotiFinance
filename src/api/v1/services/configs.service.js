import { User } from '../models/userModel.js'; 

export const updateUsername = async (userId, newUsername) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  user.username = newUsername;
  await user.save();
  return user;
};
