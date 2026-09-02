import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, active, lowStock } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', 5] };
    }

    const products = await Product.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, barcode } = req.body;

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'robocutz/products',
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
      });
      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      name,
      description: description || '',
      price,
      stock: stock || 0,
      category: category || 'haircare',
      barcode: barcode || '',
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, barcode, isActive } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    let imageUrl = product.image;
    if (req.file) {
      if (product.image) {
        const publicId = product.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`robocutz/products/${publicId}`);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'robocutz/products',
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
      });
      imageUrl = result.secure_url;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;
    product.barcode = barcode || product.barcode;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    product.image = imageUrl;

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.image) {
      const publicId = product.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`robocutz/products/${publicId}`);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { quantity, operation } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (operation === 'add') {
      product.stock += quantity;
    } else if (operation === 'subtract') {
      if (product.stock < quantity) {
        return next(new AppError('Insufficient stock', 400));
      }
      product.stock -= quantity;
    } else if (operation === 'set') {
      product.stock = quantity;
    } else {
      return next(new AppError('Invalid operation', 400));
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};