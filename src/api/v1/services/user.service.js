import { User } from '../models/userModel.js';

export const getUserInfo = async (userId) => {
  try {
    if (!userId) throw new Error('ID de usuario no proporcionado');

    const user = await User.findById(userId).select('username email role lastLogin');
    if (!user) throw new Error('Usuario no encontrado');

    return { success: true, data: user };
  } catch (error) {
    console.error('❌ [UserService] Error:', error.message);
    return { success: false, message: error.message };
  }
};
