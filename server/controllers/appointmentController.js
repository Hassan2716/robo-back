import Appointment from '../models/Appointment.js';
import Barber from '../models/Barber.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { getAvailableSlots, isSlotAvailable, formatDateForQuery } from '../utils/slots.js';
import { sendBookingConfirmation, sendCancellationConfirmation } from '../utils/email.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAppointments = async (req, res, next) => {
  try {
    const { barber, date, status, customer } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'barber') {
      const barberProfile = await Barber.findOne({ user: req.user.id });
      if (barberProfile) {
        query.barber = barberProfile._id;
      }
    }

    if (barber && ['admin', 'receptionist'].includes(req.user.role)) {
      query.barber = barber;
    }

    if (customer && ['admin', 'receptionist'].includes(req.user.role)) {
      query.customer = customer;
    }

    if (date) {
      const { start, end } = formatDateForQuery(new Date(date));
      query.date = { $gte: start, $lte: end };
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('customer', 'name email phone')
      .populate('barber', 'name photo')
      .populate('service', 'name price duration')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('barber', 'name photo specialties')
      .populate('service', 'name price duration');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (req.user.role === 'customer' && appointment.customer._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (req.user.role === 'barber') {
      const barberProfile = await Barber.findOne({ user: req.user.id });
      if (!barberProfile || appointment.barber._id.toString() !== barberProfile._id.toString()) {
        return next(new AppError('Not authorized', 403));
      }
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlotsForBarber = async (req, res, next) => {
  try {
    const { barberId, date } = req.query;

    if (!barberId || !date) {
      return next(new AppError('Barber ID and date are required', 400));
    }

    const barber = await Barber.findById(barberId);
    if (!barber) {
      return next(new AppError('Barber not found', 404));
    }

    const serviceId = req.query.service;
    let serviceDuration = 30;
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service) serviceDuration = service.duration;
    }

    const { start, end } = formatDateForQuery(new Date(date));
    const appointments = await Appointment.find({
      barber: barberId,
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    });

    const slots = getAvailableSlots(barber, new Date(date), appointments, serviceDuration);

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

export const bookAppointment = async (req, res, next) => {
  try {
    const { barber, service, date, time, notes } = req.body;

    const barberDoc = await Barber.findById(barber);
    if (!barberDoc) {
      return next(new AppError('Barber not found', 404));
    }

    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return next(new AppError('Service not found', 404));
    }

    const { start, end } = formatDateForQuery(new Date(date));
    const existingAppointments = await Appointment.find({
      barber,
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    });

    const available = isSlotAvailable(barberDoc, new Date(date), time, serviceDoc.duration, existingAppointments);
    if (!available) {
      return next(new AppError('Selected time slot is not available', 400));
    }

    const appointment = await Appointment.create({
      customer: req.user.id,
      barber,
      service,
      date: new Date(date),
      time,
      notes: notes || '',
      totalPrice: serviceDoc.price,
      createdBy: req.user.id
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'name email phone')
      .populate('barber', 'name photo')
      .populate('service', 'name price duration');

    await sendBookingConfirmation(appointment, req.user, barberDoc, serviceDoc);

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

export const createWalkInAppointment = async (req, res, next) => {
  try {
    const { barber, service, date, time, customer, notes } = req.body;

    const barberDoc = await Barber.findById(barber);
    if (!barberDoc) {
      return next(new AppError('Barber not found', 404));
    }

    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return next(new AppError('Service not found', 404));
    }

    let customerDoc = null;
    if (customer) {
      customerDoc = await User.findById(customer);
      if (!customerDoc) {
        return next(new AppError('Customer not found', 404));
      }
    }

    const appointment = await Appointment.create({
      customer: customerDoc?._id || req.user.id,
      barber,
      service,
      date: new Date(date),
      time,
      notes: notes || '',
      totalPrice: serviceDoc.price,
      isWalkIn: true,
      createdBy: req.user.id
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'name email phone')
      .populate('barber', 'name photo')
      .populate('service', 'name price duration');

    if (customerDoc) {
      await sendBookingConfirmation(appointment, customerDoc, barberDoc, serviceDoc);
    }

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
    
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('barber', 'name')
      .populate('service', 'name');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (req.user.role === 'barber') {
      const barberProfile = await Barber.findOne({ user: req.user.id });
      if (!barberProfile || appointment.barber._id.toString() !== barberProfile._id.toString()) {
        return next(new AppError('Not authorized', 403));
      }
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const customer = await User.findById(appointment.customer._id);
      const barber = await Barber.findById(appointment.barber._id);
      const service = await Service.findById(appointment.service._id);
      await sendCancellationConfirmation(appointment, customer, barber, service);
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('barber', 'name')
      .populate('service', 'name');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (req.user.role === 'customer' && appointment.customer._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (appointment.status === 'cancelled') {
      return next(new AppError('Appointment already cancelled', 400));
    }

    if (appointment.status === 'completed') {
      return next(new AppError('Cannot cancel completed appointment', 400));
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const customer = await User.findById(appointment.customer._id);
    const barber = await Barber.findById(appointment.barber._id);
    const service = await Service.findById(appointment.service._id);
    await sendCancellationConfirmation(appointment, customer, barber, service);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, time } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('barber')
      .populate('service');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    if (req.user.role === 'customer' && appointment.customer.toString() !== req.user.id) {
      return next(new AppError('Not authorized', 403));
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return next(new AppError('Cannot reschedule cancelled or completed appointment', 400));
    }

    const { start, end } = formatDateForQuery(new Date(date));
    const existingAppointments = await Appointment.find({
      barber: appointment.barber._id,
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
      _id: { $ne: appointment._id }
    });

    const available = isSlotAvailable(appointment.barber, new Date(date), time, appointment.service.duration, existingAppointments);
    if (!available) {
      return next(new AppError('Selected time slot is not available', 400));
    }

    appointment.date = new Date(date);
    appointment.time = time;
    appointment.status = 'pending';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('customer', 'name email phone')
      .populate('barber', 'name photo')
      .populate('service', 'name price duration');

    res.status(200).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerAppointments = async (req, res, next) => {
  try {
    const now = new Date();
    const { start, end } = formatDateForQuery(now);

    const upcoming = await Appointment.find({
      customer: req.user.id,
      date: { $gte: start },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('barber', 'name photo')
      .populate('service', 'name price duration')
      .sort({ date: 1, time: 1 });

    const past = await Appointment.find({
      customer: req.user.id,
      $or: [
        { date: { $lt: start } },
        { status: { $in: ['completed', 'cancelled', 'no-show'] } }
      ]
    })
      .populate('barber', 'name photo')
      .populate('service', 'name price duration')
      .sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      data: { upcoming, past }
    });
  } catch (error) {
    next(error);
  }
};