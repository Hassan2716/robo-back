import Appointment from '../models/Appointment.js';
import Sale from '../models/Sale.js';
import Service from '../models/Service.js';
import Barber from '../models/Barber.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

const getDateRange = (period) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }
  
  return { start, end };
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayAppointments,
      todayWalkIns,
      todayRevenue,
      pendingAppointments,
      totalBarbers,
      totalCustomers,
      lowStockProducts
    ] = await Promise.all([
      Appointment.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        status: { $ne: 'cancelled' }
      }),
      Appointment.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        isWalkIn: true,
        status: { $ne: 'cancelled' }
      }),
      Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow }
          }
        },
        {
          $group: { _id: null, total: { $sum: '$total' } }
        }
      ]),
      Appointment.countDocuments({ status: 'pending' }),
      Barber.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ $expr: { $lte: ['$stock', 5] }, isActive: true })
    ]);

    const revenue = todayRevenue.length > 0 ? todayRevenue[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        todayWalkIns,
        todayRevenue: revenue,
        pendingAppointments,
        totalBarbers,
        totalCustomers,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingReport = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const { start, end } = getDateRange(period);

    const appointments = await Appointment.find({
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    }).populate('service', 'name price').populate('barber', 'name');

    const dailyData = {};
    const serviceData = {};
    const barberData = {};

    appointments.forEach(apt => {
      const dateKey = apt.date.toISOString().split('T')[0];
      dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;

      const serviceName = apt.service?.name || 'Unknown';
      serviceData[serviceName] = (serviceData[serviceName] || 0) + 1;

      const barberName = apt.barber?.name || 'Unknown';
      barberData[barberName] = (barberData[barberName] || 0) + 1;
    });

    const chartData = Object.entries(dailyData).map(([date, count]) => ({
      date,
      bookings: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const topServices = Object.entries(serviceData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topBarbers = Object.entries(barberData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        period,
        totalBookings: appointments.length,
        chartData,
        topServices,
        topBarbers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const { start, end } = getDateRange(period);

    const [appointments, sales] = await Promise.all([
      Appointment.find({
        date: { $gte: start, $lte: end },
        status: { $in: ['confirmed', 'completed'] }
      }).populate('service', 'name price'),
      Sale.find({
        createdAt: { $gte: start, $lte: end }
      })
    ]);

    const dailyRevenue = {};
    const serviceRevenue = {};

    appointments.forEach(apt => {
      const dateKey = apt.date.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + apt.totalPrice;

      const serviceName = apt.service?.name || 'Unknown';
      serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + apt.totalPrice;
    });

    sales.forEach(sale => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + sale.total;

      sale.items.forEach(item => {
        serviceRevenue[item.name] = (serviceRevenue[item.name] || 0) + (item.price * item.quantity);
      });
    });

    const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const topRevenueServices = Object.entries(serviceRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalRevenue = appointments.reduce((sum, apt) => sum + apt.totalPrice, 0) +
      sales.reduce((sum, sale) => sum + sale.total, 0);

    res.status(200).json({
      success: true,
      data: {
        period,
        totalRevenue,
        chartData,
        topRevenueServices
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBarberPerformance = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const { start, end } = getDateRange(period);

    const barbers = await Barber.find({ isActive: true });
    const appointments = await Appointment.find({
      date: { $gte: start, $lte: end },
      status: { $in: ['confirmed', 'completed'] }
    }).populate('service', 'name price');

    const performance = await Promise.all(barbers.map(async barber => {
      const barberAppointments = appointments.filter(apt => 
        apt.barber.toString() === barber._id.toString()
      );

      const totalBookings = barberAppointments.length;
      const totalRevenue = barberAppointments.reduce((sum, apt) => sum + apt.totalPrice, 0);
      const avgRating = 4.5; // Placeholder for future rating system

      const serviceCounts = {};
      barberAppointments.forEach(apt => {
        const name = apt.service?.name || 'Unknown';
        serviceCounts[name] = (serviceCounts[name] || 0) + 1;
      });

      const topService = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])[0];

      return {
        barber: {
          id: barber._id,
          name: barber.name,
          photo: barber.photo
        },
        totalBookings,
        totalRevenue,
        avgRating,
        topService: topService ? { name: topService[0], count: topService[1] } : null
      };
    }));

    performance.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReport = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ stock: 1 });

    const lowStock = products.filter(p => p.stock <= 5);
    const outOfStock = products.filter(p => p.stock === 0);
    const wellStocked = products.filter(p => p.stock > 5);

    const categoryData = {};
    products.forEach(p => {
      categoryData[p.category] = (categoryData[p.category] || 0) + 1;
    });

    const chartData = Object.entries(categoryData).map(([category, count]) => ({
      category,
      count
    }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        wellStocked: wellStocked.length,
        lowStockItems: lowStock.slice(0, 10).map(p => ({
          id: p._id,
          name: p.name,
          stock: p.stock,
          price: p.price
        })),
        categoryChart: chartData
      }
    });
  } catch (error) {
    next(error);
  }
};