import Barber from '../models/Barber.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../middleware/errorHandler.js';

export const getBarbers = async (req, res, next) => {
  try {
    const { specialty, active } = req.query;
    const query = {};

    if (specialty) {
      query.specialties = { $in: [new RegExp(specialty, 'i')] };
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const barbers = await Barber.find(query)
      .populate('user', 'email phone')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: barbers.length,
      data: barbers
    });
  } catch (error) {
    next(error);
  }
};

export const getBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id)
      .populate('user', 'email phone');

    if (!barber) {
      return next(new AppError('Barber not found', 404));
    }

    res.status(200).json({
      success: true,
      data: barber
    });
  } catch (error) {
    next(error);
  }
};

export const createBarber = async (req, res, next) => {
  try {
    const { user: userId, name, specialties, experience, bio, workingHours } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role !== 'barber') {
      return next(new AppError('User must have barber role', 400));
    }

    const existingBarber = await Barber.findOne({ user: userId });
    if (existingBarber) {
      return next(new AppError('Barber profile already exists for this user', 400));
    }

    let photoUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'robocutz/barbers',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      });
      photoUrl = result.secure_url;
    }

    const barber = await Barber.create({
      user: userId,
      name,
      photo: photoUrl,
      specialties: specialties || [],
      experience: experience || 0,
      bio: bio || '',
      workingHours: workingHours || []
    });

    await User.findByIdAndUpdate(userId, { barberProfile: barber._id });

    res.status(201).json({
      success: true,
      data: barber
    });
  } catch (error) {
    next(error);
  }
};

export const updateBarber = async (req, res, next) => {
  try {
    const { name, specialties, experience, bio, workingHours, isActive } = req.body;

    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return next(new AppError('Barber not found', 404));
    }

    let photoUrl = barber.photo;
    if (req.file) {
      if (barber.photo) {
        const publicId = barber.photo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`robocutz/barbers/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'robocutz/barbers',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      });
      photoUrl = result.secure_url;
    }

    barber.name = name || barber.name;
    barber.specialties = specialties || barber.specialties;
    barber.experience = experience !== undefined ? experience : barber.experience;
    barber.bio = bio || barber.bio;
    barber.workingHours = workingHours || barber.workingHours;
    barber.isActive = isActive !== undefined ? isActive : barber.isActive;
    barber.photo = photoUrl;

    await barber.save();

    res.status(200).json({
      success: true,
      data: barber
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return next(new AppError('Barber not found', 404));
    }

    if (barber.photo) {
      const publicId = barber.photo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`robocutz/barbers/${publicId}`);
    }

    await User.findByIdAndUpdate(barber.user, { barberProfile: null });
    await barber.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Barber deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBarberProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'barber') {
      return next(new AppError('Not authorized', 403));
    }

    const barber = await Barber.findOne({ user: req.user.id })
      .populate('user', 'email phone');

    if (!barber) {
      return next(new AppError('Barber profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: barber
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyBarberProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'barber') {
      return next(new AppError('Not authorized', 403));
    }

    const barber = await Barber.findOne({ user: req.user.id });
    if (!barber) {
      return next(new AppError('Barber profile not found', 404));
    }

    const { name, specialties, experience, bio, workingHours } = req.body;

    let photoUrl = barber.photo;
    if (req.file) {
      if (barber.photo) {
        const publicId = barber.photo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`robocutz/barbers/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'robocutz/barbers',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      });
      photoUrl = result.secure_url;
    }

    barber.name = name || barber.name;
    barber.specialties = specialties || barber.specialties;
    barber.experience = experience !== undefined ? experience : barber.experience;
    barber.bio = bio || barber.bio;
    barber.workingHours = workingHours || barber.workingHours;
    barber.photo = photoUrl;

    await barber.save();

    res.status(200).json({
      success: true,
      data: barber
    });
  } catch (error) {
    next(error);
  }
};