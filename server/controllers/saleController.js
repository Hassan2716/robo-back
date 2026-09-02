import Sale from '../models/Sale.js';
import Service from '../models/Service.js';
import Product from '../models/Product.js';
import Barber from '../models/Barber.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export const getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, handledBy } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (handledBy) {
      query.handledBy = handledBy;
    }

    const sales = await Sale.find(query)
      .populate('customer', 'name email')
      .populate('barber', 'name')
      .populate('handledBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

export const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('barber', 'name')
      .populate('handledBy', 'name');

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const { items, paymentMethod, customer, barber, notes } = req.body;

    let total = 0;
    const processedItems = [];

    for (const item of items) {
      if (item.type === 'service') {
        const service = await Service.findById(item.item);
        if (!service) {
          return next(new AppError(`Service not found: ${item.item}`, 404));
        }
        const itemTotal = service.price * item.quantity;
        total += itemTotal;
        processedItems.push({
          type: 'service',
          item: service._id,
          name: service.name,
          price: service.price,
          quantity: item.quantity
        });
      } else if (item.type === 'product') {
        const product = await Product.findById(item.item);
        if (!product) {
          return next(new AppError(`Product not found: ${item.item}`, 404));
        }
        if (product.stock < item.quantity) {
          return next(new AppError(`Insufficient stock for ${product.name}`, 400));
        }
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        processedItems.push({
          type: 'product',
          item: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        });
        product.stock -= item.quantity;
        await product.save();
      }
    }

    let customerDoc = null;
    if (customer) {
      customerDoc = await User.findById(customer);
    }

    let barberDoc = null;
    if (barber) {
      barberDoc = await Barber.findById(barber);
    }

    const sale = await Sale.create({
      items: processedItems,
      total,
      paymentMethod,
      customer: customerDoc?._id,
      barber: barberDoc?._id,
      handledBy: req.user.id,
      notes: notes || ''
    });

    const populatedSale = await Sale.findById(sale._id)
      .populate('customer', 'name email')
      .populate('barber', 'name')
      .populate('handledBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedSale
    });
  } catch (error) {
    next(error);
  }
};

export const getSaleReceipt = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('barber', 'name')
      .populate('handledBy', 'name');

    if (!sale) {
      return next(new AppError('Sale not found', 404));
    }

    const receipt = {
      saleId: sale._id,
      date: sale.createdAt,
      handledBy: sale.handledBy?.name || 'Staff',
      customer: sale.customer ? {
        name: sale.customer.name,
        email: sale.customer.email,
        phone: sale.customer.phone
      } : null,
      barber: sale.barber ? sale.barber.name : null,
      items: sale.items.map(item => ({
        name: item.name,
        type: item.type,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      subtotal: sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      notes: sale.notes
    };

    res.status(200).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    next(error);
  }
};

export const getDailySalesSummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: start, $lte: end }
    });

    const summary = {
      date: targetDate,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
      byPaymentMethod: {},
      byCategory: { service: 0, product: 0 }
    };

    sales.forEach(sale => {
      summary.byPaymentMethod[sale.paymentMethod] = 
        (summary.byPaymentMethod[sale.paymentMethod] || 0) + sale.total;
      
      sale.items.forEach(item => {
        summary.byCategory[item.type] += item.price * item.quantity;
      });
    });

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};