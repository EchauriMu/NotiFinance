import { getUserInfo, updateDiscordByUserId } from '../services/user.service.js';

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userTk.id; 
    if (!userId) return res.status(400).json({ success: false, message: 'ID de usuario no válido' });

    const result = await getUserInfo(userId);

    
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ [UserController] Error:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const postDiscordSetting = async (req, res) => {
  try {
    const userId = req.userTk.id;
    const { discord } = req.body;

    if (!discord) {
      return res.status(400).json({ message: "Discord ID is required" });
    }

    const result = await updateDiscordByUserId(userId, discord);
    res.status(200).json({ message: "Discord ID updated successfully", data: result });

  } catch (error) {
    console.error("Error updating Discord ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
