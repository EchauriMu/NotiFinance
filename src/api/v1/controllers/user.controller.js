import { getUserInfo } from '../services/user.service.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userTk.id; 
    if (!userId) return res.status(400).json({ success: false, message: 'ID de usuario no válido' });

    const result = await getUserInfo(userId);

    
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }
  console.log(result);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ [UserController] Error:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
