import { UserModel } from '../models/user.model.js';
import { AppError } from '../middleware/errorHandler.js';

export const UserController = {
  // Get current user
  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          isVerified: user.is_verified,
          lastSeen: user.last_seen,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update profile
  async updateProfile(req, res, next) {
    try {
      const { name, bio } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;

      const user = await UserModel.update(req.user.id, updateData);

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          bio: user.bio,
          updatedAt: user.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Search users
  async searchUsers(req, res, next) {
    try {
      const { phone } = req.query;

      if (!phone) {
        throw new AppError('Phone number required', 400, 'INVALID_REQUEST');
      }

      const users = await UserModel.searchByPhone(phone);

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      next(error);
    }
  },
};

