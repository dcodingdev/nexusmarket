import { Request, Response } from 'express';
import { User } from './user.model.js';
import logger from '@repo/logger';

export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user is populated by your authMiddleware (verifyToken)
    const userId = req.user?._id; 

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    }

    // .select('-password') ensures we never send the hash to the frontend
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error({ err: error }, 'Get Profile Error');
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { 
        // ❌ Change this: new: true 
        // ✅ To this:
        returnDocument: 'after', 
        runValidators: true 
      }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    logger.error({ err: error }, 'Update Profile Error');
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const upgradeToVendor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { shopName, taxId, description } = req.body;
    
    if (!shopName || !taxId) {
      return res.status(400).json({ message: 'Shop Name and Tax ID are required' });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          role: 'vendor', // UserRole.VENDOR
          shopDetails: { shopName, taxId, description } 
        } 
      },
      { returnDocument: 'after', runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, data: updatedUser, message: 'Successfully upgraded to Vendor' });
  } catch (error) {
    logger.error({ err: error }, 'Upgrade to Vendor Error');
    res.status(500).json({ message: 'Failed to upgrade to vendor' });
  }
};


/**
 * Admin: Get All Users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * Admin: Toggle User Suspension
 */
export const toggleUserSuspension = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?._id;

    if (id === adminId?.toString()) {
      return res.status(400).json({ message: 'You cannot suspend yourself' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({ 
      success: true, 
      message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully`,
      data: user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle suspension' });
  }
};