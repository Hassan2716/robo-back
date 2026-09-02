import Service from '../models/Service.js';
import Barber from '../models/Barber.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../middleware/errorHandler.js';

export const getServices = async (req, res, next) => {
  try {
    const { category, barber, active } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (barber) {
      query.barbers = barber;
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const services = await Service.find(query)
      .populate('barbers', 'name')
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('barbers', 'name photo specialties');

    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { name, description, price, duration, barbers, category } = req.body;

    if (barbers && barbers.length > 0) {
      const barberCount = await Barber.countDocuments({ _id: { $in: barbers } });
      if (barberCount !== barbers.length) {
        return next(new AppError('One or more barbers not found', 400));
      }
    }

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'robocutz/services',
        transformation: [{ width: 600, height: 400, crop: 'fill' }]
      });
      imageUrl = result.secure_url;
    }

    const service = await Service.create({
      name,
      description: description || '',
      price,
      duration,
      barbers: barbers || [],
      category: category || 'haircut',
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const { name, description, price, duration, barbers, category, isActive } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    if (barbers && barbers.length > 0) {
      const barberCount = await Barber.countDocuments({ _id: { $in: barbers } });
      if (barberCount !== barbers.length) {
        return next(new AppError('One or more barbers not found', 400));
      }
    }

    let imageUrl = service.image;
    if (req.file) {
      if (service.image) {
        const publicId = service.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`robocutz/services/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'robocutz/services',
        transformation: [{ width: 600, height: 400, crop: 'fill' }]
      });
      imageUrl = result.secure_url;
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price !== undefined ? price : service.price;
    service.duration = duration !== undefined ? duration : service.duration;
    service.barbers = barbers || service.barbers;
    service.category = category || service.category;
    service.isActive = isActive !== undefined ? isActive : service.isActive;
    service.image = imageUrl;

    await service.save();

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    if (service.image) {
      const publicId = service.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`robocutz/services/${publicId}`);
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};