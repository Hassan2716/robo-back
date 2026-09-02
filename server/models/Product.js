import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    enum: ['haircare', 'beardcare', 'styling', 'accessories', 'other'],
    default: 'haircare'
  },
  image: {
    type: String,
    default: ''
  },
  barcode: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ isActive: 1 });
productSchema.index({ category: 1 });

export default mongoose.model('Product', productSchema);